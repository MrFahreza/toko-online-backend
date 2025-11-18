// Merupakan DTO untuk membuat produk baru
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Kemeja Lengan Panjang' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ required: false, example: 'https://.../image.png' })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}