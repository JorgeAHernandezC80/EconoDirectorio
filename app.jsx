// EconoDirectorio — App principal
const { useState, useEffect, useMemo, useRef } = React;
const { CATEGORIES, BUSINESSES } = window.DATA;
// BARRIOS se deriva dinámicamente del estado de negocios en App
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
function TopBar({ query, setQuery, barrio, setBarrio, barrios, onOpenMerchant, onOpenStats }) {
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
              {barrios.map(b => (
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
        <button className="top-stats-btn" onClick={onOpenStats} title="Estadísticas">
          <I.Sliders size={14} />
          <span>Estadísticas</span>
        </button>
        <button className="top-link" onClick={onOpenMerchant}>
          <I.Plus size={14} />
          <span>Soy comerciante</span>
        </button>
        <div className="avatar" title="Cuenta">JH</div>
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
            <button className="btn-icon" onClick={e => {
              e.stopPropagation();
              window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.address + ', ' + b.barrio + ', Colombia')}`, '_blank');
            }} title="Cómo llegar en Google Maps">
              <I.Navigate size={14} />
            </button>
          )}
          <button className="btn-icon" onClick={e => { e.stopPropagation(); onContact(b, 'rate'); }} title="Calificar">
            <I.Star size={14} />
          </button>
          <button className="btn-ghost" onClick={e => { e.stopPropagation(); onOpen(b); }}>
            Ver más
          </button>
        </div>
      </div>
    </article>
  );
}


// ---------- RatingModal ----------
function RatingModal({ business, onClose, onSubmit }) {
  const [hover, setHover]     = React.useState(0);
  const [rating, setRating]   = React.useState(0);
  const [author, setAuthor]   = React.useState('');
  const [comment, setComment] = React.useState('');
  const [error, setError]     = React.useState('');

  const labels = ['', 'Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];

  const submit = () => {
    if (!rating)         return setError('Selecciona una calificación');
    if (!author.trim())  return setError('Ingresa tu nombre');
    if (!comment.trim()) return setError('Escribe un comentario');
    onSubmit({ rating, author: author.trim(), comment: comment.trim() });
  };

  return (
    <div className="rm-scrim" onClick={onClose}>
      <div className="rm-modal" onClick={e => e.stopPropagation()}>
        <div className="rm-head">
          <div className="rm-head-info">
            <p className="rm-eyebrow">Calificar negocio</p>
            <h3 className="rm-title">{business.name}</h3>
          </div>
          <button className="rm-close" onClick={onClose}><I.X size={14}/></button>
        </div>

        <div className="rm-body">
          {/* Estrellas interactivas */}
          <div className="rm-stars-wrap">
            <div className="rm-stars">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button"
                  className={'rm-star ' + (n <= (hover || rating) ? 'rm-star--on' : '')}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => { setRating(n); setError(''); }}>
                  ★
                </button>
              ))}
            </div>
            <span className="rm-star-label">
              {labels[hover || rating] || 'Toca para calificar'}
            </span>
          </div>

          {/* Nombre */}
          <div className="rm-field">
            <label className="rm-label">Tu nombre</label>
            <input className="rm-input" type="text"
              placeholder="Ej: María G."
              value={author} onChange={e => { setAuthor(e.target.value); setError(''); }} />
          </div>

          {/* Comentario */}
          <div className="rm-field">
            <label className="rm-label">
              Comentario
              <span className="rm-char">{comment.length}/200</span>
            </label>
            <textarea className="rm-textarea" rows={4} maxLength={200}
              placeholder="¿Cómo fue tu experiencia? ¿Qué destacarías?"
              value={comment} onChange={e => { setComment(e.target.value); setError(''); }} />
          </div>

          {error && <p className="rm-error"><I.X size={11}/> {error}</p>}
        </div>

        <div className="rm-footer">
          <button className="rm-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="rm-btn-submit" onClick={submit}>
            <I.Check size={14}/> Publicar reseña
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Detail Panel ----------
function DetailPanel({ business, onClose, onContact, saved, onSave, onRate }) {
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
              {/* Fila 1: acción principal */}
              <button className="btn-primary big" onClick={() => onContact(business, 'call')}>
                <I.Phone size={14} /> Llamar · {business.phone}
              </button>
              {/* Fila 2: acciones secundarias */}
              {business.whatsapp && (
                <button className="btn-secondary big" onClick={() => onContact(business, 'wa')}>
                  <I.Message size={14} /> WhatsApp
                </button>
              )}
              <button className="btn-secondary big" onClick={() => onRate(business)}>
                <I.Star size={14} /> Calificar
              </button>
              <button
                className={'btn-secondary big ' + (saved ? 'is-saved' : '')}
                onClick={() => onSave(business.id)}
                title={saved ? 'Quitar de guardados' : 'Guardar negocio'}>
                <I.Bookmark size={14} />
                {saved ? 'Guardado' : 'Guardar'}
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
              <FakeReviews business={business} onRate={onRate} />
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
    <div className="mini-map" role="img" aria-label="Mapa esquemático del barrio"
      style={{cursor:'pointer'}}
      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address + ', ' + business.barrio + ', Colombia')}`, '_blank')}
      title="Ver en Google Maps">
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
        <span><I.MapPin size={11} /> {business.address} · {business.barrio}</span>
        <a
          className="link"
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.address + ', ' + business.barrio + ', Colombia')}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir en Google Maps">
          <I.Navigate size={11} /> Cómo llegar →
        </a>
      </div>
    </div>
  );
}

