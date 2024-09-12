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
  async uploadPaymentSheet(
    @UploadedFile() file: Express.Multer.File,
    @Body('clientId') clientId: string,
    @Body('clientName') clientName: string
  ): Promise<any> {
    const paymentRecords = await this.paymentService.uploadPaymentSheet(file, clientId, clientName);
    return { message: 'File processed and Excel file created.' };
  }

  @Get()
  findAll(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('stringFilters') stringFilters: string,
    @Query('numericFilters') numericFilters: string,
    @Query('dateFilters') dateFilters: string
  ) {
    console.log(
      'filters',
      stringFilters,
      typeof stringFilters,
      numericFilters,
      typeof numericFilters
    );
    let parsedStringFilters, parsedNumericFilters, parsedDateFilters;
    if (stringFilters && stringFilters !== 'undefined') {
      parsedStringFilters = JSON.parse(stringFilters);
    }
    if (numericFilters && numericFilters !== 'undefined') {
      parsedNumericFilters = JSON.parse(numericFilters);
    }
    if (dateFilters && dateFilters !== 'undefined') {
      parsedDateFilters = JSON.parse(dateFilters);
    }

    return this.paymentService.getAllPayments({
      limit,
      offset,
      stringFilters: parsedStringFilters,
      numericFilters: parsedNumericFilters,
      dateFilters: parsedDateFilters,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PaymentRecord> {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<PaymentRecord>
  ): Promise<PaymentRecord> {
    return this.paymentService.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.paymentService.remove(id);
  }
}
