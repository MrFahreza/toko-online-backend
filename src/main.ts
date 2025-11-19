import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import helmet from 'helmet';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aktifkan Helmet
  app.use(helmet());

  // Batasi ukuran payload (Mencegah DoS via upload file raksasa)
  app.use(json({ limit: '10mb' })); // Membatasi JSON body
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Menambahkan CORS
  app.enableCors();

  // Mengaktifkan validasi DTO secara global
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Interceptor untuk response
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Konfigurasi Swagger
  const config = new DocumentBuilder()
    .setTitle('Toko Online API')
    .setDescription('Dokumentasi API untuk Test Project Toko Online')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger docs available at: ${await app.getUrl()}/docs`);
}
bootstrap();