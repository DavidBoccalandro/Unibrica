import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { PaymentRecord } from '../entities/payment.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentService } from '../services/payment.service';
import { PaginationQueryDto } from 'src/debts/controllers/debts.controller';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPaymentSheet(@UploadedFile() file: Express.Multer.File): Promise<any> {
    const paymentRecords = await this.paymentService.uploadPaymentSheet(file);
    return { message: 'File processed and Excel file created.' };
  }

  @Get()
  findAll(@Query() findAllPaymentsDto: PaginationQueryDto) {
    return this.paymentService.findAll(findAllPaymentsDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<PaymentRecord> {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateData: Partial<PaymentRecord>
  ): Promise<PaymentRecord> {
    return this.paymentService.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.paymentService.remove(id);
  }
}
