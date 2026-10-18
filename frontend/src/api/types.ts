// Kontrakt z BFF. Nazwy pól 1:1 z DTO serwisów, żeby BFF mógł je przepuszczać bez mapowania.

/** common: com.game.dto.PageDto */
export interface Page<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
}

/** player-service: PlayerDto */
export interface Player {
  id: number
  userName: string
  email: string
  bio: string | null
}

/** player-service: UpdatePlayerCommand (PATCH – tylko przesłane pola) */
export interface UpdatePlayerCommand {
  userName?: string
  email?: string
  bio?: string
}

/** catalog-service: GameDto (wynik wyszukiwania) */
export interface GameSummary {
  rawgId: number
  name: string
  /** LocalDate, np. "2015-05-18" */
  released: string | null
  imageUrl: string | null
  /** ocena RAWG 0–5, serwis zwraca ją jako String */
  rating: string | null
}

/** catalog-service: GameDetailsDto */
export interface GameDetails extends GameSummary {
  description: string | null
  genres: string[]
  platforms: string[]
}

/** player-service: enum GameStatus. NONE = gra dodana, ale jeszcze nieruszona („chcę zagrać”). */
export type GameStatus = 'NONE' | 'PLAYING' | 'COMPLETED' | 'DROPPED'

export type RatingKey = 'rating' | 'gameplayRating' | 'graphicsRating' | 'storyRating' | 'monetizationRating'

/** player-service (FEATURE-003): pozycja w bibliotece gracza */
export interface LibraryEntry {
  rawgId: number
  gameName: string
  status: GameStatus
  rating: number | null
  gameplayRating: number | null
  graphicsRating: number | null
  storyRating: number | null
  monetizationRating: number | null
  review: string | null
  /** LocalDateTime ustawiane przez serwer */
  createdAt: string
  /** Nie ma w specyfikacji – jeśli backend zacznie go zwracać, profil pokaże okładki */
  imageUrl?: string | null
}

/** POST /players/{playerId}/library */
export interface AddLibraryEntryCommand {
  rawgId: number
  status: GameStatus
  rating?: number | null
  gameplayRating?: number | null
  graphicsRating?: number | null
  storyRating?: number | null
  monetizationRating?: number | null
  review?: string | null
}

/** PATCH /players/{playerId}/library/{rawgId} – tylko zmienione pola, null = wyczyść */
export type UpdateLibraryEntryCommand = Partial<Omit<AddLibraryEntryCommand, 'rawgId'>>

/** BFF: POST /auth/register */
export interface RegisterCommand {
  userName: string
  email: string
  password: string
}

/** BFF: POST /auth/login */
export interface LoginCommand {
  email: string
  password: string
}

/** RFC 9457 – format błędów ze Springa (ProblemDetail), errors dokłada GlobalExceptionHandler */
export interface ProblemDetail {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  errors?: Record<string, string[] | string>
}
