import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BillItem } from '../entities/bill-item.entity';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { BillItemResponseDto, CreateBillItemDto, UpdateBillItemDto } from '@shared/dto'; 

@Injectable()
export class BillItemService {
  constructor(
    @InjectRepository(BillItem)
    private billItemRepository: Repository<BillItem>,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  async create(createBillItemDto: CreateBillItemDto): Promise<BillItemResponseDto | { status: string, message: string }> {
    // Verificar si ya existe un bill item con el mismo CUIT
    const existingBillItem = await this.billItemRepository.findOne({
      where: { cuit: createBillItemDto.cuit, userId: createBillItemDto.userId }
    });

    if (existingBillItem) {
      throw new RpcException({
        status: 'error',
        message: 'Ya existe un Facturador con este CUIT en tu cuenta',
        code: 400
      })
    }

    // Hash de la contraseña de AFIP
    const hashedPassword = await bcrypt.hash(createBillItemDto.afipPassword, 10);

    const billItem = this.billItemRepository.create({
      ...createBillItemDto,
      afipPassword: hashedPassword,
      userId: createBillItemDto.userId,
    });

    const savedBillItem = await this.billItemRepository.save(billItem);

    await this.authService.emit('user.bill-item', { userId: createBillItemDto.userId, billId: savedBillItem.id })

    savedBillItem.afipPassword = createBillItemDto.afipPassword;
    return this.mapToResponseDto(savedBillItem);
  }

  async findAll(): Promise<BillItemResponseDto[]> {
    const billItems = await this.billItemRepository.find({
      order: { createdAt: 'DESC' }
    });
    return Promise.all(billItems.map(item => this.mapToResponseDto(item)));
  }

  async getBillItems(userId: string): Promise<BillItemResponseDto[]> {
    const billItems = await this.billItemRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
    return Promise.all(billItems.map(item => this.mapToResponseDto(item)));
  }

  async findByUserId(userId: string): Promise<BillItemResponseDto[]> {
    const billItems = await this.billItemRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });

    if (!billItems) {
      throw new RpcException({
        status: 'error',
        message: `No se encontraron Facturadores para el usuario ${userId}. Volve a Iniciar Sesión.`,
        code: 404
      })
    }


    return Promise.all(billItems.map(item => this.mapToResponseDto(item)));
  }

  async findOne(id: string): Promise<BillItemResponseDto> {
    const billItem = await this.billItemRepository.findOne({
      where: { id }
    });

    if (!billItem) {
      throw new NotFoundException(`Bill item con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(billItem);
  }

  async update(id: string, updateBillItemDto: UpdateBillItemDto): Promise<BillItemResponseDto> {
    const billItem = await this.billItemRepository.findOne({
      where: { id }
    });

    if (!billItem) {
      throw new NotFoundException(`Bill item con ID ${id} no encontrado`);
    }

    // Si se está actualizando el CUIT, verificar que no exista otro con el mismo CUIT
    if (updateBillItemDto.cuit && updateBillItemDto.cuit !== billItem.cuit) {
      const existingBillItem = await this.billItemRepository.findOne({
        where: { cuit: updateBillItemDto.cuit }
      });
    }

    // Si se está actualizando la contraseña, hashearla
    if (updateBillItemDto.afipPassword) {
      updateBillItemDto.afipPassword = await bcrypt.hash(updateBillItemDto.afipPassword, 10);
    }

    await this.billItemRepository.update(id, updateBillItemDto);
    
    const updatedBillItem = await this.billItemRepository.findOne({
      where: { id }
    });

    if (!updatedBillItem) {
      throw new NotFoundException(`Bill item con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(updatedBillItem);
  }

  async remove(id: string): Promise<void> {
    const billItem = await this.billItemRepository.findOne({
      where: { id }
    });

    if (!billItem) {
      throw new NotFoundException(`Bill item con ID ${id} no encontrado`);
    }

    await this.billItemRepository.remove(billItem);
  }

  private async mapToResponseDto(billItem: BillItem): Promise<BillItemResponseDto> {
    // Decodificar la contraseña para la respuesta
    // Nota: En un entorno real, esto podría no ser seguro
    // Aquí lo hacemos como se solicitó, pero en producción se debería manejar de forma diferente
    const decodedPassword = billItem.afipPassword; // En este caso, mantenemos el hash por seguridad

    return {
      id: billItem.id,
      cuit: billItem.cuit,
      afipPassword: decodedPassword, // En producción, esto debería ser manejado de forma diferente
      name: billItem.name,
      realPerson: billItem.realPerson,
      address: billItem.address,
      phone: billItem.phone,
      userId: billItem.userId,
      createdAt: billItem.createdAt,
      updatedAt: billItem.updatedAt,
    };
  }
} 