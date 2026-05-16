// EconoDirectorio — App principal
const { useState, useEffect, useMemo, useRef } = React;
const { CATEGORIES, BUSINESSES, BARRIOS } = window.DATA;
const I = window.Icon;

// ---------- Helpers ----------
const fmt = n => n.toLocaleString('es-CO');

// SVG placeholder rayado (en vez de emoji gigante)
function StripedThumb({ code, label, hue = 155, h = 132 }) {
  const id = `s${code}-${hue}`;
  // Hash-based offset for variety
  const seed = code.charCodeAt(0) + code.charCodeAt(1);
  const bg = `oklch(${88 + (seed % 6)}% 0.025 ${hue})`;
  const fg = `oklch(${62 + (seed % 10)}% 0.07 ${hue})`;
  return (
    <div className="thumb" style={{ background: bg, height: h }}>
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 200 132" aria-hidden="true">
        <defs>
          <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)">
            <rect width="14" height="14" fill={bg} />
            <rect width="2" height="14" fill={fg} opacity="0.32" />
          </pattern>
        </defs>
        <rect width="200" height="132" fill={`url(#${id})`} />
      </svg>
      <div className="thumb-tag"><span className="cat-code">{code}</span>{label}</div>
    </div>
  );
}

function PriceLevel({ level }) {
  return (
    <span className="price-level" title={`Nivel de precio ${level}/3`}>
      {[1,2,3].map(i => <span key={i} className={i <= level ? 'on' : ''}>$</span>)}
    </span>
  );
}

function Stars({ rating, size = 12, compact = false }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  if (compact) {
    // Compact: solo estrellas llenas + media, sin vacías
    return (
      <span className="stars compact" style={{ '--star-size': size + 'px' }}>
        {[...Array(5)].map((_, i) => {
          if (i < full) return <span key={i} className="full">★</span>;
          if (i === full && half) return <span key={i} className="half">★</span>;
          return null;
        })}
      </span>
    );
  }
  return (
    <span className="stars" style={{ '--star-size': size + 'px' }}>
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < full ? 'full' : (i === full && half ? 'half' : 'empty')}>★</span>
      ))}
    </span>
  );
}

// ---------- TopBar ----------
function TopBar({ query, setQuery, barrio, setBarrio, onOpenMerchant }) {
  const [barrioOpen, setBarrioOpen] = useState(false);
  const menuRef = useRef(null);

  // Close barrio menu on outside click
  useEffect(() => {
    if (!barrioOpen) return;
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setBarrioOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [barrioOpen]);

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">ED</div>
        <div className="brand-name">
          Econo<span className="brand-accent">Directorio</span>
          <span className="brand-meta">DIR · v2.0</span>
        </div>
      </div>

      <div className="search-shell">
        <I.Search size={16} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar negocios, productos, oficios…"
          aria-label="Buscar negocios"
        />
        {query
          ? <button className="search-clear" onClick={() => setQuery('')} title="Limpiar búsqueda"><I.X size={14} /></button>
          : <kbd>⌘K</kbd>
        }
      </div>

      <div className="top-actions">
        <button className="barrio-pill" onClick={() => setBarrioOpen(o => !o)} ref={menuRef}>
          <I.MapPin size={14} />
          <span>{barrio}</span>
          <I.ChevronD size={12} />
          {barrioOpen && (
            <div className="barrio-menu" onClick={e => e.stopPropagation()}>
              <div className="barrio-menu-head">Tu zona</div>
              {BARRIOS.map(b => (
                <button key={b} className={'barrio-item ' + (b === barrio ? 'is-active' : '')}
                  onClick={() => { setBarrio(b); setBarrioOpen(false); }}>
                  <I.MapPin size={12} />
                  <span>{b}</span>
                  {b === barrio && <I.Check size={12} />}
                </button>
              ))}
            </div>
          )}
        </button>
        <button className="top-link" onClick={onOpenMerchant}>
          <I.Plus size={14} />
          <span>Soy comerciante</span>
        </button>
        <div className="avatar" title="Cuenta">MA</div>
      </div>
    </header>
  );
}

