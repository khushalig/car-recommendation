export interface CarSpecs {
  engine_cc?: number
  power_bhp: number
  torque_nm: number
  seating_capacity: number
  boot_space_litres: number
  length_mm: number
  width_mm: number
  height_mm: number
  ground_clearance_mm: number
  battery_kwh?: number
  fast_charging_min?: number
}

export interface Car {
  id: number
  make: string
  model: string
  variant: string
  price_inr: number
  body_type: 'hatchback' | 'sedan' | 'suv' | 'mpv'
  fuel_type: 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid'
  transmission: 'manual' | 'automatic'
  mileage_kmpl: number | null
  range_km?: number
  safety_rating: number
  specs: CarSpecs
  user_reviews: string[]
}

export interface Budget {
  min: number
  max: number
}

export type FuelType = 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid'
export type BodyType = 'hatchback' | 'sedan' | 'suv' | 'mpv'
export type UsageType = 'city' | 'highway' | 'mixed' | 'offroad'
export type PriorityType = 'mileage' | 'safety' | 'performance' | 'comfort' | 'features'

export interface UserPreferences {
  budget: Budget
  fuel_types: FuelType[]
  body_types: BodyType[]
  usage: UsageType
  priorities: PriorityType[]
  seating_capacity: number
}

export interface Recommendation {
  cars: Car[]
  explanations: string[]
  summary: string
}
