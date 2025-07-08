import { Injectable, Inject, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LoginDto, RegisterDto, GoogleLoginDto } from '@shared/dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    ) { }

    private handleMicroserviceResponse(response: any, operation: string) {
        // Check if the response is an error object from the microservice
        if (response && typeof response === 'object' && response.status === 'error') {
            const errorMessage = response.message || `${operation} failed`;
            const errorCode = response.code || 400;
            
            // Map specific error messages to appropriate exceptions
            if (errorMessage === 'Invalid credentials') {
                throw new UnauthorizedException('Invalid credentials');
            }
            if (errorMessage === 'User account is not verified') {
                throw new UnauthorizedException('User account is not verified');
            }
            if (errorMessage === 'User account is deactivated') {
                throw new UnauthorizedException('User account is deactivated');
            }
            
            // Map error codes to appropriate exceptions
            if (errorCode === 401) {
                throw new UnauthorizedException(errorMessage);
            }
            if (errorCode === 409) {
                throw new ConflictException(errorMessage);
            }
            
            throw new BadRequestException(errorMessage);
        }
        
        return response;
    }

    private handleMicroserviceError(error: any, operation: string) {
        this.logger.error(`${operation} error:`, error);
        
        // Check if the error is an error object from the microservice
        if (error && typeof error === 'object' && error.status === 'error') {
            const errorMessage = error.message || `${operation} failed`;
            const errorCode = error.code || 400;
            
            // Map specific error messages to appropriate exceptions
            if (errorMessage === 'Invalid credentials') {
                throw new UnauthorizedException('Invalid credentials');
            }
            if (errorMessage === 'User account is not verified') {
                throw new UnauthorizedException('User account is not verified');
            }
            if (errorMessage === 'User account is deactivated') {
                throw new UnauthorizedException('User account is deactivated');
            }
            
            // Map error codes to appropriate exceptions
            if (errorCode === 401) {
                throw new UnauthorizedException(errorMessage);
            }
            if (errorCode === 409) {
                throw new ConflictException(errorMessage);
            }
            
            throw new BadRequestException(errorMessage);
        }
        
        // Fallback for other error types
        const errorMessage = error.message || error?.message || `${operation} failed`;
        throw new BadRequestException(errorMessage);
    }

    async register(registerDto: RegisterDto) {
        return firstValueFrom(
            this.authClient.send('auth.register', registerDto).pipe(
                catchError((error) => {
                    this.handleMicroserviceError(error, 'Registration');
                    throw error; // Re-throw to maintain the error flow
                })
            )
        ).then((response) => this.handleMicroserviceResponse(response, 'Registration'));
    }

        async login(loginDto: LoginDto) {
        return firstValueFrom(
            this.authClient.send('auth.login', loginDto).pipe(
                catchError((error) => {
                    this.handleMicroserviceError(error, 'Login');
                    throw error;
                })
            )
        ).then((response) => this.handleMicroserviceResponse(response, 'Login'));
    }

    async validateToken(token: string) {
        return firstValueFrom(
            this.authClient.send('auth.validate', token).pipe(
                catchError((error) => {
                    this.handleMicroserviceError(error, 'Token validation');
                    throw error;
                })
            )
        ).then((response) => this.handleMicroserviceResponse(response, 'Token validation'));
    }

    async verifyEmail(token: string) {
        return firstValueFrom(
            this.authClient.send('auth.verify-email', token).pipe(
                catchError((error) => {
                    this.handleMicroserviceError(error, 'Email verification');
                    throw error;
                })
            )
        ).then((response) => this.handleMicroserviceResponse(response, 'Email verification'));
    }

    async resendVerificationEmail(email: string) {
        return firstValueFrom(
            this.authClient.send('auth.resend-verification', email).pipe(
                catchError((error) => {
                    this.handleMicroserviceError(error, 'Resend verification');
                    throw error;
                })
            )
        ).then((response) => this.handleMicroserviceResponse(response, 'Resend verification'));
    }

    async googleLogin(googleLoginDto: GoogleLoginDto) {
        console.log('Google login DTO:', googleLoginDto);
        return firstValueFrom(
            this.authClient.send('auth.google-login', googleLoginDto).pipe(
                catchError((error) => {
                    this.handleMicroserviceError(error, 'Google login');
                    throw error;
                })
            )
        ).then((response) => this.handleMicroserviceResponse(response, 'Google login'));
    }
} 