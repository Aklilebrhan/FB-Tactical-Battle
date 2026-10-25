import { useState, useMemo } from 'react'
import { X, Search, Shield, Users } from 'lucide-react'
import { TEAMS, TEAM_CATEGORIES } from '../data/teams'
import type { TeamCategory, TeamPreset, TeamId } from '../types'

interface TeamPickerModalProps {
  isOpen: boolean
  teamSide: TeamId
  currentTeamId?: string
  onClose: () => void
  onSelectTeam: (team: TeamPreset) => void
}

const CATEGORY_ICONS: Record<TeamCategory, string> = {
  'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'La Liga': '🇪🇸',
  'Bundesliga': '🇩🇪',
  'Serie A': '🇮🇹',
  'Ligue 1': '🇫🇷',
  'National Teams': '🌍',
}

export function TeamPickerModal({
  isOpen,
  teamSide,
  currentTeamId,
  onClose,
  onSelectTeam,
}: TeamPickerModalProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TeamCategory | 'All'>('All')

  const filteredTeams = useMemo(() => {
    return TEAMS.filter((t) => {
      const matchesCategory =
        selectedCategory === 'All' || t.category === selectedCategory

      const query = search.trim().toLowerCase()
      if (!query) return matchesCategory

      const matchesName =
        t.name.toLowerCase().includes(query) ||
        t.shortName.toLowerCase().includes(query) ||
        t.country.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)

      const matchesPlayer =
        t.startingXI.some((p) => p.name.toLowerCase().includes(query)) ||
        t.bench.some((p) => p.name.toLowerCase().includes(query))

      return matchesCategory && (matchesName || matchesPlayer)
    })
  }, [search, selectedCategory])

  if (!isOpen) return null

  const sideLabel = teamSide === 'home' ? 'Home Team' : 'Away Team'
  const sideAccent = teamSide === 'home' ? 'text-blue-400' : 'text-red-400'

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${sideAccent}`}>
                Select {sideLabel}
              </span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                {TEAMS.length} Teams Available
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              European Powerhouses & National Teams
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-3 border-b border-slate-800/80 bg-slate-900/60 p-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search team, country, or player (e.g. Man City, Bellingham, France, Haaland)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                selectedCategory === 'All'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Leagues
            </button>
            {TEAM_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{CATEGORY_ICONS[cat]}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Team Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredTeams.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-slate-400">
              <Shield size={36} className="mb-2 opacity-40" />
              <p className="text-sm font-medium">No teams matching "{search}"</p>
              <p className="text-xs text-slate-500">Try searching a different name or league</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTeams.map((team) => {
                const isSelected = team.id === currentTeamId
                const topStars = team.startingXI.slice(8, 11).map((p) => p.name).join(', ')

                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => {
                      onSelectTeam(team)
                      onClose()
                    }}
                    className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/25 ring-2 ring-emerald-500/40 shadow-lg'
                        : 'border-slate-800 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/80'
                    }`}
                  >
                    <div>
                      {/* Top row: badge & kit swatch */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{CATEGORY_ICONS[team.category]}</span>
                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              {team.category}
                            </span>
                            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                              {team.name}
                            </h3>
                          </div>
                        </div>

                        {/* Kit circle */}
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold shadow-md shrink-0"
                          style={{
                            backgroundColor: team.kit.primary,
                            color: team.kit.numberColor,
                            border: `2px solid ${team.kit.secondary}`,
                          }}
                          title="Team Kit Colors"
                        >
                          {team.shortName.slice(0, 3)}
                        </div>
                      </div>

                      {/* Formation & squad info */}
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                        <span className="rounded bg-slate-900 px-2 py-0.5 font-medium text-slate-300 border border-slate-700/60">
                          {team.formation}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Users size={12} className="opacity-70" />
                          11 starters + {team.bench.length} subs
                        </span>
                      </div>

                      {/* Star players */}
                      <p className="mt-2 text-xs text-slate-400 line-clamp-1">
                        <span className="text-slate-500 font-medium">Attack: </span>
                        {topStars}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-700/40 pt-2.5 text-[11px]">
                      <span className="text-slate-400">{team.country}</span>
                      <span className="font-semibold text-emerald-400 group-hover:underline">
                        {isSelected ? 'Currently Loaded ✓' : 'Load Team →'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

