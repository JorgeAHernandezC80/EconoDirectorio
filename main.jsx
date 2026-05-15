// Wrap App with a tweaks-aware mount so we keep the hook ergonomics
  function Root() {
    const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);

    // Apply theme + density + accent via classes / vars
    React.useEffect(() => {
      document.documentElement.classList.toggle('is-dark', t.theme === 'dark');
      document.documentElement.classList.toggle('is-compact', t.density === 'compact');
      // Derive accent variants by adjusting the lightness
      const m = (t.accent || '').match(/oklch\(\s*([0-9.]+)%\s+([0-9.]+)\s+([0-9.]+)/);
      if (m) {
        const [, L, C, H] = m;
        document.documentElement.style.setProperty('--accent', t.accent);
        document.documentElement.style.setProperty('--accent-2', `oklch(${Math.min(100, +L + 8)}% ${C} ${H})`);
        document.documentElement.style.setProperty('--accent-soft', `oklch(94% 0.03 ${H})`);
        document.documentElement.style.setProperty('--accent-ink',  `oklch(${Math.max(0, +L - 12)}% ${Math.max(0, +C - 0.015)} ${H})`);
      }
    }, [t.theme, t.density, t.accent]);

    return (
      <>
        <App />
        <TweaksPanel>
          <TweakSection label="Vista" />
          <TweakRadio  label="Densidad" value={t.density}
                       options={['compact', 'regular']}
                       onChange={v => setTweak('density', v)} />
          <TweakRadio  label="Tema" value={t.theme}
                       options={['light', 'dark']}
                       onChange={v => setTweak('theme', v)} />
          <TweakSection label="Marca" />
          <TweakColor  label="Acento" value={t.accent}
                       options={[
                         'oklch(40% 0.075 155)',
                         'oklch(52% 0.110 45)',
                         'oklch(42% 0.110 270)',
                         'oklch(38% 0.110 330)',
                       ]}
                       onChange={v => setTweak('accent', v)} />
        </TweaksPanel>
      </>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<Root />);