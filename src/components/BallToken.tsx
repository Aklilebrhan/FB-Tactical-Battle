import { Circle, Group } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'

interface BallTokenProps {
  x: number
  y: number
  radius: number
  draggable: boolean
  selected: boolean
  listening?: boolean
  dragBoundFunc?: (pos: { x: number; y: number }) => { x: number; y: number }
  onSelect: () => void
  onDragEnd: (x: number, y: number) => void
}

export function BallToken({
  x,
  y,
  radius,
  draggable,
  selected,
  listening = true,
  dragBoundFunc,
  onSelect,
  onDragEnd,
}: BallTokenProps) {
  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    onDragEnd(e.target.x(), e.target.y())
  }

  return (
    <Group
      x={x}
      y={y}
      draggable={draggable}
      listening={listening}
      dragBoundFunc={dragBoundFunc}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={handleDragEnd}
      onDragStart={onSelect}
      onMouseEnter={(e) => {
        const stage = e.target.getStage()
        if (stage) stage.container().style.cursor = draggable ? 'grab' : 'default'
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage()
        if (stage) stage.container().style.cursor = 'default'
      }}
    >
      {selected && (
        <Circle radius={radius + 4} stroke="#fbbf24" strokeWidth={2} dash={[4, 3]} />
      )}
      <Circle
        radius={radius}
        fill="#f5f5f5"
        stroke="#1a1a1a"
        strokeWidth={1.5}
        shadowColor="black"
        shadowBlur={5}
        shadowOpacity={0.4}
        shadowOffsetY={2}
      />
      <Circle radius={radius * 0.35} fill="#1a1a1a" listening={false} />
      {[0, 72, 144, 216, 288].map((deg) => {
        const rad = ((deg - 90) * Math.PI) / 180
        return (
          <Circle
            key={deg}
            x={Math.cos(rad) * radius * 0.55}
            y={Math.sin(rad) * radius * 0.55}
            radius={radius * 0.22}
            fill="#1a1a1a"
            listening={false}
          />
        )
      })}
    </Group>
  )
}
