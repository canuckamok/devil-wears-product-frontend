export type ItemCategory =
  | 'fresh_produce'
  | 'packaged_snack'
  | 'cereal_pasta_canned'
  | 'stuffed_animal_small'
  | 'stuffed_animal_large'
  | 'childrens_book'
  | 'toy'
  | 'board_game'
  | 'clothing'
  | 'household_item'
  | 'other'

interface PriceRange {
  min: number
  max: number
}

// All prices end in .99 — never $0.00, never identical for everything
const PRICE_RANGES: Record<ItemCategory, PriceRange> = {
  fresh_produce: { min: 0.99, max: 0.99 },
  packaged_snack: { min: 2.99, max: 4.99 },
  cereal_pasta_canned: { min: 3.99, max: 5.99 },
  stuffed_animal_small: { min: 9.99, max: 14.99 },
  stuffed_animal_large: { min: 19.99, max: 24.99 },
  childrens_book: { min: 7.99, max: 10.99 },
  toy: { min: 9.99, max: 19.99 },
  board_game: { min: 14.99, max: 29.99 },
  clothing: { min: 12.99, max: 24.99 },
  household_item: { min: 4.99, max: 9.99 },
  other: { min: 2.99, max: 9.99 },
}

/**
 * Return a realistic .99-ending price for the given category.
 * Uses seeded randomness based on item name for consistency across calls.
 */
export function getPriceForCategory(category: string, seed?: string): number {
  const range = PRICE_RANGES[category as ItemCategory] ?? PRICE_RANGES.other

  if (range.min === range.max) return range.min

  // Build list of valid .99 prices within the range
  const prices: number[] = []
  let p = range.min
  while (p <= range.max + 0.001) {
    prices.push(Math.round(p * 100) / 100)
    p = Math.floor(p) + 1.99 // next .99 price
  }

  if (prices.length === 0) return range.min
  if (prices.length === 1) return prices[0]

  // Deterministic index based on seed (item name hash) so same item always gets same price
  const hash = seed ? simpleHash(seed) : Math.floor(Math.random() * 1000)
  return prices[hash % prices.length]
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // 32-bit int
  }
  return Math.abs(hash)
}
