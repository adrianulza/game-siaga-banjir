import type { CSSProperties, ReactNode } from 'react'

/**
 * The village is drawn entirely from absolutely-positioned coloured boxes — no
 * images anywhere. This wrapper carries the `position:absolute` plus the four
 * placement values so the scene files read as coordinates rather than as CSS.
 */
export const Box = ({
  x,
  y,
  w,
  h,
  style,
  children,
}: {
  x?: number | string
  y?: number | string
  w?: number | string
  h?: number | string
  style?: CSSProperties
  children?: ReactNode
}) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, ...style }}>
    {children}
  </div>
)

/**
 * A tree: trunk plus canopy, anchored at its base so it can sway or topple.
 *
 * `canopyBottom` is passed rather than derived — the original's values sit near
 * 80% of the trunk height but are hand-tuned per tree, and rounding a ratio would
 * shift several of them by a pixel.
 */
export const Tree = ({
  x,
  y,
  trunkW,
  trunkH,
  canopy,
  canopyBottom,
  animation,
  transform,
  transition,
  trunkColor = 'var(--color-neutral-800)',
  canopyColor = 'var(--color-neutral-600)',
}: {
  x: number
  y: number
  trunkW: number
  trunkH: number
  canopy: number
  canopyBottom: number
  animation?: string
  transform?: string
  transition?: string
  trunkColor?: string
  canopyColor?: string
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transformOrigin: 'bottom center',
      animation,
      transform,
      transition,
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: -Math.floor(trunkW / 2),
        bottom: 0,
        width: trunkW,
        height: trunkH,
        background: trunkColor,
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: -canopy / 2,
        bottom: canopyBottom,
        width: canopy,
        height: canopy,
        borderRadius: '50%',
        background: canopyColor,
      }}
    />
  </div>
)
