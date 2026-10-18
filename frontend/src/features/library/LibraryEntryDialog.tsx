import { useId, useState, type FormEvent } from 'react'
import { isApiError } from '../../api/client'
import type { LibraryEntry } from '../../api/types'
import { Button } from '../../components/Button'
import { FormError, TextAreaField } from '../../components/Field'
import { GameCover } from '../../components/GameCover'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import { StatusBadge } from '../../components/StatusBadge'
import { useToast } from '../../components/toast/toastContext'
import { canBeRated } from '../../domain/gameStatus'
import { GENES } from '../../domain/genes'
import { formatRawgRating, yearOf } from '../../lib/format'
import { toAddCommand, toForm, toUpdateCommand, type EntryForm } from './entryForm'
import { RatingField } from './RatingField'
import { StatusPicker } from './StatusPicker'
import { useAddToLibrary, useGameDetails, useLibraryIndex, useRemoveFromLibrary, useUpdateLibraryEntry } from './useLibrary'
import styles from './LibraryEntryDialog.module.css'

export interface DialogGame {
  rawgId: number
  name: string
  imageUrl?: string | null
  released?: string | null
  rating?: string | null
}

interface LibraryEntryDialogProps {
  game: DialogGame
  /** gdy podany – edycja istniejącego wpisu (PATCH), inaczej dodawanie (POST) */
  entry?: LibraryEntry
  onClose: () => void
}

const REVIEW_MAX = 2000

