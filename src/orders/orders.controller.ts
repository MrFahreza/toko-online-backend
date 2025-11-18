import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Role, type User } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CheckoutDto } from './dto/checkout.dto';
import { UploadProofDto } from './dto/upload-proof.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderListResponseDto } from './dto/order-list-response.dto';

@ApiTags('4. Orders (Multi-Role)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // --- Endpoint Pembeli ---
  @Post('checkout')
  @Roles(Role.PEMBELI)
  @ApiOperation({ summary: 'Checkout keranjang (Pembeli)' })
  @ApiCreatedResponse({ type: OrderResponseDto })
  checkout(@GetUser() user: User, @Body() checkoutDto: CheckoutDto) {
    return this.ordersService.checkout(user.id, checkoutDto);
  }

  @Get('history')
  @Roles(Role.PEMBELI)
  @ApiOperation({ summary: 'Melihat riwayat pesanan (Pembeli)' })
  @ApiOkResponse({ type: OrderListResponseDto })
  getOrderHistory(@GetUser() user: User) {
    return this.ordersService.getOrderHistory(user.id);
  }

  @Patch(':id/upload-proof')
  @Roles(Role.PEMBELI)
  @ApiOperation({ summary: 'Upload bukti bayar (Pembeli)' })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'Pesanan tidak ditemukan' })
  @ApiForbiddenResponse({ description: 'Akses ditolak' })
  uploadProof(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Body() uploadProofDto: UploadProofDto,
  ) {
    return this.ordersService.uploadProof(id, user.id, uploadProofDto);
  }

  @Patch(':id/complete-by-buyer')
  @Roles(Role.PEMBELI)
  @ApiOperation({ summary: 'Menandai pesanan telah diterima (Pembeli)' })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'Pesanan tidak ditemukan' })
  @ApiForbiddenResponse({ description: 'Akses ditolak' })
  completeOrderByBuyer(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    return this.ordersService.completeOrderByBuyer(id, user.id);
  }

  // --- Endpoint CS Layer 1 ---
  @Get('pending/verification')
  @Roles(Role.CS1)
  @ApiOperation({ summary: 'List pesanan untuk verifikasi (CS1)' })
  @ApiOkResponse({ type: OrderListResponseDto })
  getPendingVerification() {
    return this.ordersService.getPendingVerification();
  }

  @Patch(':id/approve-payment')
  @Roles(Role.CS1)
  @ApiOperation({ summary: 'Menyetujui pembayaran (CS1)' })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'Pesanan tidak ditemukan' })
  approvePayment(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.approvePayment(id);
  }

  @Patch(':id/reject-payment')
  @Roles(Role.CS1)
  @ApiOperation({ summary: 'Menolak pembayaran (CS1)' })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'Pesanan tidak ditemukan' })
  rejectPayment(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.rejectPayment(id);
  }

  @Get('cs1/history')
  @Roles(Role.CS1)
  @ApiOperation({ summary: 'Melihat riwayat semua pesanan masuk (CS1)' })
  @ApiOkResponse({ type: OrderListResponseDto })
  getCs1History() {
    return this.ordersService.getCs1History();
  }

  // --- Endpoint CS Layer 2 ---
  @Get('pending/processing')
  @Roles(Role.CS2)
  @ApiOperation({ summary: 'List pesanan untuk diproses (CS2)' })
  @ApiOkResponse({ type: OrderListResponseDto })
  getPendingProcessing() {
    return this.ordersService.getPendingProcessing();
  }

  @Patch(':id/update-status')
  @Roles(Role.CS2)
  @ApiOperation({ summary: 'Update status pesanan (CS2)' })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'Pesanan tidak ditemukan' })
  updateOrderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, updateStatusDto);
  }

  @Get('cs2/history')
  @Roles(Role.CS2)
  getCs2History() {
    return this.ordersService.getCs2History();
  }

  // --- Endpoint Umum (Detail) ---
  @Get(':id')
  @Roles(Role.PEMBELI, Role.CS1, Role.CS2)
  @ApiOperation({ summary: 'Mendapatkan detail pesanan (Semua Role)' })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiNotFoundResponse({ description: 'Pesanan tidak ditemukan' })
  async getOrderDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
  ) {
    const order = await this.ordersService.getOrderDetails(id);
    if (user.role === Role.PEMBELI && order.buyerId !== user.id) {
      throw new ForbiddenException('Anda tidak memiliki akses ke pesanan ini');
    }
    return order;
  }
}