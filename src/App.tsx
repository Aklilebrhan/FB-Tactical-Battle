import { useCallback, useEffect, useRef, useState } from 'react'
import { LeftSidebar } from './components/LeftSidebar'
import { RightSidebar } from './components/RightSidebar'
import {
  TacticalBoard,
  type BoardHandle,
} from './components/TacticalBoard'
import { createFormationPlayers } from './formations'
import { getTeamById, createTeamPlayers } from './data/teams'
import { useHistory } from './hooks/useHistory'
import {
  clearPersisted,
  loadFrames,
  loadPersisted,
  saveFrames,
  savePersisted,
} from './persistence'
import type {
  Ball,
  BenchPlayer,
  BoardFrame,
  BoardState,
  DrawingShape,
  DrawingStyle,
  FormationId,
  PitchMode,
  PitchTheme,
  Player,
  TeamId,
  TeamKit,
  TeamPreset,
  Tool,
} from './types'
import { PITCH_THEMES } from './types'
import { uid } from './utils'

const defaultHomePreset = getTeamById('mancity')!
const defaultAwayPreset = getTeamById('realmadrid')!
const defaultHomeSetup = createTeamPlayers(defaultHomePreset, 'home', defaultHomePreset.formation)
const defaultAwaySetup = createTeamPlayers(defaultAwayPreset, 'away', defaultAwayPreset.formation)

const DEFAULT_HOME_KIT: TeamKit = defaultHomePreset.kit
const DEFAULT_AWAY_KIT: TeamKit = defaultAwayPreset.kit

const INITIAL_STATE: BoardState = {
  players: [...defaultHomeSetup.starters, ...defaultAwaySetup.starters],
  ball: { x: 50, y: 50 },
  drawings: [],
  homeBench: defaultHomeSetup.bench,
  awayBench: defaultAwaySetup.bench,
}

const TOOL_KEYS: Record<string, Tool> = {
  v: 'select',
  p: 'freehand',
  a: 'arrow',
  d: 'dashed',
  r: 'rect',
  c: 'circle',
  t: 'text',
  e: 'eraser',
}

const TOOL_HINTS: Record<Tool, string> = {
  select: 'Drag players/ball · arrow keys nudge selection',
  freehand: 'Click and drag to draw freehand',
  arrow: 'Click and drag to place an arrow',
  dashed: 'Draw a dashed run path',
  rect: 'Drag to draw a rectangle zone',
  circle: 'Drag to draw a circle',
  text: 'Click the pitch to place a text label',
  eraser: 'Click a drawing to erase it',
}

const FORMATIONS: FormationId[] = [
  '4-3-3',
  '4-4-2',
  '3-5-2',
  '4-2-3-1',
  '5-3-2',
  '4-1-4-1',
  '4-5-1',
]
const THEME_IDS = PITCH_THEMES.map((t) => t.id)

function isTeamKit(v: unknown): v is TeamKit {
  if (!v || typeof v !== 'object') return false
  const k = v as TeamKit
  return (
    typeof k.primary === 'string' &&
    typeof k.secondary === 'string' &&
    typeof k.numberColor === 'string'
  )
}

function isBoardFrame(v: unknown): v is BoardFrame {
  if (!v || typeof v !== 'object') return false
  const f = v as BoardFrame
  return (
    typeof f.id === 'string' &&
    typeof f.name === 'string' &&
    !!f.board &&
    Array.isArray(f.board.players)
  )
}

