import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

// Shape dari objek "data" di dalam respon login
class LoginData {
  @ApiProperty()
  access_token: string;

  @ApiProperty({
    example: {
      id: 'uuid-user-123',
      email: 'pembeli@example.com',
      name: 'User Pembeli',
      role: 'PEMBELI',
    },
  })
  user: object;
}

// DTO respon lengkap yang dilihat Swagger
export class LoginResponseDto extends ApiResponseDto<LoginData> {
  @ApiProperty({ type: LoginData })
  data: LoginData;
}