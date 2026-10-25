import { useState, useId } from 'react'
import { X, Plus, Trash2, Shield, Check, Users } from 'lucide-react'
import type { FormationId, PresetPlayer, TeamId, TeamKit, TeamPreset } from '../types'
import { FORMATION_LIST, getFormationSlots } from '../formations'
import { uid } from '../utils'

interface CreateTeamModalProps {
  isOpen: boolean
  teamSide?: TeamId
  initialTeam?: Partial<TeamPreset> | null
  onClose: () => void
  onSaveTeam: (team: TeamPreset, applyToSide?: TeamId) => void
}

const COLOR_PRESETS: { name: string; kit: TeamKit }[] = [
  { name: 'Royal Blue', kit: { primary: '#1d4ed8', secondary: '#ffffff', numberColor: '#ffffff' } },
  { name: 'Scarlet Red', kit: { primary: '#dc2626', secondary: '#ffffff', numberColor: '#ffffff' } },
  { name: 'Sky Blue', kit: { primary: '#38bdf8', secondary: '#0f172a', numberColor: '#0f172a' } },
  { name: 'Gold & Black', kit: { primary: '#facc15', secondary: '#000000', numberColor: '#000000' } },
  { name: 'Emerald', kit: { primary: '#15803d', secondary: '#ffffff', numberColor: '#ffffff' } },
  { name: 'Purple / Violet', kit: { primary: '#7e22ce', secondary: '#ffffff', numberColor: '#ffffff' } },
  { name: 'Classic White', kit: { primary: '#f8fafc', secondary: '#0b163f', numberColor: '#0b163f' } },
  { name: 'Midnight Black', kit: { primary: '#18181b', secondary: '#e2b34a', numberColor: '#ffffff' } },
  { name: 'Orange', kit: { primary: '#ea580c', secondary: '#ffffff', numberColor: '#ffffff' } },
  { name: 'Blaugrana', kit: { primary: '#004d98', secondary: '#a50044', numberColor: '#edbb00' } },
]

