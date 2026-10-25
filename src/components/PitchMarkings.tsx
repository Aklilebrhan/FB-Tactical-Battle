import { Circle, Group, Line, Rect, Text } from 'react-konva'
import type { PitchMode, PitchTheme } from '../types'
import { PITCH_THEMES } from '../types'

interface PitchMarkingsProps {
  width: number
  height: number
  padding: number
  mode: PitchMode
  theme?: PitchTheme
  showGrid?: boolean
}

/**
 * FIFA-ish markings. Length along X, width along Y.
 * Full mode: entire pitch. Half mode: left half fills the stage (halfway line on right).
 */
export function PitchMarkings({
  width,
  height,
  padding,
  mode,
  theme = 'classic',
  showGrid = false,
}: PitchMarkingsProps) {
  const colors = PITCH_THEMES.find((t) => t.id === theme) ?? PITCH_THEMES[0]
  const x = padding
  const y = padding
  const w = width - padding * 2
  const h = height - padding * 2
  const lineColor = colors.line
  const stroke = Math.max(1.5, Math.min(w, h) * 0.0035)

  const fullLength = mode === 'half' ? w * 2 : w
  const cx = mode === 'half' ? x + w : x + w / 2
  const cy = y + h / 2

  const centerR = Math.min(fullLength, h) * 0.09
  const penD = fullLength * 0.157
  const penH = h * 0.593
  const penY = cy - penH / 2
  const goalD = fullLength * 0.052
  const goalH = h * 0.269
  const goalY = cy - goalH / 2
  const spotD = fullLength * 0.105
  const spotR = Math.max(2, stroke * 1.2)
  const goalMouth = h * 0.108
  const goalDepth = Math.max(4, padding * 0.35)
  const arcR = Math.min(fullLength, h) * 0.085

  const leftPenArc = buildPenaltyArc(x + penD, cy, arcR, spotD - penD, 'left')
  const rightPenArc =
    mode === 'full'
      ? buildPenaltyArc(x + w - penD, cy, arcR, penD - spotD, 'right')
      : []

  const stripeCount = mode === 'half' ? 5 : 10
  const gridStepX = mode === 'half' ? w / 10 : w / 20
  const gridStepY = h / 20

  return (
    <Group>
      <Rect x={x} y={y} width={w} height={h} fill={colors.base} />
      {Array.from({ length: stripeCount }).map((_, i) => (
        <Rect
          key={i}
          x={x + (w / stripeCount) * i}
          y={y}
          width={w / stripeCount}
          height={h}
          fill={i % 2 === 0 ? colors.stripeA : colors.stripeB}
        />
      ))}

      {showGrid && (
        <Group listening={false} opacity={0.35}>
          {Array.from({ length: Math.floor(w / gridStepX) - 1 }).map((_, i) => (
            <Line
              key={`gx-${i}`}
              points={[
                x + gridStepX * (i + 1),
                y,
                x + gridStepX * (i + 1),
                y + h,
              ]}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={0.5}
              dash={[4, 6]}
            />
          ))}
          {Array.from({ length: Math.floor(h / gridStepY) - 1 }).map((_, i) => (
            <Line
              key={`gy-${i}`}
              points={[
                x,
                y + gridStepY * (i + 1),
                x + w,
                y + gridStepY * (i + 1),
              ]}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={0.5}
              dash={[4, 6]}
            />
          ))}
        </Group>
      )}

      <Rect
        x={x}
        y={y}
        width={w}
        height={h}
        stroke={lineColor}
        strokeWidth={stroke}
        fillEnabled={false}
      />

      <Line points={[cx, y, cx, y + h]} stroke={lineColor} strokeWidth={stroke} />

      {mode === 'full' && (
        <>
          <Circle x={cx} y={cy} radius={centerR} stroke={lineColor} strokeWidth={stroke} />
          <Circle x={cx} y={cy} radius={spotR} fill={lineColor} />
        </>
      )}

      {mode === 'half' && (
        <Line
          points={semicircle(cx, cy, centerR, 'left')}
          stroke={lineColor}
          strokeWidth={stroke}
        />
      )}

      <Rect
        x={x}
        y={penY}
        width={penD}
        height={penH}
        stroke={lineColor}
        strokeWidth={stroke}
        fillEnabled={false}
      />
      <Rect
        x={x}
        y={goalY}
        width={goalD}
        height={goalH}
        stroke={lineColor}
        strokeWidth={stroke}
        fillEnabled={false}
      />
      <Circle x={x + spotD} y={cy} radius={spotR} fill={lineColor} />
      <Line points={leftPenArc} stroke={lineColor} strokeWidth={stroke} />

      {mode === 'full' && (
        <>
          <Rect
            x={x + w - penD}
            y={penY}
            width={penD}
            height={penH}
            stroke={lineColor}
            strokeWidth={stroke}
            fillEnabled={false}
          />
          <Rect
            x={x + w - goalD}
            y={goalY}
            width={goalD}
            height={goalH}
            stroke={lineColor}
            strokeWidth={stroke}
            fillEnabled={false}
          />
          <Circle x={x + w - spotD} y={cy} radius={spotR} fill={lineColor} />
          <Line points={rightPenArc} stroke={lineColor} strokeWidth={stroke} />
        </>
      )}

      <Line
        points={cornerArc(x, y, arcR * 0.25, 0, 90)}
        stroke={lineColor}
        strokeWidth={stroke}
      />
      <Line
        points={cornerArc(x, y + h, arcR * 0.25, 270, 360)}
        stroke={lineColor}
        strokeWidth={stroke}
      />
      {mode === 'full' && (
        <>
          <Line
            points={cornerArc(x + w, y, arcR * 0.25, 90, 180)}
            stroke={lineColor}
            strokeWidth={stroke}
          />
          <Line
            points={cornerArc(x + w, y + h, arcR * 0.25, 180, 270)}
            stroke={lineColor}
            strokeWidth={stroke}
          />
        </>
      )}

      <Rect
        x={x - goalDepth}
        y={cy - goalMouth / 2}
        width={goalDepth}
        height={goalMouth}
        stroke={lineColor}
        strokeWidth={stroke}
        fill="rgba(0,0,0,0.25)"
      />
      {mode === 'full' && (
        <Rect
          x={x + w}
          y={cy - goalMouth / 2}
          width={goalDepth}
          height={goalMouth}
          stroke={lineColor}
          strokeWidth={stroke}
          fill="rgba(0,0,0,0.25)"
        />
      )}

      <Text
        text={mode === 'half' ? 'HALF PITCH' : 'HOME'}
        x={x + 8}
        y={y + 6}
        fontSize={11}
        fill="rgba(255,255,255,0.35)"
        fontStyle="bold"
      />
      {mode === 'full' && (
        <Text
          text="AWAY"
          x={x + w - 48}
          y={y + 6}
          fontSize={11}
          fill="rgba(255,255,255,0.35)"
          fontStyle="bold"
        />
      )}

      <Rect name="pitch-hit" x={x} y={y} width={w} height={h} fill="transparent" />
    </Group>
  )
}

