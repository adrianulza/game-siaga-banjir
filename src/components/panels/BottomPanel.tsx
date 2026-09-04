import { PHASE2_CARDS } from '@/data/phase2-darurat'
import { spotsForScreen } from '@/engine/reducer'
import { endingCopy, gameOverCopy, mapCopy, RECAP_SCENES, recapProgress } from '@/engine/selectors'
import { onTimeDecisions, safeFamilyCount } from '@/engine/scoring'
import { isRecapScreen } from '@/engine/state'
import { useGame } from '@/hooks/useGame'

const PRIMARY_BUTTON: React.CSSProperties = {
  background: 'var(--color-accent)',
  color: 'var(--color-neutral-100)',
  border: 0,
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
}

const KICKER: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  marginBottom: 5,
}

const BODY: React.CSSProperties = {
  margin: 0,
  fontSize: 15.5,
  lineHeight: 1.45,
  textWrap: 'pretty',
}

// ----------------------------------------------------------------- intro ----

const IntroPanel = () => {
  const { dispatch, beginAudio } = useGame()
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.35fr 1fr',
        gap: 40,
        paddingTop: 18,
        animation: 'fadeUp .6s ease',
      }}
    >
      <div>
        <div style={{ ...KICKER, color: 'var(--color-accent-2-700)', marginBottom: 6 }}>
          Edisi Musim Hujan · Peringatan Dini BMKG
        </div>
        <h1
          style={{
            font: '600 42px/1.05 var(--font-heading)',
            margin: '0 0 10px',
            textWrap: 'pretty',
          }}
        >
          Hujan Tak Kunjung Reda di Kampung Tepi Sungai
        </h1>
        <p style={{ ...BODY, fontSize: 16.5, maxWidth: 640 }}>
          Kamu remaja 14 tahun yang tinggal bersama Ibu, Ayah, Adik Dito, dan Nenek — plus kucing
          Oyen. BMKG memperkirakan hujan sangat lebat tiga hari ke depan. Keputusanmu menentukan
          keselamatan keluarga dan tetangga.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
        <div style={{ fontSize: 14.5, lineHeight: 1.5, color: 'var(--color-neutral-800)' }}>
          <b>Fase 1 · Kesiapsiagaan</b> — jelajahi peta, waktumu terbatas.
          <br />
          <b>Fase 2 · Respons</b> — putuskan cepat sebelum waktu habis.
          <br />
          <b>Fase 3 · Pemulihan</b> — bangun kembali dengan lebih aman.
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            // Audio can only start inside a user gesture.
            beginAudio()
            dispatch({ type: 'START' })
          }}
          style={{
            ...PRIMARY_BUTTON,
            alignSelf: 'flex-start',
            padding: '13px 30px',
            font: '600 19px var(--font-heading)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          Mulai Bermain
        </button>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------- map ----

const MapOverview = () => {
  const { state, dispatch } = useGame()
  const copy = mapCopy(state, spotsForScreen(state.screen).length)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 40,
        alignItems: 'start',
        paddingTop: 16,
        animation: 'fadeUp .4s ease',
      }}
    >
      <div>
        <div style={{ ...KICKER, color: 'var(--color-accent-700)' }}>{copy.kicker}</div>
        <h2 style={{ font: '600 29px/1.1 var(--font-heading)', margin: '0 0 8px' }}>
          {copy.title}
        </h2>
        <p style={{ ...BODY, maxWidth: 700 }}>{copy.note}</p>
      </div>
      <div
        style={{
          textAlign: 'right',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 9,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: 'var(--color-neutral-700)',
            }}
          >
            Sisa waktu
          </div>
          <div style={{ font: '600 36px/1 var(--font-heading)', color: copy.hoursColor }}>
            {copy.hoursLabel}
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--color-neutral-700)' }}>{copy.doneLabel}</div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => dispatch({ type: 'FINISH_MAP' })}
          style={{
            ...PRIMARY_BUTTON,
            padding: '11px 24px',
            font: '600 16.5px var(--font-heading)',
          }}
        >
          {copy.finishLabel}
        </button>
      </div>
    </div>
  )
}

