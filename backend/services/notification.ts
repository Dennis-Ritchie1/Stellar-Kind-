export async function sendEmail(to: string, subject: string, body: string) {
  // Integrate with an email provider like SendGrid or Mailgun
  return { to, subject, status: 'sent' }
}

export async function sendSMS(to: string, message: string) {
  // Integrate with SMS provider like Twilio
  return { to, message, status: 'sent' }
}

export async function sendWebhook(event: string, payload: unknown) {
  // Send webhook payloads to subscriber endpoints
  return { event, status: 'delivered' }
}