// ---------- Sidebar ----------
function Sidebar({ catId, setCatId, filters, setFilter, counts, onResetFilters }) {
  const activeFilters = Object.values(filters).filter(Boolean).length + (catId ? 1 : 0);
  return (
    <aside className="sidebar">
      <div className="side-section">
        <div className="side-label-row">
          <span className="side-label">Categorías</span>
          {activeFilters > 0 && (
            <button className="side-reset" onClick={onResetFilters} title="Limpiar filtros">
              <span className="filter-badge">{activeFilters}</span> Limpiar
            </button>
          )}
        </div>
        <button
          className={'cat-row ' + (catId === null ? 'is-active' : '')}
          onClick={() => setCatId(null)}>
          <span className="cat-code dim">·</span>
          <span className="cat-name">Todos los negocios</span>
          <span className="cat-count">{counts.total}</span>
        </button>
        {CATEGORIES.map(c => (
          <button key={c.id}
            className={'cat-row ' + (catId === c.id ? 'is-active' : '')}
            onClick={() => setCatId(c.id)}>
            <span className="cat-code">{c.code}</span>
            <span className="cat-name">{c.name}</span>
            <span className="cat-count">{c.count}</span>
          </button>
        ))}
      </div>

      <div className="side-section">
        <div className="side-label">Filtros rápidos</div>
        <FilterToggle label="Abierto ahora"   active={filters.openNow}  onChange={v => setFilter('openNow', v)} dot />
        <FilterToggle label="Verificados"     active={filters.verified} onChange={v => setFilter('verified', v)} />
        <FilterToggle label="Hace domicilio"  active={filters.delivery} onChange={v => setFilter('delivery', v)} />
        <FilterToggle label="Acepta Nequi"    active={filters.nequi}    onChange={v => setFilter('nequi', v)} />
        <FilterToggle label="Calificación 4.5+" active={filters.topRated} onChange={v => setFilter('topRated', v)} />
      </div>

      <div className="side-footer">
        <div className="kv"><span>Negocios</span><b>{fmt(248)}</b></div>
        <div className="kv"><span>Categorías</span><b>14</b></div>
        <div className="kv"><span>Barrios</span><b>12</b></div>
        <div className="kv"><span>Actualizado</span><b>Hoy</b></div>
      </div>
    </aside>
  );
}

function FilterToggle({ label, active, onChange, dot }) {
  return (
    <button className={'filter-row ' + (active ? 'is-on' : '')} onClick={() => onChange(!active)}>
      <span className="check-box">{active && <I.Check size={10} />}</span>
      <span className="filter-label">{label}</span>
      {dot && <span className="live-dot" />}
    </button>
  );
}

// ---------- Toolbar ----------
function Toolbar({ count, sort, setSort, view, setView, density, catName, query }) {
  const title = query
    ? <>Resultados para <em>«{query}»</em></>
    : (catName ? <>{catName}</> : <>Cerca de ti</>);
  return (
    <div className="toolbar">
      <div className="toolbar-title">
        <h1>{title}</h1>
        <div className="toolbar-meta">
          <span><b>{count}</b> {count === 1 ? 'negocio' : 'negocios'}</span>
          <span className="sep">·</span>
          <span>Actualizado hace 4 min</span>
        </div>
      </div>
      <div className="toolbar-right">
        <div className="select-wrap">
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option value="relevance">Más relevantes</option>
            <option value="rating">Mejor calificados</option>
            <option value="reviews">Más reseñas</option>
            <option value="nearby">Más cercanos</option>
            <option value="newest">Más recientes</option>
          </select>
          <I.ChevronD size={12} />
        </div>
        <div className="view-seg">
          <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')} title="Cuadrícula"><I.Grid size={14} /></button>
          <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')} title="Lista"><I.List size={14} /></button>
          <button className={view === 'map' ? 'on' : ''} onClick={() => setView('map')} title="Mapa"><I.Map size={14} /></button>
        </div>
      </div>
    </div>
  );
}

