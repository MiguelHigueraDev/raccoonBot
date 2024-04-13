import { type Map } from './Map'

// Results are called "docs" in the API, this means maps.
export interface SearchResults {
  docs: Map[]
}