export function LibraryEntryDialog({ game, entry: initialEntry, onClose }: LibraryEntryDialogProps) {
  const formId = useId()
  const toast = useToast()
  const details = useGameDetails(game.rawgId)
  const library = useLibraryIndex()
  const add = useAddToLibrary()
  const update = useUpdateLibraryEntry()
  const remove = useRemoveFromLibrary()

  const [entry, setEntry] = useState(initialEntry)
  const [form, setForm] = useState<EntryForm>(() => toForm(initialEntry))
  const [statusError, setStatusError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const name = details.data?.name ?? game.name
  const isEdit = entry != null
  const mutation = isEdit ? update : add
  const apiError = isApiError(mutation.error) ? mutation.error : null
  const fieldErrors = apiError?.fieldErrors ?? {}
  const formError = (mutation.error && !Object.keys(fieldErrors).length ? mutation.error.message : null) ?? remove.error?.message ?? null
  const rated = form.status != null && canBeRated(form.status)

  const set = <K extends keyof EntryForm>(key: K, value: EntryForm[K]) => setForm((current) => ({ ...current, [key]: value }))

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!form.status) {
      setStatusError('Wybierz status gry.')
      return
    }
    if (entry) {
      const command = toUpdateCommand(toForm(entry), form)
      if (Object.keys(command).length === 0) return onClose()
      update.mutate(
        { rawgId: game.rawgId, command },
        {
          onSuccess: () => {
            toast({ title: 'Zapisano zmiany', description: name })
            onClose()
          },
        },
      )
      return
    }
    add.mutate(toAddCommand(game.rawgId, form), {
      onSuccess: () => {
        toast({ title: 'Dodano do profilu', description: name })
        onClose()
      },
      onError: (error) => {
        // 409 – gra już jest w bibliotece: przełączamy się na edycję istniejącego wpisu
        const existing = library.index.get(game.rawgId)
        if (isApiError(error) && error.status === 409 && existing) {
          add.reset()
          setEntry(existing)
          setForm(toForm(existing))
          setNotice('Ta gra jest już w Twoim profilu – wczytaliśmy Twój wpis do edycji.')
        }
      },
    })
  }

  const onDelete = () =>
    remove.mutate(game.rawgId, {
      onSuccess: () => {
        toast({ title: 'Usunięto z profilu', description: name })
        onClose()
      },
    })

  const footer = confirmingDelete ? (
    <div className={styles.confirm}>
      <p>
        Usunąć <strong>{name}</strong> z profilu? Ocena i recenzja przepadną.
      </p>
      <div className={styles.confirmActions}>
        <Button variant="ghost" onClick={() => setConfirmingDelete(false)}>
          Nie, zostaw
        </Button>
        <Button variant="danger" icon="trash" loading={remove.isPending} onClick={onDelete}>
          Usuń
        </Button>
      </div>
    </div>
  ) : (
    <>
      {isEdit && (
        <Button variant="ghost" icon="trash" className={styles.deleteButton} onClick={() => setConfirmingDelete(true)}>
          Usuń z profilu
        </Button>
      )}
      <Button variant="ghost" onClick={onClose}>
        Anuluj
      </Button>
      <Button type="submit" form={formId} variant="primary" icon={isEdit ? 'check' : 'plus'} loading={mutation.isPending}>
        {isEdit ? 'Zapisz zmiany' : 'Dodaj do profilu'}
      </Button>
    </>
  )

  const year = yearOf(details.data?.released ?? game.released)
  const rawgRating = formatRawgRating(details.data?.rating ?? game.rating)
  const genres = details.data?.genres ?? []

  return (
    <Modal open onClose={onClose} title={isEdit ? `Edytuj wpis: ${name}` : `Dodaj do profilu: ${name}`} hideTitle size="lg" footer={footer}>
      <div className={styles.hero}>
        <GameCover name={name} imageUrl={details.data?.imageUrl ?? game.imageUrl ?? entry?.imageUrl} className={styles.heroCover} />
        <div className={styles.heroText} aria-hidden="true">
          {entry && <StatusBadge status={entry.status} solid />}
          <p className={`display ${styles.heroTitle}`}>{name}</p>
          <p className={styles.heroMeta}>
            <span>{year ?? 'Data premiery nieznana'}</span>
            {rawgRating && (
              <span className={styles.rawg}>
                <Icon name="star" size={13} /> {rawgRating} RAWG
              </span>
            )}
            {genres.length > 0 && <span>{genres.slice(0, 3).join(' · ')}</span>}
          </p>
        </div>
      </div>

      <GameDetailsSection details={details} />

      <form id={formId} className={styles.form} onSubmit={onSubmit} noValidate>
        <h3 className={styles.sectionTitle}>{isEdit ? 'Twój wpis' : 'Dodaj do swojego profilu'}</h3>
        {notice && (
          <p className={styles.notice} role="status">
            <Icon name="helix" size={16} /> {notice}
          </p>
        )}
        <FormError message={formError} />

        <StatusPicker
          value={form.status}
          onChange={(status) => {
            set('status', status)
            setStatusError(null)
          }}
          errors={statusError ? [statusError] : fieldErrors.status}
        />

        {rated ? (
          <div className={styles.ratings}>
            <RatingField
              size="lg"
              label="Ocena ogólna"
              color="var(--accent-strong)"
              value={form.rating}
              onChange={(value) => set('rating', value)}
              errors={fieldErrors.rating}
            />
            <div className={styles.genes}>
              <p className={styles.genesTitle}>
                Geny <span>opcjonalne – to z nich powstaje Twoje Game DNA</span>
              </p>
              {GENES.map((gene) => (
                <RatingField
                  key={gene.key}
                  gene={gene.key}
                  label={gene.label}
                  hint={gene.hint}
                  color={gene.color}
                  value={form[gene.field]}
                  onChange={(value) => set(gene.field, value)}
                  errors={fieldErrors[gene.field]}
                />
              ))}
            </div>
          </div>
        ) : (
          form.status === 'NONE' && (
            <p className={styles.plannedHint}>
              <Icon name="bookmark" size={16} /> Grę z listy „Chcę zagrać” ocenisz, gdy już w nią zagrasz. Na razie możesz dodać notatkę.
            </p>
          )
        )}

        <TextAreaField
          label={rated ? 'Recenzja' : 'Notatka'}
          placeholder={rated ? 'Co zostanie Ci w głowie po tej grze?' : 'Dlaczego chcesz w to zagrać?'}
          rows={4}
          maxLength={REVIEW_MAX}
          value={form.review}
          onChange={(event) => set('review', event.target.value)}
          errors={fieldErrors.review}
        />
      </form>
    </Modal>
  )
}

function GameDetailsSection({ details }: { details: ReturnType<typeof useGameDetails> }) {
  const [expanded, setExpanded] = useState(false)

  if (details.isPending) {
    return (
      <div className={styles.details} aria-hidden="true">
        <div className="skeleton" style={{ height: 14, width: '92%' }} />
        <div className="skeleton" style={{ height: 14, width: '78%' }} />
      </div>
    )
  }
  if (details.isError) {
    return (
      <p className={styles.detailsError}>
        <Icon name="alert" size={15} /> Nie udało się pobrać szczegółów gry: {details.error.message}
      </p>
    )
  }

  const { description, platforms } = details.data
  const long = (description?.length ?? 0) > 260
  return (
    <div className={styles.details}>
      {description && (
        <p className={styles.description} data-clamped={long && !expanded ? true : undefined}>
          {description}
        </p>
      )}
      {long && (
        <button type="button" className={styles.more} onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'Zwiń opis' : 'Pokaż cały opis'}
        </button>
      )}
      {platforms.length > 0 && (
        <ul className={styles.platforms} aria-label="Platformy">
          {platforms.slice(0, 8).map((platform) => (
            <li key={platform}>{platform}</li>
          ))}
          {platforms.length > 8 && <li>+{platforms.length - 8}</li>}
        </ul>
      )}
    </div>
  )
}