function restoreBoard() {
  const saved = loadPersisted()
  if (!saved) {
    return {
      board: INITIAL_STATE,
      homeKit: DEFAULT_HOME_KIT,
      awayKit: DEFAULT_AWAY_KIT,
      homeFormation: defaultHomePreset.formation,
      awayFormation: defaultAwayPreset.formation,
      homeTeamName: defaultHomePreset.name,
      awayTeamName: defaultAwayPreset.name,
      homeTeamId: defaultHomePreset.id,
      awayTeamId: defaultAwayPreset.id,
      pitchMode: 'full' as PitchMode,
      pitchTheme: 'classic' as PitchTheme,
      showNames: true,
      showHome: true,
      showAway: true,
      snapToGrid: false,
    }
  }

  const board: BoardState = {
    players: Array.isArray(saved.players)
      ? (saved.players as Player[])
      : INITIAL_STATE.players,
    ball:
      saved.ball && typeof saved.ball === 'object'
        ? (saved.ball as Ball)
        : INITIAL_STATE.ball,
    drawings: Array.isArray(saved.drawings)
      ? (saved.drawings as DrawingShape[])
      : [],
    homeBench: Array.isArray(saved.homeBench)
      ? (saved.homeBench as BenchPlayer[])
      : defaultHomeSetup.bench,
    awayBench: Array.isArray(saved.awayBench)
      ? (saved.awayBench as BenchPlayer[])
      : defaultAwaySetup.bench,
  }

  return {
    board,
    homeKit: isTeamKit(saved.homeKit) ? saved.homeKit : DEFAULT_HOME_KIT,
    awayKit: isTeamKit(saved.awayKit) ? saved.awayKit : DEFAULT_AWAY_KIT,
    homeFormation: FORMATIONS.includes(saved.homeFormation as FormationId)
      ? (saved.homeFormation as FormationId)
      : defaultHomePreset.formation,
    awayFormation: FORMATIONS.includes(saved.awayFormation as FormationId)
      ? (saved.awayFormation as FormationId)
      : defaultAwayPreset.formation,
    homeTeamName:
      typeof saved.homeTeamName === 'string'
        ? saved.homeTeamName
        : defaultHomePreset.name,
    awayTeamName:
      typeof saved.awayTeamName === 'string'
        ? saved.awayTeamName
        : defaultAwayPreset.name,
    homeTeamId:
      typeof saved.homeTeamId === 'string'
        ? saved.homeTeamId
        : defaultHomePreset.id,
    awayTeamId:
      typeof saved.awayTeamId === 'string'
        ? saved.awayTeamId
        : defaultAwayPreset.id,
    pitchMode: (saved.pitchMode === 'half' ? 'half' : 'full') as PitchMode,
    pitchTheme: THEME_IDS.includes(saved.pitchTheme as PitchTheme)
      ? (saved.pitchTheme as PitchTheme)
      : ('classic' as PitchTheme),
    showNames: saved.showNames !== false,
    showHome: saved.showHome !== false,
    showAway: saved.showAway !== false,
    snapToGrid: saved.snapToGrid === true,
  }
}

const RESTORED = restoreBoard()

