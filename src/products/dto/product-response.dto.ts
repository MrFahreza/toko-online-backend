// Merupakan DTO respon untuk satu produk
import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { ProductEntity } from './product.entity';

export class ProductResponseDto extends ApiResponseDto<ProductEntity> {
  @ApiProperty({ type: ProductEntity })
  data: ProductEntity;
}