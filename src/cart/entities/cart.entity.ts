// Merupakan "entity" DTO untuk merepresentasikan data cart
import { ApiProperty } from '@nestjs/swagger';
import { ProductEntity } from 'src/products/dto/product.entity';

class CartItemEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty({ type: ProductEntity })
  product: ProductEntity;
}

export class CartEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ type: [CartItemEntity] })
  items: CartItemEntity[];

  @ApiProperty({ description: 'Total harga dari semua item di cart' })
  totalPrice: number;
}