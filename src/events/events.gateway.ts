// src/events/events.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Gateway ini akan berjalan di port terpisah (misal 8080) atau terintegrasi
@WebSocketGateway({
  cors: {
    origin: '*', // Izinkan koneksi dari mana saja (sesuaikan di production)
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Method ini akan kita panggil dari OrdersService
  sendToUser(userId: string, event: string, data: any) {
    this.logger.log(`Emitting event '${event}' to room 'user_${userId}'`);
    this.server.to(`user_${userId}`).emit(event, data);
  }

  // Method ini akan kita panggil dari OrdersService
  sendToRole(role: string, event: string, data: any) {
    this.logger.log(`Emitting event '${event}' to room 'role_${role}'`);
    this.server.to(`role_${role}`).emit(event, data);
  }

  // Berjalan saat server WebSocket startup
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  // Berjalan saat client (Flutter) mencoba terhubung
  handleConnection(client: Socket, ...args: any[]) {
    try {
      const token = client.handshake.query.token as string;
      if (!token) {
        throw new Error('No token provided');
      }

      // 1. Autentikasi koneksi WebSocket
      const payload = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
      });

      const userId = payload.sub;
      const userRole = payload.role;

      // 2. Masukkan user ke "Room" pribadi mereka
      // Ini agar kita bisa kirim notif status order HANYA ke dia
      client.join(`user_${userId}`);

      // 3. Masukkan user ke "Room" rolenya
      // Ini agar kita bisa kirim notif "Tugas Baru!" ke semua CS1
      client.join(`role_${userRole}`);

      this.logger.log(`Client connected: ${client.id} (User: ${userId}, Role: ${userRole})`);
    } catch (e) {
      // Jika token tidak valid, tolak koneksi
      this.logger.error(`Connection failed: ${e.message}`);
      client.disconnect();
    }
  }

  // Berjalan saat client terputus
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
}