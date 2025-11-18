// Merupakan "entity" DTO untuk merepresentasikan OrderItem
import { ApiProperty } from '@nestjs/swagger';
import { ProductEntity } from 'src/products/dto/product.entity';

export class OrderItemEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ description: 'Harga snapshot produk saat checkout' })
  price: number;

  @ApiProperty({ type: () => ProductEntity })
  product: ProductEntity;
}