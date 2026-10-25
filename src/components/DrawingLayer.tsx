import { Arrow, Circle, Line, Rect, Text } from 'react-konva'
import type { DrawingShape } from '../types'

interface DrawingLayerProps {
  drawings: DrawingShape[]
  preview: DrawingShape | null
  onErase: (id: string) => void
  eraserActive: boolean
}

function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('#') && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }
  return color
}

export function DrawingLayer({
  drawings,
  preview,
  onErase,
  eraserActive,
}: DrawingLayerProps) {
  const all = preview ? [...drawings, preview] : drawings

  return (
    <>
      {all.map((shape) => {
        const common = {
          onClick: eraserActive ? () => onErase(shape.id) : undefined,
          onTap: eraserActive ? () => onErase(shape.id) : undefined,
          listening: eraserActive,
        }

        switch (shape.type) {
          case 'freehand':
            return (
              <Line
                key={shape.id}
                {...common}
                points={shape.points}
                stroke={shape.color}
                strokeWidth={shape.strokeWidth}
                tension={0.4}
                lineCap="round"
                lineJoin="round"
                fillEnabled={false}
              />
            )
          case 'dashed':
            return (
              <Line
                key={shape.id}
                {...common}
                points={shape.points}
                stroke={shape.color}
                strokeWidth={shape.strokeWidth}
                dash={[12, 8]}
                tension={0.35}
                lineCap="round"
                lineJoin="round"
                fillEnabled={false}
              />
            )
          case 'arrow':
            return (
              <Arrow
                key={shape.id}
                {...common}
                points={shape.points}
                stroke={shape.color}
                strokeWidth={shape.strokeWidth}
                pointerLength={Math.max(10, shape.strokeWidth * 3)}
                pointerWidth={Math.max(8, shape.strokeWidth * 2.5)}
                fill={shape.color}
                lineCap="round"
                lineJoin="round"
              />
            )
          case 'rect':
            return (
              <Rect
                key={shape.id}
                {...common}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                stroke={shape.color}
                strokeWidth={shape.strokeWidth}
                fill={shape.filled ? withAlpha(shape.color, 0.28) : undefined}
                fillEnabled={!!shape.filled}
              />
            )
          case 'circle':
            return (
              <Circle
                key={shape.id}
                {...common}
                x={shape.x}
                y={shape.y}
                radius={Math.abs(shape.radius)}
                stroke={shape.color}
                strokeWidth={shape.strokeWidth}
                fill={shape.filled ? withAlpha(shape.color, 0.28) : undefined}
                fillEnabled={!!shape.filled}
              />
            )
          case 'text':
            return (
              <Text
                key={shape.id}
                {...common}
                x={shape.x}
                y={shape.y}
                text={shape.text}
                fontSize={shape.fontSize}
                fontStyle="bold"
                fill={shape.color}
                shadowColor="black"
                shadowBlur={4}
                shadowOpacity={0.6}
              />
            )
          default:
            return null
        }
      })}
    </>
  )
}
