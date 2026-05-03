import { useState } from 'react'
import type { UserPreferences, FuelType, BodyType, UsageType, PriorityType } from '../types'
import PriceRangeSlider from './PriceRangeSlider'
import MultiSelect from './MultiSelect'

const MIN_PRICE = 500000
const MAX_PRICE = 2500000
const PRICE_STEP = 50000

const FUEL_OPTIONS = [
  { value: 'petrol',   label: 'Petrol'   },
  { value: 'diesel',   label: 'Diesel'   },
  { value: 'cng',      label: 'CNG'      },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid',   label: 'Hybrid'   },
]

const BODY_OPTIONS = [
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'sedan',     label: 'Sedan'     },
  { value: 'suv',       label: 'SUV'       },
  { value: 'mpv',       label: 'MPV'       },
]

const PRIORITY_OPTIONS = [
  { value: 'mileage',     label: 'Mileage'     },
  { value: 'safety',      label: 'Safety'      },
  { value: 'performance', label: 'Performance' },
  { value: 'comfort',     label: 'Comfort'     },
  { value: 'features',    label: 'Features'    },
]

const USAGE_OPTIONS: { value: UsageType; label: string; desc: string }[] = [
  { value: 'city',     label: 'City',     desc: 'Stop-and-go urban traffic'   },
  { value: 'highway',  label: 'Highway',  desc: 'Long-distance expressway'    },
  { value: 'mixed',    label: 'Mixed',    desc: 'Both city and highway'        },
  { value: 'offroad',  label: 'Off-Road', desc: 'Rough terrain & adventures'  },
]

const SEATING_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 2, label: '2+'  },
  { value: 4, label: '4+'  },
  { value: 5, label: '5+'  },
  { value: 6, label: '6+'  },
  { value: 7, label: '7+'  },
]

// Separate form state type so usage can be unset before the user picks one
type FormValues = Omit<UserPreferences, 'usage'> & { usage: UsageType | '' }

const DEFAULT_PREFS: FormValues = {
  budget:           { min: MIN_PRICE, max: MAX_PRICE },
  fuel_types:       [],
  body_types:       [],
  usage:            '',
  priorities:       [],
  seating_capacity: 0,
}

interface Props {
  onSubmit: (prefs: UserPreferences) => void
  isLoading: boolean
}

export default function PreferencesForm({ onSubmit, isLoading }: Props) {
  const [prefs, setPrefs] = useState<FormValues>(DEFAULT_PREFS)

  const isValid = prefs.usage !== ''

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    onSubmit(prefs as UserPreferences)
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-8">

      {/* Budget */}
      <div>
        <label className="label text-base">Budget</label>
        <p className="text-xs text-gray-400 mb-3">Drag both handles to set your price range</p>
        <PriceRangeSlider
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={PRICE_STEP}
          low={prefs.budget.min}
          high={prefs.budget.max}
          onChange={(low, high) =>
            setPrefs(p => ({ ...p, budget: { min: low, max: high } }))
          }
        />
      </div>

      <hr className="border-gray-100" />

      {/* Fuel Type + Body Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="label">Fuel Type</label>
          <p className="text-xs text-gray-400 mb-2">Select one or more (optional)</p>
          <MultiSelect
            options={FUEL_OPTIONS}
            selected={prefs.fuel_types}
            onChange={v => setPrefs(p => ({ ...p, fuel_types: v as FuelType[] }))}
            placeholder="Any fuel type"
          />
        </div>

        <div>
          <label className="label">Body Type</label>
          <p className="text-xs text-gray-400 mb-2">Select one or more (optional)</p>
          <MultiSelect
            options={BODY_OPTIONS}
            selected={prefs.body_types}
            onChange={v => setPrefs(p => ({ ...p, body_types: v as BodyType[] }))}
            placeholder="Any body type"
          />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Usage — required */}
      <div>
        <label className="label text-base">
          Primary Usage <span className="text-red-500 ml-0.5">*</span>
        </label>
        <p className="text-xs text-gray-400 mb-3">Where will you drive most?</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {USAGE_OPTIONS.map(opt => {
            const checked = prefs.usage === opt.value
            return (
              <label
                key={opt.value}
                className={`flex flex-col gap-1 p-3 rounded-lg border-2 cursor-pointer transition-colors
                  ${checked
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
              >
                <input
                  type="radio"
                  name="usage"
                  value={opt.value}
                  checked={checked}
                  onChange={() => setPrefs(p => ({ ...p, usage: opt.value }))}
                  className="sr-only"
                />
                <span className={`text-sm font-semibold ${checked ? 'text-blue-700' : 'text-gray-700'}`}>
                  {opt.label}
                </span>
                <span className="text-xs text-gray-400 leading-tight">{opt.desc}</span>
              </label>
            )
          })}
        </div>
        {prefs.usage === '' && (
          <p className="mt-2 text-xs text-red-500">Please select a usage type to continue</p>
        )}
      </div>

      <hr className="border-gray-100" />

      {/* Priority + Seating */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="label">Priority</label>
          <p className="text-xs text-gray-400 mb-2">First selection has highest weight</p>
          <MultiSelect
            options={PRIORITY_OPTIONS}
            selected={prefs.priorities}
            onChange={v => setPrefs(p => ({ ...p, priorities: v as PriorityType[] }))}
            placeholder="Balanced (no priority)"
          />
        </div>

        <div>
          <label className="label">Minimum Seating</label>
          <p className="text-xs text-gray-400 mb-2">How many seats do you need?</p>
          <select
            value={prefs.seating_capacity}
            onChange={e => setPrefs(p => ({ ...p, seating_capacity: Number(e.target.value) }))}
            className="input"
          >
            {SEATING_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Submit */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {isValid
            ? 'Ready — click to find your car'
            : 'Select a usage type to enable search'}
        </p>
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="btn-primary flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
              Finding cars…
            </>
          ) : (
            'Find My Car →'
          )}
        </button>
      </div>

    </form>
  )
}

