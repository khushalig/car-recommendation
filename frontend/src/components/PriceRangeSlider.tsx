interface Props {
  min: number
  max: number
  low: number
  high: number
  step: number
  onChange: (low: number, high: number) => void
}

function toL(v: number) {
  return `₹${(v / 100000).toFixed(1)}L`
}

export default function PriceRangeSlider({ min, max, low, high, step, onChange }: Props) {
  const lowPct  = ((low  - min) / (max - min)) * 100
  const highPct = ((high - min) / (max - min)) * 100

  const handleLow = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), high - step)
    onChange(v, high)
  }

  const handleHigh = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), low + step)
    onChange(low, v)
  }

  return (
    <div>
      {/* Current values */}
      <div className="flex justify-between mb-3">
        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {toL(low)}
        </span>
        <span className="text-sm text-gray-400">to</span>
        <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {toL(high)}
        </span>
      </div>

      {/* Slider track */}
      <div className="relative h-6 flex items-center range-wrap">
        {/* Background track */}
        <div className="absolute w-full h-1.5 rounded-full bg-gray-200">
          {/* Active fill */}
          <div
            className="absolute h-full bg-blue-500 rounded-full"
            style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }}
          />
        </div>

        {/* Low input — higher z-index when pushed to the right edge so it stays grabbable */}
        <input
          type="range"
          min={min} max={max} step={step}
          value={low}
          onChange={handleLow}
          style={{ zIndex: low >= high - step ? 5 : 3 }}
        />
        {/* High input */}
        <input
          type="range"
          min={min} max={max} step={step}
          value={high}
          onChange={handleHigh}
          style={{ zIndex: 4 }}
        />
      </div>

      {/* Min / max labels */}
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        <span>{toL(min)}</span>
        <span>{toL(max)}</span>
      </div>
    </div>
  )
}
