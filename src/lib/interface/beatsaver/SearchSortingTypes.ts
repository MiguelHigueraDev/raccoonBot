export type SortingType = 'Rating' | 'Relevance' | 'Latest' | 'Curated'

export interface SortingTypes {
  value: string
  name: SortingType
}

export const SORTING_TYPES: SortingTypes[] = [
  {
    value: 'rating',
    name: 'Rating'
  },
  {
    value: 'relevance',
    name: 'Relevance'
  },
  {
    value: 'latest',
    name: 'Latest'
  },
  {
    value: 'curated',
    name: 'Curated'
  }
]