export default function App() {
  const boardRef = useRef<BoardHandle>(null)
  const {
    state,
    setState,
    replace,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  } = useHistory<BoardState>(RESTORED.board)

  const [tool, setTool] = useState<Tool>('select')
  const [style, setStyle] = useState<DrawingStyle>({
    color: '#fbbf24',
    strokeWidth: 3,
    fill: false,
  })
  const [pitchMode, setPitchMode] = useState<PitchMode>(RESTORED.pitchMode)
  const [pitchTheme, setPitchTheme] = useState<PitchTheme>(RESTORED.pitchTheme)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showNames, setShowNames] = useState(RESTORED.showNames)
  const [showHome, setShowHome] = useState(RESTORED.showHome)
  const [showAway, setShowAway] = useState(RESTORED.showAway)
  const [snapToGrid, setSnapToGrid] = useState(RESTORED.snapToGrid)
  const [homeKit, setHomeKit] = useState<TeamKit>(RESTORED.homeKit)
  const [awayKit, setAwayKit] = useState<TeamKit>(RESTORED.awayKit)
  const [homeTeamName, setHomeTeamName] = useState<string>(RESTORED.homeTeamName)
  const [awayTeamName, setAwayTeamName] = useState<string>(RESTORED.awayTeamName)
  const [homeTeamId, setHomeTeamId] = useState<string | undefined>(RESTORED.homeTeamId)
  const [awayTeamId, setAwayTeamId] = useState<string | undefined>(RESTORED.awayTeamId)
  const [homeFormation, setHomeFormation] = useState<FormationId>(
    RESTORED.homeFormation,
  )
  const [awayFormation, setAwayFormation] = useState<FormationId>(
    RESTORED.awayFormation,
  )
  const [frames, setFrames] = useState<BoardFrame[]>(() =>
    loadFrames<unknown>().filter(isBoardFrame),
  )

  const { players, ball, drawings, homeBench, awayBench } = state

  useEffect(() => {
    savePersisted({
      players,
      ball,
      drawings,
      homeBench,
      awayBench,
      homeTeamName,
      awayTeamName,
      homeTeamId,
      awayTeamId,
      homeKit,
      awayKit,
      homeFormation,
      awayFormation,
      pitchMode,
      pitchTheme,
      showNames,
      showHome,
      showAway,
      snapToGrid,
    })
  }, [
    players,
    ball,
    drawings,
    homeBench,
    awayBench,
    homeTeamName,
    awayTeamName,
    homeTeamId,
    awayTeamId,
    homeKit,
    awayKit,
    homeFormation,
    awayFormation,
    pitchMode,
    pitchTheme,
    showNames,
    showHome,
    showAway,
    snapToGrid,
  ])

  useEffect(() => {
    saveFrames(frames)
  }, [frames])

  const commit = useCallback(
    (patch: Partial<BoardState>) => {
      setState((prev) => ({ ...prev, ...patch }))
    },
    [setState],
  )

  const replaceLive = useCallback(
    (patch: Partial<BoardState>) => {
      replace((prev) => ({ ...prev, ...patch }))
    },
    [replace],
  )

  const onPlayersChange = useCallback(
    (next: Player[]) => {
      commit({ players: next })
    },
    [commit],
  )

  const onBallChange = useCallback(
    (next: Ball) => {
      commit({ ball: next })
    },
    [commit],
  )

  const onCommitDrawings = useCallback(
    (next: DrawingShape[]) => {
      commit({ drawings: next })
    },
    [commit],
  )

  const onLoadFormation = useCallback(
    (team: TeamId, formation: FormationId) => {
      if (team === 'home') setHomeFormation(formation)
      else setAwayFormation(formation)

      const formed = createFormationPlayers(formation, team)
      setState((prev) => {
        const existing = prev.players.filter((p) => p.team === team)
        const merged = formed.map((slot, i) => {
          const prevPlayer = existing[i]
          if (!prevPlayer) return slot
          return {
            ...slot,
            number: prevPlayer.number,
            name: prevPlayer.name,
            role: prevPlayer.role || slot.role,
          }
        })
        return {
          ...prev,
          players: [...prev.players.filter((p) => p.team !== team), ...merged],
        }
      })
    },
    [setState],
  )

  const onLoadTeamPreset = useCallback(
    (teamSide: TeamId, preset: TeamPreset) => {
      const { starters, bench } = createTeamPlayers(preset, teamSide, preset.formation)

      if (teamSide === 'home') {
        setHomeKit(preset.kit)
        setHomeFormation(preset.formation)
        setHomeTeamName(preset.name)
        setHomeTeamId(preset.id)
      } else {
        setAwayKit(preset.kit)
        setAwayFormation(preset.formation)
        setAwayTeamName(preset.name)
        setAwayTeamId(preset.id)
      }

      setState((prev) => ({
        ...prev,
        players: [
          ...prev.players.filter((p) => p.team !== teamSide),
          ...starters,
        ],
        [teamSide === 'home' ? 'homeBench' : 'awayBench']: bench,
      }))
      setSelectedId(null)
    },
    [setState],
  )

  const onSubstitute = useCallback(
    (teamSide: TeamId, pitchPlayerId: string, benchPlayerId: string) => {
      setState((prev) => {
        const pitchPlayer = prev.players.find((p) => p.id === pitchPlayerId)
        const bench = teamSide === 'home' ? prev.homeBench : prev.awayBench
        const benchPlayer = bench.find((b) => b.id === benchPlayerId)
        if (!pitchPlayer || !benchPlayer) return prev

        const newPitchPlayer: Player = {
          id: `${teamSide}-${Date.now().toString(36)}`,
          team: teamSide,
          number: benchPlayer.number,
          name: benchPlayer.name,
          role: benchPlayer.role || pitchPlayer.role,
          x: pitchPlayer.x,
          y: pitchPlayer.y,
        }

        const newBenchPlayer: BenchPlayer = {
          id: `${teamSide}-bench-${Date.now().toString(36)}`,
          team: teamSide,
          number: pitchPlayer.number,
          name: pitchPlayer.name,
          role: pitchPlayer.role,
        }

        const nextPlayers = prev.players.map((p) =>
          p.id === pitchPlayerId ? newPitchPlayer : p,
        )
        const nextBench = bench.map((b) =>
          b.id === benchPlayerId ? newBenchPlayer : b,
        )

        return {
          ...prev,
          players: nextPlayers,
          [teamSide === 'home' ? 'homeBench' : 'awayBench']: nextBench,
        }
      })
    },
    [setState],
  )

  const onUpdatePlayer = useCallback(
    (id: string, patch: Partial<Player>) => {
      replaceLive({
        players: players.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      })
    },
    [players, replaceLive],
  )

  const onUpdateBenchPlayer = useCallback(
    (id: string, patch: Partial<BenchPlayer>) => {
      replaceLive({
        homeBench: homeBench.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        awayBench: awayBench.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      })
    },
    [homeBench, awayBench, replaceLive],
  )

  const onAddBenchPlayer = useCallback(
    (teamSide: TeamId) => {
      const bench = teamSide === 'home' ? homeBench : awayBench
      const maxNum = bench.reduce((max, b) => Math.max(max, b.number), 0)
      const newBenchPlayer: BenchPlayer = {
        id: `${teamSide}-bench-${Date.now().toString(36)}`,
        team: teamSide,
        number: maxNum > 0 ? maxNum + 1 : 12,
        name: `Sub ${bench.length + 1}`,
        role: 'SUB',
      }
      commit({
        [teamSide === 'home' ? 'homeBench' : 'awayBench']: [...bench, newBenchPlayer],
      })
    },
    [homeBench, awayBench, commit],
  )

  const onRemoveBenchPlayer = useCallback(
    (teamSide: TeamId, benchPlayerId: string) => {
      const bench = teamSide === 'home' ? homeBench : awayBench
      commit({
        [teamSide === 'home' ? 'homeBench' : 'awayBench']: bench.filter(
          (b) => b.id !== benchPlayerId,
        ),
      })
    },
    [homeBench, awayBench, commit],
  )

  const onKitChange = useCallback((team: TeamId, kit: TeamKit) => {
    if (team === 'home') setHomeKit(kit)
    else setAwayKit(kit)
  }, [])

  const onClearDrawings = useCallback(() => {
    commit({ drawings: [] })
  }, [commit])

  const onCenterBall = useCallback(() => {
    commit({ ball: { x: 50, y: 50 } })
  }, [commit])

  const onSwapTeams = useCallback(() => {
    setState((prev) => ({
      ...prev,
      players: prev.players.map((p) => {
        const nextTeam: TeamId = p.team === 'home' ? 'away' : 'home'
        const suffix = p.id.includes('-') ? p.id.slice(p.id.indexOf('-') + 1) : p.id
        return {
          ...p,
          team: nextTeam,
          x: 100 - p.x,
          id: `${nextTeam}-${suffix}`,
        }
      }),
      homeBench: prev.awayBench.map((b) => ({ ...b, team: 'home' as TeamId })),
      awayBench: prev.homeBench.map((b) => ({ ...b, team: 'away' as TeamId })),
      ball: { ...prev.ball, x: 100 - prev.ball.x },
      drawings: prev.drawings.map((d) => mirrorDrawingX(d)),
    }))
    setHomeKit(awayKit)
    setAwayKit(homeKit)
    setHomeFormation(awayFormation)
    setAwayFormation(homeFormation)
    setHomeTeamName(awayTeamName)
    setAwayTeamName(homeTeamName)
    setHomeTeamId(awayTeamId)
    setAwayTeamId(homeTeamId)
    setSelectedId(null)
  }, [
    setState,
    homeKit,
    awayKit,
    homeFormation,
    awayFormation,
    homeTeamName,
    awayTeamName,
    homeTeamId,
    awayTeamId,
  ])

  const onPullAwayToHalf = useCallback(() => {
    setPitchMode('half')
    setShowAway(true)
    setState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.team === 'away' ? { ...p, x: Math.min(50, 100 - p.x) } : p,
      ),
      ball: {
        ...prev.ball,
        x: Math.min(50, prev.ball.x > 50 ? 100 - prev.ball.x : prev.ball.x),
      },
    }))
  }, [setState])

  const onSaveFrame = useCallback(() => {
    const name =
      window.prompt('Frame name', `Phase ${frames.length + 1}`)?.trim() ||
      `Phase ${frames.length + 1}`
    const frame: BoardFrame = {
      id: uid('frame'),
      name: name.slice(0, 40),
      createdAt: Date.now(),
      board: {
        players: structuredClone(players),
        ball: { ...ball },
        drawings: structuredClone(drawings),
        homeBench: structuredClone(homeBench),
        awayBench: structuredClone(awayBench),
      },
    }
    setFrames((prev) => [frame, ...prev].slice(0, 24))
  }, [frames.length, players, ball, drawings, homeBench, awayBench])

  const onLoadFrame = useCallback(
    (id: string) => {
      const frame = frames.find((f) => f.id === id)
      if (!frame) return
      setState(() => ({
        ...structuredClone(frame.board),
        homeBench: Array.isArray(frame.board.homeBench)
          ? structuredClone(frame.board.homeBench)
          : homeBench,
        awayBench: Array.isArray(frame.board.awayBench)
          ? structuredClone(frame.board.awayBench)
          : awayBench,
      }))
      setSelectedId(null)
    },
    [frames, setState, homeBench, awayBench],
  )

  const onDeleteFrame = useCallback((id: string) => {
    setFrames((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const onResetBoard = useCallback(() => {
    clearPersisted()
    reset(INITIAL_STATE)
    setHomeFormation(defaultHomePreset.formation)
    setAwayFormation(defaultAwayPreset.formation)
    setHomeKit(DEFAULT_HOME_KIT)
    setAwayKit(DEFAULT_AWAY_KIT)
    setHomeTeamName(defaultHomePreset.name)
    setAwayTeamName(defaultAwayPreset.name)
    setHomeTeamId(defaultHomePreset.id)
    setAwayTeamId(defaultAwayPreset.id)
    setSelectedId(null)
    setTool('select')
    setPitchMode('full')
    setPitchTheme('classic')
    setShowNames(true)
    setShowHome(true)
    setShowAway(true)
    setSnapToGrid(false)
  }, [reset])

  const onExportPng = useCallback(() => {
    boardRef.current?.exportPng()
  }, [])

  const onExportJson = useCallback(() => {
    const payload = {
      version: 2,
      players,
      ball,
      drawings,
      homeBench,
      awayBench,
      homeTeamName,
      awayTeamName,
      homeTeamId,
      awayTeamId,
      homeKit,
      awayKit,
      homeFormation,
      awayFormation,
      pitchMode,
      pitchTheme,
      showNames,
      showHome,
      showAway,
      snapToGrid,
      frames,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tactical-board-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [
    players,
    ball,
    drawings,
    homeBench,
    awayBench,
    homeTeamName,
    awayTeamName,
    homeTeamId,
    awayTeamId,
    homeKit,
    awayKit,
    homeFormation,
    awayFormation,
    pitchMode,
    pitchTheme,
    showNames,
    showHome,
    showAway,
    snapToGrid,
    frames,
  ])

  const onImportJson = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result)) as Record<string, unknown>
          if (!Array.isArray(data.players) || !data.ball) {
            window.alert('Invalid board file: missing players or ball.')
            return
          }
          reset({
            players: data.players as Player[],
            ball: data.ball as Ball,
            drawings: Array.isArray(data.drawings)
              ? (data.drawings as DrawingShape[])
              : [],
            homeBench: Array.isArray(data.homeBench)
              ? (data.homeBench as BenchPlayer[])
              : defaultHomeSetup.bench,
            awayBench: Array.isArray(data.awayBench)
              ? (data.awayBench as BenchPlayer[])
              : defaultAwaySetup.bench,
          })
          if (isTeamKit(data.homeKit)) setHomeKit(data.homeKit)
          if (isTeamKit(data.awayKit)) setAwayKit(data.awayKit)
          if (typeof data.homeTeamName === 'string') setHomeTeamName(data.homeTeamName)
          if (typeof data.awayTeamName === 'string') setAwayTeamName(data.awayTeamName)
          if (typeof data.homeTeamId === 'string') setHomeTeamId(data.homeTeamId)
          if (typeof data.awayTeamId === 'string') setAwayTeamId(data.awayTeamId)
          if (FORMATIONS.includes(data.homeFormation as FormationId)) {
            setHomeFormation(data.homeFormation as FormationId)
          }
          if (FORMATIONS.includes(data.awayFormation as FormationId)) {
            setAwayFormation(data.awayFormation as FormationId)
          }
          if (data.pitchMode === 'half' || data.pitchMode === 'full') {
            setPitchMode(data.pitchMode)
          }
          if (THEME_IDS.includes(data.pitchTheme as PitchTheme)) {
            setPitchTheme(data.pitchTheme as PitchTheme)
          }
          if (typeof data.showNames === 'boolean') setShowNames(data.showNames)
          if (typeof data.showHome === 'boolean') setShowHome(data.showHome)
          if (typeof data.showAway === 'boolean') setShowAway(data.showAway)
          if (typeof data.snapToGrid === 'boolean') setSnapToGrid(data.snapToGrid)
          if (Array.isArray(data.frames)) {
            setFrames(data.frames.filter(isBoardFrame))
          }
          setSelectedId(null)
        } catch {
          window.alert('Could not read that JSON file.')
        }
      }
      reader.readAsText(file)
    },
    [reset],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      const inInput = e.target instanceof HTMLInputElement
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
        return
      }
      if (inInput || mod) return

      const next = TOOL_KEYS[e.key.toLowerCase()]
      if (next) {
        e.preventDefault()
        setTool(next)
        return
      }

      // Arrow-key nudge for selected player or ball
      if (
        selectedId &&
        tool === 'select' &&
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
      ) {
        e.preventDefault()
        const step = e.shiftKey ? 2.5 : 1
        const dx =
          e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy =
          e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
        const maxX = pitchMode === 'half' ? 50 : 100

        if (selectedId === 'ball') {
          commit({
            ball: {
              x: Math.max(0, Math.min(maxX, ball.x + dx)),
              y: Math.max(0, Math.min(100, ball.y + dy)),
            },
          })
        } else {
          commit({
            players: players.map((p) =>
              p.id === selectedId
                ? {
                    ...p,
                    x: Math.max(0, Math.min(maxX, p.x + dx)),
                    y: Math.max(0, Math.min(100, p.y + dy)),
                  }
                : p,
            ),
          })
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    undo,
    redo,
    selectedId,
    tool,
    pitchMode,
    ball,
    players,
    commit,
  ])

  return (
    <div className="flex h-full w-full bg-slate-950 text-slate-100">
      <LeftSidebar
        tool={tool}
        onToolChange={setTool}
        style={style}
        onStyleChange={setStyle}
        pitchMode={pitchMode}
        onPitchModeChange={setPitchMode}
        pitchTheme={pitchTheme}
        onPitchThemeChange={setPitchTheme}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        homeFormation={homeFormation}
        awayFormation={awayFormation}
        onLoadFormation={onLoadFormation}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onClearDrawings={onClearDrawings}
        onResetBoard={onResetBoard}
        showNames={showNames}
        onShowNamesChange={setShowNames}
        showHome={showHome}
        showAway={showAway}
        onShowHomeChange={setShowHome}
        onShowAwayChange={setShowAway}
        snapToGrid={snapToGrid}
        onSnapToGridChange={setSnapToGrid}
        onCenterBall={onCenterBall}
        onPullAwayToHalf={onPullAwayToHalf}
        onSwapTeams={onSwapTeams}
        frames={frames}
        onSaveFrame={onSaveFrame}
        onLoadFrame={onLoadFrame}
        onDeleteFrame={onDeleteFrame}
        onExportPng={onExportPng}
        onExportJson={onExportJson}
        onImportJson={onImportJson}
      />

      <main className="relative flex min-w-0 flex-1 flex-col p-3">
        <div className="min-h-0 flex-1">
          <TacticalBoard
            ref={boardRef}
            players={players}
            ball={ball}
            drawings={drawings}
            homeKit={homeKit}
            awayKit={awayKit}
            pitchMode={pitchMode}
            pitchTheme={pitchTheme}
            tool={tool}
            style={style}
            selectedId={selectedId}
            showNames={showNames}
            showHome={showHome}
            showAway={showAway}
            snapToGrid={snapToGrid}
            onSelect={setSelectedId}
            onPlayersChange={onPlayersChange}
            onBallChange={onBallChange}
            onCommitDrawings={onCommitDrawings}
          />
        </div>
        <div className="mt-2 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-400">
          <span>
            <span className="font-medium text-emerald-400 capitalize">{tool}</span>
            {' · '}
            {TOOL_HINTS[tool]}
            {snapToGrid ? ' · Snap on' : ''}
            {style.fill ? ' · Fill on' : ''}
          </span>
          <span className="hidden sm:inline">
            V P A D R C T E · Arrows nudge · Ctrl+Z/Y · Auto-saved
          </span>
        </div>
      </main>

      <RightSidebar
        players={players}
        homeBench={homeBench}
        awayBench={awayBench}
        homeKit={homeKit}
        awayKit={awayKit}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
        homeTeamId={homeTeamId}
        awayTeamId={awayTeamId}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onUpdatePlayer={onUpdatePlayer}
        onUpdateBenchPlayer={onUpdateBenchPlayer}
        onKitChange={onKitChange}
        onLoadTeamPreset={onLoadTeamPreset}
        onSubstitute={onSubstitute}
        onAddBenchPlayer={onAddBenchPlayer}
        onRemoveBenchPlayer={onRemoveBenchPlayer}
      />
    </div>
  )
}

function mirrorDrawingX(shape: DrawingShape): DrawingShape {
  switch (shape.type) {
    case 'freehand':
    case 'dashed': {
      const points = [...shape.points]
      for (let i = 0; i < points.length; i += 2) points[i] = 100 - points[i]
      return { ...shape, points }
    }
    case 'arrow':
      return {
        ...shape,
        points: [
          100 - shape.points[0],
          shape.points[1],
          100 - shape.points[2],
          shape.points[3],
        ],
      }
    case 'rect':
      return {
        ...shape,
        x: 100 - shape.x - shape.width,
      }
    case 'circle':
    case 'text':
      return { ...shape, x: 100 - shape.x }
  }
}
