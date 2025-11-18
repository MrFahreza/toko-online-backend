// Merupakan DTO untuk CS2 update status
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({
    enum: [OrderStatus.SEDANG_DIPROSES, OrderStatus.DIKIRIM, OrderStatus.SELESAI],
    example: OrderStatus.SEDANG_DIPROSES,
  })
  @IsNotEmpty()
  @IsEnum([OrderStatus.SEDANG_DIPROSES, OrderStatus.DIKIRIM, OrderStatus.SELESAI])
  status: OrderStatus;
}