import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// Create transporter
let transporter;

const createTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransporter(emailConfig);
  }
  return transporter;
};

// Email templates
const emailTemplates = {
  'password-reset': {
    subject: 'Password Reset Request - PathologyLab',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PathologyLab</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="content">
            <h2>Hello {{name}},</h2>
            <p>We received a request to reset your password for your PathologyLab account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="{{resetUrl}}" class="button">Reset Password</a>
            <div class="warning">
              <strong>Important:</strong> This link will expire in {{expiresIn}}. If you didn't request this password reset, please ignore this email.
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="{{resetUrl}}">{{resetUrl}}</a></p>
            <p>For security reasons, this link can only be used once.</p>
          </div>
          <div class="footer">
            <p>© 2024 PathologyLab. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  'welcome': {
    subject: 'Welcome to PathologyLab - {{labName}}',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to PathologyLab</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature-list ul { list-style-type: none; padding: 0; }
          .feature-list li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .feature-list li:last-child { border-bottom: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to PathologyLab!</h1>
            <p>Your account has been created successfully</p>
          </div>
          <div class="content">
            <h2>Hello {{name}},</h2>
            <p>Welcome to <strong>{{labName}}</strong>! Your account has been successfully created and you can now access the PathologyLab system.</p>
            
            <div class="feature-list">
              <h3>What you can do:</h3>
              <ul>
                <li>✓ Manage patient records and test results</li>
                <li>✓ Track samples with barcode scanning</li>
                <li>✓ Generate professional reports</li>
                <li>✓ Handle billing and invoicing</li>
                <li>✓ Access real-time analytics</li>
              </ul>
            </div>
            
            <p><strong>Your Role:</strong> {{role}}</p>
            <p><strong>Login Email:</strong> {{email}}</p>
            
            <a href="{{loginUrl}}" class="button">Login to Dashboard</a>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>© 2024 PathologyLab. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  'report-ready': {
    subject: 'Test Report Ready - {{patientName}}',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Report Ready</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .report-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>{{labName}}</h1>
            <p>Test Report Ready</p>
          </div>
          <div class="content">
            <h2>Dear {{patientName}},</h2>
            <p>Your test report is now ready for download.</p>
            
            <div class="report-info">
              <h3>Report Details:</h3>
              <p><strong>Report ID:</strong> {{reportId}}</p>
              <p><strong>Test Date:</strong> {{testDate}}</p>
              <p><strong>Report Date:</strong> {{reportDate}}</p>
              <p><strong>Tests:</strong> {{testNames}}</p>
            </div>
            
            <a href="{{reportUrl}}" class="button">Download Report</a>
            
            <p>Please consult with your healthcare provider to discuss the results.</p>
            <p>If you have any questions about your report, please contact us.</p>
          </div>
          <div class="footer">
            <p>© 2024 {{labName}}. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  
  'invoice': {
    subject: 'Invoice - {{invoiceNumber}}',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .invoice-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #7c3aed; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>{{labName}}</h1>
            <p>Invoice</p>
          </div>
          <div class="content">
            <h2>Dear {{patientName}},</h2>
            <p>Please find your invoice details below:</p>
            
            <div class="invoice-info">
              <h3>Invoice Details:</h3>
              <p><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
              <p><strong>Date:</strong> {{invoiceDate}}</p>
              <p><strong>Due Date:</strong> {{dueDate}}</p>
              <p><strong>Total Amount:</strong> <span class="amount">₹{{totalAmount}}</span></p>
            </div>
            
            <a href="{{invoiceUrl}}" class="button">View Invoice</a>
            
            <p>Payment can be made online or at our facility. Please retain this invoice for your records.</p>
          </div>
          <div class="footer">
            <p>© 2024 {{labName}}. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

// Replace template variables
const replaceTemplateVariables = (template, data) => {
  let result = template;
  
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }
  
  return result;
};

// Send email function
export const sendEmail = async (options) => {
  try {
    const { to, subject, template, data, html, text, attachments } = options;
    
    if (!to) {
      throw new Error('Recipient email is required');
    }
    
    // Create transporter if not exists
    const emailTransporter = createTransporter();
    
    let emailHtml = html;
    let emailSubject = subject;
    
    // Use template if provided
    if (template && emailTemplates[template]) {
      const templateData = emailTemplates[template];
      emailHtml = replaceTemplateVariables(templateData.html, data || {});
      emailSubject = replaceTemplateVariables(templateData.subject, data || {});
    }
    
    // Email options
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'PathologyLab'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: emailSubject,
      html: emailHtml,
      text: text,
      attachments: attachments
    };
    
    // Send email
    const result = await emailTransporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', {
      messageId: result.messageId,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    return {
      success: true,
      messageId: result.messageId
    };
    
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send bulk emails
export const sendBulkEmails = async (emails) => {
  const results = [];
  
  for (const emailOptions of emails) {
    try {
      const result = await sendEmail(emailOptions);
      results.push({ ...result, to: emailOptions.to });
    } catch (error) {
      results.push({ 
        success: false, 
        error: error.message, 
        to: emailOptions.to 
      });
    }
  }
  
  return results;
};

// Verify email configuration
export const verifyEmailConfig = async () => {
  try {
    const emailTransporter = createTransporter();
    await emailTransporter.verify();
    console.log('Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email configuration verification failed:', error);
    return false;
  }
};

// Send test email
export const sendTestEmail = async (to) => {
  try {
    const result = await sendEmail({
      to,
      subject: 'PathologyLab - Test Email',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from PathologyLab system.</p>
        <p>If you received this email, the email configuration is working correctly.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `
    });
    
    return result;
  } catch (error) {
    throw new Error(`Test email failed: ${error.message}`);
  }
};

// Email queue for handling high volume (basic implementation)
class EmailQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxRetries = 3;
  }
  
  add(emailOptions) {
    this.queue.push({
      ...emailOptions,
      retries: 0,
      addedAt: new Date()
    });
    
    if (!this.processing) {
      this.process();
    }
  }
  
  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const emailItem = this.queue.shift();
      
      try {
        await sendEmail(emailItem);
        console.log(`Email sent successfully to ${emailItem.to}`);
      } catch (error) {
        console.error(`Email failed to ${emailItem.to}:`, error.message);
        
        // Retry logic
        if (emailItem.retries < this.maxRetries) {
          emailItem.retries++;
          this.queue.push(emailItem);
          console.log(`Email queued for retry (${emailItem.retries}/${this.maxRetries})`);
        } else {
          console.error(`Email permanently failed to ${emailItem.to} after ${this.maxRetries} retries`);
        }
      }
      
      // Small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.processing = false;
  }
  
  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing
    };
  }
}

// Create email queue instance
export const emailQueue = new EmailQueue();

// Add email to queue
export const queueEmail = (emailOptions) => {
  emailQueue.add(emailOptions);
};

// Get queue status
export const getEmailQueueStatus = () => {
  return emailQueue.getQueueStatus();
};

export default {
  sendEmail,
  sendBulkEmails,
  verifyEmailConfig,
  sendTestEmail,
  queueEmail,
  getEmailQueueStatus,
  emailQueue
};