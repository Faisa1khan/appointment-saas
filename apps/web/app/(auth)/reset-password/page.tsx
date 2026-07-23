import { Metadata } from 'next'
import { ResetPasswordForm } from './reset-password-form'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set a new password for your Arrivo account.',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
