// Merupakan DTO respon untuk daftar (array) produk
import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { ProductEntity } from './product.entity';

export class ProductListResponseDto extends ApiResponseDto<ProductEntity[]> {
  @ApiProperty({ type: [ProductEntity] })
  data: ProductEntity[];
}