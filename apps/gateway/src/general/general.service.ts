import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MicroserviceErrorHandler } from '@shared/common';
import { CreateBillItemDto, UpdateBillItemDto, BillItemResponseDto } from '@shared/dto';

@Injectable()
export class GeneralService {
  private readonly logger = new Logger(GeneralService.name);

  constructor(
    @Inject('GENERAL_SERVICE') private readonly generalServiceClient: ClientProxy,
    private readonly errorHandler: MicroserviceErrorHandler,
  ) { }

  async createBillItem(createBillItemDto: CreateBillItemDto): Promise<BillItemResponseDto> {
    return this.errorHandler.executeMicroserviceOperation(
      this.generalServiceClient,
      'bill-item.create',
      createBillItemDto,
      'Crear bill item'
    );
  }

  async findAllBillItems(): Promise<BillItemResponseDto[]> {
    return this.errorHandler.executeMicroserviceOperation(
      this.generalServiceClient,
      'bill-item.findAll',
      {},
      'Obtener todos los bill items'
    );
  }

  async findBillItemsByUserId(userId: string): Promise<BillItemResponseDto[]> {
    return this.errorHandler.executeMicroserviceOperation(
      this.generalServiceClient,
      'bill-item.findByUserId',
      userId,
      'Obtener bill items por usuario'
    );
  }

  async findOneBillItem(id: string): Promise<BillItemResponseDto> {
    return this.errorHandler.executeMicroserviceOperation(
      this.generalServiceClient,
      'bill-item.findOne',
      id,
      'Obtener bill item'
    );
  }

  async updateBillItem(id: string, updateBillItemDto: UpdateBillItemDto): Promise<BillItemResponseDto> {
    return this.errorHandler.executeMicroserviceOperation(
      this.generalServiceClient,
      'bill-item.update',
      { id, updateBillItemDto },
      'Actualizar bill item'
    );
  }

  async removeBillItem(id: string): Promise<void> {
    return this.errorHandler.executeMicroserviceOperation(
      this.generalServiceClient,
      'bill-item.remove',
      id,
      'Eliminar bill item'
    );
  }
} 