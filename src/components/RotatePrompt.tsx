/**
 * Blocking portrait gate.
 *
 * The village is hand-placed on a wide stage, so portrait has nowhere to put it.
 * Rather than letterbox the game into a useless strip we cover the screen entirely
 * until the device is turned. There is deliberately no way past this — the prompt
 * renders outside the scaled stage, at true device pixels, so it stays readable
 * however far down the stage itself has been scaled.
 */
const PhoneGlyph = () => (
  <svg
    width="88"
    height="88"
    viewBox="0 0 88 88"
    fill="none"
    aria-hidden
    style={{ animation: 'rotate-hint 2.4s ease-in-out infinite' }}
  >
    <rect
      x="30"
      y="10"
      width="28"
      height="52"
      rx="4"
      stroke="var(--color-text)"
      strokeWidth="2.5"
      fill="none"
    />
    <line x1="39" y1="17" x2="49" y2="17" stroke="var(--color-text)" strokeWidth="2.5" />
    <circle cx="44" cy="55" r="2" fill="var(--color-text)" />
    <path
      d="M22 70a30 30 0 0 0 44 0"
      stroke="var(--color-accent)"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <path d="M66 70l-1-8 7 4z" fill="var(--color-accent)" />
  </svg>
)

export const RotatePrompt = () => (
  <div
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="rotate-title"
    className="dialog-backdrop"
    style={{
      // Opaque, not the class's default scrim: the game behind must be fully hidden.
      background: 'var(--color-bg)',
      zIndex: 100,
      padding: 'max(var(--space-4), env(safe-area-inset-top)) var(--space-4)',
      textAlign: 'center',
    }}
  >
    <div
      className="dialog"
      style={{ alignItems: 'center', boxShadow: 'none', background: 'transparent' }}
    >
      <PhoneGlyph />
      <h1 id="rotate-title" className="dialog-title" style={{ margin: 0 }}>
        Putar Layar Anda
      </h1>
      <p className="dialog-body" style={{ margin: 0, lineHeight: 1.55 }}>
        Permainan ini dirancang untuk tampilan lanskap (landscape). Silakan putar HP Anda ke posisi
        mendatar untuk mulai bermain.
      </p>
      <p
        className="dialog-body"
        style={{ margin: 0, fontStyle: 'italic', opacity: 0.6, fontSize: 12.5 }}
      >
        Pastikan kunci rotasi layar (rotation lock) di perangkat Anda tidak aktif.
      </p>
    </div>
  </div>
)
