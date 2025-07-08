import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class HttpService {
  private readonly logger = new Logger(HttpService.name);
  private readonly axiosInstance: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.axiosInstance = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.log(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.log(`Response received: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        this.logger.error('Response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
} 