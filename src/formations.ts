import type { FormationId, Player, TeamId } from './types'

/** Positions as % of pitch (x: length 0–100, y: width 0–100). Home attacks left→right. */
type Slot = { x: number; y: number; number: number; role: string }

const FORMATIONS: Record<FormationId, Slot[]> = {
  '4-3-3': [
    { x: 8, y: 50, number: 1, role: 'GK' },
    { x: 22, y: 15, number: 2, role: 'RB' },
    { x: 20, y: 35, number: 4, role: 'CB' },
    { x: 20, y: 65, number: 5, role: 'CB' },
    { x: 22, y: 85, number: 3, role: 'LB' },
    { x: 40, y: 30, number: 8, role: 'CM' },
    { x: 38, y: 50, number: 6, role: 'CDM' },
    { x: 40, y: 70, number: 10, role: 'CM' },
    { x: 58, y: 18, number: 7, role: 'RW' },
    { x: 62, y: 50, number: 9, role: 'ST' },
    { x: 58, y: 82, number: 11, role: 'LW' },
  ],
  '4-4-2': [
    { x: 8, y: 50, number: 1, role: 'GK' },
    { x: 22, y: 15, number: 2, role: 'RB' },
    { x: 20, y: 35, number: 4, role: 'CB' },
    { x: 20, y: 65, number: 5, role: 'CB' },
    { x: 22, y: 85, number: 3, role: 'LB' },
    { x: 42, y: 15, number: 7, role: 'RM' },
    { x: 40, y: 38, number: 8, role: 'CM' },
    { x: 40, y: 62, number: 6, role: 'CM' },
    { x: 42, y: 85, number: 11, role: 'LM' },
    { x: 60, y: 38, number: 9, role: 'ST' },
    { x: 60, y: 62, number: 10, role: 'ST' },
  ],
  '3-5-2': [
    { x: 8, y: 50, number: 1, role: 'GK' },
    { x: 22, y: 28, number: 4, role: 'CB' },
    { x: 20, y: 50, number: 5, role: 'CB' },
    { x: 22, y: 72, number: 3, role: 'CB' },
    { x: 42, y: 12, number: 2, role: 'RWB' },
    { x: 40, y: 35, number: 8, role: 'CM' },
    { x: 38, y: 50, number: 6, role: 'CDM' },
    { x: 40, y: 65, number: 10, role: 'CM' },
    { x: 42, y: 88, number: 7, role: 'LWB' },
    { x: 60, y: 40, number: 9, role: 'ST' },
    { x: 60, y: 60, number: 11, role: 'ST' },
  ],
  '4-2-3-1': [
    { x: 8, y: 50, number: 1, role: 'GK' },
    { x: 22, y: 15, number: 2, role: 'RB' },
    { x: 20, y: 35, number: 4, role: 'CB' },
    { x: 20, y: 65, number: 5, role: 'CB' },
    { x: 22, y: 85, number: 3, role: 'LB' },
    { x: 36, y: 38, number: 6, role: 'CDM' },
    { x: 36, y: 62, number: 8, role: 'CDM' },
    { x: 52, y: 18, number: 7, role: 'RAM' },
    { x: 50, y: 50, number: 10, role: 'CAM' },
    { x: 52, y: 82, number: 11, role: 'LAM' },
    { x: 64, y: 50, number: 9, role: 'ST' },
  ],
  '5-3-2': [
    { x: 8, y: 50, number: 1, role: 'GK' },
    { x: 22, y: 12, number: 2, role: 'RWB' },
    { x: 20, y: 30, number: 4, role: 'CB' },
    { x: 18, y: 50, number: 5, role: 'CB' },
    { x: 20, y: 70, number: 6, role: 'CB' },
    { x: 22, y: 88, number: 3, role: 'LWB' },
    { x: 40, y: 28, number: 8, role: 'CM' },
    { x: 38, y: 50, number: 10, role: 'CM' },
    { x: 40, y: 72, number: 7, role: 'CM' },
    { x: 60, y: 40, number: 9, role: 'ST' },
    { x: 60, y: 60, number: 11, role: 'ST' },
  ],
  '4-1-4-1': [
    { x: 8, y: 50, number: 1, role: 'GK' },
    { x: 22, y: 15, number: 2, role: 'RB' },
    { x: 20, y: 35, number: 4, role: 'CB' },
    { x: 20, y: 65, number: 5, role: 'CB' },
    { x: 22, y: 85, number: 3, role: 'LB' },
    { x: 36, y: 50, number: 6, role: 'CDM' },
    { x: 50, y: 15, number: 7, role: 'RM' },
    { x: 48, y: 38, number: 8, role: 'CM' },
    { x: 48, y: 62, number: 10, role: 'CM' },
    { x: 50, y: 85, number: 11, role: 'LM' },
    { x: 64, y: 50, number: 9, role: 'ST' },
  ],
  '4-5-1': [
    { x: 8, y: 50, number: 1, role: 'GK' },
    { x: 22, y: 15, number: 2, role: 'RB' },
    { x: 20, y: 35, number: 4, role: 'CB' },
    { x: 20, y: 65, number: 5, role: 'CB' },
    { x: 22, y: 85, number: 3, role: 'LB' },
    { x: 42, y: 12, number: 7, role: 'RM' },
    { x: 40, y: 32, number: 8, role: 'CM' },
    { x: 38, y: 50, number: 6, role: 'CDM' },
    { x: 40, y: 68, number: 10, role: 'CM' },
    { x: 42, y: 88, number: 11, role: 'LM' },
    { x: 62, y: 50, number: 9, role: 'ST' },
  ],
}

export const FORMATION_LIST: FormationId[] = [
  '4-3-3',
  '4-4-2',
  '3-5-2',
  '4-2-3-1',
  '5-3-2',
  '4-1-4-1',
  '4-5-1',
]

export function getFormationSlots(formation: FormationId): Slot[] {
  return FORMATIONS[formation]
}

function mirrorX(x: number): number {
  return 100 - x
}

export function createFormationPlayers(
  formation: FormationId,
  team: TeamId,
): Player[] {
  const slots = FORMATIONS[formation]
  return slots.map((slot, i) => {
    const x = team === 'home' ? slot.x : mirrorX(slot.x)
    return {
      id: `${team}-${i}`,
      team,
      number: slot.number,
      name: slot.role,
      role: slot.role,
      x,
      y: slot.y,
    }
  })
}

export function createDefaultPlayers(): Player[] {
  return [
    ...createFormationPlayers('4-3-3', 'home'),
    ...createFormationPlayers('4-4-2', 'away'),
  ]
}
