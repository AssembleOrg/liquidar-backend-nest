import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GeneralService } from './general.service';
import { BillItemResponseDto, CreateBillItemDto, UpdateBillItemDto } from '@shared/dto';

@ApiTags('General')
@Controller('general')
export class GeneralController {
  constructor(private readonly generalService: GeneralService) {}

  @Post('bill-item')
  @ApiOperation({ summary: 'Crear un nuevo bill item' })
  @ApiResponse({ 
    status: 201, 
    description: 'Bill item creado exitosamente',
    type: BillItemResponseDto 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Ya existe un bill item con este CUIT' 
  })
  async create(@Body() createBillItemDto: CreateBillItemDto): Promise<BillItemResponseDto> {
    return this.generalService.createBillItem(createBillItemDto);
  }

  @Get('bill-item')
  @ApiOperation({ summary: 'Obtener todos los bill items' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de bill items',
    type: [BillItemResponseDto] 
  })
  async findAll(): Promise<BillItemResponseDto[]> {
    return this.generalService.findAllBillItems();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener bill items por usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de bill items del usuario',
    type: [BillItemResponseDto] 
  })
  async findByUserId(@Param('userId') userId: string): Promise<BillItemResponseDto[]> {
    return this.generalService.findBillItemsByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un bill item por ID' })
  @ApiParam({ name: 'id', description: 'ID del bill item' })
  @ApiResponse({ 
    status: 200, 
    description: 'Bill item encontrado',
    type: BillItemResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Bill item no encontrado' 
  })
  async findOne(@Param('id') id: string): Promise<BillItemResponseDto> {
    return this.generalService.findOneBillItem(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un bill item' })
  @ApiParam({ name: 'id', description: 'ID del bill item' })
  @ApiResponse({ 
    status: 200, 
    description: 'Bill item actualizado exitosamente',
    type: BillItemResponseDto 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Bill item no encontrado' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Ya existe un bill item con este CUIT' 
  })
  async update(
    @Param('id') id: string,
    @Body() updateBillItemDto: UpdateBillItemDto,
  ): Promise<BillItemResponseDto> {
    return this.generalService.updateBillItem(id, updateBillItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un bill item' })
  @ApiParam({ name: 'id', description: 'ID del bill item' })
  @ApiResponse({ 
    status: 204, 
    description: 'Bill item eliminado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Bill item no encontrado' 
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.generalService.removeBillItem(id);
  }
} 