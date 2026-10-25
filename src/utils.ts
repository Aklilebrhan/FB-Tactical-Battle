import type { DrawingShape, PitchMode } from './types'

/** Convert pitch % coords to stage pixels (mode-aware). */
export function toStage(
  xPct: number,
  yPct: number,
  width: number,
  height: number,
  padding: number,
  mode: PitchMode = 'full',
): { x: number; y: number } {
  const innerW = width - padding * 2
  const innerH = height - padding * 2
  const xScale = mode === 'half' ? xPct / 50 : xPct / 100
  return {
    x: padding + xScale * innerW,
    y: padding + (yPct / 100) * innerH,
  }
}

/** Convert stage pixels to pitch % coords (mode-aware). */
export function toPitch(
  x: number,
  y: number,
  width: number,
  height: number,
  padding: number,
  mode: PitchMode = 'full',
): { x: number; y: number } {
  const innerW = width - padding * 2
  const innerH = height - padding * 2
  const xPct =
    mode === 'half'
      ? ((x - padding) / innerW) * 50
      : ((x - padding) / innerW) * 100
  return {
    x: Math.max(0, Math.min(mode === 'half' ? 50 : 100, xPct)),
    y: Math.max(0, Math.min(100, ((y - padding) / innerH) * 100)),
  }
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

/** Snap pitch % coordinate to a grid (default 2.5%). */
export function snapPct(value: number, step = 2.5): number {
  return Math.round(value / step) * step
}

export function snapPoint(
  x: number,
  y: number,
  enabled: boolean,
  step = 2.5,
): { x: number; y: number } {
  if (!enabled) return { x, y }
  return { x: snapPct(x, step), y: snapPct(y, step) }
}

function mapPointsToPitch(
  points: number[],
  width: number,
  height: number,
  padding: number,
  mode: PitchMode,
): number[] {
  const out: number[] = []
  for (let i = 0; i < points.length; i += 2) {
    const p = toPitch(points[i], points[i + 1], width, height, padding, mode)
    out.push(p.x, p.y)
  }
  return out
}

function mapPointsToStage(
  points: number[],
  width: number,
  height: number,
  padding: number,
  mode: PitchMode,
): number[] {
  const out: number[] = []
  for (let i = 0; i < points.length; i += 2) {
    const p = toStage(points[i], points[i + 1], width, height, padding, mode)
    out.push(p.x, p.y)
  }
  return out
}

/** Pixel radius ↔ % of pitch height (keeps circles round after resize). */
export function radiusToPitch(
  radiusPx: number,
  height: number,
  padding: number,
): number {
  const innerH = height - padding * 2
  return (radiusPx / innerH) * 100
}

export function radiusToStage(
  radiusPct: number,
  height: number,
  padding: number,
): number {
  const innerH = height - padding * 2
  return (radiusPct / 100) * innerH
}

export function shapeToPitch(
  shape: DrawingShape,
  width: number,
  height: number,
  padding: number,
  mode: PitchMode,
): DrawingShape {
  switch (shape.type) {
    case 'freehand':
    case 'dashed':
      return {
        ...shape,
        points: mapPointsToPitch(shape.points, width, height, padding, mode),
      }
    case 'arrow': {
      const pts = mapPointsToPitch(
        [...shape.points],
        width,
        height,
        padding,
        mode,
      )
      return {
        ...shape,
        points: [pts[0], pts[1], pts[2], pts[3]],
      }
    }
    case 'rect': {
      const a = toPitch(shape.x, shape.y, width, height, padding, mode)
      const b = toPitch(
        shape.x + shape.width,
        shape.y + shape.height,
        width,
        height,
        padding,
        mode,
      )
      return {
        ...shape,
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        width: Math.abs(b.x - a.x),
        height: Math.abs(b.y - a.y),
      }
    }
    case 'circle':
      return {
        ...shape,
        ...toPitch(shape.x, shape.y, width, height, padding, mode),
        radius: radiusToPitch(shape.radius, height, padding),
      }
    case 'text':
      return {
        ...shape,
        ...toPitch(shape.x, shape.y, width, height, padding, mode),
        fontSize: radiusToPitch(shape.fontSize, height, padding),
      }
  }
}

export function shapeToStage(
  shape: DrawingShape,
  width: number,
  height: number,
  padding: number,
  mode: PitchMode,
): DrawingShape {
  switch (shape.type) {
    case 'freehand':
    case 'dashed':
      return {
        ...shape,
        points: mapPointsToStage(shape.points, width, height, padding, mode),
      }
    case 'arrow': {
      const pts = mapPointsToStage(
        [...shape.points],
        width,
        height,
        padding,
        mode,
      )
      return {
        ...shape,
        points: [pts[0], pts[1], pts[2], pts[3]],
      }
    }
    case 'rect': {
      const a = toStage(shape.x, shape.y, width, height, padding, mode)
      const b = toStage(
        shape.x + shape.width,
        shape.y + shape.height,
        width,
        height,
        padding,
        mode,
      )
      return {
        ...shape,
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        width: Math.abs(b.x - a.x),
        height: Math.abs(b.y - a.y),
      }
    }
    case 'circle':
      return {
        ...shape,
        ...toStage(shape.x, shape.y, width, height, padding, mode),
        radius: radiusToStage(shape.radius, height, padding),
      }
    case 'text':
      return {
        ...shape,
        ...toStage(shape.x, shape.y, width, height, padding, mode),
        fontSize: Math.max(10, radiusToStage(shape.fontSize, height, padding)),
      }
  }
}
