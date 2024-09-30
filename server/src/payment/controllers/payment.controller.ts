import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  UseInterceptors,
  Query,
  UploadedFiles,
} from '@nestjs/common';
import { PaymentRecord } from '../entities/payment.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PaymentService } from '../services/payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadReversal(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('clientId') agreementNumber: string
  ): Promise<any> {
    const [file, optionalFile] = files;
    await this.paymentService.uploadPaymentSheet(file, agreementNumber, optionalFile);

    return { message: 'Files processed and Excel file created.' };
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