export function CreateTeamModal({
  isOpen,
  teamSide,
  initialTeam,
  onClose,
  onSaveTeam,
}: CreateTeamModalProps) {
  const formId = useId()
  const isEditing = Boolean(initialTeam?.id && initialTeam.isCustom)

  const [name, setName] = useState(initialTeam?.name || '')
  const [shortName, setShortName] = useState(initialTeam?.shortName || '')
  const [country, setCountry] = useState(initialTeam?.country || 'Custom')
  const [formation, setFormation] = useState<FormationId>(initialTeam?.formation || '4-3-3')
  const [kit, setKit] = useState<TeamKit>(
    initialTeam?.kit || {
      primary: '#1d4ed8',
      secondary: '#ffffff',
      numberColor: '#ffffff',
    },
  )
  const [activeTab, setActiveTab] = useState<'xi' | 'bench'>('xi')

  // Initialize Starting XI with roles matching selected formation
  const [starters, setStarters] = useState<PresetPlayer[]>(() => {
    if (initialTeam?.startingXI && initialTeam.startingXI.length === 11) {
      return initialTeam.startingXI.map((p) => ({ ...p }))
    }
    const slots = getFormationSlots(initialTeam?.formation || '4-3-3')
    return slots.map((s, i) => ({
      number: s.number || i + 1,
      name: s.role,
      role: s.role,
    }))
  })

  // Initialize Bench
  const [bench, setBench] = useState<PresetPlayer[]>(() => {
    if (initialTeam?.bench && initialTeam.bench.length > 0) {
      return initialTeam.bench.map((p) => ({ ...p }))
    }
    return [
      { number: 12, name: 'Sub GK', role: 'GK' },
      { number: 13, name: 'Sub Defender', role: 'CB' },
      { number: 14, name: 'Sub Midfielder', role: 'CM' },
      { number: 15, name: 'Sub Winger', role: 'RW' },
      { number: 16, name: 'Sub Striker', role: 'ST' },
    ]
  })

  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleFormationChange = (newFormation: FormationId) => {
    setFormation(newFormation)
    const newSlots = getFormationSlots(newFormation)
    setStarters((prev) =>
      newSlots.map((slot, i) => {
        const existing = prev[i]
        return {
          number: existing ? existing.number : slot.number,
          name: existing && existing.name !== existing.role ? existing.name : slot.role,
          role: slot.role,
        }
      }),
    )
  }

  const handleAutoNumberStarters = () => {
    setStarters((prev) => prev.map((p, i) => ({ ...p, number: i + 1 })))
  }

  const handleFillRolesAsNames = () => {
    setStarters((prev) => prev.map((p) => ({ ...p, name: p.role })))
  }

  const handleUpdateStarter = (index: number, patch: Partial<PresetPlayer>) => {
    setStarters((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    )
  }

  const handleUpdateBench = (index: number, patch: Partial<PresetPlayer>) => {
    setBench((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    )
  }

  const handleAddBenchPlayer = () => {
    const maxNum = Math.max(
      ...starters.map((s) => s.number),
      ...bench.map((b) => b.number),
      11,
    )
    setBench((prev) => [
      ...prev,
      {
        number: maxNum + 1,
        name: `Substitute ${prev.length + 1}`,
        role: 'SUB',
      },
    ])
  }

  const handleRemoveBenchPlayer = (index: number) => {
    setBench((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = (applySide?: TeamId) => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Please provide a team name')
      return
    }

    const finalShortName =
      shortName.trim().toUpperCase() ||
      trimmedName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 3)
        .toUpperCase() ||
      'MYC'

    const teamToSave: TeamPreset = {
      id: initialTeam?.id || uid('custom-team'),
      name: trimmedName,
      shortName: finalShortName,
      category: 'Custom',
      country: country.trim() || 'Custom',
      formation,
      kit,
      startingXI: starters,
      bench,
      isCustom: true,
    }

    onSaveTeam(teamToSave, applySide)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative flex h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing
                  ? `Edit Team: ${initialTeam?.name}`
                  : `Create Your Own Team${teamSide ? ` (${teamSide === 'home' ? 'Home' : 'Away'})` : ''}`}
              </h2>
              <p className="text-xs text-slate-400">
                Customise team name, colors, tactical formation, starting XI & bench
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-red-950/60 border border-red-500/50 p-2.5 text-xs text-red-200">
              {error}
            </div>
          )}

          {/* Section 1: Team identity & live preview */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
            <div className="md:col-span-2 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label htmlFor={`${formId}-name`} className="block text-xs font-semibold text-slate-300 mb-1">
                    Team Name *
                  </label>
                  <input
                    id={`${formId}-name`}
                    type="text"
                    required
                    placeholder="e.g. Richmond FC, Ajax, Sunday United"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setError(null)
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor={`${formId}-shortName`} className="block text-xs font-semibold text-slate-300 mb-1">
                    Code / Abbr.
                  </label>
                  <input
                    id={`${formId}-shortName`}
                    type="text"
                    maxLength={4}
                    placeholder="RIC"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm font-bold text-center text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor={`${formId}-country`} className="block text-xs font-semibold text-slate-300 mb-1">
                    Country / League
                  </label>
                  <input
                    id={`${formId}-country`}
                    type="text"
                    placeholder="e.g. England, Amateur, High School"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor={`${formId}-formation`} className="block text-xs font-semibold text-slate-300 mb-1">
                    Default Formation
                  </label>
                  <select
                    id={`${formId}-formation`}
                    value={formation}
                    onChange={(e) => handleFormationChange(e.target.value as FormationId)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-medium text-white outline-none focus:border-emerald-500"
                  >
                    {FORMATION_LIST.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Live Token Preview */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Pitch Token Preview
              </span>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold shadow-xl transition-all"
                style={{
                  backgroundColor: kit.primary,
                  color: kit.numberColor,
                  border: `3px solid ${kit.secondary}`,
                }}
              >
                10
              </div>
              <span className="mt-1.5 text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                {name || 'Team Name'}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">
                {shortName || 'CODE'} • {formation}
              </span>
            </div>
          </section>

          {/* Section 2: Kit Colors & Presets */}
          <section className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
              Kit Color Scheme
            </h3>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="block text-[11px] text-slate-400 mb-1">Primary Color</span>
                <div className="flex items-center gap-2">
                  <input
                    aria-label="Primary Color"
                    type="color"
                    value={kit.primary}
                    onChange={(e) => setKit({ ...kit, primary: e.target.value })}
                    className="h-7 w-8 cursor-pointer rounded border border-slate-700 bg-transparent"
                  />
                  <input
                    aria-label="Primary Color Hex"
                    type="text"
                    value={kit.primary}
                    onChange={(e) => setKit({ ...kit, primary: e.target.value })}
                    className="w-full text-xs font-mono uppercase bg-transparent text-white outline-none"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="block text-[11px] text-slate-400 mb-1">Trim / Border</span>
                <div className="flex items-center gap-2">
                  <input
                    aria-label="Trim / Border Color"
                    type="color"
                    value={kit.secondary}
                    onChange={(e) => setKit({ ...kit, secondary: e.target.value })}
                    className="h-7 w-8 cursor-pointer rounded border border-slate-700 bg-transparent"
                  />
                  <input
                    aria-label="Trim / Border Color Hex"
                    type="text"
                    value={kit.secondary}
                    onChange={(e) => setKit({ ...kit, secondary: e.target.value })}
                    className="w-full text-xs font-mono uppercase bg-transparent text-white outline-none"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
                <span className="block text-[11px] text-slate-400 mb-1">Number Color</span>
                <div className="flex items-center gap-2">
                  <input
                    aria-label="Number Color"
                    type="color"
                    value={kit.numberColor}
                    onChange={(e) => setKit({ ...kit, numberColor: e.target.value })}
                    className="h-7 w-8 cursor-pointer rounded border border-slate-700 bg-transparent"
                  />
                  <input
                    aria-label="Number Color Hex"
                    type="text"
                    value={kit.numberColor}
                    onChange={(e) => setKit({ ...kit, numberColor: e.target.value })}
                    className="w-full text-xs font-mono uppercase bg-transparent text-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-3">
              <span className="text-[10px] text-slate-400 font-medium block mb-1.5">
                Quick Color Themes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_PRESETS.map((cp) => (
                  <button
                    key={cp.name}
                    type="button"
                    onClick={() => setKit(cp.kit)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 hover:border-slate-500 hover:text-white transition"
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-white/20"
                      style={{ backgroundColor: cp.kit.primary }}
                    />
                    <span>{cp.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3: Starting XI & Bench Players */}
          <section className="rounded-xl border border-slate-800 bg-slate-800/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1 rounded-lg bg-slate-900 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('xi')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                    activeTab === 'xi'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users size={13} /> Starting XI (11)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('bench')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                    activeTab === 'bench'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Bench ({bench.length})</span>
                </button>
              </div>

              {activeTab === 'xi' ? (
                <div className="flex gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={handleAutoNumberStarters}
                    className="rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700"
                    title="Number 1 to 11"
                  >
                    # 1–11
                  </button>
                  <button
                    type="button"
                    onClick={handleFillRolesAsNames}
                    className="rounded bg-slate-800 px-2 py-1 text-slate-300 hover:bg-slate-700"
                    title="Fill player names with roles"
                  >
                    Use Roles
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAddBenchPlayer}
                  className="flex items-center gap-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white transition"
                >
                  <Plus size={13} /> Add Substitute
                </button>
              )}
            </div>

            {/* Starting XI Editor */}
            {activeTab === 'xi' ? (
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {starters.map((starter, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg bg-slate-900/80 p-1.5 border border-slate-800"
                  >
                    <span className="w-10 text-center rounded bg-slate-800 py-1 text-[10px] font-bold text-emerald-400">
                      {starter.role}
                    </span>
                    <input
                      aria-label={`Player ${i + 1} Number`}
                      type="number"
                      min={1}
                      max={99}
                      value={starter.number}
                      onChange={(e) =>
                        handleUpdateStarter(i, {
                          number: Math.max(1, Math.min(99, Number(e.target.value) || 1)),
                        })
                      }
                      className="w-14 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-bold text-center text-white outline-none focus:border-emerald-500"
                    />
                    <input
                      aria-label={`Player ${i + 1} Name`}
                      type="text"
                      maxLength={18}
                      placeholder={`Player ${i + 1}`}
                      value={starter.name}
                      onChange={(e) => handleUpdateStarter(i, { name: e.target.value })}
                      className="flex-1 rounded border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Bench Editor */
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {bench.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No substitutes added. Click "+ Add Substitute" above.
                  </div>
                ) : (
                  bench.map((sub, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg bg-slate-900/80 p-1.5 border border-slate-800"
                    >
                      <input
                        aria-label={`Bench ${i + 1} Role`}
                        type="text"
                        maxLength={5}
                        placeholder="POS"
                        value={sub.role}
                        onChange={(e) =>
                          handleUpdateBench(i, { role: e.target.value.toUpperCase() })
                        }
                        className="w-14 rounded border border-slate-700 bg-slate-950 px-1 py-1 text-[10px] font-bold text-center text-amber-400 uppercase outline-none focus:border-emerald-500"
                      />
                      <input
                        aria-label={`Bench ${i + 1} Number`}
                        type="number"
                        min={1}
                        max={99}
                        value={sub.number}
                        onChange={(e) =>
                          handleUpdateBench(i, {
                            number: Math.max(1, Math.min(99, Number(e.target.value) || 1)),
                          })
                        }
                        className="w-14 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-bold text-center text-white outline-none focus:border-emerald-500"
                      />
                      <input
                        aria-label={`Bench ${i + 1} Name`}
                        type="text"
                        maxLength={18}
                        placeholder="Player Name"
                        value={sub.name}
                        onChange={(e) => handleUpdateBench(i, { name: e.target.value })}
                        className="flex-1 rounded border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-white outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBenchPlayer(i)}
                        className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-red-400 transition"
                        title="Remove substitute"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        </div>

        {/* Modal Footer with Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-slate-950/80 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave()}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-200 transition"
            >
              Save Team Preset
            </button>
            <button
              type="button"
              onClick={() => handleSave('home')}
              className="flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-xs font-semibold text-white shadow transition"
            >
              <Check size={13} /> Save & Apply as Home
            </button>
            <button
              type="button"
              onClick={() => handleSave('away')}
              className="flex items-center gap-1 rounded-lg bg-red-600 hover:bg-red-500 px-3.5 py-2 text-xs font-semibold text-white shadow transition"
            >
              <Check size={13} /> Save & Apply as Away
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
