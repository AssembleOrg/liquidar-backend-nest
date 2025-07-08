import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  brevoApiKey: process.env.BREVO_API_KEY || '',
  fromEmail: process.env.FROM_EMAIL || 'noreply@liquidar.com',
  fromName: process.env.FROM_NAME || 'Liquidar',
  verificationUrl: process.env.VERIFICATION_URL || 'http://localhost:3000/api/verify',
})); 