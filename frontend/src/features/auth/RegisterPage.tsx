import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { isApiError } from '../../api/client'
import { Button } from '../../components/Button'
import { FormError, TextField } from '../../components/Field'
import { AuthLayout } from './AuthLayout'
import { ModeNotice } from './ModeNotice'
import { useRegister } from './useAuth'
import { conflictField, validateEmail, validateNewPassword, validateUserName, type FieldErrors } from './validation'
import styles from './AuthForm.module.css'

export function RegisterPage() {
  const register = useRegister()
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [clientErrors, setClientErrors] = useState<FieldErrors>({})

  const { fieldErrors: serverFieldErrors, formError } = describeServerError(register.error)
  const errors = { ...serverFieldErrors, ...clientErrors }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: FieldErrors = {}
    validateUserName(userName, nextErrors)
    validateEmail(email, nextErrors)
    validateNewPassword(password, nextErrors)
    setClientErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    register.mutate({ userName: userName.trim(), email: email.trim(), password })
  }

  return (
    <AuthLayout
      title="Załóż konto"
      subtitle="Zacznij budować swoje Game DNA – to zajmie chwilę."
      notice={<ModeNotice />}
      footer={
        <>
          Masz już konto? <Link to="/login">Zaloguj się</Link>
        </>
      }
    >
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <FormError message={formError} />
        <TextField
          label="Nick"
          autoComplete="username"
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
          errors={errors.userName}
          hint="Od 3 do 30 znaków. Inni gracze zobaczą go w Twoim profilu."
          maxLength={30}
          autoFocus
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          errors={errors.email}
        />
        <TextField
          label="Hasło"
          type="password"
          autoComplete="new-password"
          revealable
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          errors={errors.password}
          hint="Co najmniej 8 znaków."
        />
        <Button type="submit" variant="primary" size="lg" loading={register.isPending} className={styles.submit}>
          Załóż konto
        </Button>
      </form>
    </AuthLayout>
  )
}

function describeServerError(error: Error | null): { fieldErrors: FieldErrors; formError: string | null } {
  if (!error) return { fieldErrors: {}, formError: null }
  if (!isApiError(error)) return { fieldErrors: {}, formError: error.message }
  if (Object.keys(error.fieldErrors).length) return { fieldErrors: error.fieldErrors, formError: null }
  if (error.status === 409) {
    const field = conflictField(error.message)
    const message = field === 'userName' ? 'Ten nick jest już zajęty.' : field === 'email' ? 'Konto z tym emailem już istnieje.' : error.message
    if (field) return { fieldErrors: { [field]: [message] }, formError: null }
  }
  return { fieldErrors: {}, formError: error.message }
}
