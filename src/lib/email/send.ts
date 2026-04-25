import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.FROM_EMAIL || 'orders@velaintimates.com'
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

  try {
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
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
