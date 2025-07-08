import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BillItemService } from './services/bill-item.service';
import { CreateBillItemDto, UpdateBillItemDto } from '@shared/dto';

@Controller()
export class BillItemController {
  constructor(private readonly billItemService: BillItemService) {}

  @MessagePattern('bill-item.create')
  async create(@Payload() createBillItemDto: CreateBillItemDto) {
    try {
      return this.billItemService.create(createBillItemDto);
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Error al crear un nuevo Facturador',
        code: error.status || 400
      };
    }
  }

  @MessagePattern('bill-item.findAll')
  async findAll() {
    return this.billItemService.findAll();
  }

  @MessagePattern('bill-item.findByUserId')
  async findByUserId(@Payload() userId: string) {
    try {
      return this.billItemService.findByUserId(userId);
    } catch (error) {
      return {
        status: 'error',
        message: error.message || 'Error al obtener los Facturadores. Volve a Iniciar Sesión.',
        code: error.status || 400
      };
    }
  }

  @MessagePattern('bill-item.findOne')
  async findOne(@Payload() id: string) {
    return this.billItemService.findOne(id);
  }

  @MessagePattern('bill-item.update')
  async update(@Payload() data: { id: string; updateBillItemDto: UpdateBillItemDto }) {
    return this.billItemService.update(data.id, data.updateBillItemDto);
  }

  @MessagePattern('bill-item.remove')
  async remove(@Payload() id: string) {
    return this.billItemService.remove(id);
  }

  @MessagePattern('bill-item.getBillItems')
  async getBillItems(@Payload() userId: string) {
    return this.billItemService.getBillItems(userId);
  }
} 