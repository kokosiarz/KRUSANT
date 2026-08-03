import { Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

export interface MailResult {
  sent: boolean;
  /** Why the send failed, safe to show an admin. Absent when `sent` is true. */
  error?: string;
}

export interface AccountCreatedMail {
  email: string;
  name?: string | null;
  tempPassword: string;
  expiresAt: Date;
}

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Europe/Warsaw',
});

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  /**
   * SMTP is optional: without it the app still runs and account creation still
   * works — the admin just has to pass the temporary password on by hand (the
   * Users page shows it when a send fails).
   */
  isConfigured(): boolean {
    return Boolean(process.env.MAIL_HOST && process.env.MAIL_FROM);
  }

  private getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT ?? 587),
        // Implicit TLS on 465; everything else upgrades via STARTTLS.
        secure: process.env.MAIL_SECURE
          ? process.env.MAIL_SECURE === 'true'
          : Number(process.env.MAIL_PORT ?? 587) === 465,
        auth: process.env.MAIL_USER
          ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
          : undefined,
      });
    }
    return this.transporter;
  }

  /**
   * Never throws and never logs the password itself — a failure here must not
   * roll back an account that was already created, it just means the admin
   * delivers the password another way.
   */
  async sendAccountCreated(mail: AccountCreatedMail): Promise<MailResult> {
    if (!this.isConfigured()) {
      this.logger.warn(
        `SMTP not configured (MAIL_HOST/MAIL_FROM); no email sent to ${mail.email}`,
      );
      return { sent: false, error: 'Serwer poczty nie jest skonfigurowany.' };
    }

    try {
      await this.getTransporter().sendMail({
        from: process.env.MAIL_FROM,
        to: mail.email,
        subject: 'Twoje konto w systemie KRUSANT',
        text: this.accountCreatedText(mail),
        html: this.accountCreatedHtml(mail),
      });
      this.logger.log(`Account-created email sent to ${mail.email}`);
      return { sent: true };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send account-created email to ${mail.email}: ${reason}`,
      );
      return { sent: false, error: reason };
    }
  }

  private loginUrl(): string {
    return process.env.FRONTEND_URL || 'http://localhost:3001';
  }

  private accountCreatedText({
    name,
    tempPassword,
    expiresAt,
  }: AccountCreatedMail): string {
    return [
      `Witaj${name ? ` ${name}` : ''},`,
      '',
      'Administrator utworzył dla Ciebie konto w systemie KRUSANT.',
      '',
      `Hasło tymczasowe: ${tempPassword}`,
      `Ważne do: ${dateFormatter.format(expiresAt)}`,
      '',
      'Zaloguj się i ustaw własne hasło przed upływem tego terminu.',
      'Po tym czasie hasło tymczasowe przestanie działać i trzeba będzie',
      'poprosić administratora o nowe.',
      '',
      this.loginUrl(),
      '',
      'Jeśli nie spodziewałeś się tej wiadomości, zignoruj ją.',
    ].join('\n');
  }

  private accountCreatedHtml({
    name,
    tempPassword,
    expiresAt,
  }: AccountCreatedMail): string {
    return `
<div style="font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; font-size: 15px; color: #1a1a1a; line-height: 1.55;">
  <p>Witaj${name ? ` ${escapeHtml(name)}` : ''},</p>
  <p>Administrator utworzył dla Ciebie konto w systemie <strong>KRUSANT</strong>.</p>
  <p style="margin: 24px 0; padding: 16px 20px; background: #f4f4f5; border-radius: 8px;">
    Hasło tymczasowe:<br>
    <code style="font-size: 20px; font-weight: 600; letter-spacing: 1px;">${escapeHtml(tempPassword)}</code><br>
    <span style="color: #52525b; font-size: 13px;">Ważne do: ${escapeHtml(dateFormatter.format(expiresAt))}</span>
  </p>
  <p>Zaloguj się i ustaw własne hasło przed upływem tego terminu. Po tym czasie
     hasło tymczasowe przestanie działać i trzeba będzie poprosić administratora o nowe.</p>
  <p><a href="${escapeHtml(this.loginUrl())}" style="color: #2563eb;">${escapeHtml(this.loginUrl())}</a></p>
  <p style="color: #71717a; font-size: 13px;">Jeśli nie spodziewałeś się tej wiadomości, zignoruj ją.</p>
</div>`.trim();
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
