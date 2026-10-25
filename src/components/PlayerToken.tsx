import { Circle, Group, Text } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { Player, TeamKit } from '../types'

interface PlayerTokenProps {
  player: Player
  x: number
  y: number
  radius: number
  kit: TeamKit
  selected: boolean
  draggable: boolean
  listening?: boolean
  dragBoundFunc?: (pos: { x: number; y: number }) => { x: number; y: number }
  onSelect: (id: string) => void
  onDragEnd: (id: string, x: number, y: number) => void
}

export function PlayerToken({
  player,
  x,
  y,
  radius,
  kit,
  selected,
  draggable,
  listening = true,
  dragBoundFunc,
  onSelect,
  onDragEnd,
}: PlayerTokenProps) {
  const fontSize = Math.max(10, radius * 0.85)
  const nameSize = Math.max(8, radius * 0.55)

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    onDragEnd(player.id, e.target.x(), e.target.y())
  }

  return (
    <Group
      x={x}
      y={y}
      draggable={draggable}
      listening={listening}
      dragBoundFunc={dragBoundFunc}
      onClick={() => onSelect(player.id)}
      onTap={() => onSelect(player.id)}
      onDragEnd={handleDragEnd}
      onMouseEnter={(e) => {
        const stage = e.target.getStage()
        if (stage) stage.container().style.cursor = draggable ? 'grab' : 'default'
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage()
        if (stage) stage.container().style.cursor = 'default'
      }}
      onDragStart={(e) => {
        const stage = e.target.getStage()
        if (stage) stage.container().style.cursor = 'grabbing'
        onSelect(player.id)
      }}
    >
      {selected && (
        <Circle
          radius={radius + 4}
          stroke="#fbbf24"
          strokeWidth={2}
          dash={[4, 3]}
        />
      )}
      <Circle
        radius={radius}
        fill={kit.primary}
        stroke={kit.secondary}
        strokeWidth={2.5}
        shadowColor="black"
        shadowBlur={6}
        shadowOpacity={0.35}
        shadowOffsetY={2}
      />
      <Text
        text={String(player.number)}
        width={radius * 2}
        height={radius * 2}
        offsetX={radius}
        offsetY={radius + (player.name ? fontSize * 0.15 : 0)}
        align="center"
        verticalAlign="middle"
        fontSize={fontSize}
        fontStyle="bold"
        fill={kit.numberColor}
        listening={false}
      />
      {player.name && (
        <Text
          text={player.name}
          y={radius + 4}
          width={radius * 4}
          offsetX={radius * 2}
          align="center"
          fontSize={nameSize}
          fill="#fff"
          fontStyle="bold"
          shadowColor="black"
          shadowBlur={3}
          shadowOpacity={0.8}
          listening={false}
        />
      )}
    </Group>
  )
}
