import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { Stage, Layer } from 'react-konva'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { PitchMarkings } from './PitchMarkings'
import { PlayerToken } from './PlayerToken'
import { BallToken } from './BallToken'
import { DrawingLayer } from './DrawingLayer'
import { toPitch, toStage, shapeToPitch, shapeToStage, snapPoint, uid } from '../utils'
import type {
  Ball,
  DrawingShape,
  DrawingStyle,
  PitchMode,
  PitchTheme,
  Player,
  TeamKit,
  Tool,
} from '../types'

export interface BoardHandle {
  exportPng: () => void
}

interface TacticalBoardProps {
  players: Player[]
  ball: Ball
  drawings: DrawingShape[]
  homeKit: TeamKit
  awayKit: TeamKit
  pitchMode: PitchMode
  pitchTheme: PitchTheme
  tool: Tool
  style: DrawingStyle
  selectedId: string | null
  showNames: boolean
  showHome: boolean
  showAway: boolean
  snapToGrid: boolean
  onSelect: (id: string | null) => void
  onPlayersChange: (players: Player[]) => void
  onBallChange: (ball: Ball) => void
  onCommitDrawings: (drawings: DrawingShape[]) => void
}

export const TacticalBoard = forwardRef<BoardHandle, TacticalBoardProps>(
  function TacticalBoard(
    {
      players,
      ball,
      drawings,
      homeKit,
      awayKit,
      pitchMode,
      pitchTheme,
      tool,
      style,
      selectedId,
      showNames,
      showHome,
      showAway,
      snapToGrid,
      onSelect,
      onPlayersChange,
      onBallChange,
      onCommitDrawings,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null)
    const stageRef = useRef<Konva.Stage>(null)
    const [size, setSize] = useState({ width: 800, height: 520 })
    const [preview, setPreview] = useState<DrawingShape | null>(null)
    const drawingRef = useRef<{
      active: boolean
      startX: number
      startY: number
      points: number[]
      id: string
    } | null>(null)

    const padding = 24
    // Full pitch aspect ~105:68. Half pitch shows half length.
    const aspect =
      pitchMode === 'full' ? 105 / 68 : 52.5 / 68

    useLayoutEffect(() => {
      const el = containerRef.current
      if (!el) return

      const update = () => {
        const cw = el.clientWidth
        const ch = el.clientHeight
        let width = cw
        let height = width / aspect
        if (height > ch) {
          height = ch
          width = height * aspect
        }
        setSize({ width: Math.floor(width), height: Math.floor(height) })
      }

      update()
      const ro = new ResizeObserver(update)
      ro.observe(el)
      return () => ro.disconnect()
    }, [aspect])

    useImperativeHandle(ref, () => ({
      exportPng: () => {
        const stage = stageRef.current
        if (!stage) return
        // Deselect visuals briefly? Keep as-is for export fidelity
        const uri = stage.toDataURL({ pixelRatio: 2, mimeType: 'image/png' })
        const link = document.createElement('a')
        link.download = `tactical-board-${Date.now()}.png`
        link.href = uri
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      },
    }))

    const tokensDraggable = tool === 'select'
    const tokensListening = tool === 'select'

    const clampToPitch = useCallback(
      (pos: { x: number; y: number }) => {
        const minX = padding
        const maxX = size.width - padding
        const minY = padding
        const maxY = size.height - padding
        return {
          x: Math.max(minX, Math.min(maxX, pos.x)),
          y: Math.max(minY, Math.min(maxY, pos.y)),
        }
      },
      [size.width, size.height],
    )

    const handlePlayerDrag = useCallback(
      (id: string, sx: number, sy: number) => {
        const pct = toPitch(sx, sy, size.width, size.height, padding, pitchMode)
        const snapped = snapPoint(pct.x, pct.y, snapToGrid)
        onPlayersChange(
          players.map((p) =>
            p.id === id ? { ...p, x: snapped.x, y: snapped.y } : p,
          ),
        )
      },
      [players, size, pitchMode, snapToGrid, onPlayersChange],
    )

    const handleBallDrag = useCallback(
      (sx: number, sy: number) => {
        const pct = toPitch(sx, sy, size.width, size.height, padding, pitchMode)
        onBallChange(snapPoint(pct.x, pct.y, snapToGrid))
      },
      [size, pitchMode, snapToGrid, onBallChange],
    )

    const getPointer = (stage: Konva.Stage) => {
      const pos = stage.getPointerPosition()
      if (!pos) return null
      return pos
    }

    const onMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (tool === 'select' || tool === 'eraser') {
        if (e.target === e.target.getStage() || e.target.name() === 'pitch-hit') {
          onSelect(null)
        }
        return
      }

      const stage = e.target.getStage()
      if (!stage) return
      const pos = getPointer(stage)
      if (!pos) return

      // Text tool: single click places a label
      if (tool === 'text') {
        const label = window.prompt('Label text', 'Press')
        if (!label || !label.trim()) return
        const id = uid('draw')
        const fontPx = Math.max(14, Math.min(size.width, size.height) * 0.028)
        const pixelShape: DrawingShape = {
          id,
          type: 'text',
          x: pos.x,
          y: pos.y,
          text: label.trim().slice(0, 40),
          color: style.color,
          fontSize: fontPx,
        }
        const inPitch = shapeToPitch(
          pixelShape,
          size.width,
          size.height,
          padding,
          pitchMode,
        )
        onCommitDrawings([...drawings, inPitch])
        return
      }

      const id = uid('draw')
      drawingRef.current = {
        active: true,
        startX: pos.x,
        startY: pos.y,
        points: [pos.x, pos.y],
        id,
      }

      if (tool === 'freehand' || tool === 'dashed') {
        setPreview({
          id,
          type: tool,
          points: [pos.x, pos.y],
          color: style.color,
          strokeWidth: style.strokeWidth,
        })
      } else if (tool === 'arrow') {
        setPreview({
          id,
          type: 'arrow',
          points: [pos.x, pos.y, pos.x, pos.y],
          color: style.color,
          strokeWidth: style.strokeWidth,
        })
      } else if (tool === 'rect') {
        setPreview({
          id,
          type: 'rect',
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          color: style.color,
          strokeWidth: style.strokeWidth,
          filled: style.fill,
        })
      } else if (tool === 'circle') {
        setPreview({
          id,
          type: 'circle',
          x: pos.x,
          y: pos.y,
          radius: 0,
          color: style.color,
          strokeWidth: style.strokeWidth,
          filled: style.fill,
        })
      }
    }

    const onMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      const draft = drawingRef.current
      if (!draft?.active) return
      const stage = e.target.getStage()
      if (!stage) return
      const pos = getPointer(stage)
      if (!pos) return

      if (tool === 'freehand' || tool === 'dashed') {
        draft.points = [...draft.points, pos.x, pos.y]
        setPreview({
          id: draft.id,
          type: tool,
          points: draft.points,
          color: style.color,
          strokeWidth: style.strokeWidth,
        })
      } else if (tool === 'arrow') {
        setPreview({
          id: draft.id,
          type: 'arrow',
          points: [draft.startX, draft.startY, pos.x, pos.y],
          color: style.color,
          strokeWidth: style.strokeWidth,
        })
      } else if (tool === 'rect') {
        setPreview({
          id: draft.id,
          type: 'rect',
          x: Math.min(draft.startX, pos.x),
          y: Math.min(draft.startY, pos.y),
          width: Math.abs(pos.x - draft.startX),
          height: Math.abs(pos.y - draft.startY),
          color: style.color,
          strokeWidth: style.strokeWidth,
          filled: style.fill,
        })
      } else if (tool === 'circle') {
        const dx = pos.x - draft.startX
        const dy = pos.y - draft.startY
        setPreview({
          id: draft.id,
          type: 'circle',
          x: draft.startX,
          y: draft.startY,
          radius: Math.sqrt(dx * dx + dy * dy),
          color: style.color,
          strokeWidth: style.strokeWidth,
          filled: style.fill,
        })
      }
    }

    const finishDrawing = () => {
      const draft = drawingRef.current
      if (!draft?.active || !preview) {
        drawingRef.current = null
        setPreview(null)
        return
      }
      drawingRef.current = null
      // Skip tiny accidental clicks
      const tooSmall =
        (preview.type === 'rect' &&
          Math.abs(preview.width) < 3 &&
          Math.abs(preview.height) < 3) ||
        (preview.type === 'circle' && Math.abs(preview.radius) < 3) ||
        ((preview.type === 'freehand' || preview.type === 'dashed') &&
          preview.points.length < 4) ||
        (preview.type === 'arrow' &&
          Math.hypot(
            preview.points[2] - preview.points[0],
            preview.points[3] - preview.points[1],
          ) < 4)

      const committed = preview
      setPreview(null)
      if (tooSmall) return

      const inPitch = shapeToPitch(
        committed,
        size.width,
        size.height,
        padding,
        pitchMode,
      )
      onCommitDrawings([...drawings, inPitch])
    }

    const onErase = (id: string) => {
      onCommitDrawings(drawings.filter((d) => d.id !== id))
    }

    useEffect(() => {
      const stage = stageRef.current
      if (!stage) return
      const container = stage.container()
      if (tool === 'eraser') container.style.cursor = 'cell'
      else if (tool !== 'select') container.style.cursor = 'crosshair'
      else container.style.cursor = 'default'
    }, [tool])

    const visiblePlayers = players.filter((p) => {
      if (p.team === 'home' && !showHome) return false
      if (p.team === 'away' && !showAway) return false
      if (pitchMode === 'half' && p.x > 50) return false
      return true
    })
    const ballVisible = pitchMode === 'full' || ball.x <= 50

    const tokenR = Math.max(14, Math.min(size.width, size.height) * 0.028)
    const ballR = tokenR * 0.7

    const stageDrawings = drawings.map((d) =>
      shapeToStage(d, size.width, size.height, padding, pitchMode),
    )

    return (
      <div
        ref={containerRef}
        className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-[#0a0e12]"
      >
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          onMouseDown={onMouseDown}
          onMousemove={onMouseMove}
          onMouseup={finishDrawing}
          onMouseLeave={finishDrawing}
          onTouchStart={onMouseDown}
          onTouchMove={onMouseMove}
          onTouchEnd={finishDrawing}
        >
          <Layer>
            <PitchMarkings
              width={size.width}
              height={size.height}
              padding={padding}
              mode={pitchMode}
              theme={pitchTheme}
              showGrid={snapToGrid}
            />
          </Layer>
          <Layer>
            <DrawingLayer
              drawings={stageDrawings}
              preview={preview}
              onErase={onErase}
              eraserActive={tool === 'eraser'}
            />
          </Layer>
          <Layer>
            {visiblePlayers.map((player) => {
              const pos = toStage(
                player.x,
                player.y,
                size.width,
                size.height,
                padding,
                pitchMode,
              )
              return (
                <PlayerToken
                  key={player.id}
                  player={showNames ? player : { ...player, name: '' }}
                  x={pos.x}
                  y={pos.y}
                  radius={tokenR}
                  kit={player.team === 'home' ? homeKit : awayKit}
                  selected={selectedId === player.id}
                  draggable={tokensDraggable}
                  listening={tokensListening}
                  dragBoundFunc={clampToPitch}
                  onSelect={onSelect}
                  onDragEnd={handlePlayerDrag}
                />
              )
            })}
            {ballVisible && (
              <BallToken
                x={
                  toStage(ball.x, ball.y, size.width, size.height, padding, pitchMode)
                    .x
                }
                y={
                  toStage(ball.x, ball.y, size.width, size.height, padding, pitchMode)
                    .y
                }
                radius={ballR}
                draggable={tokensDraggable}
                listening={tokensListening}
                dragBoundFunc={clampToPitch}
                selected={selectedId === 'ball'}
                onSelect={() => onSelect('ball')}
                onDragEnd={handleBallDrag}
              />
            )}
          </Layer>
        </Stage>
      </div>
    )
  },
)
