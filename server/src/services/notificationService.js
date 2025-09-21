import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Email configuration
const emailTransporter = nodemailer.createTransporter({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Twilio configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

class NotificationService {
  // Send email notification
  async sendEmail({ to, subject, html, attachments = [] }) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        html,
        attachments
      };

      const result = await emailTransporter.sendMail(mailOptions);
      return {
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send SMS notification
  async sendSMS({ to, message }) {
    try {
      const result = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });

      return {
        success: true,
        sid: result.sid,
        message: 'SMS sent successfully'
      };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send WhatsApp message
  async sendWhatsApp({ to, message }) {
    try {
      const result = await twilioClient.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${to}`
      });

      return {
        success: true,
        sid: result.sid,
        message: 'WhatsApp message sent successfully'
      };
    } catch (error) {
      console.error('WhatsApp sending failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send report notification
  async sendReportNotification({ patient, reportUrl, method = 'email' }) {
    const message = `Dear ${patient.name}, your lab report is ready. You can view it at: ${reportUrl}`;
    const subject = 'Lab Report Ready - ' + patient.name;

    switch (method) {
      case 'email':
        return await this.sendEmail({
          to: patient.email,
          subject,
          html: `
            <h2>Lab Report Ready</h2>
            <p>Dear ${patient.name},</p>
            <p>Your lab report is now ready for viewing.</p>
            <p><a href="${reportUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Report</a></p>
            <p>Thank you for choosing our services.</p>
          `
        });

      case 'sms':
        return await this.sendSMS({
          to: patient.phone,
          message
        });

      case 'whatsapp':
        return await this.sendWhatsApp({
          to: patient.phone,
          message
        });

      default:
        throw new Error('Invalid notification method');
    }
  }

  // Send invoice notification
  async sendInvoiceNotification({ patient, invoiceUrl, amount, method = 'email' }) {
    const message = `Dear ${patient.name}, your invoice of ₹${amount} is ready. View: ${invoiceUrl}`;
    const subject = 'Invoice Generated - ₹' + amount;

    switch (method) {
      case 'email':
        return await this.sendEmail({
          to: patient.email,
          subject,
          html: `
            <h2>Invoice Generated</h2>
            <p>Dear ${patient.name},</p>
            <p>Your invoice for ₹${amount} has been generated.</p>
            <p><a href="${invoiceUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Invoice</a></p>
            <p>Please make the payment at your earliest convenience.</p>
          `
        });

      case 'sms':
        return await this.sendSMS({
          to: patient.phone,
          message
        });

      case 'whatsapp':
        return await this.sendWhatsApp({
          to: patient.phone,
          message
        });

      default:
        throw new Error('Invalid notification method');
    }
  }

  // Send appointment reminder
  async sendAppointmentReminder({ patient, appointmentDate, method = 'sms' }) {
    const message = `Reminder: You have an appointment scheduled for ${appointmentDate}. Please arrive 15 minutes early.`;
    const subject = 'Appointment Reminder';

    switch (method) {
      case 'email':
        return await this.sendEmail({
          to: patient.email,
          subject,
          html: `
            <h2>Appointment Reminder</h2>
            <p>Dear ${patient.name},</p>
            <p>This is a reminder that you have an appointment scheduled for <strong>${appointmentDate}</strong>.</p>
            <p>Please arrive 15 minutes early for check-in.</p>
          `
        });

      case 'sms':
        return await this.sendSMS({
          to: patient.phone,
          message
        });

      case 'whatsapp':
        return await this.sendWhatsApp({
          to: patient.phone,
          message
        });

      default:
        throw new Error('Invalid notification method');
    }
  }
}

export default new NotificationService();