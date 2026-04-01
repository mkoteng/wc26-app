import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendNewUserNotification(user: {
  name: string
  email: string
}): Promise<void> {
  try {
    await getResend().emails.send({
      from: 'WC26 App <onboarding@resend.dev>',
      to: 'mkoteng@gmail.com',
      subject: `Ny bruker: ${user.name}`,
      html: `
        <h2>Ny bruker har logget inn for første gang</h2>
        <p><strong>Navn:</strong> ${user.name}</p>
        <p><strong>Epost:</strong> ${user.email}</p>
        <p><strong>Tidspunkt:</strong> ${new Date().toLocaleString('nb-NO', { timeZone: 'Europe/Oslo' })}</p>
        <hr>
        <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/brukere">
          Se alle brukere i admin-panelet
        </a></p>
      `,
    })
  } catch (error) {
    console.error('Failed to send new user notification:', error)
  }
}
