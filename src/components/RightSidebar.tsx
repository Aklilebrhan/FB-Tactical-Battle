import { useState } from 'react'
import {
  Users,
  ArrowLeftRight,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Palette,
  Sparkles,
} from 'lucide-react'
import type { Player, BenchPlayer, TeamId, TeamKit, TeamPreset } from '../types'
import { TEAMS } from '../data/teams'
import { TeamPickerModal } from './TeamPickerModal'

interface RightSidebarProps {
  players: Player[]
  homeBench: BenchPlayer[]
  awayBench: BenchPlayer[]
  homeKit: TeamKit
  awayKit: TeamKit
  homeTeamName: string
  awayTeamName: string
  homeTeamId?: string
  awayTeamId?: string
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdatePlayer: (id: string, patch: Partial<Player>) => void
  onUpdateBenchPlayer: (id: string, patch: Partial<BenchPlayer>) => void
  onKitChange: (team: TeamId, kit: TeamKit) => void
  onLoadTeamPreset: (teamSide: TeamId, teamPreset: TeamPreset) => void
  onSubstitute: (teamSide: TeamId, pitchPlayerId: string, benchPlayerId: string) => void
  onAddBenchPlayer: (teamSide: TeamId) => void
  onRemoveBenchPlayer: (teamSide: TeamId, benchPlayerId: string) => void
}

