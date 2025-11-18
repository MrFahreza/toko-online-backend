// Merupakan DTO respon untuk daftar (array) order
import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { OrderEntity } from '../entities/order.entity';

export class OrderListResponseDto extends ApiResponseDto<OrderEntity[]> {
  @ApiProperty({ type: [OrderEntity] })
  data: OrderEntity[];
}