function FakeReviews({ business, onRate }) {
  const DEFAULT_REVIEWS = business.id <= 22 ? [
    { author: 'Marcela R.', date: 'hace 2 días',    rating: 5, text: 'Excelente atención y precios justos. Llevo años viniendo y nunca decepciona.' },
    { author: 'Jhon S.',    date: 'hace 1 semana',  rating: 4, text: 'Buen servicio, el dueño es muy amable y honesto con los precios.' },
  ] : [];

  const allReviews = [...(business.userReviews || []), ...DEFAULT_REVIEWS];

  return (
    <div className="reviews-list">
      {allReviews.length === 0 && (
        <p className="reviews-empty">Aún no hay reseñas. ¡Sé el primero en calificar!</p>
      )}
      {allReviews.map((r, i) => (
        <div key={i} className="review">
          <div className="review-head">
            <div className="review-avatar">{r.author.split(' ').map(s => s[0]).join('')}</div>
            <div className="review-meta">
              <b>{r.author}</b>
              <span>{r.date || 'Ahora'}</span>
            </div>
            <Stars rating={r.rating} compact={true} size={12} />
          </div>
          <p>{r.text}</p>
        </div>
      ))}
      <button className="link" onClick={() => onRate(business)}>
        + Calificar este negocio
      </button>
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


// ---------- RegisterPage ----------
function RegisterPage({ onBack, showToast, onRegister, barrios }) {
  const PAYMENT_OPTIONS = [
    { id: 'efectivo',      label: 'Efectivo',      icon: '💵' },
    { id: 'nequi',         label: 'Nequi',          icon: '📱' },
    { id: 'daviplata',     label: 'Daviplata',      icon: '📲' },
    { id: 'tarjeta',       label: 'Tarjeta',        icon: '💳' },
    { id: 'transferencia', label: 'Transferencia',  icon: '🏦' },
  ];
  const DAYS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const HOUR_OPTIONS = ['5:00','6:00','7:00','8:00','9:00','10:00','11:00','12:00',
    '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00','24:00'];

  const [step, setStep]       = React.useState(1);
  const [errors, setErrors]   = React.useState({});
  const [submitted, setSubmitted] = React.useState(false);
  const [form, setForm]       = React.useState({
    name: '', owner: '', catId: '', specialty: '',
    barrio: '', address: '',
    phone: '', whatsapp: false,
    days: [], openFrom: '8:00', openTo: '18:00',
    desc: '', payments: [],
  });

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };
  const toggleArr = (k, v) => setForm(f => ({
    ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v]
  }));

  const validate = s => {
    const e = {};
    if (s === 1) {
      if (!form.name.trim())  e.name  = 'Ingresa el nombre del negocio';
      if (!form.owner.trim()) e.owner = 'Ingresa el nombre del propietario';
      if (!form.catId)        e.catId = 'Selecciona una categoría';
    }
    if (s === 2) {
      if (!form.barrio)         e.barrio  = 'Selecciona un barrio';
      if (!form.address.trim()) e.address = 'Ingresa la dirección';
      if (!form.phone.trim())   e.phone   = 'Ingresa un teléfono de contacto';
    }
    if (s === 3) {
      if (!form.desc.trim())     e.desc     = 'Agrega una descripción';
      if (!form.payments.length) e.payments = 'Selecciona al menos un método';
    }
    return e;
  };

  const next = () => {
    const e = validate(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const prev = () => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const submit = () => {
    const e = validate(3);
    if (Object.keys(e).length) { setErrors(e); return; }
    // Construir objeto negocio compatible con el directorio
    const cat = CATEGORIES.find(c => c.id === form.catId);
    const newBusiness = {
      id: Date.now(),
      cat: form.catId,
      name: form.name,
      owner: form.owner,
      desc: form.desc,
      rating: 0,
      reviews: 0,
      address: form.address,
      barrio: form.barrio,
      phone: form.phone,
      whatsapp: form.whatsapp,
      hours: form.days.length
        ? `${form.days.join('–')} · ${form.openFrom}–${form.openTo}`
        : `${form.openFrom}–${form.openTo}`,
      openNow: false,
      closesAt: form.openTo,
      specialty: form.specialty || cat?.name || '',
      tags: [],
      payments: form.payments,
      verified: false,
      since: new Date().getFullYear().toString(),
      priceLevel: 1,
    };
    setSubmitted(true);
    onRegister(newBusiness);
  };

  const STEPS = [
    { num: 1, label: 'Tu negocio',  desc: 'Información básica' },
    { num: 2, label: 'Ubicación',   desc: 'Dónde encontrarte'  },
    { num: 3, label: 'Detalles',    desc: 'Último paso'        },
  ];

  const selectedCat = CATEGORIES.find(c => c.id === form.catId);

  // ── Pantalla de éxito ──────────────────────────────────────
  if (submitted) {
    return (
      <div className="app">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">ED</div>
            <div className="brand-name">
              Econo<span className="brand-accent">Directorio</span>
              <span className="brand-meta">DIR · v2.0</span>
            </div>
          </div>
        </header>
        <div className="rp-success">
          <div className="rp-success-ring">
            <div className="rp-success-icon"><I.Check size={32} /></div>
          </div>
          <div className="rp-success-body">
            <p className="rp-success-eyebrow">Registro completado</p>
            <h2 className="rp-success-title">{form.name}</h2>
            <p className="rp-success-sub">
              Revisaremos tu solicitud y en menos de 48 horas
              tu negocio estará visible en el directorio.
            </p>
            <div className="rp-success-card">
              <div className="rp-success-row"><I.MapPin size={14}/><span>{form.barrio} · {form.address}</span></div>
              <div className="rp-success-row"><I.Phone  size={14}/><span>{form.phone}</span></div>
              <div className="rp-success-row"><I.Clock  size={14}/><span>{form.openFrom} – {form.openTo}</span></div>
            </div>
            <button className="rp-btn-primary" onClick={onBack}>
              <I.ArrowL size={15}/> Volver al directorio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app rp-app">
      {/* Header compacto */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">ED</div>
          <div className="brand-name">
            Econo<span className="brand-accent">Directorio</span>
            <span className="brand-meta">DIR · v2.0</span>
          </div>
        </div>
        <div style={{flex:1}} />
        <div className="top-actions">
          <button className="btn-ghost" onClick={onBack}>
            <I.ArrowL size={14}/> Volver
          </button>
        </div>
      </header>

      {/* Layout de dos columnas */}
      <div className="rp-layout">

        {/* ── Columna izquierda — Hero + progreso ── */}
        <aside className="rp-sidebar">
          <div className="rp-sidebar-inner">
            <div className="rp-sidebar-top">
              <p className="rp-eyebrow">Economía popular</p>
              <h1 className="rp-hero-title">Registra tu<br/><em>negocio</em></h1>
              <p className="rp-hero-sub">
                Únete a más de 248 negocios que ya hacen parte del directorio de tu comunidad.
              </p>
            </div>

            {/* Steps verticales */}
            <nav className="rp-steps">
              {STEPS.map((s, i) => {
                const state = s.num < step ? 'done' : s.num === step ? 'active' : 'pending';
                return (
                  <div key={s.num} className={'rp-step rp-step--' + state}>
                    <div className="rp-step-track">
                      <div className="rp-step-dot">
                        {state === 'done' ? <I.Check size={12}/> : s.num}
                      </div>
                      {i < STEPS.length - 1 && <div className="rp-step-connector"/>}
                    </div>
                    <div className="rp-step-text">
                      <span className="rp-step-label">{s.label}</span>
                      <span className="rp-step-desc">{s.desc}</span>
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Preview card si hay datos */}
            {(form.name || form.catId) && (
              <div className="rp-preview">
                <p className="rp-preview-label">Vista previa</p>
                <div className="rp-preview-card">
                  {selectedCat && (
                    <div className="rp-preview-cat">
                      <span className="cat-code">{selectedCat.code}</span>
                      <span>{selectedCat.name}</span>
                    </div>
                  )}
                  <div className="rp-preview-name">{form.name || 'Nombre del negocio'}</div>
                  {form.owner && <div className="rp-preview-owner">{form.owner}</div>}
                  {form.barrio && (
                    <div className="rp-preview-meta">
                      <I.MapPin size={11}/> {form.barrio}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── Columna derecha — Formulario ── */}
        <main className="rp-main">
          <div className="rp-form-wrap">

            {/* Step 1 */}
            {step === 1 && (
              <div className="rp-step-content">
                <div className="rp-form-header">
                  <span className="rp-form-step-num">01</span>
                  <h2 className="rp-form-title">Tu negocio</h2>
                  <p className="rp-form-sub">Cuéntanos quién eres y a qué te dedicas.</p>
                </div>

                <div className="rp-fields">
                  <div className="rp-field">
                    <label className="rp-label">
                      Nombre del negocio <span className="rp-req">*</span>
                    </label>
                    <input className={'rp-input' + (errors.name ? ' rp-input--err' : '')}
                      type="text" placeholder="Ej: Tienda El Progreso"
                      value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
                    {errors.name && <p className="rp-error"><I.X size={11}/> {errors.name}</p>}
                  </div>

                  <div className="rp-field">
                    <label className="rp-label">
                      Nombre del propietario <span className="rp-req">*</span>
                    </label>
                    <input className={'rp-input' + (errors.owner ? ' rp-input--err' : '')}
                      type="text" placeholder="Ej: María González"
                      value={form.owner} onChange={e => set('owner', e.target.value)} />
                    {errors.owner && <p className="rp-error"><I.X size={11}/> {errors.owner}</p>}
                  </div>

                  <div className="rp-field">
                    <label className="rp-label">
                      Categoría <span className="rp-req">*</span>
                    </label>
                    <div className="rp-cat-grid">
                      {CATEGORIES.map(c => (
                        <button key={c.id} type="button"
                          className={'rp-cat-chip' + (form.catId === c.id ? ' rp-cat-chip--on' : '')}
                          onClick={() => set('catId', c.id)}>
                          <span className={'cat-code' + (form.catId === c.id ? '' : ' dim')}>{c.code}</span>
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                    {errors.catId && <p className="rp-error"><I.X size={11}/> {errors.catId}</p>}
                  </div>

                  <div className="rp-field">
                    <label className="rp-label">Especialidad principal</label>
                    <input className="rp-input"
                      type="text" placeholder="Ej: Menú del día, Reparación de motos…"
                      value={form.specialty} onChange={e => set('specialty', e.target.value)} />
                    <p className="rp-hint">Lo que mejor describes tu negocio en pocas palabras.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="rp-step-content">
                <div className="rp-form-header">
                  <span className="rp-form-step-num">02</span>
                  <h2 className="rp-form-title">Ubicación y contacto</h2>
                  <p className="rp-form-sub">¿Dónde y cómo pueden encontrarte tus clientes?</p>
                </div>

                <div className="rp-fields">
                  <div className="rp-field-row">
                    <div className="rp-field">
                      <label className="rp-label">Barrio <span className="rp-req">*</span></label>
                      <div className={'rp-select-wrap' + (errors.barrio ? ' rp-input--err' : '')}>
                        <I.MapPin size={14} />
                        <select className="rp-select"
                          value={form.barrio} onChange={e => set('barrio', e.target.value)}>
                          <option value="">Selecciona…</option>
                          {barrios.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <I.ChevronD size={13} />
                      </div>
                      {errors.barrio && <p className="rp-error"><I.X size={11}/> {errors.barrio}</p>}
                    </div>

                    <div className="rp-field">
                      <label className="rp-label">Dirección <span className="rp-req">*</span></label>
                      <div className={'rp-input-icon-wrap' + (errors.address ? ' rp-input--err' : '')}>
                        <I.Navigate size={14}/>
                        <input className="rp-input-icon"
                          type="text" placeholder="Calle 12 #34-56"
                          value={form.address} onChange={e => set('address', e.target.value)} />
                      </div>
                      {errors.address && <p className="rp-error"><I.X size={11}/> {errors.address}</p>}
                    </div>
                  </div>

                  <div className="rp-field">
                    <label className="rp-label">Teléfono <span className="rp-req">*</span></label>
                    <div className={'rp-input-icon-wrap' + (errors.phone ? ' rp-input--err' : '')}>
                      <I.Phone size={14}/>
                      <input className="rp-input-icon"
                        type="tel" placeholder="311 234 5678"
                        value={form.phone} onChange={e => set('phone', e.target.value)} />
                    </div>
                    {errors.phone && <p className="rp-error"><I.X size={11}/> {errors.phone}</p>}
                    <label className="rp-checkbox-label">
                      <input type="checkbox" className="rp-checkbox"
                        checked={form.whatsapp} onChange={e => set('whatsapp', e.target.checked)}/>
                      <span className="rp-checkbox-box">{form.whatsapp && <I.Check size={10}/>}</span>
                      Este número tiene WhatsApp
                    </label>
                  </div>

                  <div className="rp-field">
                    <label className="rp-label">Días de atención</label>
                    <div className="rp-days">
                      {DAYS.map(d => (
                        <button key={d} type="button"
                          className={'rp-day' + (form.days.includes(d) ? ' rp-day--on' : '')}
                          onClick={() => toggleArr('days', d)}>{d}</button>
                      ))}
                    </div>
                  </div>

                  <div className="rp-field">
                    <label className="rp-label">Horario de atención</label>
                    <div className="rp-hours-row">
                      <div className="rp-hours-block">
                        <span className="rp-hours-lbl">Desde</span>
                        <div className="rp-select-wrap rp-select-sm">
                          <select className="rp-select"
                            value={form.openFrom} onChange={e => set('openFrom', e.target.value)}>
                            {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                          <I.ChevronD size={12}/>
                        </div>
                      </div>
                      <div className="rp-hours-dash">—</div>
                      <div className="rp-hours-block">
                        <span className="rp-hours-lbl">Hasta</span>
                        <div className="rp-select-wrap rp-select-sm">
                          <select className="rp-select"
                            value={form.openTo} onChange={e => set('openTo', e.target.value)}>
                            {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                          <I.ChevronD size={12}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="rp-step-content">
                <div className="rp-form-header">
                  <span className="rp-form-step-num">03</span>
                  <h2 className="rp-form-title">Detalles finales</h2>
                  <p className="rp-form-sub">Ayuda a tus clientes a conocerte mejor.</p>
                </div>

                <div className="rp-fields">
                  <div className="rp-field">
                    <label className="rp-label">
                      Descripción del negocio <span className="rp-req">*</span>
                      <span className="rp-char-count">{form.desc.length}/200</span>
                    </label>
                    <textarea className={'rp-textarea' + (errors.desc ? ' rp-input--err' : '')}
                      placeholder="Describe qué ofreces, qué te hace especial, por qué deben visitarte…"
                      maxLength={200} rows={5}
                      value={form.desc} onChange={e => set('desc', e.target.value)} />
                    {errors.desc && <p className="rp-error"><I.X size={11}/> {errors.desc}</p>}
                  </div>

                  <div className="rp-field">
                    <label className="rp-label">
                      Métodos de pago <span className="rp-req">*</span>
                    </label>
                    <div className="rp-payment-grid">
                      {PAYMENT_OPTIONS.map(p => {
                        const on = form.payments.includes(p.id);
                        return (
                          <button key={p.id} type="button"
                            className={'rp-payment-chip' + (on ? ' rp-payment-chip--on' : '')}
                            onClick={() => toggleArr('payments', p.id)}>
                            <span className="rp-payment-icon">{p.icon}</span>
                            <span className="rp-payment-label">{p.label}</span>
                            {on && <span className="rp-payment-check"><I.Check size={11}/></span>}
                          </button>
                        );
                      })}
                    </div>
                    {errors.payments && <p className="rp-error"><I.X size={11}/> {errors.payments}</p>}
                  </div>

                  {/* Resumen final */}
                  <div className="rp-summary">
                    <p className="rp-summary-title">Confirma tu registro</p>
                    <div className="rp-summary-grid">
                      <div className="rp-summary-item">
                        <span className="rp-summary-key">Negocio</span>
                        <span className="rp-summary-val">{form.name}</span>
                      </div>
                      <div className="rp-summary-item">
                        <span className="rp-summary-key">Propietario</span>
                        <span className="rp-summary-val">{form.owner}</span>
                      </div>
                      <div className="rp-summary-item">
                        <span className="rp-summary-key">Categoría</span>
                        <span className="rp-summary-val">{selectedCat?.name || '—'}</span>
                      </div>
                      <div className="rp-summary-item">
                        <span className="rp-summary-key">Ubicación</span>
                        <span className="rp-summary-val">{form.barrio} · {form.address}</span>
                      </div>
                      <div className="rp-summary-item">
                        <span className="rp-summary-key">Teléfono</span>
                        <span className="rp-summary-val">{form.phone}{form.whatsapp ? ' · WhatsApp' : ''}</span>
                      </div>
                      <div className="rp-summary-item">
                        <span className="rp-summary-key">Horario</span>
                        <span className="rp-summary-val">{form.openFrom} – {form.openTo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navegación */}
            <div className="rp-nav">
              <div className="rp-nav-left">
                {step > 1 && (
                  <button className="rp-btn-back" onClick={prev}>
                    <I.ArrowL size={14}/> Anterior
                  </button>
                )}
              </div>
              <div className="rp-nav-right">
                <span className="rp-nav-progress">{step} de 3</span>
                {step < 3
                  ? <button className="rp-btn-primary" onClick={next}>
                      Siguiente <I.ArrowR size={14}/>
                    </button>
                  : <button className="rp-btn-primary rp-btn-submit" onClick={submit}>
                      <I.Check size={14}/> Registrar negocio
                    </button>
                }
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


// ---------- StatsPage ----------
function StatsPage({ businesses, barrios, onBack }) {
  const [activeBarrio, setActiveBarrio] = React.useState('todos');

  // ── Cálculos generales ──────────────────────────────────────
  const total      = businesses.length;
  const verified   = businesses.filter(b => b.verified).length;
  const openNow    = businesses.filter(b => b.openNow).length;
  const withWA     = businesses.filter(b => b.whatsapp).length;
  const avgRating  = total ? (businesses.reduce((s, b) => s + b.rating, 0) / total).toFixed(1) : 0;
  const totalReviews = businesses.reduce((s, b) => s + b.reviews, 0);

  // ── Por barrio ──────────────────────────────────────────────
  const byBarrio = barrios.map(br => {
    const biz = businesses.filter(b => b.barrio === br);
    const avg = biz.length ? (biz.reduce((s, b) => s + b.rating, 0) / biz.length).toFixed(1) : '—';
    const topCat = (() => {
      const counts = {};
      biz.forEach(b => { counts[b.cat] = (counts[b.cat] || 0) + 1; });
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      return top ? CATEGORIES.find(c => c.id === top[0])?.name : '—';
    })();
    return { name: br, count: biz.length, avg, topCat, open: biz.filter(b => b.openNow).length };
  }).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...byBarrio.map(b => b.count), 1);

  // ── Por categoría ───────────────────────────────────────────
  const byCat = CATEGORIES.map(cat => {
    const biz = businesses.filter(b => b.cat === cat.id);
    const avg = biz.length ? (biz.reduce((s, b) => s + b.rating, 0) / biz.length).toFixed(1) : '—';
    return { ...cat, count: biz.length, avg };
  }).sort((a, b) => b.count - a.count);

  const maxCatCount = Math.max(...byCat.map(c => c.count), 1);

  // ── Métodos de pago ─────────────────────────────────────────
  const paymentCounts = {};
  businesses.forEach(b => b.payments.forEach(p => {
    paymentCounts[p] = (paymentCounts[p] || 0) + 1;
  }));
  const payments = Object.entries(paymentCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, pct: Math.round(count / total * 100) }));

  // ── Filtro de barrio ────────────────────────────────────────
  const filtered = activeBarrio === 'todos'
    ? businesses
    : businesses.filter(b => b.barrio === activeBarrio);

  const filteredCats = CATEGORIES.map(cat => ({
    ...cat,
    count: filtered.filter(b => b.cat === cat.id).length,
  })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">ED</div>
          <div className="brand-name">
            Econo<span className="brand-accent">Directorio</span>
            <span className="brand-meta">DIR · v2.0</span>
          </div>
        </div>
        <div className="st-topbar-title">
          <I.Sliders size={14} />
          <span>Panel de estadísticas</span>
        </div>
        <div className="top-actions">
          <button className="btn-ghost" onClick={onBack}>
            <I.ArrowL size={14} /> Volver
          </button>
        </div>
      </header>

      <div className="st-page">

        {/* ── KPIs generales ── */}
        <div className="st-kpis">
          <div className="st-kpi">
            <span className="st-kpi-val">{total}</span>
            <span className="st-kpi-label">Negocios totales</span>
          </div>
          <div className="st-kpi">
            <span className="st-kpi-val st-kpi-accent">{avgRating}</span>
            <span className="st-kpi-label">Rating promedio</span>
          </div>
          <div className="st-kpi">
            <span className="st-kpi-val">{openNow}</span>
            <span className="st-kpi-label">Abiertos ahora</span>
          </div>
          <div className="st-kpi">
            <span className="st-kpi-val">{verified}</span>
            <span className="st-kpi-label">Verificados</span>
          </div>
          <div className="st-kpi">
            <span className="st-kpi-val">{withWA}</span>
            <span className="st-kpi-label">Con WhatsApp</span>
          </div>
          <div className="st-kpi">
            <span className="st-kpi-val">{totalReviews.toLocaleString('es-CO')}</span>
            <span className="st-kpi-label">Total reseñas</span>
          </div>
        </div>

        <div className="st-grid">

          {/* ── Negocios por barrio ── */}
          <div className="st-card st-card--wide">
            <div className="st-card-head">
              <h2 className="st-card-title">Negocios por barrio</h2>
              <span className="st-card-sub">{barrios.length} zonas registradas</span>
            </div>
            <div className="st-bars">
              {byBarrio.map(br => (
                <div key={br.name} className={'st-bar-row ' + (activeBarrio === br.name ? 'st-bar-row--active' : '')}
                  onClick={() => setActiveBarrio(activeBarrio === br.name ? 'todos' : br.name)}
                  title="Clic para filtrar">
                  <div className="st-bar-label">
                    <span className="st-bar-name">{br.name}</span>
                    <span className="st-bar-meta">{br.topCat}</span>
                  </div>
                  <div className="st-bar-track">
                    <div className="st-bar-fill" style={{ width: `${(br.count / maxCount) * 100}%` }} />
                  </div>
                  <div className="st-bar-right">
                    <span className="st-bar-count">{br.count}</span>
                    <span className="st-bar-rating">★ {br.avg}</span>
                  </div>
                </div>
              ))}
            </div>
            {activeBarrio !== 'todos' && (
              <button className="st-clear-filter" onClick={() => setActiveBarrio('todos')}>
                <I.X size={11} /> Mostrando {activeBarrio} — quitar filtro
              </button>
            )}
          </div>

          {/* ── Distribución por categoría ── */}
          <div className="st-card">
            <div className="st-card-head">
              <h2 className="st-card-title">
                {activeBarrio === 'todos' ? 'Por categoría' : `Categorías · ${activeBarrio}`}
              </h2>
              <span className="st-card-sub">{filtered.length} negocios</span>
            </div>
            <div className="st-cat-list">
              {(activeBarrio === 'todos' ? byCat : filteredCats).map(cat => (
                <div key={cat.id} className="st-cat-row">
                  <span className="cat-code">{cat.code}</span>
                  <span className="st-cat-name">{cat.name}</span>
                  <div className="st-cat-bar-track">
                    <div className="st-cat-bar-fill"
                      style={{ width: `${(cat.count / (activeBarrio === 'todos' ? maxCatCount : filteredCats[0]?.count || 1)) * 100}%` }} />
                  </div>
                  <span className="st-cat-count">{cat.count}</span>
                  {activeBarrio === 'todos' && <span className="st-cat-rating">★ {cat.avg}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* ── Métodos de pago ── */}
          <div className="st-card">
            <div className="st-card-head">
              <h2 className="st-card-title">Métodos de pago</h2>
              <span className="st-card-sub">Adopción en el directorio</span>
            </div>
            <div className="st-payments">
              {payments.map(p => (
                <div key={p.name} className="st-payment-row">
                  <span className="st-payment-name">{p.name}</span>
                  <div className="st-payment-track">
                    <div className="st-payment-fill" style={{ width: `${p.pct}%` }} />
                  </div>
                  <span className="st-payment-pct">{p.pct}%</span>
                  <span className="st-payment-count">{p.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Ranking top negocios ── */}
          <div className="st-card">
            <div className="st-card-head">
              <h2 className="st-card-title">Top 5 · Mejor calificados</h2>
              <span className="st-card-sub">
                {activeBarrio === 'todos' ? 'Todo el directorio' : activeBarrio}
              </span>
            </div>
            <div className="st-ranking">
              {filtered
                .filter(b => b.reviews > 0)
                .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
                .slice(0, 5)
                .map((b, i) => {
                  const cat = CATEGORIES.find(c => c.id === b.cat);
                  return (
                    <div key={b.id} className="st-rank-row">
                      <span className={'st-rank-num ' + (i === 0 ? 'st-rank-num--gold' : i === 1 ? 'st-rank-num--silver' : i === 2 ? 'st-rank-num--bronze' : '')}>
                        {i + 1}
                      </span>
                      <div className="st-rank-body">
                        <span className="st-rank-name">{b.name}</span>
                        <span className="st-rank-meta">
                          <span className="cat-code dim">{cat?.code}</span>
                          {b.barrio}
                        </span>
                      </div>
                      <div className="st-rank-right">
                        <span className="st-rank-rating">★ {b.rating}</span>
                        <span className="st-rank-reviews">{b.reviews} reseñas</span>
                      </div>
                    </div>
                  );
                })}
              {filtered.filter(b => b.reviews > 0).length === 0 && (
                <p className="st-empty">Sin negocios con reseñas en esta zona.</p>
              )}
            </div>
          </div>

          {/* ── Cobertura ── */}
          <div className="st-card st-card--wide">
            <div className="st-card-head">
              <h2 className="st-card-title">Cobertura de servicios</h2>
              <span className="st-card-sub">
                {activeBarrio === 'todos' ? 'Todo el directorio' : activeBarrio}
              </span>
            </div>
            <div className="st-coverage">
              {[
                { label: 'Negocios verificados',  val: filtered.filter(b => b.verified).length,      total: filtered.length, color: 'var(--accent)' },
                { label: 'Abiertos ahora',         val: filtered.filter(b => b.openNow).length,       total: filtered.length, color: 'var(--open)'   },
                { label: 'Con WhatsApp',            val: filtered.filter(b => b.whatsapp).length,     total: filtered.length, color: '#25D366'       },
                { label: 'Hacen domicilio',         val: filtered.filter(b => b.tags.some(t => /domicilio/i.test(t))).length, total: filtered.length, color: 'var(--warn)' },
                { label: 'Aceptan Nequi',           val: filtered.filter(b => b.payments.some(p => /nequi/i.test(p))).length, total: filtered.length, color: '#8B5CF6' },
              ].map(item => {
                const pct = item.total ? Math.round(item.val / item.total * 100) : 0;
                return (
                  <div key={item.label} className="st-cov-row">
                    <span className="st-cov-label">{item.label}</span>
                    <div className="st-cov-track">
                      <div className="st-cov-fill" style={{ width: `${pct}%`, background: item.color }} />
                    </div>
                    <span className="st-cov-val">{item.val}<span className="st-cov-total">/{item.total}</span></span>
                    <span className="st-cov-pct">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
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
  const [ratingTarget, setRatingTarget] = useState(null);
  const [page, setPage] = useState('home'); // 'home' | 'register' | 'stats'
  const [businesses, setBusinesses] = useState(BUSINESSES);
  const [barrios, setBarrios] = useState(window.DATA.BARRIOS);
  // Barrios: parte del seed + crece con cada nuevo negocio registrado

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
    if (mode === 'rate') { setRatingTarget(b); return; }
    if (mode === 'call') showToast(`Llamando a ${b.name} · ${b.phone}`);
    else if (mode === 'wa') showToast(`Abriendo WhatsApp · ${b.name}`);
    else if (mode === 'route') {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.address + ', ' + b.barrio + ', Colombia')}`, '_blank');
      showToast(`Abriendo Google Maps · ${b.address}`);
    }
  };

  const onRate = (b) => setRatingTarget(b);

  const onSubmitRating = ({ rating, author, comment }) => {
    const newReview = { author, rating, text: comment, date: 'Ahora' };
    setBusinesses(prev => prev.map(b => {
      if (b.id !== ratingTarget.id) return b;
      const reviews    = (b.userReviews || []);
      const allRatings = [...reviews.map(r => r.rating), rating];
      const newAvg     = (allRatings.reduce((s, r) => s + r, 0) / allRatings.length);
      return {
        ...b,
        userReviews: [newReview, ...reviews],
        rating:  Math.round(newAvg * 10) / 10,
        reviews: b.reviews + 1,
      };
    }));
    setRatingTarget(null);
    showToast(`¡Reseña publicada para ${ratingTarget.name}!`);
  };

  const onRegister = (newBusiness) => {
    setBusinesses(prev => [newBusiness, ...prev]);
    if (newBusiness.barrio) {
      setBarrios(prev =>
        prev.includes(newBusiness.barrio) ? prev : [...prev, newBusiness.barrio]
      );
    }
    setPage('home');
    showToast(`¡${newBusiness.name} ya está en el directorio!`);
  };

  const resetFilters = () => {
    setFilters({ openNow: false, verified: false, delivery: false, nequi: false, topRated: false });
    setQuery('');
    setCatId(null);
  };

  // Filtering
  const items = useMemo(() => {
    let r = businesses.slice();
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
  }, [catId, query, filters, sort, barrio, businesses]);

  // Spotlight: top 3 by rating (only on home, no filters/query)
  const spotlight = useMemo(() => {
    if (catId || query || Object.values(filters).some(Boolean)) return [];
    return businesses.filter(b => b.verified).sort((a, b) => b.rating - a.rating).slice(0, 3);
  }, [catId, query, filters, businesses]);

  const counts = { total: businesses.length };
  const catName = catId ? CATEGORIES.find(c => c.id === catId).name : null;

  // Esc to close detail
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') setActive(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (page === 'stats') {
    return <StatsPage businesses={businesses} barrios={barrios} onBack={() => setPage('home')} />;
  }

  if (page === 'register') {
    return <RegisterPage onBack={() => setPage('home')} showToast={showToast} onRegister={onRegister} barrios={barrios} />;
  }

  return (
    <div className="app">
      <TopBar query={query} setQuery={setQuery} barrio={barrio} setBarrio={setBarrio}
        barrios={barrios} onOpenMerchant={() => setPage('register')} onOpenStats={() => setPage('stats')} />

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
        onSave={onSave} onRate={onRate} />

      {active && <div className="scrim" onClick={() => setActive(null)} />}

      <Toast msg={toast} />
      {ratingTarget && (
        <RatingModal
          business={ratingTarget}
          onClose={() => setRatingTarget(null)}
          onSubmit={onSubmitRating}
        />
      )}
    </div>
  );
}

window.App = App;
