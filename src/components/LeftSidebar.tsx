import { useRef } from 'react'
import {
  MousePointer2,
  Pencil,
  MoveUpRight,
  Spline,
  Square,
  Circle,
  Eraser,
  Undo2,
  Redo2,
  Download,
  Trash2,
  RotateCcw,
  Crosshair,
  FileDown,
  FileUp,
  FlipHorizontal2,
  Type,
  ArrowLeftRight,
  Bookmark,
  PaintBucket,
} from 'lucide-react'
import type {
  BoardFrame,
  FormationId,
  PitchMode,
  PitchTheme,
  DrawingStyle,
  Tool,
  TeamId,
} from '../types'
import { FORMATION_LIST } from '../formations'
import { PITCH_THEMES } from '../types'

interface LeftSidebarProps {
  tool: Tool
  onToolChange: (tool: Tool) => void
  style: DrawingStyle
  onStyleChange: (style: DrawingStyle) => void
  pitchMode: PitchMode
  onPitchModeChange: (mode: PitchMode) => void
  pitchTheme: PitchTheme
  onPitchThemeChange: (theme: PitchTheme) => void
  homeTeamName?: string
  awayTeamName?: string
  homeFormation: FormationId
  awayFormation: FormationId
  onLoadFormation: (team: TeamId, formation: FormationId) => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  onClearDrawings: () => void
  onResetBoard: () => void
  showNames: boolean
  onShowNamesChange: (show: boolean) => void
  showHome: boolean
  showAway: boolean
  onShowHomeChange: (show: boolean) => void
  onShowAwayChange: (show: boolean) => void
  snapToGrid: boolean
  onSnapToGridChange: (snap: boolean) => void
  onCenterBall: () => void
  onPullAwayToHalf: () => void
  onSwapTeams: () => void
  frames: BoardFrame[]
  onSaveFrame: () => void
  onLoadFrame: (id: string) => void
  onDeleteFrame: (id: string) => void
  onExportPng: () => void
  onExportJson: () => void
  onImportJson: (file: File) => void
}

const TOOLS: { id: Tool; label: string; icon: typeof Pencil; hint: string }[] = [
  { id: 'select', label: 'Select / Move', icon: MousePointer2, hint: 'V' },
  { id: 'freehand', label: 'Freehand', icon: Pencil, hint: 'P' },
  { id: 'arrow', label: 'Arrow', icon: MoveUpRight, hint: 'A' },
  { id: 'dashed', label: 'Run Path', icon: Spline, hint: 'D' },
  { id: 'rect', label: 'Rectangle', icon: Square, hint: 'R' },
  { id: 'circle', label: 'Circle', icon: Circle, hint: 'C' },
  { id: 'text', label: 'Text Label', icon: Type, hint: 'T' },
  { id: 'eraser', label: 'Eraser', icon: Eraser, hint: 'E' },
]

const STROKE_PRESETS = [2, 3, 5, 8]
const COLOR_PRESETS = [
  '#ffffff',
  '#fbbf24',
  '#ef4444',
  '#3b82f6',
  '#22c55e',
  '#a855f7',
  '#000000',
]

