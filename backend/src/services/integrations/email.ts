import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private fromAddress: string | null = null;
  private enabled = false;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const secure = process.env.SMTP_SECURE === 'true';
    const from = process.env.SMTP_FROM || user;

    if (host && port && user && pass && from) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });
      this.fromAddress = from;
      this.enabled = true;
    } else {
      console.warn('📧 SMTP settings incomplete. Email notifications disabled.');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter || !this.fromAddress) {
      return;
    }

    const to = Array.isArray(options.to) ? options.to.join(',') : options.to;

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    } catch (error) {
      console.error('Email send failure:', error);
    }
  }

  async sendNewLeadNotification(lead: {
    email: string;
    first_name?: string;
    last_name?: string;
    company?: string;
    phone?: string;
    notes?: string;
    score?: number;
  }): Promise<void> {
    if (!this.enabled) return;
    const toAddress = process.env.NOTIFY_LEADS_TO || this.fromAddress!;

    const name = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'New lead';
    const subject = `📥 New Lead: ${name}`;

    const html = `
      <h2>New Lead Captured</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${lead.email}</p>
      <p><strong>Company:</strong> ${lead.company || 'N/A'}</p>
      <p><strong>Phone:</strong> ${lead.phone || 'N/A'}</p>
      <p><strong>Score:</strong> ${lead.score ?? 'Not scored yet'}</p>
      <p><strong>Notes:</strong><br/>${lead.notes || 'None'}</p>
    `;

    await this.sendEmail({
      to: toAddress,
      subject,
      html,
      text: `
New lead captured:
Name: ${name}
Email: ${lead.email}
Company: ${lead.company || 'N/A'}
Phone: ${lead.phone || 'N/A'}
Score: ${lead.score ?? 'Not scored yet'}
Notes: ${lead.notes || 'None'}
      `,
    });
  }

  async sendNewApplicationNotification(application: {
    job_title: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    score?: number;
  }): Promise<void> {
    if (!this.enabled) return;

    const toAddress = process.env.NOTIFY_APPLICATIONS_TO || this.fromAddress!;
    const subject = `🧾 New Application for ${application.job_title}`;

    const html = `
      <h2>New Job Application</h2>
      <p><strong>Job:</strong> ${application.job_title}</p>
      <p><strong>Name:</strong> ${application.first_name} ${application.last_name}</p>
      <p><strong>Email:</strong> ${application.email}</p>
      <p><strong>Phone:</strong> ${application.phone || 'N/A'}</p>
      <p><strong>Score:</strong> ${application.score ?? 'Not scored yet'}</p>
    `;

    await this.sendEmail({
      to: toAddress,
      subject,
      html,
      text: `
New job application:
Job: ${application.job_title}
Name: ${application.first_name} ${application.last_name}
Email: ${application.email}
Phone: ${application.phone || 'N/A'}
Score: ${application.score ?? 'Not scored yet'}
      `,
    });
  }
}

export const emailService = new EmailService();





