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
  findAll(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('stringFilters') stringFilters: string,
    @Query('numericFilters') numericFilters: string
  ) {
    console.log(
      'filters',
      stringFilters,
      typeof stringFilters,
      numericFilters,
      typeof numericFilters
    );
    let parsedStringFilters, parsedNumericFilters;
    if (stringFilters && stringFilters !== 'undefined') {
      parsedStringFilters = JSON.parse(stringFilters);
    }
    if (numericFilters && numericFilters !== 'undefined') {
      parsedNumericFilters = JSON.parse(numericFilters);
    }

    return this.paymentService.getAllPayments({
      limit,
      offset,
      stringFilters: parsedStringFilters,
      numericFilters: parsedNumericFilters,
    });
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
