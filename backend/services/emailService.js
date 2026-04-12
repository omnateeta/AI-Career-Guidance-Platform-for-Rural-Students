const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          logger.warn(`Email service not configured: ${error.message}`);
        } else {
          logger.info('Email service is ready to send messages');
        }
      });
    } catch (error) {
      logger.warn(`Failed to initialize email transporter: ${error.message}`);
    }
  }

  /**
   * Send job alert email
   */
  async sendJobAlertEmail(to, userName, jobs) {
    if (!this.transporter) {
      logger.warn('Email transporter not configured, skipping job alert email');
      return;
    }

    try {
      const subject = `🎯 ${jobs.length} New Jobs Match Your Profile - Margdarshak AI`;
      
      const html = this.generateJobAlertEmailTemplate(userName, jobs);

      const mailOptions = {
        from: `"Margdarshak AI" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Job alert email sent to ${to}. Message ID: ${result.messageId}`);
      return result;
    } catch (error) {
      logger.error(`Failed to send job alert email to ${to}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate job alert email HTML template
   */
  generateJobAlertEmailTemplate(userName, jobs) {
    const jobsHtml = jobs.map((job, index) => {
      const matchScore = job.matchScore || 0;
      const matchColor = matchScore >= 80 ? '#10b981' : matchScore >= 60 ? '#f59e0b' : '#ef4444';
      const jobType = job.jobSource === 'government' ? '🏛️ Government' : '💼 Private';
      const salaryInfo = job.salary ? `₹${job.salary}` : 'Not specified';
      const location = job.location || 'India';
      const applyLink = job.applyUrl || job.applicationUrl || '#';
      
      return `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; background-color: #f9fafb;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <h3 style="margin: 0; color: #111827; font-size: 18px;">${index + 1}. ${job.title}</h3>
            <span style="background-color: ${matchColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">
              ${matchScore}% Match
            </span>
          </div>
          
          <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
            ${jobType} | ${job.company || job.department || ''}
          </p>
          
          <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
            📍 ${location} | 💰 ${salaryInfo}
          </p>
          
          ${job.qualification ? `<p style="margin: 4px 0; color: #6b7280; font-size: 14px;">🎓 ${job.qualification}</p>` : ''}
          
          ${job.lastDate ? `<p style="margin: 4px 0; color: #dc2626; font-size: 14px; font-weight: bold;">⏰ Last Date: ${new Date(job.lastDate).toLocaleDateString('en-IN')}</p>` : ''}
          
          ${job.matchReason ? `<p style="margin: 8px 0 4px 0; color: #374151; font-size: 13px; font-style: italic;">${job.matchReason}</p>` : ''}
          
          <a href="${applyLink}" target="_blank" 
             style="display: inline-block; margin-top: 12px; padding: 8px 16px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            View & Apply →
          </a>
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 20px 0;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px; text-align: center;">
                    <h1 style="margin: 0; color: white; font-size: 28px;">🎯 Margdarshak AI</h1>
                    <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Your Personal Career Guidance Platform</p>
                  </td>
                </tr>
                
                <!-- Greeting -->
                <tr>
                  <td style="padding: 32px 32px 16px 32px;">
                    <h2 style="margin: 0 0 8px 0; color: #111827;">Hello ${userName || 'User'}! 👋</h2>
                    <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                      Great news! We found <strong style="color: #3b82f6;">${jobs.length} new jobs</strong> that match your skills and preferences.
                    </p>
                  </td>
                </tr>
                
                <!-- Jobs List -->
                <tr>
                  <td style="padding: 16px 32px 32px 32px;">
                    ${jobsHtml}
                  </td>
                </tr>
                
                <!-- CTA -->
                <tr>
                  <td style="padding: 0 32px 32px 32px; text-align: center;">
                    <a href="http://localhost:5173/jobs" target="_blank"
                       style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      View All Jobs on Margdarshak AI
                    </a>
                  </td>
                </tr>
                
                <!-- Tips -->
                <tr>
                  <td style="padding: 0 32px 32px 32px; background-color: #fef3c7; border-radius: 8px; margin: 0 32px;">
                    <h3 style="margin: 16px 0 8px 0; color: #92400e;">💡 Pro Tips:</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #78350f; line-height: 1.8;">
                      <li>Update your profile skills to get better job matches</li>
                      <li>Apply to jobs before their deadline</li>
                      <li>Keep your resume updated and ready</li>
                      <li>Check new jobs daily for the best opportunities</li>
                    </ul>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 32px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                      You're receiving this email because you subscribed to job alerts on Margdarshak AI
                    </p>
                    <p style="margin: 0 0 16px 0; color: #9ca3af; font-size: 12px;">
                      To unsubscribe or update preferences, visit your profile settings
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      © 2024 Margdarshak AI. Empowering rural students with career guidance.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Send test email
   */
  async sendTestEmail(to) {
    if (!this.transporter) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: `"Margdarshak AI" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: 'Test Email - Margdarshak AI',
        html: '<h1>Test Email</h1><p>If you received this, email service is working correctly!</p>',
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true, message: 'Test email sent successfully' };
    } catch (error) {
      logger.error(`Failed to send test email: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Check if email service is configured
   */
  isConfigured() {
    return this.transporter !== null;
  }
}

module.exports = new EmailService();
