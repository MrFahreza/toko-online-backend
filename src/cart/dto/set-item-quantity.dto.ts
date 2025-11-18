// Merupakan DTO untuk 'set' kuantitas item
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class SetItemQuantityDto {
  @ApiProperty({
    description: 'Jumlah total baru untuk item ini',
    example: 3,
  })
  @IsInt()
  @Min(0)
  quantity: number;
}