function buildPenaltyArc(
  boxEdgeX: number,
  cy: number,
  radius: number,
  offsetFromBox: number,
  side: 'left' | 'right',
): number[] {
  const points: number[] = []
  const steps = 24
  const halfAngle = Math.acos(Math.min(1, Math.abs(offsetFromBox) / radius))
  const start = side === 'left' ? -halfAngle : Math.PI - halfAngle
  const end = side === 'left' ? halfAngle : Math.PI + halfAngle
  const spotX = boxEdgeX + offsetFromBox

  for (let i = 0; i <= steps; i++) {
    const t = start + ((end - start) * i) / steps
    points.push(spotX + Math.cos(t) * radius, cy + Math.sin(t) * radius)
  }
  return points
}

function semicircle(
  cx: number,
  cy: number,
  r: number,
  open: 'left' | 'right',
): number[] {
  const points: number[] = []
  const steps = 32
  const start = open === 'left' ? Math.PI / 2 : -Math.PI / 2
  const end = open === 'left' ? (Math.PI * 3) / 2 : Math.PI / 2
  for (let i = 0; i <= steps; i++) {
    const t = start + ((end - start) * i) / steps
    points.push(cx + Math.cos(t) * r, cy + Math.sin(t) * r)
  }
  return points
}

function cornerArc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
): number[] {
  const points: number[] = []
  const steps = 10
  for (let i = 0; i <= steps; i++) {
    const deg = startDeg + ((endDeg - startDeg) * i) / steps
    const rad = (deg * Math.PI) / 180
    points.push(cx + Math.cos(rad) * r, cy + Math.sin(rad) * r)
  }
  return points
}
