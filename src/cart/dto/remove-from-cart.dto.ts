// Merupakan DTO untuk menghapus item dari cart
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class RemoveFromCartDto {
  @ApiProperty({ description: 'ID dari CartItem (bukan ProductID)' })
  @IsNotEmpty()
  @IsUUID()
  cartItemId: string;
}