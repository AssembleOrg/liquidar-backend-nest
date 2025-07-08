import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

@Injectable()
export class VerificationService {
  constructor(private jwtService: JwtService) {}

  generateVerificationToken(userId: number, email: string): string {
    const payload = {
      sub: userId,
      email: email,
      type: 'email_verification',
    };

    return this.jwtService.sign(payload, { expiresIn: '24h' });
  }

  generateRandomToken(): string {
    return randomBytes(32).toString('hex');
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      
      if (payload.type !== 'email_verification') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new Error('Invalid or expired verification token');
    }
  }
} 