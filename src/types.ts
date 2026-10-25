export type TeamId = 'home' | 'away'

export type PitchMode = 'full' | 'half'

export type PitchTheme = 'classic' | 'night' | 'blue' | 'clay'

export type Tool =
  | 'select'
  | 'freehand'
  | 'arrow'
  | 'dashed'
  | 'rect'
  | 'circle'
  | 'text'
  | 'eraser'

export interface Player {
  id: string
  team: TeamId
  number: number
  name: string
  x: number
  y: number
  role?: string
}

export interface BenchPlayer {
  id: string
  team: TeamId
  number: number
  name: string
  role?: string
}

export interface Ball {
  x: number
  y: number
}

export interface TeamKit {
  primary: string
  secondary: string
  numberColor: string
}

export type TeamCategory =
  | 'Custom'
  | 'Premier League'
  | 'La Liga'
  | 'Bundesliga'
  | 'Serie A'
  | 'Ligue 1'
  | 'National Teams'

export interface PresetPlayer {
  number: number
  name: string
  role: string
}

export interface TeamPreset {
  id: string
  name: string
  shortName: string
  category: TeamCategory | string
  country: string
  formation: FormationId
  kit: TeamKit
  startingXI: PresetPlayer[]
  bench: PresetPlayer[]
  isCustom?: boolean
}

export interface DrawingStyle {
  color: string
  strokeWidth: number
  fill: boolean
}

export type DrawingShape =
  | {
      id: string
      type: 'freehand' | 'dashed'
      points: number[]
      color: string
      strokeWidth: number
    }
  | {
      id: string
      type: 'arrow'
      points: [number, number, number, number]
      color: string
      strokeWidth: number
    }
  | {
      id: string
      type: 'rect'
      x: number
      y: number
      width: number
      height: number
      color: string
      strokeWidth: number
      filled?: boolean
    }
  | {
      id: string
      type: 'circle'
      x: number
      y: number
      radius: number
      color: string
      strokeWidth: number
      filled?: boolean
    }
  | {
      id: string
      type: 'text'
      x: number
      y: number
      text: string
      color: string
      fontSize: number
    }

export interface BoardState {
  players: Player[]
  ball: Ball
  drawings: DrawingShape[]
  homeBench: BenchPlayer[]
  awayBench: BenchPlayer[]
}

export interface BoardFrame {
  id: string
  name: string
  createdAt: number
  board: BoardState
}

export type FormationId =
  | '4-3-3'
  | '4-4-2'
  | '3-5-2'
  | '4-2-3-1'
  | '5-3-2'
  | '4-1-4-1'
  | '4-5-1'

export interface PitchThemeColors {
  id: PitchTheme
  label: string
  base: string
  stripeA: string
  stripeB: string
  line: string
}

export const PITCH_THEMES: PitchThemeColors[] = [
  {
    id: 'classic',
    label: 'Classic',
    base: '#1a7a3a',
    stripeA: 'rgba(255,255,255,0.04)',
    stripeB: 'rgba(0,0,0,0.06)',
    line: 'rgba(255,255,255,0.92)',
  },
  {
    id: 'night',
    label: 'Night',
    base: '#0d3d24',
    stripeA: 'rgba(255,255,255,0.03)',
    stripeB: 'rgba(0,0,0,0.12)',
    line: 'rgba(230,255,240,0.85)',
  },
  {
    id: 'blue',
    label: 'Training',
    base: '#1a5a7a',
    stripeA: 'rgba(255,255,255,0.05)',
    stripeB: 'rgba(0,0,0,0.08)',
    line: 'rgba(255,255,255,0.9)',
  },
  {
    id: 'clay',
    label: 'Clay',
    base: '#9a6b2f',
    stripeA: 'rgba(255,255,255,0.06)',
    stripeB: 'rgba(0,0,0,0.08)',
    line: 'rgba(255,255,255,0.88)',
  },
]
