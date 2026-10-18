import type { AddLibraryEntryCommand, GameStatus, LibraryEntry, RatingKey, UpdateLibraryEntryCommand } from '../../api/types'
import { canBeRated } from '../../domain/gameStatus'
import { RATING_FIELDS } from '../../domain/genes'

export type EntryForm = Record<RatingKey, number | null> & {
  status: GameStatus | null
  review: string
}

export function toForm(entry?: LibraryEntry): EntryForm {
  return {
    status: entry?.status ?? null,
    rating: entry?.rating ?? null,
    gameplayRating: entry?.gameplayRating ?? null,
    graphicsRating: entry?.graphicsRating ?? null,
    storyRating: entry?.storyRating ?? null,
    monetizationRating: entry?.monetizationRating ?? null,
    review: entry?.review ?? '',
  }
}

const reviewOrNull = (review: string) => review.trim() || null

export function toAddCommand(rawgId: number, form: EntryForm): AddLibraryEntryCommand {
  const status = form.status ?? 'NONE'
  const command: AddLibraryEntryCommand = { rawgId, status }
  if (canBeRated(status)) {
    for (const field of RATING_FIELDS) if (form[field] != null) command[field] = form[field]
  }
  const review = reviewOrNull(form.review)
  if (review) command.review = review
  return command
}

/** PATCH wysyła tylko to, co się zmieniło. Wyczyszczona wartość idzie jako null. */
export function toUpdateCommand(original: EntryForm, form: EntryForm): UpdateLibraryEntryCommand {
  const command: UpdateLibraryEntryCommand = {}
  if (form.status && form.status !== original.status) command.status = form.status
  if (canBeRated(form.status ?? 'NONE')) {
    for (const field of RATING_FIELDS) if (form[field] !== original[field]) command[field] = form[field]
  }
  const review = reviewOrNull(form.review)
  if (review !== reviewOrNull(original.review)) command.review = review
  return command
}