const SpotDetail = ({ spotId }: { spotId: string }) => {
  const { state, dispatch } = useGame()
  const spot = spotsForScreen(state.screen).find((s) => s.id === spotId)
  if (!spot) return null

  return (
    <div style={{ paddingTop: 14, animation: 'fadeUp .35s ease' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 20,
        }}
      >
        <div>
          <span style={{ ...KICKER, color: 'var(--color-accent-700)', marginBottom: 0 }}>
            {spot.name}
          </span>
          <p
            style={{
              margin: '3px 0 10px',
              fontSize: 16.5,
              lineHeight: 1.4,
              maxWidth: 900,
              textWrap: 'pretty',
            }}
          >
            {spot.prompt}
          </p>
        </div>
        <button
          type="button"
          className="link-quiet"
          onClick={() => dispatch({ type: 'CLOSE_SPOT' })}
          style={{
            background: 'none',
            border: 0,
            color: 'var(--color-accent-700)',
            fontSize: 14.5,
            cursor: 'pointer',
            textDecoration: 'underline',
            whiteSpace: 'nowrap',
          }}
        >
          Kembali ke peta
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {spot.options.map((option, i) => {
          const tooExpensive = option.hourCost > state.hoursLeft
          return (
            <button
              key={option.text}
              type="button"
              className="option-card"
              disabled={tooExpensive}
              onClick={() => dispatch({ type: 'CHOOSE_MAP_OPTION', optionIndex: i })}
              style={{
                textAlign: 'left',
                background: 'var(--color-neutral-100)',
                border: 0,
                borderRadius: 'var(--radius-md)',
                padding: '13px 15px',
                cursor: tooExpensive ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minHeight: 112,
                boxShadow: 'var(--shadow-sm)',
                opacity: tooExpensive ? 0.4 : 1,
              }}
            >
              <span style={{ fontSize: 14.5, lineHeight: 1.4, textWrap: 'pretty' }}>
                {option.text}
              </span>
              <span
                style={{
                  marginTop: 'auto',
                  fontSize: 12,
                  color: 'var(--color-accent-700)',
                  fontWeight: 600,
                }}
              >
                {option.hourCost ? `${option.hourCost} jam` : 'tanpa waktu'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- crisis ----

const CrisisCardPanel = () => {
  const { state, dispatch } = useGame()
  const card = PHASE2_CARDS[state.cardIndex]
  if (!card) return null

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.15fr',
        gap: 34,
        paddingTop: 14,
        animation: 'fadeUp .35s ease',
      }}
    >
      <div>
        <div style={{ ...KICKER, color: 'var(--color-accent-2-700)' }}>
          Fase 2 · Respons · Situasi {state.cardIndex + 1}
        </div>
        <h2 style={{ font: '600 27px/1.1 var(--font-heading)', margin: '0 0 8px' }}>
          {card.title}
        </h2>
        <p style={BODY}>{card.text}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 2 }}>
        {card.options.map((option, i) => (
          <button
            key={option.text}
            type="button"
            className="option-row"
            onClick={() =>
              dispatch({ type: 'CHOOSE_CRISIS_OPTION', optionIndex: i, timedOut: false })
            }
            style={{
              textAlign: 'left',
              background: 'var(--color-neutral-100)',
              border: 0,
              borderRadius: 'var(--radius-md)',
              padding: '11px 15px',
              cursor: 'pointer',
              fontSize: 14.5,
              lineHeight: 1.35,
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            <span
              style={{
                font: '600 16px var(--font-heading)',
                color: 'var(--color-accent-2-700)',
              }}
            >
              {'ABC'[i]}
            </span>
            <span>{option.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const FeedbackPanel = () => {
  const { state, dispatch } = useGame()
  const feedback = state.feedback
  if (!feedback) return null

  const positive = feedback.delta > 0
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 36,
        alignItems: 'center',
        paddingTop: 20,
        animation: 'fadeUp .35s ease',
      }}
    >
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: positive ? 'var(--color-accent)' : 'var(--color-accent-2)',
            color: 'var(--color-neutral-100)',
            display: 'grid',
            placeItems: 'center',
            font: '600 22px var(--font-heading)',
            flex: 'none',
            animation: 'pop .5s ease',
          }}
        >
          {positive ? `+${feedback.delta}` : String(feedback.delta)}
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'var(--color-neutral-700)',
              marginBottom: 3,
            }}
          >
            Akibat keputusanmu
          </div>
          <p style={{ ...BODY, fontSize: 17, maxWidth: 820 }}>{feedback.text}</p>
        </div>
      </div>
      <button
        type="button"
        className="btn-shift"
        onClick={() => dispatch({ type: 'NEXT_CARD' })}
        style={{
          ...PRIMARY_BUTTON,
          background: feedback.fatal ? 'var(--color-accent-2-700)' : 'var(--color-accent)',
          padding: '13px 28px',
          font: '600 17.5px var(--font-heading)',
        }}
      >
        {feedback.fatal ? 'Lihat akibatnya →' : 'Lanjut'}
      </button>
    </div>
  )
}

// ----------------------------------------------------------------- recap ----

const RecapPanel = ({ screen }: { screen: 'recap1' | 'recap2' | 'recap3' }) => {
  const { state, dispatch } = useGame()
  const progress = recapProgress(state)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 30,
        alignItems: 'center',
        paddingTop: 14,
        animation: 'fadeUp .4s ease',
      }}
    >
      <p
        style={{
          margin: 0,
          font: 'italic 400 19px/1.4 var(--font-body)',
          maxWidth: 900,
          textWrap: 'pretty',
        }}
      >
        “{progress.line}”
      </p>
      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 12.5, color: 'var(--color-neutral-700)', whiteSpace: 'nowrap' }}>
          {progress.count}
        </span>
        <button
          type="button"
          className="btn-primary"
          onClick={() => dispatch({ type: 'RECAP_NEXT' })}
          style={{
            ...PRIMARY_BUTTON,
            padding: '12px 26px',
            font: '600 17px var(--font-heading)',
            whiteSpace: 'nowrap',
          }}
        >
          {progress.isLast ? RECAP_SCENES[screen].nextLabel : 'Lanjut'}
        </button>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------- end ----