export function LeftSidebar({
  tool,
  onToolChange,
  style,
  onStyleChange,
  pitchMode,
  onPitchModeChange,
  pitchTheme,
  onPitchThemeChange,
  homeTeamName,
  awayTeamName,
  homeFormation,
  awayFormation,
  onLoadFormation,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearDrawings,
  onResetBoard,
  showNames,
  onShowNamesChange,
  showHome,
  showAway,
  onShowHomeChange,
  onShowAwayChange,
  snapToGrid,
  onSnapToGridChange,
  onCenterBall,
  onPullAwayToHalf,
  onSwapTeams,
  frames,
  onSaveFrame,
  onLoadFrame,
  onDeleteFrame,
  onExportPng,
  onExportJson,
  onImportJson,
}: LeftSidebarProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r border-slate-700/60 bg-slate-900/95 p-4">
      <div>
        <h1 className="text-sm font-bold tracking-wide text-emerald-400 uppercase">
          Tactical Board
        </h1>
        <p className="mt-0.5 text-xs text-slate-400">Football analysis studio</p>
      </div>

      <section>
        <h2 className="mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Pitch View
        </h2>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-800 p-1">
          {(['full', 'half'] as PitchMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onPitchModeChange(mode)}
              className={`rounded-md px-2 py-1.5 text-xs font-medium capitalize transition ${
                pitchMode === mode
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {mode} Pitch
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-1.5">
          {PITCH_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              title={t.label}
              onClick={() => onPitchThemeChange(t.id)}
              className={`h-6 flex-1 rounded border-2 transition ${
                pitchTheme === t.id ? 'border-white scale-105' : 'border-transparent'
              }`}
              style={{ backgroundColor: t.base }}
            />
          ))}
        </div>
        <label className="mt-2 flex cursor-pointer items-center justify-between rounded-lg bg-slate-800/80 px-2.5 py-2 text-xs text-slate-300">
          <span>Show player names</span>
          <input
            type="checkbox"
            checked={showNames}
            onChange={(e) => onShowNamesChange(e.target.checked)}
            className="h-3.5 w-3.5 accent-emerald-500"
          />
        </label>
        <label className="mt-1.5 flex cursor-pointer items-center justify-between rounded-lg bg-slate-800/80 px-2.5 py-2 text-xs text-slate-300">
          <span>Snap to grid</span>
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={(e) => onSnapToGridChange(e.target.checked)}
            className="h-3.5 w-3.5 accent-emerald-500"
          />
        </label>
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          <label className="flex cursor-pointer items-center justify-between rounded-lg bg-slate-800/80 px-2.5 py-2 text-xs text-blue-300">
            <span>Home</span>
            <input
              type="checkbox"
              checked={showHome}
              onChange={(e) => onShowHomeChange(e.target.checked)}
              className="h-3.5 w-3.5 accent-blue-500"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between rounded-lg bg-slate-800/80 px-2.5 py-2 text-xs text-red-300">
            <span>Away</span>
            <input
              type="checkbox"
              checked={showAway}
              onChange={(e) => onShowAwayChange(e.target.checked)}
              className="h-3.5 w-3.5 accent-red-500"
            />
          </label>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Quick Actions
        </h2>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={onCenterBall}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-800 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
          >
            <Crosshair size={14} /> Center Ball
          </button>
          <button
            type="button"
            onClick={onSwapTeams}
            title="Mirror all players and kits across the halfway line"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-800 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
          >
            <ArrowLeftRight size={14} /> Swap / Mirror Teams
          </button>
          <button
            type="button"
            onClick={onPullAwayToHalf}
            title="Mirror away into the left half and switch to half-pitch view"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-800 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
          >
            <FlipHorizontal2 size={14} /> Pull Away to Half
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Drawing Tools
        </h2>
        <div className="grid grid-cols-4 gap-1.5">
          {TOOLS.map(({ id, label, icon: Icon, hint }) => (
            <button
              key={id}
              type="button"
              title={`${label} (${hint})`}
              onClick={() => onToolChange(id)}
              className={`relative flex aspect-square items-center justify-center rounded-lg transition ${
                tool === id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              <span className="absolute right-0.5 bottom-0.5 text-[8px] opacity-60">
                {hint}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Stroke
        </h2>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => onStyleChange({ ...style, color: c })}
              className={`h-7 w-7 rounded-full border-2 transition ${
                style.color === c ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <label
            className="flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-slate-600"
            title="Custom color"
          >
            <input
              type="color"
              value={style.color}
              onChange={(e) => onStyleChange({ ...style, color: e.target.value })}
              className="h-10 w-10 cursor-pointer"
            />
          </label>
        </div>
        <div className="flex gap-1">
          {STROKE_PRESETS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => onStyleChange({ ...style, strokeWidth: w })}
              className={`flex h-8 flex-1 items-center justify-center rounded-md transition ${
                style.strokeWidth === w
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span
                className="block w-5 rounded-full bg-current"
                style={{ height: Math.min(w, 6) }}
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onStyleChange({ ...style, fill: !style.fill })}
          className={`mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition ${
            style.fill
              ? 'bg-emerald-700/50 text-emerald-200 ring-1 ring-emerald-500/40'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
          title="Fill rectangles and circles with translucent color"
        >
          <PaintBucket size={14} /> Zone fill {style.fill ? 'ON' : 'OFF'}
        </button>
      </section>

      <section>
        <h2 className="mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Frames
        </h2>
        <button
          type="button"
          onClick={onSaveFrame}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-800 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
        >
          <Bookmark size={14} /> Save Frame
        </button>
        {frames.length === 0 ? (
          <p className="mt-1.5 text-[10px] text-slate-500">
            Snapshot the board for Phase A / B / C…
          </p>
        ) : (
          <ul className="mt-1.5 max-h-36 space-y-1 overflow-y-auto">
            {frames.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-1 rounded-md bg-slate-800/80 px-1.5 py-1"
              >
                <button
                  type="button"
                  onClick={() => onLoadFrame(f.id)}
                  className="min-w-0 flex-1 truncate text-left text-xs text-slate-200 hover:text-emerald-300"
                  title="Load frame"
                >
                  {f.name}
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteFrame(f.id)}
                  className="shrink-0 rounded p-0.5 text-slate-500 hover:text-red-300"
                  title="Delete frame"
                >
                  <Trash2 size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          History
        </h2>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndo}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-800 py-2 text-xs font-medium text-slate-200 transition enabled:hover:bg-slate-700 disabled:opacity-40"
          >
            <Undo2 size={14} /> Undo
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={onRedo}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-800 py-2 text-xs font-medium text-slate-200 transition enabled:hover:bg-slate-700 disabled:opacity-40"
          >
            <Redo2 size={14} /> Redo
          </button>
        </div>
        <button
          type="button"
          onClick={onClearDrawings}
          className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-800 py-2 text-xs font-medium text-red-300 transition hover:bg-red-950/50"
        >
          <Trash2 size={14} /> Clear Drawings
        </button>
        <button
          type="button"
          onClick={onResetBoard}
          className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-800 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
        >
          <RotateCcw size={14} /> Reset Board
        </button>
      </section>

      <section>
        <h2 className="mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Formations
        </h2>
        <FormationPicker
          label={homeTeamName ? `Home (${homeTeamName})` : 'Home'}
          accent="text-blue-400"
          value={homeFormation}
          onChange={(f) => onLoadFormation('home', f)}
        />
        <FormationPicker
          label={awayTeamName ? `Away (${awayTeamName})` : 'Away'}
          accent="text-red-400"
          value={awayFormation}
          onChange={(f) => onLoadFormation('away', f)}
        />
      </section>

      <div className="mt-auto flex flex-col gap-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onExportJson}
            className="flex items-center justify-center gap-1 rounded-lg bg-slate-800 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
          >
            <FileDown size={14} /> JSON
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-1 rounded-lg bg-slate-800 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
          >
            <FileUp size={14} /> Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onImportJson(file)
              e.target.value = ''
            }}
          />
        </div>
        <button
          type="button"
          onClick={onExportPng}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-500"
        >
          <Download size={16} /> Export PNG
        </button>
      </div>
    </aside>
  )
}

function FormationPicker({
  label,
  accent,
  value,
  onChange,
}: {
  label: string
  accent: string
  value: FormationId
  onChange: (f: FormationId) => void
}) {
  return (
    <div className="mb-2">
      <div className={`mb-1 text-xs font-semibold ${accent}`}>{label}</div>
      <div className="grid grid-cols-2 gap-1">
        {FORMATION_LIST.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onChange(f)}
            className={`rounded-md px-2 py-1.5 text-[11px] font-medium transition ${
              value === f
                ? 'bg-slate-600 text-white ring-1 ring-emerald-500/50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  )
}
