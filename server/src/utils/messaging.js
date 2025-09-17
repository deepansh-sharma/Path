// Stubs for WhatsApp and Email integrations
export async function sendWhatsAppMessage({ to, message, mediaUrl }) {
  // Integrate WhatsApp Cloud API / Twilio later
  return { success: true, to, message, mediaUrl };
}

export async function sendEmail({ to, subject, text, html, attachments }) {
  // Integrate nodemailer / provider later
  return { success: true, to, subject };
}
