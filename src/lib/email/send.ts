import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.FROM_EMAIL || "fahadrazzaq508@gmail.com"
const FROM_NAME = 'Vela Intimates'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[]
  subject: string
  html: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY not set — email not sent')
    console.log('[Email] Subject:', subject)
    console.log('[Email] To:', to)
    return { success: true, skipped: true }
  }

  // In dev, redirect all emails to a test inbox (onboarding@resend.dev only delivers to your own Resend account email)
  const recipient = process.env.TO_EMAIL_OVERRIDE
    ? [process.env.TO_EMAIL_OVERRIDE]
    : Array.isArray(to) ? to : [to]

  try {
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: recipient,
      subject,
      html,
    })

    if (result.error) {
      console.error('[Email] Failed to send:', result.error)
      return { success: false, error: result.error }
    }

    return { success: true, id: result.data?.id }
  } catch (err) {
    console.error('[Email] Exception:', err)
    return { success: false, error: err }
  }
}