export function RightSidebar({
  players,
  homeBench,
  awayBench,
  homeKit,
  awayKit,
  homeTeamName,
  awayTeamName,
  homeTeamId,
  awayTeamId,
  selectedId,
  onSelect,
  onUpdatePlayer,
  onUpdateBenchPlayer,
  onKitChange,
  onLoadTeamPreset,
  onSubstitute,
  onAddBenchPlayer,
  onRemoveBenchPlayer,
}: RightSidebarProps) {
  const [modalTeamSide, setModalTeamSide] = useState<TeamId | null>(null)
  const [homeKitOpen, setHomeKitOpen] = useState(false)
  const [awayKitOpen, setAwayKitOpen] = useState(false)
  const [homeActiveTab, setHomeActiveTab] = useState<'xi' | 'bench'>('xi')
  const [awayActiveTab, setAwayActiveTab] = useState<'xi' | 'bench'>('xi')

  // Find if selected item is a pitch player or bench player
  const selectedPitchPlayer =
    selectedId && selectedId !== 'ball'
      ? players.find((p) => p.id === selectedId) || null
      : null

  const selectedBenchPlayer =
    selectedId && selectedId !== 'ball'
      ? homeBench.find((b) => b.id === selectedId) ||
        awayBench.find((b) => b.id === selectedId) ||
        null
      : null

  const homePlayers = players.filter((p) => p.team === 'home')
  const awayPlayers = players.filter((p) => p.team === 'away')

  return (
    <>
      <aside className="flex h-full w-80 shrink-0 flex-col gap-3.5 overflow-y-auto border-l border-slate-700/60 bg-slate-900/95 p-4 text-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Teams & Rosters
          </h2>
          <p className="text-xs text-slate-400">Manage European clubs, starters & benches</p>
        </div>

        {/* Selected Player Editor (Pitch or Bench) */}
        {selectedPitchPlayer ? (
          <section className="rounded-xl border border-amber-500/40 bg-slate-800/90 p-3 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                Pitch Player · {selectedPitchPlayer.team === 'home' ? homeTeamName : awayTeamName}
              </span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                {selectedPitchPlayer.role || 'Player'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <label className="block text-[11px] text-slate-400">
                Number
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={selectedPitchPlayer.number}
                  onChange={(e) =>
                    onUpdatePlayer(selectedPitchPlayer.id, {
                      number: Math.max(1, Math.min(99, Number(e.target.value) || 1)),
                    })
                  }
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-2 py-1 text-sm font-semibold text-white outline-none focus:border-amber-500"
                />
              </label>
              <label className="col-span-2 block text-[11px] text-slate-400">
                Name
                <input
                  type="text"
                  maxLength={18}
                  value={selectedPitchPlayer.name}
                  onChange={(e) => onUpdatePlayer(selectedPitchPlayer.id, { name: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-2 py-1 text-sm text-white outline-none focus:border-amber-500"
                />
              </label>
            </div>

            {/* Quick Substitution with Bench */}
            <div className="mt-2.5 pt-2 border-t border-slate-700/60">
              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mb-1">
                <ArrowLeftRight size={12} className="text-emerald-400" />
                Quick Substitute with Bench:
              </span>
              <select
                aria-label="Substitute selected pitch player with bench player"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    onSubstitute(selectedPitchPlayer.team, selectedPitchPlayer.id, e.target.value)
                    e.target.value = ''
                  }
                }}
                className="w-full rounded-md border border-slate-600 bg-slate-950 px-2 py-1 text-xs text-emerald-300 outline-none focus:border-emerald-500"
              >
                <option value="" disabled>
                  Choose bench substitute to bring in...
                </option>
                {(selectedPitchPlayer.team === 'home' ? homeBench : awayBench).map((b) => (
                  <option key={b.id} value={b.id}>
                    #{b.number} {b.name} ({b.role || 'SUB'})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => onSelect(null)}
              className="mt-2 text-[11px] text-slate-400 hover:text-slate-200 transition"
            >
              Deselect
            </button>
          </section>
        ) : selectedBenchPlayer ? (
          <section className="rounded-xl border border-emerald-500/40 bg-slate-800/90 p-3 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
                Bench Substitute · {selectedBenchPlayer.team === 'home' ? homeTeamName : awayTeamName}
              </span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                {selectedBenchPlayer.role || 'SUB'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <label className="block text-[11px] text-slate-400">
                Number
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={selectedBenchPlayer.number}
                  onChange={(e) =>
                    onUpdateBenchPlayer(selectedBenchPlayer.id, {
                      number: Math.max(1, Math.min(99, Number(e.target.value) || 1)),
                    })
                  }
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-2 py-1 text-sm font-semibold text-white outline-none focus:border-emerald-500"
                />
              </label>
              <label className="col-span-2 block text-[11px] text-slate-400">
                Name
                <input
                  type="text"
                  maxLength={18}
                  value={selectedBenchPlayer.name}
                  onChange={(e) =>
                    onUpdateBenchPlayer(selectedBenchPlayer.id, { name: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-2 py-1 text-sm text-white outline-none focus:border-emerald-500"
                />
              </label>
            </div>

            {/* Sub onto pitch for one of starting XI */}
            <div className="mt-2.5 pt-2 border-t border-slate-700/60">
              <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mb-1">
                <ArrowLeftRight size={12} className="text-emerald-400" />
                Substitute into pitch for:
              </span>
              <select
                aria-label="Substitute bench player for a starter"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    onSubstitute(selectedBenchPlayer.team, e.target.value, selectedBenchPlayer.id)
                    e.target.value = ''
                  }
                }}
                className="w-full rounded-md border border-slate-600 bg-slate-950 px-2 py-1 text-xs text-amber-300 outline-none focus:border-amber-500"
              >
                <option value="" disabled>
                  Select starter to replace...
                </option>
                {(selectedBenchPlayer.team === 'home' ? homePlayers : awayPlayers).map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.number} {p.name} ({p.role || 'XI'})
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => onSelect(null)}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                Deselect
              </button>
              <button
                type="button"
                onClick={() => {
                  onRemoveBenchPlayer(selectedBenchPlayer.team, selectedBenchPlayer.id)
                  onSelect(null)
                }}
                className="flex items-center gap-1 text-red-400 hover:text-red-300 transition"
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </section>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-700/80 px-3 py-3 text-center text-xs text-slate-500">
            Click a starter or bench player to edit or substitute
          </div>
        )}

        {/* HOME TEAM SECTION */}
        <TeamCard
          teamSide="home"
          teamName={homeTeamName}
          teamId={homeTeamId}
          kit={homeKit}
          players={homePlayers}
          bench={homeBench}
          selectedId={selectedId}
          activeTab={homeActiveTab}
          kitOpen={homeKitOpen}
          accent="blue"
          onToggleKit={() => setHomeKitOpen((v) => !v)}
          onTabChange={setHomeActiveTab}
          onSelect={onSelect}
          onOpenModal={() => setModalTeamSide('home')}
          onKitChange={(k) => onKitChange('home', k)}
          onSelectPreset={(p) => onLoadTeamPreset('home', p)}
          onSubstitute={(starterId, benchId) => onSubstitute('home', starterId, benchId)}
          onAddSub={() => onAddBenchPlayer('home')}
          onRemoveSub={(bId) => onRemoveBenchPlayer('home', bId)}
        />

        {/* AWAY TEAM SECTION */}
        <TeamCard
          teamSide="away"
          teamName={awayTeamName}
          teamId={awayTeamId}
          kit={awayKit}
          players={awayPlayers}
          bench={awayBench}
          selectedId={selectedId}
          activeTab={awayActiveTab}
          kitOpen={awayKitOpen}
          accent="red"
          onToggleKit={() => setAwayKitOpen((v) => !v)}
          onTabChange={setAwayActiveTab}
          onSelect={onSelect}
          onOpenModal={() => setModalTeamSide('away')}
          onKitChange={(k) => onKitChange('away', k)}
          onSelectPreset={(p) => onLoadTeamPreset('away', p)}
          onSubstitute={(starterId, benchId) => onSubstitute('away', starterId, benchId)}
          onAddSub={() => onAddBenchPlayer('away')}
          onRemoveSub={(bId) => onRemoveBenchPlayer('away', bId)}
        />
      </aside>

      {/* Team Picker Modal */}
      {modalTeamSide && (
        <TeamPickerModal
          isOpen={true}
          teamSide={modalTeamSide}
          currentTeamId={modalTeamSide === 'home' ? homeTeamId : awayTeamId}
          onClose={() => setModalTeamSide(null)}
          onSelectTeam={(team) => onLoadTeamPreset(modalTeamSide, team)}
        />
      )}
    </>
  )
}

function TeamCard({
  teamSide,
  teamName,
  teamId,
  kit,
  players,
  bench,
  selectedId,
  activeTab,
  kitOpen,
  accent,
  onToggleKit,
  onTabChange,
  onSelect,
  onOpenModal,
  onKitChange,
  onSelectPreset,
  onSubstitute,
  onAddSub,
  onRemoveSub,
}: {
  teamSide: TeamId
  teamName: string
  teamId?: string
  kit: TeamKit
  players: Player[]
  bench: BenchPlayer[]
  selectedId: string | null
  activeTab: 'xi' | 'bench'
  kitOpen: boolean
  accent: 'blue' | 'red'
  onToggleKit: () => void
  onTabChange: (tab: 'xi' | 'bench') => void
  onSelect: (id: string) => void
  onOpenModal: () => void
  onKitChange: (kit: TeamKit) => void
  onSelectPreset: (preset: TeamPreset) => void
  onSubstitute: (starterId: string, benchId: string) => void
  onAddSub: () => void
  onRemoveSub: (benchId: string) => void
}) {
  const isBlue = accent === 'blue'
  const titleColor = isBlue ? 'text-blue-400' : 'text-red-400'
  const borderAccent = isBlue ? 'border-blue-500/30' : 'border-red-500/30'
  const tabActiveBg = isBlue ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'

  return (
    <section className={`rounded-xl border bg-slate-800/40 p-3 ${borderAccent}`}>
      {/* Team header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${titleColor}`}>
            {teamSide === 'home' ? 'Home Team' : 'Away Team'}
          </span>
          <h3 className="truncate text-sm font-bold text-slate-100" title={teamName}>
            {teamName}
          </h3>
        </div>

        {/* Kit swatch indicator */}
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold shadow"
          style={{
            backgroundColor: kit.primary,
            color: kit.numberColor,
            border: `2px solid ${kit.secondary}`,
          }}
        >
          {players[0]?.number || 1}
        </div>
      </div>

      {/* Team selector buttons */}
      <div className="mt-2.5 flex items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenModal}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 py-1.5 px-2 text-xs font-semibold text-white shadow transition"
          title="Browse all European clubs & national teams"
        >
          <Sparkles size={13} /> Change Team
        </button>

        <button
          type="button"
          onClick={onToggleKit}
          className={`flex items-center gap-1 rounded-lg border border-slate-700 py-1.5 px-2 text-xs text-slate-300 hover:bg-slate-700 transition ${
            kitOpen ? 'bg-slate-700 text-white' : 'bg-slate-800'
          }`}
          title="Customise Kit Colors"
        >
          <Palette size={13} />
          {kitOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
      </div>

      {/* Quick preset selector dropdown */}
      <div className="mt-1.5">
        <select
          aria-label={`Select ${teamSide === 'home' ? 'Home' : 'Away'} team preset`}
          value={teamId || ''}
          onChange={(e) => {
            const chosen = TEAMS.find((t) => t.id === e.target.value)
            if (chosen) onSelectPreset(chosen)
          }}
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300 outline-none focus:border-emerald-500"
        >
          <option value="" disabled>
            Quick Select Team...
          </option>
          <optgroup label="Premier League">
            {TEAMS.filter((t) => t.category === 'Premier League').map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="La Liga">
            {TEAMS.filter((t) => t.category === 'La Liga').map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Bundesliga">
            {TEAMS.filter((t) => t.category === 'Bundesliga').map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Serie A">
            {TEAMS.filter((t) => t.category === 'Serie A').map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Ligue 1">
            {TEAMS.filter((t) => t.category === 'Ligue 1').map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="National Teams">
            {TEAMS.filter((t) => t.category === 'National Teams').map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Kit Color Editor (Collapsible) */}
      {kitOpen && (
        <div className="mt-2.5 rounded-lg border border-slate-700/80 bg-slate-900/80 p-2.5">
          <span className="text-[10px] font-semibold uppercase text-slate-400 mb-1.5 block">
            Kit Color Swatches
          </span>
          <div className="flex flex-col gap-1.5">
            <ColorRow
              label="Primary"
              value={kit.primary}
              onChange={(primary) => onKitChange({ ...kit, primary })}
            />
            <ColorRow
              label="Trim / Stroke"
              value={kit.secondary}
              onChange={(secondary) => onKitChange({ ...kit, secondary })}
            />
            <ColorRow
              label="Number"
              value={kit.numberColor}
              onChange={(numberColor) => onKitChange({ ...kit, numberColor })}
            />
          </div>
        </div>
      )}

      {/* Starters & Bench Tabs */}
      <div className="mt-3 flex gap-1 rounded-lg bg-slate-900/80 p-1">
        <button
          type="button"
          onClick={() => onTabChange('xi')}
          className={`flex flex-1 items-center justify-center gap-1 rounded-md py-1 text-xs font-semibold transition ${
            activeTab === 'xi' ? tabActiveBg : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users size={12} /> Starting XI ({players.length})
        </button>
        <button
          type="button"
          onClick={() => onTabChange('bench')}
          className={`flex flex-1 items-center justify-center gap-1 rounded-md py-1 text-xs font-semibold transition ${
            activeTab === 'bench' ? tabActiveBg : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Bench ({bench.length})</span>
        </button>
      </div>

      {/* Roster List: Starting XI */}
      {activeTab === 'xi' ? (
        <div className="mt-2 space-y-1 max-h-64 overflow-y-auto pr-0.5">
          {players.map((p) => {
            const isSelected = selectedId === p.id
            return (
              <div
                key={p.id}
                className={`group flex items-center justify-between rounded-lg px-2 py-1 text-left transition ${
                  isSelected
                    ? 'bg-amber-500/25 ring-1 ring-amber-500/50'
                    : 'hover:bg-slate-800/80'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(p.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{
                      backgroundColor: kit.primary,
                      color: kit.numberColor,
                      border: `1.5px solid ${kit.secondary}`,
                    }}
                  >
                    {p.number}
                  </span>
                  <span className="truncate text-xs text-slate-200 font-medium">
                    {p.name || '—'}
                  </span>
                  {p.role && (
                    <span className="rounded bg-slate-800 px-1 py-0.2 text-[9px] font-semibold text-slate-400">
                      {p.role}
                    </span>
                  )}
                </button>

                {/* Quick sub dropdown */}
                {bench.length > 0 && (
                  <select
                    title="Sub out this player"
                    aria-label={`Substitute out #${p.number} ${p.name}`}
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        onSubstitute(p.id, e.target.value)
                        e.target.value = ''
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 transition rounded border border-slate-700 bg-slate-900 px-1 py-0.5 text-[10px] text-emerald-400 outline-none cursor-pointer"
                  >
                    <option value="" disabled>
                      ⇄ Sub
                    </option>
                    {bench.map((b) => (
                      <option key={b.id} value={b.id}>
                        In: #{b.number} {b.name} ({b.role || 'SUB'})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* Roster List: Bench */
        <div className="mt-2 space-y-1 max-h-64 overflow-y-auto pr-0.5">
          {bench.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-500">
              No bench players. Click "+ Add Sub" below.
            </div>
          ) : (
            bench.map((b) => {
              const isSelected = selectedId === b.id
              return (
                <div
                  key={b.id}
                  className={`group flex items-center justify-between rounded-lg px-2 py-1 text-left transition ${
                    isSelected
                      ? 'bg-emerald-500/25 ring-1 ring-emerald-500/50'
                      : 'hover:bg-slate-800/80'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(b.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{
                        backgroundColor: kit.primary,
                        color: kit.numberColor,
                        border: `1.5px solid ${kit.secondary}`,
                      }}
                    >
                      {b.number}
                    </span>
                    <span className="truncate text-xs text-slate-200">{b.name || '—'}</span>
                    {b.role && (
                      <span className="rounded bg-slate-800 px-1 py-0.2 text-[9px] font-semibold text-slate-400">
                        {b.role}
                      </span>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Quick sub in button */}
                    <select
                      title="Sub this player into the pitch"
                      aria-label={`Substitute in #${b.number} ${b.name}`}
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          onSubstitute(e.target.value, b.id)
                          e.target.value = ''
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 transition rounded border border-slate-700 bg-slate-900 px-1 py-0.5 text-[10px] text-amber-400 outline-none cursor-pointer"
                    >
                      <option value="" disabled>
                        ⇄ Sub In
                      </option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          Out: #{p.number} {p.name} ({p.role || 'XI'})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => onRemoveSub(b.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-red-400 transition"
                      title="Remove substitute"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              )
            })
          )}

          <button
            type="button"
            onClick={onAddSub}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-700 py-1.5 text-xs text-slate-400 hover:border-slate-500 hover:text-white transition"
          >
            <Plus size={13} /> Add Substitute
          </button>
        </div>
      )}
    </section>
  )
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-slate-400">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-500 uppercase">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-5 w-7 cursor-pointer rounded border border-slate-600 bg-transparent"
        />
      </div>
    </div>
  )
}
