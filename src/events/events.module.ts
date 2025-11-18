// src/events/events.module.ts
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [JwtModule, ConfigModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}