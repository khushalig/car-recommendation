import { useState } from 'react'
import { getRecommendations } from '../api/recommend'
import type { UserPreferences, Recommendation } from '../types'

interface State {
  data: Recommendation | null
  loading: boolean
  error: string | null
}

export function useRecommend() {
  const [state, setState] = useState<State>({ data: null, loading: false, error: null })

  async function recommend(prefs: UserPreferences) {
    setState({ data: null, loading: true, error: null })
    try {
      const data = await getRecommendations(prefs)
      setState({ data, loading: false, error: null })
    } catch (err) {
      setState({ data: null, loading: false, error: (err as Error).message })
    }
  }

  return { ...state, recommend }
}
