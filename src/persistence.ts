const STORAGE_KEY = 'tactical-board-v2'
const FRAMES_KEY = 'tactical-board-frames-v1'
const CUSTOM_TEAMS_KEY = 'tactical-board-custom-teams-v1'

import type { TeamPreset } from './types'

export interface PersistedSnapshot {
  players: unknown
  ball: unknown
  drawings: unknown
  homeKit: unknown
  awayKit: unknown
  homeFormation: unknown
  awayFormation: unknown
  pitchMode: unknown
  pitchTheme: unknown
  showNames: unknown
  showHome: unknown
  showAway: unknown
  snapToGrid: unknown
  homeBench?: unknown
  awayBench?: unknown
  homeTeamName?: unknown
  awayTeamName?: unknown
  homeTeamId?: unknown
  awayTeamId?: unknown
  customTeams?: unknown
}

export function loadPersisted(): PersistedSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedSnapshot
  } catch {
    return null
  }
}

export function savePersisted(data: PersistedSnapshot): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // quota / private mode — ignore
  }
}

export function clearPersisted(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function loadFrames<T>(): T[] {
  try {
    const raw = localStorage.getItem(FRAMES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

export function saveFrames<T>(frames: T[]): void {
  try {
    localStorage.setItem(FRAMES_KEY, JSON.stringify(frames))
  } catch {
    // ignore
  }
}

export function loadCustomTeams(): TeamPreset[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEAMS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as TeamPreset[]) : []
  } catch {
    return []
  }
}

export function saveCustomTeams(teams: TeamPreset[]): void {
  try {
    localStorage.setItem(CUSTOM_TEAMS_KEY, JSON.stringify(teams))
  } catch {
    // ignore
  }
}
