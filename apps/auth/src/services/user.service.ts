import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async addBillItemToUser(userId: string, billId: string) {
    try {
      this.logger.log(`Intentando agregar billItem ${billId} al usuario ${userId}`);
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        this.logger.error(`Usuario no encontrado: ${userId}`);
        throw new NotFoundException('User not found');
      }
      user.billItems = [...(user.billItems || []), billId];
      const updated = await this.userRepository.save(user);
      this.logger.log(`BillItem agregado correctamente al usuario ${userId}`);
      return { success: true, user: updated };
    } catch (error) {
      this.logger.error(`Error agregando billItem al usuario: ${error.message}`, error.stack);
      return { status: 'error', message: error.message || error.toString() };
    }
  }
}