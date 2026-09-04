import { MAX_STRIKES } from '@/engine/state'
import {
  competencyReport,
  datelineFor,
  familyChips,
  familyStripOpacity,
  phaseTabs,
} from '@/engine/selectors'
import { useGame } from '@/hooks/useGame'

const LABEL: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: '.09em',
  textTransform: 'uppercase',
  color: 'var(--color-neutral-700)',
}

const FIGURE: React.CSSProperties = {
  font: '600 25px/1.05 var(--font-heading)',
}

const Score = ({
  label,
  value,
  color,
  popping,
}: {
  label: string
  value: number
  color?: string
  popping: boolean
}) => (
  <div style={{ textAlign: 'right' }}>
    <div style={LABEL}>{label}</div>
    <div style={{ ...FIGURE, color, animation: popping ? 'pop .46s ease' : 'none' }}>{value}</div>
  </div>
)

/**
 * One competency, as a rule and a filled length. These are the score now, so they
 * are on screen the whole run rather than saved for the end.
 */
const Bar = ({ label, value, popping }: { label: string; value: number; popping: boolean }) => (
  <div style={{ display: 'grid', gap: 2, animation: popping ? 'pop .46s ease' : 'none' }}>
    <div style={{ ...LABEL, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
      <span>{label}</span>
      <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{value}</span>
    </div>
    <div style={{ height: 4, background: 'var(--color-neutral-300)' }}>
      <div
        style={{
          height: '100%',
          width: `${value}%`,
          background: 'var(--color-accent-700)',
          transition: 'width .35s ease',
        }}
      />
    </div>
  </div>
)

/** Three wrong answers in fase 2 end the run; the pips say how much rope is left. */
const Strikes = ({ used }: { used: number }) => (
  <div style={{ textAlign: 'right' }}>
    <div style={LABEL}>Kesalahan</div>
    <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', marginTop: 5 }}>
      {Array.from({ length: MAX_STRIKES }, (_, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            width: 11,
            height: 11,
            borderRadius: '50%',
            border: '1.5px solid var(--color-accent-2-700)',
            background: i < used ? 'var(--color-accent-2-700)' : 'transparent',
          }}
        />
      ))}
    </div>
    <span style={{ position: 'absolute', left: -9999 }}>
      {used} dari {MAX_STRIKES} kesalahan
    </span>
  </div>
)

/** The newspaper masthead: title, phase rail, the three scores, and the family strip. */
export const Masthead = () => {
  const { state, config, pops, muted, toggleMute } = useGame()

  return (
    <div
      style={{
        margin: '12px 36px 0',
        borderTop: '4px solid var(--color-text)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'end',
          gap: 28,
          padding: '8px 0 7px',
        }}
      >
        <div>
          <div style={{ font: 'italic 600 29px/1 var(--font-heading)', letterSpacing: '-.01em' }}>
            Warta Siaga
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: 'var(--color-neutral-700)',
              marginTop: 3,
              letterSpacing: '.02em',
            }}
          >
            Kampung Tepi Sungai · Simulasi Mitigasi Bencana Hidrometeorologi
          </div>
        </div>

        <div style={{ display: 'flex', gap: 22, justifyContent: 'center', paddingBottom: 2 }}>
          {phaseTabs(state).map((tab) => (
            <div
              key={tab.label}
              style={{
                fontSize: 13,
                padding: '4px 0',
                color: tab.active ? 'var(--color-text)' : 'var(--color-neutral-500)',
                borderBottom: `2px solid ${tab.active ? 'var(--color-accent)' : 'transparent'}`,
                fontWeight: tab.active ? 600 : 400,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 22, alignItems: 'flex-end' }}>
          <Score
            label="Keselamatan"
            value={state.safety}
            color="var(--color-accent-2-700)"
            popping={pops.safety}
          />
          {state.screen === 'p2' && <Strikes used={state.strikes} />}
          <div style={{ display: 'grid', gap: 5, minWidth: 168 }}>
            {competencyReport(state, config).map((bar) => (
              <Bar key={bar.id} label={bar.label} value={bar.value} popping={pops[bar.id]} />
            ))}
          </div>
          <button
            type="button"
            onClick={toggleMute}
            className="link-mute"
            style={{
              background: 'none',
              border: 0,
              padding: '4px 2px',
              cursor: 'pointer',
              color: 'var(--color-neutral-700)',
              fontSize: 12,
              letterSpacing: '.05em',
              textTransform: 'uppercase',
              alignSelf: 'flex-end',
            }}
          >
            {muted ? 'Suara mati' : 'Suara hidup'}
          </button>
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--color-text)' }} />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '5px 0 6px',
          fontSize: 11.5,
          color: 'var(--color-neutral-700)',
        }}
      >
        <div style={{ letterSpacing: '.06em', textTransform: 'uppercase' }}>
          {datelineFor(state)}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 14,
            opacity: familyStripOpacity(state),
            transition: 'opacity .5s',
          }}
        >
          {familyChips(state).map((chip) => (
            <div
              key={chip.id}
              style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: chip.dot,
                  transition: 'background .6s',
                }}
              />
              {chip.name}
              <span style={{ color: 'var(--color-neutral-500)' }}>{chip.tail}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--color-divider)' }} />
    </div>
  )
}
