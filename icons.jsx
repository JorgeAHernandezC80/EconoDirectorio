// Iconos — set mínimo, trazo 1.5, estilo Lucide-like
// Cada uno acepta {size, className} y hereda currentColor

const _icon = (paths, vb = '0 0 24 24') => ({ size = 16, className = '', style = {} }) => (
  <svg width={size} height={size} viewBox={vb} fill="none" stroke="currentColor"
       strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
       className={className} style={style} aria-hidden="true">
    {paths}
  </svg>
);

const Icon = {
  Search:   _icon(<><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>),
  MapPin:   _icon(<><path d="M20 10c0 7-8 13-8 13S4 17 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>),
  Clock:    _icon(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>),
  Phone:    _icon(<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/>),
  Star:     _icon(<path d="M12 2 15.09 8.26 22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2Z"/>),
  Check:    _icon(<path d="m5 12 5 5L20 7"/>),
  ChevronR: _icon(<path d="m9 6 6 6-6 6"/>),
  ChevronD: _icon(<path d="m6 9 6 6 6-6"/>),
  Filter:   _icon(<path d="M3 6h18M6 12h12M10 18h4"/>),
  Heart:    _icon(<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/>),
  Share:    _icon(<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></>),
  Message:  _icon(<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 0 1 15.1-3.8 8.4 8.4 0 0 1 1 0Z"/>),
  X:        _icon(<path d="M18 6 6 18M6 6l12 12"/>),
  Menu:     _icon(<path d="M3 6h18M3 12h18M3 18h18"/>),
  Navigate: _icon(<><path d="m3 11 19-9-9 19-2-8-8-2Z"/></>),
  Sliders:  _icon(<><path d="M4 21V14M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M1 14h6M9 8h6M17 16h6"/></>),
  Grid:     _icon(<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>),
  List:     _icon(<><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="0.5"/><circle cx="4" cy="12" r="0.5"/><circle cx="4" cy="18" r="0.5"/></>),
  Map:      _icon(<><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/></>),
  Plus:     _icon(<path d="M12 5v14M5 12h14"/>),
  Truck:    _icon(<><rect x="1" y="6" width="14" height="11" rx="1"/><path d="M15 9h4l3 3v5h-7V9Z"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></>),
  Wallet:   _icon(<><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/></>),
  Calendar: _icon(<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>),
  Verified: _icon(<><path d="m9 12 2 2 4-4"/><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Z"/></>),
  ArrowR:   _icon(<><path d="M5 12h14M13 5l7 7-7 7"/></>),
  ArrowL:   _icon(<><path d="M19 12H5M11 5l-7 7 7 7"/></>),
  Dot:      _icon(<circle cx="12" cy="12" r="4" fill="currentColor"/>),
  Bookmark: _icon(<path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z"/>),
};

window.Icon = Icon;