const EndPanel = () => {
  const { state, dispatch } = useGame()
  const ending = endingCopy(state)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: 40,
        paddingTop: 14,
        animation: 'fadeUp .6s ease',
      }}
    >
      <div>
        <div style={{ ...KICKER, color: 'var(--color-accent-2-700)' }}>
          Edisi Khusus · Setelah Bencana
        </div>
        <h1
          style={{
            font: '600 38px/1.05 var(--font-heading)',
            margin: '0 0 8px',
            textWrap: 'pretty',
          }}
        >
          {ending.title}
        </h1>
        <p style={{ ...BODY, maxWidth: 640 }}>{ending.text}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 28 }}>
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: 'var(--color-neutral-700)',
              }}
            >
              Total skor
            </div>
            <div className="cmyk-num" style={{ font: '600 46px/1 var(--font-heading)' }}>
              {ending.total}
            </div>
          </div>
          <div
            style={{
              fontSize: 13.5,
              lineHeight: 1.5,
              color: 'var(--color-neutral-800)',
              alignSelf: 'center',
            }}
          >
            Keluarga &amp; tetangga selamat tanpa cedera: <b>{safeFamilyCount(state.family)}/6</b>
            <br />
            Keputusan tepat waktu: <b>{onTimeDecisions(state.crisisLog)}/8</b>
          </div>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => dispatch({ type: 'RESTART' })}
          style={{
            ...PRIMARY_BUTTON,
            alignSelf: 'flex-start',
            padding: '13px 30px',
            font: '600 18px var(--font-heading)',
          }}
        >
          Main Lagi
        </button>
      </div>
    </div>
  )
}

// ------------------------------------------------------------- game over ----

const GameOverPanel = () => {
  const { state, dispatch } = useGame()
  const copy = gameOverCopy(state)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.3fr 1fr',
        gap: 44,
        paddingTop: 12,
        animation: 'fadeUp .7s ease',
      }}
    >
      <div style={{ borderTop: '9px solid var(--color-text)', paddingTop: 9 }}>
        <div style={{ height: 2, background: 'var(--color-text)', marginBottom: 10 }} />
        <div style={{ ...KICKER, letterSpacing: '.13em', color: 'var(--color-accent-2-700)' }}>
          Edisi Duka · {copy.kicker}
        </div>
        <h1
          style={{
            font: 'italic 600 37px/1.04 var(--font-heading)',
            margin: '0 0 8px',
            textWrap: 'pretty',
          }}
        >
          {copy.title}
        </h1>
        <p style={{ ...BODY, maxWidth: 660 }}>{copy.text}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 11 }}>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.5,
            color: 'var(--color-neutral-800)',
            textWrap: 'pretty',
          }}
        >
          <b>Titik gagal:</b> {state.overCause}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.5,
            color: 'var(--color-accent-700)',
            textWrap: 'pretty',
          }}
        >
          {copy.lesson}
        </p>
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
            marginTop: 2,
          }}
        >
          <button
            type="button"
            className="btn-primary"
            onClick={() => dispatch({ type: 'RETRY_PHASE' })}
            style={{
              ...PRIMARY_BUTTON,
              padding: '12px 26px',
              font: '600 17px var(--font-heading)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {copy.retryLabel}
          </button>
          <button
            type="button"
            className="link-quiet"
            onClick={() => dispatch({ type: 'RESTART' })}
            style={{
              background: 'none',
              border: 0,
              color: 'var(--color-accent-700)',
              fontSize: 14.5,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: '6px 2px',
            }}
          >
            Mulai dari awal
          </button>
        </div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ root ----

/**
 * One panel per screen. The original used six independent boolean flags
 * (isIntro, isMap, isP2, ...) computed in its props bag; a switch on the screen id
 * makes the set exhaustive and drops the flags entirely.
 */
export const BottomPanel = () => {
  const { state } = useGame()
  const screen = state.screen

  const body = () => {
    if (isRecapScreen(screen)) return <RecapPanel screen={screen} />
    switch (screen) {
      case 'intro':
        return <IntroPanel />
      case 'p1':
      case 'p3':
        return state.openSpotId ? <SpotDetail spotId={state.openSpotId} /> : <MapOverview />
      case 'p2':
        return state.feedback ? <FeedbackPanel /> : <CrisisCardPanel />
      case 'end':
        return <EndPanel />
      case 'over':
        return <GameOverPanel />
    }
  }

  return <div style={{ flex: 1, margin: '0 36px', position: 'relative' }}>{body()}</div>
}
