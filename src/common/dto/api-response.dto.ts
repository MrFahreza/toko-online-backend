import { ApiProperty } from '@nestjs/swagger';

// DTO dasar yang akan di-extend oleh DTO respon lainnya
export class ApiResponseDto<T> {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Success' })
  message: string;
}