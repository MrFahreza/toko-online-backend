// Merupakan DTO respon untuk satu order
import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { OrderEntity } from '../entities/order.entity';

export class OrderResponseDto extends ApiResponseDto<OrderEntity> {
  @ApiProperty({ type: OrderEntity })
  data: OrderEntity;
}