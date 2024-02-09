export interface TvShowResults {
  page: number
  results: TvShowResult[]
  total_pages: number
  total_results: number
}

export interface TvShowResult {
  backdrop_path: string
  first_air_date: string
  genre_ids: number[]
  id: number
  name: string
  origin_country: string[]
  original_language: string
  original_name: string
  overview: string
  popularity: number
  poster_path: string
  vote_average: number
  vote_count: number
}

export interface TvShow {
  adult: boolean
  backdrop_path: string
  created_by: any[]
  episode_run_time: any[]
  first_air_date: string
  genres: any[]
  homepage: string
  id: number
  in_production: boolean
  languages: any[]
  last_air_date: string
  last_episode_to_air: any
  name: string
  next_episode_to_air: any
  networks: any[]
  number_of_episodes: number
  number_of_seasons: number
  origin_country: any[]
  original_language: string
  original_name: string
  overview: string
  popularity: number
  poster_path: string
  production_companies: any[]
  production_countries: any[]
  seasons: any[]
  spoken_languages: any[]
  status: string
  tagline: string
  type: string
  vote_average: number
  vote_count: number
}

export interface MovieResults {
  page: number
  results: MovieResult[]
  total_pages: number
  total_results: number
}

export interface MovieResult {
  adult: boolean
  backdrop_path: string
  genre_ids: any[]
  id: number
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string
  release_date: string
  title: string
  video: boolean
  vote_average: number
  vote_count: number
}

export interface Movie {
  adult: boolean
  backdrop_path: string
  belongs_to_collection: any
  budget: number
  genres: any[]
  homepage: string
  id: number
  imdb_id: string
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string
  production_companies: any[]
  production_countries: any[]
  release_date: string
  revenue: number
  runtime: number
  spoken_languages: any[]
  status: string
  tagline: string
  title: string
  video: boolean
  vote_average: number
  vote_count: number
}

export interface CastResult {
  cast: Cast[]
  id: number
}

export interface Cast {
  adult: false
  gender: number
  id: number
  known_for_department: string
  name: string
  original_name: string
  popularity: number
  profile_path: string
  cast_id: number
  character: string
  credit_id: string
  order: number
}

export interface KeywordsResult {
  id: number
  keywords: Keyword[]
}

export interface ShowKeywordsResult {
  id: number
  results: Keyword[]
}

export interface Keyword {
  id: number
  name: string
}
