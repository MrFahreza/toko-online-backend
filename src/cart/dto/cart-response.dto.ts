// Merupakan DTO respon untuk data cart
import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { CartEntity } from '../entities/cart.entity';

export class CartResponseDto extends ApiResponseDto<CartEntity> {
  @ApiProperty({ type: CartEntity })
  data: CartEntity;
}