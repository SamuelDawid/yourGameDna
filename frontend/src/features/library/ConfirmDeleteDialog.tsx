import type { LibraryEntry } from '../../api/types'
import { Button } from '../../components/Button'
import { FormError } from '../../components/Field'
import { Modal } from '../../components/Modal'
import { useToast } from '../../components/toast/toastContext'
import { useRemoveFromLibrary } from './useLibrary'

export function ConfirmDeleteDialog({ entry, onClose }: { entry: LibraryEntry; onClose: () => void }) {
  const remove = useRemoveFromLibrary()
  const toast = useToast()

  const onConfirm = () =>
    remove.mutate(entry.rawgId, {
      onSuccess: () => {
        toast({ title: 'Usunięto z profilu', description: entry.gameName })
        onClose()
      },
    })

  return (
    <Modal
      open
      onClose={onClose}
      title="Usunąć grę z profilu?"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Anuluj
          </Button>
          <Button variant="danger" icon="trash" loading={remove.isPending} onClick={onConfirm}>
            Usuń
          </Button>
        </>
      }
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <p style={{ color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text)' }}>{entry.gameName}</strong> zniknie z Twojej biblioteki razem z oceną i recenzją. Game DNA przeliczy się bez tej gry.
        </p>
        <FormError message={remove.error?.message} />
      </div>
    </Modal>
  )
}
