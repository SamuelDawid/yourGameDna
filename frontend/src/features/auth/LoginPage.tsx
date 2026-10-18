import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { isApiError } from '../../api/client'
import { Button } from '../../components/Button'
import { FormError, TextField } from '../../components/Field'
import { AuthLayout } from './AuthLayout'
import { ModeNotice } from './ModeNotice'
import { useLogin } from './useAuth'
import { validateEmail, type FieldErrors } from './validation'
import styles from './AuthForm.module.css'

export function LoginPage() {
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [clientErrors, setClientErrors] = useState<FieldErrors>({})

  const serverError = isApiError(login.error) ? login.error : null
  const errors = { ...serverError?.fieldErrors, ...clientErrors }
  const formError = login.error && !Object.keys(serverError?.fieldErrors ?? {}).length ? login.error.message : null

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: FieldErrors = {}
    validateEmail(email, nextErrors)
    if (!password) nextErrors.password = ['Podaj hasło.']
    setClientErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    // po sukcesie GuestOnly sam przekieruje tam, skąd gracz przyszedł
    login.mutate({ email: email.trim(), password })
  }

  return (
    <AuthLayout
      title="Zaloguj się"
      subtitle="Wróć do swojej biblioteki i Game DNA."
      notice={
        <ModeNotice
          onUseDemo={(demoEmail, demoPassword) => {
            setEmail(demoEmail)
            setPassword(demoPassword)
            setClientErrors({})
          }}
        />
      }
      footer={
        <>
          Nie masz konta? <Link to="/register">Załóż je</Link>
        </>
      }
    >
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <FormError message={formError} />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          errors={errors.email}
          autoFocus
        />
        <TextField
          label="Hasło"
          type="password"
          autoComplete="current-password"
          revealable
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          errors={errors.password}
        />
        <Button type="submit" variant="primary" size="lg" loading={login.isPending} className={styles.submit}>
          Zaloguj się
        </Button>
      </form>
    </AuthLayout>
  )
}
