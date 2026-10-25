import { useCallback, useState } from 'react'

export function useHistory<T>(initial: T) {
  const [present, setPresent] = useState<T>(initial)
  const [past, setPast] = useState<T[]>([])
  const [future, setFuture] = useState<T[]>([])

  const setState = useCallback((next: T | ((prev: T) => T)) => {
    setPresent((prev) => {
      const value = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
      setPast((p) => [...p, prev])
      setFuture([])
      return value
    })
  }, [])

  const replace = useCallback((next: T | ((prev: T) => T)) => {
    setPresent((prev) =>
      typeof next === 'function' ? (next as (p: T) => T)(prev) : next,
    )
  }, [])

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p
      const previous = p[p.length - 1]
      setPresent((curr) => {
        setFuture((f) => [curr, ...f])
        return previous
      })
      return p.slice(0, -1)
    })
  }, [])

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f
      const next = f[0]
      setPresent((curr) => {
        setPast((p) => [...p, curr])
        return next
      })
      return f.slice(1)
    })
  }, [])

  const reset = useCallback((value: T) => {
    setPresent(value)
    setPast([])
    setFuture([])
  }, [])

  return {
    state: present,
    setState,
    replace,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  }
}
