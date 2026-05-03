import type { Car, Recommendation } from '../types'

interface Props {
  result: Recommendation
  onReset: () => void
}

// ── helpers ──────────────────────────────────────────────────────────────────

function formatPrice(v: number) {
  return `₹${(v / 100000).toFixed(2)}L`
}

function formatMileage(car: Car) {
  if (car.mileage_kmpl !== null) return `${car.mileage_kmpl} km/l`
  if (car.range_km)              return `${car.range_km} km range`
  return '—'
}

const FUEL_BADGE: Record<string, string> = {
  petrol:   'bg-amber-100  text-amber-700',
  diesel:   'bg-blue-100   text-blue-700',
  cng:      'bg-green-100  text-green-700',
  electric: 'bg-purple-100 text-purple-700',
  hybrid:   'bg-teal-100   text-teal-700',
}

const BODY_BADGE: Record<string, string> = {
  hatchback: 'bg-gray-100   text-gray-700',
  sedan:     'bg-sky-100    text-sky-700',
  suv:       'bg-orange-100 text-orange-700',
  mpv:       'bg-lime-100   text-lime-700',
}

function Badge({ text, cls }: { text: string; cls: string }) {
  return (
    <span className={`badge capitalize ${cls}`}>{text}</span>
  )
}

function SafetyStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= rating ? 'text-amber-400' : 'text-gray-200'}`}
          viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-gray-500">{rating}/5</span>
    </div>
  )
}

// ── rank badge ────────────────────────────────────────────────────────────────

const RANK_STYLE = [
  'bg-yellow-400 text-yellow-900',
  'bg-gray-300   text-gray-700',
  'bg-orange-300 text-orange-800',
]
const RANK_LABEL = ['#1 Pick', '#2 Pick', '#3 Pick']

// ── table rows config ─────────────────────────────────────────────────────────

type RowRenderer = (car: Car, explanation: string) => React.ReactNode

const ROWS: { label: string; render: RowRenderer }[] = [
  {
    label: 'Make & Model',
    render: car => (
      <div>
        <p className="font-semibold text-gray-900">{car.make} {car.model}</p>
        <p className="text-xs text-gray-400 mt-0.5">{car.variant}</p>
      </div>
    ),
  },
  {
    label: 'Price',
    render: car => (
      <span className="font-semibold text-gray-900">{formatPrice(car.price_inr)}</span>
    ),
  },
  {
    label: 'Mileage',
    render: car => <span className="text-gray-700">{formatMileage(car)}</span>,
  },
  {
    label: 'Safety Rating',
    render: car => <SafetyStars rating={car.safety_rating} />,
  },
  {
    label: 'Fuel Type',
    render: car => <Badge text={car.fuel_type} cls={FUEL_BADGE[car.fuel_type] ?? 'bg-gray-100 text-gray-600'} />,
  },
  {
    label: 'Body Type',
    render: car => <Badge text={car.body_type} cls={BODY_BADGE[car.body_type] ?? 'bg-gray-100 text-gray-600'} />,
  },
  {
    label: 'Seating',
    render: car => <span className="text-gray-700">{car.specs.seating_capacity} seats</span>,
  },
  {
    label: 'Why this car?',
    render: (_car, explanation) => (
      <p className="text-sm text-blue-700 italic leading-relaxed">{explanation}</p>
    ),
  },
]

// ── main component ────────────────────────────────────────────────────────────

export default function ResultsSection({ result, onReset }: Props) {
  const { cars, explanations, summary } = result

  return (
    <div className="space-y-6">

      {/* Summary banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mt-0.5">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-900 mb-1">AI Summary</p>
          <p className="text-sm text-blue-800 leading-relaxed">{summary}</p>
        </div>
      </div>

      {/* Comparison table */}
      {cars.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  {/* empty corner cell */}
                  <th className="py-4 px-5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-32 bg-gray-50 sticky left-0 z-10" />

                  {cars.map((car, i) => (
                    <th key={car.id} className="py-4 px-5 text-left font-medium min-w-[200px]">
                      <span className={`badge text-xs font-semibold px-2.5 py-1 ${RANK_STYLE[i] ?? 'bg-gray-100 text-gray-600'}`}>
                        {RANK_LABEL[i] ?? `#${i + 1}`}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {ROWS.map((row, ri) => (
                  <tr
                    key={row.label}
                    className={`border-b border-gray-50 ${
                      row.label === 'Why this car?'
                        ? 'bg-blue-50/40'
                        : ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    {/* Row label — sticky on mobile scroll */}
                    <td className={`py-4 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider align-top sticky left-0 z-10 ${
                      ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}>
                      {row.label}
                    </td>

                    {cars.map((car, ci) => (
                      <td key={car.id} className="py-4 px-5 align-top">
                        {row.render(car, explanations[ci] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Search again */}
      <div className="flex justify-end">
        <button type="button" onClick={onReset} className="btn-secondary text-sm">
          ← Search Again
        </button>
      </div>

    </div>
  )
}
