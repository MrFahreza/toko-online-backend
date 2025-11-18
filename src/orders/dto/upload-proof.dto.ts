// Merupakan DTO untuk upload bukti bayar
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class UploadProofDto {
  @ApiProperty({
    description: 'URL gambar dari Supabase Storage',
    example: 'https://.../storage/v1/object/public/bukti-pembayaran/file.png',
  })
  @IsUrl()
  @IsNotEmpty()
  paymentProofUrl: string;
}