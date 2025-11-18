// Merupakan "entity" DTO untuk merepresentasikan Order
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, Role } from '@prisma/client';
import { OrderItemEntity } from './order-item.entity';

export class OrderEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.MENUNGGU_UPLOAD_BUKTI })
  status: OrderStatus;

  @ApiProperty()
  buyerName: string;

  @ApiProperty()
  buyerPhone: string;

  @ApiProperty()
  buyerAddress: string;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty({ nullable: true })
  paymentProofUrl: string | null;

  @ApiProperty()
  buyerId: string;

  @ApiProperty({ type: [OrderItemEntity] })
  items: OrderItemEntity[];
}