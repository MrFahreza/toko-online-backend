// Merupakan DTO untuk checkout (mengisi data pembeli)
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ example: 'Reza' })
  @IsString()
  @IsNotEmpty()
  buyerName: string;

  @ApiProperty({ example: '081234567890' })
  @IsPhoneNumber('ID') // Validasi nomor HP Indonesia
  @IsNotEmpty()
  buyerPhone: string;

  @ApiProperty({ example: 'Jl. Merdeka No. 10, Bandung' })
  @IsString()
  @IsNotEmpty()
  buyerAddress: string;
}