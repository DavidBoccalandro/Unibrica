import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReversalService } from '../services/reversal.service';
import { ReversalRecord } from '../entities/reversal.entity';
import { UpdateReversalDto } from '../dto/updateReversalDto';

@Controller('reversal')
export class ReversalController {
  constructor(private readonly reversalService: ReversalService) {}

  // Subir un archivo de reversión
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadReversal(@UploadedFile() file: Express.Multer.File): Promise<ReversalRecord[]> {
    return this.reversalService.uploadReversalSheet(file);
  }

  // Obtener todos los registros de reversión
  @Get()
  async findAll(): Promise<ReversalRecord[]> {
    return this.reversalService.findAll();
  }

  // Obtener un registro de reversión por ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ReversalRecord> {
    return this.reversalService.findOne(id);
  }

  @Get('sheet/:id')
  async findBySheet(@Param('id') id: string): Promise<ReversalRecord[]> {
    return this.reversalService.findBySheet(id);
  }

  // Actualizar un registro de reversión por ID
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReversalDto: UpdateReversalDto
  ): Promise<ReversalRecord> {
    return this.reversalService.update(id, updateReversalDto);
  }

  // Eliminar un registro de reversión por ID
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.reversalService.remove(+id);
  }
}