// ---------- Card ----------
function BusinessCard({ b, onOpen, onSave, saved, view, onContact }) {
  const cat = CATEGORIES.find(c => c.id === b.cat);
  const hueMap = {
    restaurantes: 30, tiendas: 220, ropa: 320, salud: 165, talleres: 50,
    belleza: 340, panaderia: 60, electronicos: 210, educacion: 250,
    transporte: 25, artesania: 290, frutas: 130, tecnologia: 230, eventos: 280,
  };
  const hue = hueMap[b.cat] || 150;

  // ── Vista Lista ──────────────────────────────────────────────
  if (view === 'list') {
    return (
      <article className={'card list ' + (saved ? 'saved' : '')} onClick={() => onOpen(b)}>
        <div className="card-thumb-wrap small">
          <StripedThumb code={cat.code} label={cat.name} hue={hue} h={88} />
        </div>

        <div className="card-body">
          <div className="card-top">
            <div className="card-status">
              <span className={'status-dot ' + (b.openNow ? 'open' : 'closed')} />
              <span className="status-text">
                {b.openNow ? `Abierto · cierra ${b.closesAt}` : 'Cerrado ahora'}
              </span>
              {b.verified && (
                <span className="badge-v"><I.Verified size={10} /> Verificado</span>
              )}
            </div>
            <div className="card-rating">
              <Stars rating={b.rating} size={13} compact={true} />
              <b>{b.rating}</b>
              <span className="reviews">({b.reviews})</span>
            </div>
          </div>

          <h3 className="card-name">{b.name}</h3>
          <p className="card-desc">{b.desc}</p>

          <div className="card-meta">
            <span className="meta-item"><I.MapPin size={12} />{b.barrio} · {b.address}</span>
            <span className="meta-item"><I.Clock size={12} />{b.hours}</span>
            <PriceLevel level={b.priceLevel} />
          </div>

          <div className="card-tags">
            {b.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        </div>

        {/* Acciones verticales — botón guardar siempre visible */}
        <div className="card-actions vertical">
          <button
            className={'btn-icon ' + (saved ? 'is-saved' : '')}
            onClick={e => { e.stopPropagation(); onSave(b.id); }}
            title={saved ? 'Quitar de guardados' : 'Guardar negocio'}>
            <I.Bookmark size={14} />
          </button>
          <button className="btn-primary" onClick={e => { e.stopPropagation(); onContact(b, 'call'); }}>
            <I.Phone size={12} /> Llamar
          </button>
          {b.whatsapp && (
            <button className="btn-secondary" onClick={e => { e.stopPropagation(); onContact(b, 'wa'); }}>
              <I.Message size={12} /> WhatsApp
            </button>
          )}
        </div>
      </article>
    );
  }

  // ── Vista Grid ───────────────────────────────────────────────
  return (
    <article className={'card grid ' + (saved ? 'saved' : '')} onClick={() => onOpen(b)}>
      {/* Thumbnail con overlay de estado */}
      <div className="card-thumb-wrap">
        <StripedThumb code={cat.code} label={cat.name} hue={hue} />
        <div className="thumb-overlay">
          {b.verified && (
            <span className="badge-v light"><I.Verified size={10} /> Verificado</span>
          )}
          <button
            className={'btn-save ' + (saved ? 'is-saved' : '')}
            onClick={e => { e.stopPropagation(); onSave(b.id); }}
            title={saved ? 'Quitar de guardados' : 'Guardar'}>
            <I.Bookmark size={13} />
          </button>
        </div>
        <div className="thumb-status">
          <span className={'status-dot ' + (b.openNow ? 'open' : 'closed')} />
          <span>{b.openNow ? `Cierra ${b.closesAt}` : 'Cerrado'}</span>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="card-body">
        <div className="card-row-top">
          <h3 className="card-name">{b.name}</h3>
          <PriceLevel level={b.priceLevel} />
        </div>

        <div className="card-owner">{b.owner} · {b.specialty}</div>

        <div className="card-rating">
          <Stars rating={b.rating} size={13} compact={true} />
          <b>{b.rating}</b>
          <span className="reviews">({b.reviews})</span>
        </div>

        <div className="card-meta-row">
          <span className="meta-item"><I.MapPin size={11} />{b.barrio}</span>
          <span className="sep">·</span>
          <span className="meta-item">{b.address}</span>
        </div>

        <div className="card-tags">
          {b.tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
        </div>

        {/* Acciones: Llamar | ícono WA/Ruta | Ver más */}
        <div className="card-actions">
          <button className="btn-primary" onClick={e => { e.stopPropagation(); onContact(b, 'call'); }}>
            <I.Phone size={12} /> Llamar
          </button>
          {b.whatsapp ? (
            <button className="btn-icon" onClick={e => { e.stopPropagation(); onContact(b, 'wa'); }} title="WhatsApp">
              <I.Message size={14} />
            </button>
          ) : (
            <button className="btn-icon" onClick={e => { e.stopPropagation(); onContact(b, 'route'); }} title="Cómo llegar">
              <I.Navigate size={14} />
            </button>
          )}
          <button className="btn-ghost" onClick={e => { e.stopPropagation(); onOpen(b); }}>
            Ver más
          </button>
        </div>
      </div>
    </article>
  );
}

// ---------- Detail Panel ----------
function DetailPanel({ business, onClose, onContact, saved, onSave }) {
  const cat = business && CATEGORIES.find(c => c.id === business.cat);
  const hueMap = { restaurantes: 30, tiendas: 220, ropa: 320, salud: 165, talleres: 50, belleza: 340, panaderia: 60, electronicos: 210, educacion: 250, transporte: 25, artesania: 290, frutas: 130, tecnologia: 230, eventos: 280 };
  return (
    <aside className={'detail-panel ' + (business ? 'is-open' : '')}>
      {business && (
        <div className="detail-inner">
          <div className="detail-head">
            <StripedThumb code={cat.code} label={cat.name} hue={hueMap[business.cat]} h={180} />
            <button className="detail-close" onClick={onClose}><I.X size={14} /></button>
          </div>
          <div className="detail-body">
            <div className="detail-status">
              <span className={'status-dot ' + (business.openNow ? 'open' : 'closed')} />
              <span>{business.openNow ? `Abierto ahora · cierra ${business.closesAt}` : 'Cerrado'}</span>
              {business.verified && <span className="badge-v"><I.Verified size={10} /> Verificado</span>}
            </div>
            <h2 className="detail-name">{business.name}</h2>
            <div className="detail-sub">{business.owner} · Desde {business.since}</div>
            <div className="detail-rating">
              <Stars rating={business.rating} size={15} compact={true} />
              <b>{business.rating}</b>
              <span className="sep">·</span>
              <span>{business.reviews} reseñas</span>
              <span className="sep">·</span>
              <PriceLevel level={business.priceLevel} />
            </div>
            <p className="detail-desc">{business.desc}</p>

            <div className="detail-actions">
              <button className="btn-primary big" onClick={() => onContact(business, 'call')}>
                <I.Phone size={14} /> Llamar {business.phone}
              </button>
              {business.whatsapp && (
                <button className="btn-secondary big" onClick={() => onContact(business, 'wa')}>
                  <I.Message size={14} /> WhatsApp
                </button>
              )}
              <button className="btn-icon big" onClick={() => onSave(business.id)} title="Guardar">
                <I.Bookmark size={14} />
              </button>
            </div>

            <div className="detail-grid">
              <div className="info-block">
                <div className="info-label"><I.MapPin size={11} /> Dirección</div>
                <div className="info-value">{business.address}</div>
                <div className="info-sub">{business.barrio}</div>
              </div>
              <div className="info-block">
                <div className="info-label"><I.Clock size={11} /> Horario</div>
                <div className="info-value">{business.hours}</div>
                <div className="info-sub">{business.openNow ? 'Abierto ahora' : 'Cerrado ahora'}</div>
              </div>
              <div className="info-block">
                <div className="info-label"><I.Verified size={11} /> Especialidad</div>
                <div className="info-value">{business.specialty}</div>
                <div className="info-sub">{cat.name}</div>
              </div>
              <div className="info-block">
                <div className="info-label"><I.Wallet size={11} /> Pagos</div>
                <div className="info-value">{business.payments.join(' · ')}</div>
                <div className="info-sub">Nivel de precio {business.priceLevel}/3</div>
              </div>
            </div>

            <div className="detail-section">
              <div className="detail-section-title">Etiquetas</div>
              <div className="card-tags">
                {business.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>

            <div className="detail-section">
              <div className="detail-section-title">Ubicación</div>
              <MiniMap business={business} />
            </div>

            <div className="detail-section">
              <div className="detail-section-title">Reseñas recientes</div>
              <FakeReviews business={business} />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function MiniMap({ business }) {
  // Stylized grid — deliberately schematic
  return (
    <div className="mini-map" role="img" aria-label="Mapa esquemático del barrio">
      <svg viewBox="0 0 320 180" width="100%" height="180" preserveAspectRatio="none">
        <defs>
          <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="var(--surface-2)" />
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--line)" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="320" height="180" fill="url(#map-grid)" />
        {/* Streets */}
        <rect x="0" y="80" width="320" height="14" fill="var(--surface)" stroke="var(--line)" strokeWidth="0.5" />
        <rect x="140" y="0" width="14" height="180" fill="var(--surface)" stroke="var(--line)" strokeWidth="0.5" />
        <rect x="0" y="140" width="320" height="8" fill="var(--surface)" stroke="var(--line)" strokeWidth="0.5" />
        {/* Pin */}
        <g transform="translate(150 80)">
          <circle r="22" fill="var(--accent)" opacity="0.15" />
          <circle r="12" fill="var(--accent)" opacity="0.3" />
          <circle r="6" fill="var(--accent)" />
          <circle r="2" fill="white" />
        </g>
        <text x="160" y="120" fontSize="9" fill="var(--ink-3)" fontFamily="JetBrains Mono">{business.barrio.toUpperCase()}</text>
      </svg>
      <div className="map-meta">
        <span><I.Navigate size={11} /> ~ 6 min a pie · 2 min en bici</span>
        <button className="link">Cómo llegar →</button>
      </div>
    </div>
  );
}

function FakeReviews({ business }) {
  const REVIEWS = [
    { author: 'Marcela R.', date: 'hace 2 días', rating: 5, text: 'Excelente atención y precios justos. Llevo años viniendo y nunca decepciona.' },
    { author: 'Jhon S.',    date: 'hace 1 semana', rating: 4, text: 'Buen servicio, el dueño es muy amable y honesto con los precios.' },
  ];
  return (
    <div className="reviews-list">
      {REVIEWS.map((r, i) => (
        <div key={i} className="review">
          <div className="review-head">
            <div className="review-avatar">{r.author.split(' ').map(s => s[0]).join('')}</div>
            <div className="review-meta">
              <b>{r.author}</b>
              <span>{r.date}</span>
            </div>
            <Stars rating={r.rating} />
          </div>
          <p>{r.text}</p>
        </div>
      ))}
      <button className="link">Ver las {business.reviews} reseñas →</button>
    </div>
  );
}

// ---------- Map View ----------
function MapView({ items, onOpen, hoveredId, setHoveredId }) {
  // Pseudo-random but stable positions
  const pos = id => {
    const x = ((id * 73) % 100);
    const y = ((id * 41) % 100);
    return { x: 8 + (x * 0.84), y: 8 + (y * 0.84) };
  };
  return (
    <div className="map-view">
      <div className="map-canvas">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="mv-grid" width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="var(--surface-2)" />
              <path d="M 6 0 L 0 0 0 6" fill="none" stroke="var(--line)" strokeWidth="0.15" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#mv-grid)" />
          <rect x="0" y="46" width="100" height="4" fill="var(--surface)" />
          <rect x="48" y="0" width="4" height="100" fill="var(--surface)" />
          <rect x="0" y="78" width="100" height="2.5" fill="var(--surface)" />
          <rect x="22" y="0" width="2" height="100" fill="var(--surface)" />
        </svg>
        {items.map(b => {
          const p = pos(b.id);
          const hot = hoveredId === b.id;
          return (
            <button key={b.id}
              className={'map-pin ' + (hot ? 'hot' : '')}
              style={{ left: p.x + '%', top: p.y + '%' }}
              onMouseEnter={() => setHoveredId(b.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onOpen(b)}>
              <span className="map-pin-dot" />
              <span className="map-pin-label">{b.name}</span>
            </button>
          );
        })}
      </div>
      <div className="map-side">
        {items.map(b => (
          <button key={b.id}
            className={'map-row ' + (hoveredId === b.id ? 'hot' : '')}
            onMouseEnter={() => setHoveredId(b.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onOpen(b)}>
            <div className="map-row-thumb"><span className="cat-code">{CATEGORIES.find(c => c.id === b.cat).code}</span></div>
            <div className="map-row-body">
              <b>{b.name}</b>
              <span>{b.barrio} · ⭐ {b.rating} ({b.reviews})</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Empty State ----------
function EmptyState({ onReset }) {
  return (
    <div className="empty">
      <div className="empty-mark">
        <I.Search size={20} />
      </div>
      <h3>Sin resultados</h3>
      <p>No encontramos negocios con esos filtros. Prueba cambiando la búsqueda o el barrio.</p>
      <button className="btn-primary" onClick={onReset}>
        <I.X size={13} /> Limpiar filtros
      </button>
    </div>
  );
}

// ---------- Toast ----------
function Toast({ msg }) {
  return <div className={'toast ' + (msg ? 'show' : '')}>{msg}</div>;
}

// ---------- Spotlight (featured strip on home) ----------
function Spotlight({ items, onOpen }) {
  if (!items.length) return null;
  return (
    <div className="spotlight">
      <div className="spotlight-head">
        <span className="kicker">Destacados de la semana</span>
        <span className="kicker-sub">Negocios recomendados por la comunidad</span>
      </div>
      <div className="spotlight-grid">
        {items.map(b => {
          const cat = CATEGORIES.find(c => c.id === b.cat);
          return (
            <button key={b.id} className="spot-card" onClick={() => onOpen(b)}>
              <div className="spot-tag">{cat.code} · {cat.name.toUpperCase()}</div>
              <h3>{b.name}</h3>
              <p>{b.desc}</p>
              <div className="spot-meta">
                <Stars rating={b.rating} /> <b>{b.rating}</b>
                <span className="sep">·</span>
                <span>{b.barrio}</span>
                <span className="arrow">→</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- App Root ----------
function App() {
  const [catId, setCatId] = useState(null);
  const [query, setQuery] = useState('');
  const [barrio, setBarrio] = useState('La Esperanza');
  const [filters, setFilters] = useState({ openNow: false, verified: false, delivery: false, nequi: false, topRated: false });
  const [sort, setSort] = useState('relevance');
  const [view, setView] = useState('grid');
  const [active, setActive] = useState(null);
  const [saved, setSaved] = useState(new Set());
  const [toast, setToast] = useState('');
  const [hoveredId, setHoveredId] = useState(null);

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const showToast = msg => {
    setToast(msg);
    clearTimeout(window.__toastT);
    window.__toastT = setTimeout(() => setToast(''), 2400);
  };

  const onSave = id => {
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); showToast('Quitado de guardados'); }
      else { next.add(id); showToast('Guardado en tu lista'); }
      return next;
    });
  };

  const onContact = (b, mode) => {
    if (mode === 'call') showToast(`Llamando a ${b.name} · ${b.phone}`);
    else if (mode === 'wa') showToast(`Abriendo WhatsApp · ${b.name}`);
    else if (mode === 'route') showToast(`Calculando ruta a ${b.address}`);
  };

  const resetFilters = () => {
    setFilters({ openNow: false, verified: false, delivery: false, nequi: false, topRated: false });
    setQuery('');
    setCatId(null);
  };

  // Filtering
  const items = useMemo(() => {
    let r = BUSINESSES.slice();
    if (catId) r = r.filter(b => b.cat === catId);
    if (query) {
      const q = query.toLowerCase();
      r = r.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.desc.toLowerCase().includes(q) ||
        b.specialty.toLowerCase().includes(q) ||
        b.tags.some(t => t.toLowerCase().includes(q)) ||
        b.owner.toLowerCase().includes(q)
      );
    }
    if (filters.openNow) r = r.filter(b => b.openNow);
    if (filters.verified) r = r.filter(b => b.verified);
    if (filters.delivery) r = r.filter(b => b.tags.some(t => /domicilio/i.test(t)));
    if (filters.nequi) r = r.filter(b => b.payments.some(p => /nequi/i.test(p)));
    if (filters.topRated) r = r.filter(b => b.rating >= 4.5);

    if (sort === 'rating') r.sort((a, b) => b.rating - a.rating);
    else if (sort === 'reviews') r.sort((a, b) => b.reviews - a.reviews);
    else if (sort === 'newest') r.sort((a, b) => (+b.since) - (+a.since));
    else if (sort === 'nearby') r.sort((a, b) => (a.barrio === barrio ? -1 : 1) - (b.barrio === barrio ? -1 : 1));
    return r;
  }, [catId, query, filters, sort, barrio]);

  // Spotlight: top 3 by rating (only on home, no filters/query)
  const spotlight = useMemo(() => {
    if (catId || query || Object.values(filters).some(Boolean)) return [];
    return BUSINESSES.filter(b => b.verified).sort((a, b) => b.rating - a.rating).slice(0, 3);
  }, [catId, query, filters]);

  const counts = { total: BUSINESSES.length };
  const catName = catId ? CATEGORIES.find(c => c.id === catId).name : null;

  // Esc to close detail
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setActive(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="app">
      <TopBar query={query} setQuery={setQuery} barrio={barrio} setBarrio={setBarrio}
        onOpenMerchant={() => showToast('Próximamente: registro de negocios')} />

      <div className="shell">
        <Sidebar catId={catId} setCatId={setCatId} filters={filters} setFilter={setFilter} counts={counts} onResetFilters={resetFilters} />

        <main className="main">
          <Toolbar count={items.length} sort={sort} setSort={setSort}
            view={view} setView={setView}
            catName={catName} query={query} />

          {spotlight.length > 0 && <Spotlight items={spotlight} onOpen={setActive} />}

          {items.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : view === 'map' ? (
            <MapView items={items} onOpen={setActive} hoveredId={hoveredId} setHoveredId={setHoveredId} />
          ) : (
            <div className={'results ' + view}>
              {items.map(b => (
                <BusinessCard key={b.id} b={b} view={view}
                  onOpen={setActive} onSave={onSave} saved={saved.has(b.id)}
                  onContact={onContact} />
              ))}
            </div>
          )}
        </main>
      </div>

      <DetailPanel business={active} onClose={() => setActive(null)}
        onContact={onContact} saved={active && saved.has(active.id)}
        onSave={onSave} />

      {active && <div className="scrim" onClick={() => setActive(null)} />}

      <Toast msg={toast} />
    </div>
  );
}

window.App = App;
