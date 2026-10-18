import { describe, expect, it } from 'vitest'
import type { LibraryEntry } from '../../api/types'
import { toAddCommand, toForm, toUpdateCommand } from './entryForm'

const entry: LibraryEntry = {
  rawgId: 3328,
  gameName: 'The Witcher 3: Wild Hunt',
  status: 'COMPLETED',
  rating: 9,
  gameplayRating: 8,
  graphicsRating: 9,
  storyRating: 10,
  monetizationRating: null,
  review: 'Najlepsze questy poboczne.',
  createdAt: '2026-10-15T10:00:00',
}

describe('toAddCommand', () => {
  it('wysyła tylko wypełnione oceny', () => {
    const form = { ...toForm(), status: 'COMPLETED' as const, rating: 9, storyRating: 10, review: '  ' }
    expect(toAddCommand(3328, form)).toEqual({ rawgId: 3328, status: 'COMPLETED', rating: 9, storyRating: 10 })
  })

  it('dla „Chcę zagrać” pomija oceny, ale zostawia notatkę', () => {
    const form = { ...toForm(), status: 'NONE' as const, rating: 7, review: 'Na wakacje' }
    expect(toAddCommand(3328, form)).toEqual({ rawgId: 3328, status: 'NONE', review: 'Na wakacje' })
  })
})

describe('toUpdateCommand (PATCH)', () => {
  it('bez zmian daje pusty obiekt', () => {
    expect(toUpdateCommand(toForm(entry), toForm(entry))).toEqual({})
  })

  it('wysyła tylko zmienione pola, a wyczyszczone jako null', () => {
    const form = { ...toForm(entry), rating: 10, graphicsRating: null, review: '' }
    expect(toUpdateCommand(toForm(entry), form)).toEqual({ rating: 10, graphicsRating: null, review: null })
  })

  it('zmiana statusu na „Chcę zagrać” nie rusza ocen', () => {
    const form = { ...toForm(entry), status: 'NONE' as const, rating: 3 }
    expect(toUpdateCommand(toForm(entry), form)).toEqual({ status: 'NONE' })
  })
})
