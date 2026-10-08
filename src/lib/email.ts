/**
 * Email sending abstraction for OTP delivery.
 * No provider is configured yet — the log driver keeps signup/verify fully
 * testable in development. Plug a real sender (Resend/SMTP) behind the
 * EmailProvider interface when ready; callers won't change.
 */

export interface EmailProvider {
  sendOtp(email: string, code: string): Promise<void>;
}

class LogEmailProvider implements EmailProvider {
  async sendOtp(email: string, code: string): Promise<void> {
    // Dev only: no email is sent. Never enable in production.
    console.log(`[email:dev] OTP for ${email}: ${code}`);
  }
}

let cached: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (cached) return cached;
  // TODO: return Resend/SMTP provider when EMAIL_* env is configured.
  cached = new LogEmailProvider();
  return cached;
}
