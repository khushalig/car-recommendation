import PreferencesForm from '../components/PreferencesForm'
import ResultsSection from '../components/ResultsSection'
import { useRecommend } from '../hooks/useRecommend'
import type { UserPreferences } from '../types'

export default function Home() {
  const { recommend, loading, data, error } = useRecommend()

  function handleSubmit(prefs: UserPreferences) {
    recommend(prefs)
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Page header — hidden once results are shown */}
      {!data && (
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Car</h1>
          <p className="text-gray-500">
            Tell us your preferences and we'll recommend the best cars in India for you.
          </p>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Form — shown only when no results yet */}
      {!data && (
        <PreferencesForm onSubmit={handleSubmit} isLoading={loading} />
      )}

      {/* Results */}
      {data && (
        <ResultsSection result={data} onReset={() => window.location.reload()} />
      )}

    </div>
  )
}
