import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useId, useState, type FormEvent } from 'react'
import { isApiError } from '../../api/client'
import { playersApi } from '../../api/players'
import type { Player, UpdatePlayerCommand } from '../../api/types'
import { queryKeys } from '../../app/queryKeys'
import { Button } from '../../components/Button'
import { FormError, TextAreaField, TextField } from '../../components/Field'
import { Modal } from '../../components/Modal'
import { useToast } from '../../components/toast/toastContext'
import { conflictField, validateEmail, validateUserName, type FieldErrors } from '../auth/validation'

const BIO_MAX = 2000

export function EditProfileDialog({ player, onClose }: { player: Player; onClose: () => void }) {
  const formId = useId()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [userName, setUserName] = useState(player.userName)
  const [email, setEmail] = useState(player.email)
  const [bio, setBio] = useState(player.bio ?? '')
  const [clientErrors, setClientErrors] = useState<FieldErrors>({})

  const update = useMutation({
    mutationFn: (command: UpdatePlayerCommand) => playersApi.update(player.id, command),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.me, updated)
      toast({ title: 'Profil zaktualizowany' })
      onClose()
    },
  })

  const serverError = isApiError(update.error) ? update.error : null
  const conflict = serverError?.status === 409 ? conflictField(serverError.message) : null
  const errors: FieldErrors = { ...serverError?.fieldErrors, ...(conflict ? { [conflict]: [serverError!.message] } : {}), ...clientErrors }
  const formError = update.error && !conflict && !Object.keys(serverError?.fieldErrors ?? {}).length ? update.error.message : null

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: FieldErrors = {}
    validateUserName(userName, nextErrors)
    validateEmail(email, nextErrors)
    setClientErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    // PATCH – tylko zmienione pola
    const command: UpdatePlayerCommand = {}
    if (userName.trim() !== player.userName) command.userName = userName.trim()
    if (email.trim() !== player.email) command.email = email.trim()
    if (bio.trim() !== (player.bio ?? '')) command.bio = bio.trim()
    if (Object.keys(command).length === 0) return onClose()
    update.mutate(command)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Edytuj profil"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Anuluj
          </Button>
          <Button type="submit" form={formId} variant="primary" icon="check" loading={update.isPending}>
            Zapisz
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} noValidate style={{ display: 'grid', gap: 16 }}>
        <FormError message={formError} />
        <TextField label="Nick" value={userName} maxLength={30} onChange={(event) => setUserName(event.target.value)} errors={errors.userName} autoComplete="username" />
        <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} errors={errors.email} autoComplete="email" />
        <TextAreaField
          label="O mnie"
          placeholder="W co grasz najczęściej? Czego szukasz w grach?"
          rows={5}
          maxLength={BIO_MAX}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          errors={errors.bio}
        />
      </form>
    </Modal>
  )
}
