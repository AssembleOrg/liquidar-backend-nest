import { Injectable, Logger } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleUserInfo {
  email: string;
  firstName: string;
  lastName: string;
  googleId: string;
  picture?: string;
}

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client;
  private readonly logger = new Logger(GoogleAuthService.name);

  constructor() {
    this.client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
  }

  async verifyGoogleToken(token: string): Promise<GoogleUserInfo> {
    try {
      // Detectar si es un access token (empieza con ya29) o ID token (JWT)
      if (token.startsWith('ya29.')) {
        this.logger.log('Verificando Access Token de Google');
        return this.verifyAccessToken(token);
      } else {
        this.logger.log('Verificando ID Token de Google');
        return this.verifyIdToken(token);
      }
    } catch (error) {
      this.logger.error('Error verificando token de Google:', error);
      throw new Error('Error verificando token de Google: ' + error.message);
    }
  }

  private async verifyIdToken(token: string): Promise<GoogleUserInfo> {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Token inválido');
    }

    return {
      email: payload.email!,
      firstName: payload.given_name || '',
      lastName: payload.family_name || '',
      googleId: payload.sub,
      picture: payload.picture,
    };
  }

  private async verifyAccessToken(accessToken: string): Promise<GoogleUserInfo> {
    try {
      this.logger.log(`Llamando a Google API con access token: ${accessToken.substring(0, 20)}...`);
      
      // Usar el access token para obtener información del usuario
      const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Google API error: ${response.status} - ${errorText}`);
        throw new Error('Token de acceso inválido');
      }

      const userInfo = await response.json() as {
        email: string;
        given_name?: string;
        family_name?: string;
        id: string;
        picture?: string;
        verfied_email?: boolean;
        name?: string;
      };
      this.logger.log('Información del usuario obtenida de Google:', userInfo);

      return {
        email: userInfo.email,
        firstName: userInfo.given_name || '',
        lastName: userInfo.family_name || '',
        googleId: userInfo.id,
        picture: userInfo.picture,
      };
    } catch (error) {
      this.logger.error('Error validando access token:', error);
      throw new Error('Error validando access token: ' + error.message);
    }
  }
}
