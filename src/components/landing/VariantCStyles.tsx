export default function VariantCStyles() {
  return (
    <style>{`
      .vc-root { font-family: var(--font-body); }

      /* ── Skip link ── */
      .vc-skip-link {
        position: fixed; top: -100%; left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background: var(--accent); color: white;
        border-radius: 0 0 12px 12px;
        font-size: 14px; font-weight: 600;
        text-decoration: none; z-index: 1000;
        transition: top 0.2s; white-space: nowrap;
      }
      .vc-skip-link:focus { top: 0; outline: 3px solid white; outline-offset: 2px; }

      /* ── Badges accesibles ── */
      .vc-badge-paid {
        font-size: 11px; padding: 3px 8px; border-radius: 100px;
        background: oklch(0.55 0.18 145 / 0.25);
        color: oklch(0.88 0.18 145);
        letter-spacing: 0.1em; font-family: var(--font-mono);
      }
      [data-theme="light"] .vc-badge-paid {
        background: oklch(0.88 0.15 145 / 0.4);
        color: oklch(0.25 0.15 145);
      }
      .vc-badge-live {
        font-size: 11px; letter-spacing: 0.12em;
        color: oklch(0.7 0.18 145);
        font-family: var(--font-mono);
      }
      [data-theme="light"] .vc-badge-live {
        color: oklch(0.32 0.18 145);
      }
      .vc-badge-live { display: inline-flex; align-items: center; gap: 7px; }
      .vc-live-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: oklch(0.7 0.2 145); box-shadow: 0 0 8px oklch(0.7 0.2 145);
        animation: vcLivePulse 1.4s infinite;
      }
      @keyframes vcLivePulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%      { opacity: 0.4; transform: scale(1.4); }
      }
      .vc-badge-pending {
        font-size: 11px; padding: 3px 8px; border-radius: 100px;
        background: oklch(0.7 0.15 75 / 0.2);
        color: oklch(0.85 0.14 80);
        letter-spacing: 0.1em; font-family: var(--font-mono);
        animation: vcPendingBlink 1s ease-in-out infinite;
      }
      [data-theme="light"] .vc-badge-pending {
        background: oklch(0.9 0.12 85 / 0.5);
        color: oklch(0.4 0.12 70);
      }
      @keyframes vcPendingBlink { 50% { opacity: 0.55; } }
      .vc-badge-pop { animation: vcBadgePop 0.45s var(--ease-out); }
      @keyframes vcBadgePop {
        0%   { transform: scale(0.7); opacity: 0; }
        60%  { transform: scale(1.12); opacity: 1; }
        100% { transform: scale(1); }
      }

      /* ── Background ── */
      .vc-bg {
        position: absolute; inset: 0;
        background: linear-gradient(180deg, oklch(0.07 0.02 280), oklch(0.05 0.01 280));
        z-index: 0;
      }
      [data-theme="light"] .vc-bg {
        background: linear-gradient(180deg, oklch(0.97 0.01 280), oklch(0.94 0.02 290));
      }
      .vc-blobs { position: absolute; inset: 0; z-index: 1; overflow: hidden; pointer-events: none; }
      .vc-blob {
        position: absolute; border-radius: 50%;
        filter: blur(100px); will-change: transform; opacity: 0.7;
      }
      .vc-blob-1 {
        width: 900px; height: 900px; top: -300px; left: -200px;
        background: radial-gradient(circle, oklch(0.5 0.25 290), transparent 60%);
      }
      .vc-blob-2 {
        width: 700px; height: 700px; top: 200px; right: -200px;
        background: radial-gradient(circle, oklch(0.5 0.25 320), transparent 60%);
      }
      .vc-blob-3 {
        width: 1000px; height: 1000px; top: 1400px; left: 30%;
        background: radial-gradient(circle, oklch(0.45 0.22 270), transparent 60%);
        opacity: 0.5;
      }
      [data-theme="light"] .vc-blob { opacity: 0.5; }
      [data-theme="light"] .vc-blob-1 { background: radial-gradient(circle, oklch(0.85 0.15 290), transparent 60%); }
      [data-theme="light"] .vc-blob-2 { background: radial-gradient(circle, oklch(0.88 0.12 320), transparent 60%); }
      [data-theme="light"] .vc-blob-3 { background: radial-gradient(circle, oklch(0.82 0.14 270), transparent 60%); }
      .vc-stage { position: relative; z-index: 3; }

      /* ── Nav ── */
      .vc-nav {
        display: flex; align-items: center; justify-content: space-between;
        padding: 20px 60px;
        position: fixed; top: 0; left: 0; right: 0; z-index: 50;
        background: transparent;
      }
      .vc-nav-pill {
        display: flex; gap: 4px; padding: 6px; border-radius: 100px;
      }
      .vc-nav-pill a {
        padding: 8px 16px; border-radius: 100px;
        font-size: 13.5px; color: var(--fg-2); cursor: pointer; transition: all 0.3s;
      }
      .vc-nav-pill a:hover { color: var(--fg-0); }
      .vc-nav-pill a.active { color: var(--fg-0); background: var(--glass-bg-strong); }

      /* ── Hero ── */
      .vc-hero {
        display: grid; grid-template-columns: 1fr 1fr;
        align-items: center; gap: 60px;
        padding: 140px 60px 100px; min-height: 100vh;
      }
      .vc-eyeline {
        display: inline-flex; align-items: center; gap: 12px;
        font-size: 11px; letter-spacing: 0.18em; color: var(--fg-2); margin-bottom: 36px;
      }
      .vc-eyeline-bar { width: 24px; height: 1px; background: var(--accent); }
      .vc-h1 {
        font-size: clamp(56px, 8vw, 124px);
        line-height: 0.92; letter-spacing: -0.045em; font-weight: 600;
      }
      .vc-h1-part { display: block; }
      .vc-h1-out { color: var(--fg-0); }
      .vc-h1-mid {
        font-style: italic; font-weight: 400;
        background: linear-gradient(180deg, var(--fg-1), var(--fg-3));
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      .vc-h1-bright {
        /* background-clip: text only paints inside the box; the tight line-height cuts descenders (g, p, y) */
        padding-bottom: 0.18em; margin-bottom: -0.18em;
        background: linear-gradient(135deg, var(--v-200), var(--v-500) 60%, var(--v-700));
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      .ma-root .vc-hero-sub { margin-top: 36px; font-size: 18px; line-height: 1.55; color: var(--fg-2); max-width: 480px; }
      .vc-cta-row { display: flex; gap: 14px; align-items: center; margin-top: 40px; }
      .vc-play-btn {
        display: flex; align-items: center; gap: 12px; padding: 8px 16px 8px 8px;
        border-radius: 100px; background: var(--glass-bg); border: 1px solid var(--glass-border);
        backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        cursor: pointer; transition: background 0.3s, transform 0.3s;
        text-decoration: none;
      }
      .vc-play-btn:hover { background: var(--glass-bg-strong); transform: translateY(-1px); }
      .vc-play-icon {
        width: 32px; height: 32px; border-radius: 50%;
        background: var(--accent-strong);
        display: flex; align-items: center; justify-content: center; padding-left: 2px;
        flex-shrink: 0;
      }
      .vc-hero-r { position: relative; height: 540px; transition: transform 0.4s var(--ease-out); will-change: transform; }
      .vc-card-stack { position: absolute; inset: 0; transform-style: preserve-3d; }
      .vc-stack-back { position: absolute; inset: 0; border-radius: var(--r-lg); overflow: hidden; opacity: 0.7; }
      .vc-stack-front { position: absolute; inset: 0; }
      .vc-stack-front > .live-cal { box-shadow: var(--shadow-floating); }
      .vc-stack-noti {
        position: absolute; bottom: -20px; right: -30px;
        display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 16px;
      }
      .vc-noti-icon {
        width: 32px; height: 32px; border-radius: 50%;
        background: linear-gradient(135deg, oklch(0.7 0.18 145), oklch(0.55 0.2 145));
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }

      /* ── Words marquee ── */
      .vc-words { padding: 80px 0; overflow: hidden; position: relative; }
      .vc-words-track {
        mask-image: linear-gradient(90deg, transparent, black 5%, black 95%, transparent);
        -webkit-mask-image: linear-gradient(90deg, transparent, black 5%, black 95%, transparent);
      }
      .vc-words-row {
        display: flex; gap: 60px; align-items: center;
        animation: vcMarquee 35s linear infinite; white-space: nowrap;
      }
      .vc-word {
        display: inline-flex; align-items: center; gap: 60px;
        font-family: var(--font-display); font-style: italic;
        font-size: clamp(60px, 9vw, 140px); font-weight: 400; letter-spacing: -0.04em;
        color: transparent; -webkit-text-stroke: 1.5px var(--fg-2); opacity: 0.5; flex-shrink: 0;
      }
      .vc-word-star { font-size: 50%; color: var(--accent); -webkit-text-stroke: 0; opacity: 1; }
      @keyframes vcMarquee {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }

      /* ── Section headings ── */
      .vc-h2 { font-size: clamp(40px, 5.6vw, 80px); line-height: 1; letter-spacing: -0.04em; font-weight: 600; }
      .vc-h2 em {
        font-style: italic; font-weight: 400;
        background: linear-gradient(180deg, var(--v-300), var(--v-500));
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      .vc-section-head { text-align: center; margin-bottom: 100px; }

      /* ── Features alternating ── */
      .vc-features { padding: 80px 60px; }
      .vc-feature {
        display: grid; grid-template-columns: 1fr 1fr; gap: 80px;
        align-items: center; padding: 80px 0;
      }
      .vc-feature-l .vc-feature-text { order: 2; }
      .vc-feature-l .vc-feature-visual { order: 1; }
      .vc-f-eb { font-size: 11px; letter-spacing: 0.18em; color: var(--fg-3); margin-bottom: 18px; }
      .ma-root .vc-feature-t { font-size: clamp(32px, 4vw, 56px); line-height: 1.05; letter-spacing: -0.035em; font-weight: 600; margin-bottom: 18px; }
      .vc-feature-d { font-size: 17px; line-height: 1.55; color: var(--fg-2); max-width: 440px; }
      .vc-link-btn {
        display: inline-flex; align-items: center; gap: 8px; margin-top: 28px;
        font-size: 14px; color: var(--accent); font-weight: 600; cursor: pointer; transition: gap 0.3s;
      }
      .vc-link-btn:hover { gap: 12px; }
      .vc-vis { position: relative; padding: 26px; border-radius: var(--r-xl); min-height: 320px; }
      .vc-vis-reminders { background: transparent; border: none; backdrop-filter: none; -webkit-backdrop-filter: none; box-shadow: none; }
      .vc-bubble { padding: 14px 18px; border-radius: 18px; max-width: 320px; }
      .vc-bubble-r1 { margin-left: 0; }
      .vc-bubble-r2 { margin-left: 60px; margin-top: 16px; }
      .vc-bubble-r3 { margin-left: 30px; margin-top: 16px; }
      .vc-book-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--glass-border); }
      .vc-book-row:last-child { border-bottom: none; }
      /* Fixed-height list: rows pushed past the bottom fade out under the mask instead of vanishing. */
      .vc-book-list {
        height: 236px; overflow: hidden;
        -webkit-mask-image: linear-gradient(180deg, #000 72%, transparent);
                mask-image: linear-gradient(180deg, #000 72%, transparent);
      }
      .vc-book-new { animation: vcBookIn 0.7s var(--ease-out); }
      .vc-book-new .vc-book-bar { animation: vcBarGlow 1.4s ease-out; }
      @keyframes vcBookIn {
        from { max-height: 0; opacity: 0; transform: translateY(-8px) scale(0.97); padding-top: 0; padding-bottom: 0; }
        to   { max-height: 70px; opacity: 1; transform: none; }
      }
      /* ── Payments card ── */
      .vc-pay-bar {
        height: 100%; border-radius: 2px;
        background: linear-gradient(90deg, var(--v-400), var(--v-600));
        transition: width 1.2s var(--ease-out);
      }
      .vc-pay-flash { animation: vcPayFlash 1.2s ease-out; }
      @keyframes vcPayFlash {
        0%, 25% { color: oklch(0.85 0.18 145); }
        100%    { color: var(--fg-2); }
      }
      .vc-pay-toast {
        position: absolute; top: 22px; right: 22px; z-index: 2;
        display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
        padding: 8px 12px; border-radius: 12px; font-size: 11px;
        animation: vcToast 2.2s var(--ease-out) forwards;
      }
      .vc-pay-toast-amt {
        font-family: var(--font-mono); font-size: 13px; font-weight: 600;
        color: oklch(0.85 0.18 145);
      }
      [data-theme="light"] .vc-pay-toast-amt { color: oklch(0.42 0.16 145); }
      @keyframes vcToast {
        0%   { opacity: 0; transform: translateY(-8px) scale(0.96); }
        15%  { opacity: 1; transform: none; }
        80%  { opacity: 1; transform: none; }
        100% { opacity: 0; transform: translateY(-4px); }
      }

      /* ── Insights chart: line draws in once the card is visible ── */
      .vc-chart-line {
        stroke-dasharray: 1; stroke-dashoffset: 1;
        transition: stroke-dashoffset 1.8s var(--ease-out);
      }
      .vc-chart-area { opacity: 0; transition: opacity 1s ease 0.9s; }
      .vc-chart-on .vc-chart-line { stroke-dashoffset: 0; }
      .vc-chart-on .vc-chart-area { opacity: 1; }
      .vc-chart-dot {
        position: absolute; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%;
        background: oklch(0.8 0.18 290); box-shadow: 0 0 10px oklch(0.75 0.2 290);
        opacity: 0; transition: opacity 0.4s ease 1.7s;
      }
      .vc-chart-on .vc-chart-dot { opacity: 1; animation: vcLivePulse 1.4s infinite 1.7s; }

      /* ── Studio mockup (mirrors /editor: topbar · sections · canvas · design panel) ── */
      .vc-studio { padding: 0; overflow: hidden; display: flex; flex-direction: column; height: 410px; min-height: 0; font-size: 10px; color: var(--fg-1); }
      .vc-st-top {
        display: flex; align-items: center; justify-content: space-between; gap: 10px;
        padding: 10px 14px; border-bottom: 1px solid var(--glass-border);
      }
      .vc-st-top-l { display: flex; align-items: center; gap: 8px; min-width: 0; color: var(--fg-2); }
      .vc-st-title { font-weight: 600; color: var(--fg-0); font-size: 11px; white-space: nowrap; }
      .vc-st-save {
        display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 100px;
        font-size: 9px; color: oklch(0.75 0.15 145); background: oklch(0.6 0.15 145 / 0.12);
        transition: color 0.3s, background 0.3s; white-space: nowrap;
      }
      .vc-st-save.is-saving { color: var(--fg-2); background: var(--glass-bg); }
      .vc-st-spin { animation: vcSpin 0.8s linear infinite; }
      @keyframes vcSpin { to { transform: rotate(360deg); } }
      .vc-st-devices { display: flex; gap: 2px; padding: 2px; border-radius: 8px; border: 1px solid var(--glass-border); }
      .vc-st-devices span { display: inline-flex; padding: 4px 6px; border-radius: 6px; color: var(--fg-3); transition: background 0.3s, color 0.3s; }
      .vc-st-devices span.is-on { background: var(--glass-bg-strong); color: var(--fg-0); }
      .vc-st-publish {
        padding: 5px 11px; border-radius: 100px; font-size: 10px; font-weight: 600; white-space: nowrap;
        background: var(--accent); color: white; transition: background 0.3s;
      }
      .vc-st-focus { animation: vcStFocus 0.9s ease-out; }
      @keyframes vcStFocus {
        0%   { box-shadow: 0 0 0 0 oklch(0.7 0.22 290 / 0.7); transform: scale(0.94); }
        40%  { transform: scale(1.04); }
        100% { box-shadow: 0 0 0 10px oklch(0.7 0.22 290 / 0); transform: none; }
      }

      .vc-st-body { flex: 1; display: grid; grid-template-columns: 118px 1fr 148px; min-height: 0; }
      .vc-st-left, .vc-st-right { padding: 10px; display: flex; flex-direction: column; gap: 5px; }
      .vc-st-left { border-right: 1px solid var(--glass-border); }
      .vc-st-right { border-left: 1px solid var(--glass-border); }
      .vc-st-left-h { display: flex; justify-content: space-between; align-items: center; gap: 4px; margin-bottom: 3px; font-size: 9.5px; font-weight: 600; color: var(--fg-0); }
      .vc-st-add {
        display: inline-flex; align-items: center; gap: 2px; font-size: 8.5px; font-weight: 500;
        padding: 2px 5px; border-radius: 5px; border: 1px solid var(--glass-border); color: var(--fg-2);
      }
      .vc-st-srow {
        display: flex; align-items: center; gap: 4px; padding: 5px 6px; border-radius: 6px;
        background: var(--glass-bg); border: 1px solid var(--glass-border);
      }
      .vc-st-srow.is-new { animation: vcStRowIn 0.6s var(--ease-out); border-color: oklch(0.7 0.2 290 / 0.6); }
      @keyframes vcStRowIn {
        from { opacity: 0; transform: translateX(-10px); max-height: 0; padding-top: 0; padding-bottom: 0; }
        to   { opacity: 1; transform: none; max-height: 30px; }
      }
      .vc-st-grip { color: var(--fg-3); flex-shrink: 0; }
      .vc-st-sname { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

      .vc-st-canvas {
        position: relative; padding: 12px; display: flex; justify-content: center; align-items: flex-start;
        background: oklch(0 0 0 / 0.25); overflow: hidden;
      }
      [data-theme="light"] .vc-st-canvas { background: oklch(0.9 0.01 280 / 0.5); }
      .vc-st-page {
        width: 100%; border-radius: 8px; overflow: hidden;
        background: var(--sp-bg); color: var(--sp-fg); border: 1px solid var(--sp-line);
        box-shadow: 0 8px 24px -8px oklch(0 0 0 / 0.5);
        transition: width 0.6s var(--ease-out), background 0.6s, color 0.6s, border-color 0.6s;
      }
      .vc-st-page.is-mobile { width: 46%; }
      .vc-st-page * { transition: background 0.6s, color 0.6s, border-color 0.6s; }
      .vc-st-hero {
        position: relative; height: 190px; display: flex; flex-direction: column; justify-content: flex-end;
        padding: 10px; color: #fff;
        background:
          linear-gradient(180deg, rgba(0,0,0,0.05) 25%, rgba(0,0,0,0.72) 100%),
          url('/landing/studio-barberia.webp') center 38% / cover no-repeat;
      }
      .vc-st-page.is-mobile .vc-st-hero { height: 220px; }
      .vc-st-nav {
        position: absolute; top: 7px; left: 7px; right: 7px;
        display: flex; justify-content: space-between; align-items: center; gap: 6px;
        padding: 5px 7px 5px 9px; border-radius: 100px;
        background: var(--sp-bg); color: var(--sp-fg); border: 1px solid var(--sp-line);
        box-shadow: 0 4px 14px -6px rgba(0,0,0,0.5);
      }
      .vc-st-logo { font-family: var(--font-display); font-weight: 800; font-size: 8px; letter-spacing: 0.08em; }
      .vc-st-nav-r { display: inline-flex; align-items: center; gap: 6px; }
      .vc-st-btn-ghost {
        padding: 2px 7px; border-radius: 100px; font-size: 7.5px; font-weight: 600;
        border: 1px solid var(--sp-fg); color: var(--sp-fg); white-space: nowrap;
      }
      .vc-st-hero-txt { position: relative; }
      .vc-st-h {
        font-family: var(--font-display); font-weight: 700; font-size: 17px; line-height: 1.05;
        letter-spacing: -0.02em; color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,0.4);
      }
      .vc-st-page.is-mobile .vc-st-h { font-size: 13px; }
      .vc-st-sub { color: rgba(255,255,255,0.85); font-size: 8px; margin: 3px 0 7px; max-width: 220px; }
      .vc-st-ctas { display: flex; gap: 5px; flex-wrap: wrap; }
      .vc-st-btn-line {
        display: inline-block; padding: 3px 8px; border-radius: 100px; font-size: 8px; font-weight: 600;
        border: 1px solid rgba(255,255,255,0.85); color: #fff; white-space: nowrap;
      }
      .vc-st-status { display: flex; flex-direction: column; gap: 1px; margin-top: 7px; font-size: 7.5px; }
      .vc-st-status em { font-style: normal; font-family: var(--font-mono); font-size: 6.5px; letter-spacing: 0.12em; color: rgba(255,255,255,0.7); }
      .vc-st-status span { color: #34d399; font-weight: 600; }
      .vc-st-btn {
        display: inline-block; padding: 3px 8px; border-radius: 100px; font-size: 8px; font-weight: 600; white-space: nowrap;
        background: var(--sp-accent); color: var(--sp-accent-fg);
      }
      .vc-st-h2 { font-family: var(--font-display); font-weight: 600; font-size: 12px; letter-spacing: -0.02em; margin: -1px 0 5px; }
      .vc-st-block { padding: 10px; border-top: 1px solid var(--sp-line); }
      .vc-st-block.is-new { animation: vcStBlockIn 0.7s var(--ease-out); }
      @keyframes vcStBlockIn {
        from { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
        to   { opacity: 1; max-height: 90px; }
      }
      .vc-st-eb { font-family: var(--font-mono); font-size: 7px; letter-spacing: 0.14em; color: var(--sp-accent); margin-bottom: 5px; }
      .vc-st-svc { display: flex; justify-content: space-between; gap: 6px; padding: 4px 0; font-size: 8.5px; border-bottom: 1px dashed var(--sp-line); }
      .vc-st-svc:last-child { border-bottom: none; }
      .vc-st-svc em { font-style: normal; color: var(--sp-soft); margin-left: 5px; }
      .vc-st-page.is-mobile .vc-st-svc em { display: none; }
      .vc-st-svc b { font-weight: 600; white-space: nowrap; }
      .vc-st-review { font-size: 8.5px; color: var(--sp-soft); line-height: 1.4; }
      .vc-st-stars { display: block; color: var(--sp-accent); letter-spacing: 1px; margin-bottom: 2px; }
      .vc-st-toast {
        position: absolute; left: 50%; bottom: 12px; transform: translateX(-50%);
        display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 100px;
        font-size: 9.5px; font-weight: 600; white-space: nowrap;
        background: oklch(0.3 0.08 145); color: oklch(0.92 0.12 145); border: 1px solid oklch(0.6 0.15 145 / 0.5);
        animation: vcStToast 0.5s var(--ease-out);
      }
      @keyframes vcStToast { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }

      .vc-st-right { padding: 0; gap: 0; min-height: 0; }
      .vc-st-tabs { display: flex; border-bottom: 1px solid var(--glass-border); flex-shrink: 0; }
      .vc-st-tabs span {
        flex: 1; display: flex; align-items: center; justify-content: center; gap: 3px;
        padding: 7px 2px; font-size: 8px; font-weight: 600; color: var(--fg-3);
        border-bottom: 1.5px solid transparent;
      }
      .vc-st-tabs span.is-on { color: #a78bfa; border-bottom-color: #a78bfa; }
      [data-theme="light"] .vc-st-tabs span.is-on { color: var(--accent); border-bottom-color: var(--accent); }
      .vc-st-right-body { flex: 1; min-height: 0; overflow: hidden; padding: 8px 8px 10px; }
      .vc-st-head { display: flex; flex-direction: column; gap: 2px; padding-bottom: 7px; border-bottom: 1px solid var(--glass-border); }
      .vc-st-head b { font-size: 9.5px; font-weight: 600; color: var(--fg-0); }
      .vc-st-head span { font-size: 7.5px; line-height: 1.35; color: var(--fg-3); }
      .vc-st-collapse { display: flex; align-items: center; gap: 4px; padding: 7px 0; font-size: 8.5px; font-weight: 600; color: var(--fg-0); }
      .vc-st-collapse svg { color: var(--fg-3); }
      .vc-st-collapse.is-closed { border-top: 1px solid var(--glass-border); }
      .vc-st-collapse.is-closed svg { transform: rotate(-90deg); }
      .vc-st-palettes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; padding-bottom: 8px; }
      .vc-st-palette {
        display: grid; gap: 3px; justify-items: center; padding: 5px 4px; border-radius: 6px;
        background: #171528; border: 1px solid transparent;
        font-size: 7.5px; font-weight: 600; color: #a49dbd; white-space: nowrap;
        min-width: 0; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.01em;
        transition: border-color 0.3s, color 0.3s;
      }
      [data-theme="light"] .vc-st-palette { background: #f5f4fa; color: #6b6585; }
      .vc-st-palette.is-on { border-color: #a78bfa; color: var(--fg-0); }
      .vc-st-chips {
        display: flex; gap: 2px; align-items: center; justify-content: center;
        width: 100%; height: 17px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.09);
      }
      .vc-st-chips i { width: 6px; height: 6px; border-radius: 50%; display: block; }

      @media (max-width: 700px) {
        .vc-studio { height: 360px; }
        .vc-st-body { grid-template-columns: 1fr; }
        .vc-st-left, .vc-st-right, .vc-st-title { display: none; }
        .vc-st-page.is-mobile { width: 62%; }
      }

      @keyframes vcBarGlow {
        0%, 30% { box-shadow: 0 0 10px 1px currentColor; }
        100%    { box-shadow: 0 0 0 0 transparent; }
      }

      /* ── Stats frame ── */
      .vc-stats { padding: 100px 60px; }
      .vc-stats-frame {
        position: relative; padding: 100px 60px; border-radius: var(--r-2xl);
        background: linear-gradient(180deg, oklch(0.18 0.06 290 / 0.4), oklch(0.1 0.03 280 / 0.4));
        backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
        border: 1px solid var(--glass-border); overflow: hidden;
      }
      [data-theme="light"] .vc-stats-frame {
        background: linear-gradient(180deg, oklch(0.95 0.04 290 / 0.6), oklch(0.92 0.06 280 / 0.6));
      }
      .vc-stats-frame-glow {
        position: absolute; inset: 0;
        background: radial-gradient(50% 60% at 50% 0%, var(--accent-glow), transparent); opacity: 0.4;
      }
      .vc-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; position: relative; }
      .vc-stat { text-align: center; }
      .vc-stat-v {
        font-family: var(--font-display); font-size: clamp(48px, 6vw, 88px); font-weight: 600;
        letter-spacing: -0.04em; line-height: 1;
        background: linear-gradient(180deg, var(--fg-0), var(--v-400) 90%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      .vc-stat-l { color: var(--fg-1); font-size: 14px; margin-top: 14px; }
      .vc-stat-d { color: var(--fg-3); font-size: 11px; letter-spacing: 0.1em; margin-top: 4px; }

      /* ── Steps ── */
      .vc-steps { padding: 80px 60px; }
      .vc-steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      .vc-step {
        padding: 36px; border-radius: var(--r-xl); position: relative;
        min-height: 220px; display: flex; flex-direction: column;
        transition: transform 0.4s var(--ease-out);
      }
      .vc-step:hover { transform: translateY(-6px); }
      .vc-step-n {
        font-size: clamp(40px, 5vw, 64px); font-weight: 700; letter-spacing: -0.03em;
        background: linear-gradient(180deg, var(--accent), transparent 90%);
        -webkit-background-clip: text; background-clip: text; color: transparent;
        line-height: 1; margin-bottom: 24px;
      }
      .ma-root .vc-step-t { font-size: 24px; font-weight: 600; margin-bottom: 10px; }
      .vc-step-d { color: var(--fg-2); font-size: 14.5px; line-height: 1.55; }

      /* ── Pricing ── */
      .vc-pricing { padding: 100px 60px; }
      .vc-price-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 1200px; margin: 0 auto; }
      .vc-price { position: relative; padding: 36px; border-radius: var(--r-xl); display: flex; flex-direction: column; overflow: hidden; }
      .vc-price-feat {
        background: linear-gradient(180deg, oklch(0.45 0.22 290 / 0.6), oklch(0.25 0.15 280 / 0.6));
        border: 1px solid oklch(0.7 0.2 290 / 0.5);
        backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
        box-shadow: 0 30px 80px -20px var(--accent-glow);
        transform: scale(1.04); z-index: 1;
      }
      .vc-price-bg {
        position: absolute; inset: 0; pointer-events: none;
        background: radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.7 0.25 290 / 0.4), transparent);
      }
      .vc-price-name { font-size: 11px; letter-spacing: 0.18em; color: var(--fg-2); }
      .vc-price-amt { display: flex; align-items: baseline; gap: 6px; margin-top: 16px; position: relative; }
      .vc-price-num { font-family: var(--font-display); font-size: 60px; font-weight: 600; letter-spacing: -0.04em; line-height: 1; color: var(--fg-0); }
      .vc-price-suf { font-size: 13px; color: var(--fg-2); }
      .vc-price-tag { color: var(--fg-2); margin-top: 8px; font-size: 14px; position: relative; }
      .vc-price-feats { list-style: none; padding: 0; margin: 28px 0 0; display: flex; flex-direction: column; gap: 12px; position: relative; }
      .vc-price-feats li { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--fg-1); }
      .vc-price-feats svg { color: var(--accent); flex-shrink: 0; }

      /* ── Testimonials ── */
      .vc-testi { padding: 100px 60px; }
      .vc-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
      .vc-testi-card { padding: 32px; border-radius: var(--r-xl); transition: transform 0.4s var(--ease-out); }
      .vc-testi-card:hover { transform: translateY(-4px); }

      /* ── FAQ ── */
      .vc-faq { padding: 80px 60px; }

      /* ── CTA ── */
      .vc-cta { position: relative; padding: 160px 60px; text-align: center; overflow: hidden; }
      .vc-cta-glow {
        position: absolute; inset: 0;
        background:
          radial-gradient(60% 60% at 50% 50%, oklch(0.55 0.25 290 / 0.45), transparent 65%),
          radial-gradient(40% 40% at 30% 30%, oklch(0.5 0.25 320 / 0.3), transparent 65%);
      }
      .vc-h-final { font-size: clamp(48px, 8vw, 128px); line-height: 0.95; letter-spacing: -0.045em; font-weight: 600; }
      .vc-h-final em {
        font-style: italic; font-weight: 400;
        background: linear-gradient(135deg, var(--v-200), var(--v-600));
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }

      /* ── Footer ── */
      .vc-footer { padding: 60px 60px 30px; border-top: 1px solid var(--glass-border); }
      .vc-footer-top { display: grid; grid-template-columns: 1fr 2fr; gap: 60px; margin-bottom: 50px; }
      .vc-footer-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
      .vc-footer-bot {
        display: flex; justify-content: space-between; align-items: center;
        padding-top: 24px; border-top: 1px solid var(--glass-border);
      }

      /* ── Responsive: tablet ── */
      @media (max-width: 1100px) {
        .vc-hero { grid-template-columns: 1fr; padding: 120px 32px 80px; }
        .vc-hero-r { height: 420px; }
        .vc-feature { grid-template-columns: 1fr; gap: 40px; padding: 50px 0; }
        .vc-feature-l .vc-feature-text { order: 1; }
        .vc-feature-l .vc-feature-visual { order: 2; }
        .vc-stats-grid, .vc-steps-grid, .vc-price-grid, .vc-testi-grid { grid-template-columns: 1fr; }
        .vc-price-feat { transform: none; }
        .vc-footer-top { grid-template-columns: 1fr; }
        .vc-footer-cols { grid-template-columns: 1fr 1fr; }
        .vc-features, .vc-stats, .vc-steps, .vc-pricing, .vc-testi, .vc-faq, .vc-cta, .vc-footer { padding-left: 32px; padding-right: 32px; }
        .vc-nav { padding: 16px 24px; }
      }

      /* ── Responsive: mobile ── */
      @media (max-width: 768px) {
        /* Nav: ocultar pill, fondo glass para separar en light mode */
        .vc-nav-pill { display: none; }
        .vc-nav {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
        }

        /* Hero */
        .vc-hero { padding: 110px 20px 60px; }
        .ma-root .vc-hero-sub { font-size: 16px; }
        .vc-cta-row { flex-wrap: wrap; gap: 10px; }

        /* Words marquee más pequeño */
        .vc-word { font-size: clamp(40px, 12vw, 80px); }

        /* Secciones */
        .vc-features, .vc-stats, .vc-steps, .vc-pricing,
        .vc-testi, .vc-faq, .vc-cta, .vc-footer { padding-left: 20px; padding-right: 20px; }
        .vc-section-head { margin-bottom: 48px; }
        .vc-stats-frame { padding: 48px 20px; }
        .vc-stats-grid { grid-template-columns: 1fr 1fr; gap: 20px; }
        .vc-steps-grid { grid-template-columns: 1fr; }
        .vc-step { padding: 28px; min-height: auto; }
        .vc-price-grid { grid-template-columns: 1fr; }
        .vc-testi-grid { grid-template-columns: 1fr; }
        .vc-footer-cols { grid-template-columns: 1fr 1fr; }
        .vc-cta { padding: 100px 20px; }
        .vc-footer { padding: 48px 20px 24px; }
        .vc-footer-top { gap: 36px; }
        .vc-footer-bot { flex-direction: column; gap: 12px; text-align: center; }
      }

      /* ── Responsive: mobile pequeño ── */
      @media (max-width: 480px) {
        .vc-nav { padding: 14px 16px; }
        .vc-hero { padding: 100px 16px 48px; }
        .vc-hero-r { height: 300px; }
        .vc-stats-grid { grid-template-columns: 1fr 1fr; }
        .vc-stats-frame { padding: 40px 16px; }
        .vc-footer-cols { grid-template-columns: 1fr; }
        .vc-feature-d { font-size: 15px; }
        .vc-features, .vc-stats, .vc-steps, .vc-pricing,
        .vc-testi, .vc-faq, .vc-cta, .vc-footer { padding-left: 16px; padding-right: 16px; }
      }

      /* ── Reduced motion ── */
      @media (prefers-reduced-motion: reduce) {
        .vc-words-row { animation: none; }
        .vc-live-dot, .vc-badge-pending, .vc-badge-pop, .vc-book-new, .vc-book-new .vc-book-bar,
        .vc-pay-flash, .vc-pay-toast, .vc-chart-on .vc-chart-dot,
        .vc-st-focus, .vc-st-srow.is-new, .vc-st-block.is-new, .vc-st-toast, .vc-st-spin { animation: none; }
        .vc-pay-bar, .vc-chart-line, .vc-chart-area, .vc-chart-dot { transition: none; }
        .vc-blob { will-change: auto; }
      }
    `}</style>
  );
}
