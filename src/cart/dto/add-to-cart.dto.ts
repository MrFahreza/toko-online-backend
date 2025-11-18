// Merupakan DTO untuk menambah/update item di cart
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsUUID, Min, NotEquals } from 'class-validator';

export class AddToCartDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Jumlah (bisa positif/negatif, tapi bukan 0)',
    example: 1,
  })
  @IsInt()
  @NotEquals(0)
  quantity: number;
}