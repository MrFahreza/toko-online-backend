import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { type Order, OrderStatus, Prisma, Role, type User } from '@prisma/client';
import { CheckoutDto } from './dto/checkout.dto';
import { UploadProofDto } from './dto/upload-proof.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventsGateway } from '../events/events.gateway';

// Merupakan konstanta untuk query data order lengkap
const fullOrderInclude = {
  items: {
    include: {
      product: true,
    },
  },
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  // --- LOGIKA NOTIFIKASI WEBSOCKET ---
  // Merupakan helper untuk mengirim notifikasi WebSocket
  private notifyStatusChange(order: Order) {
    // Kirim notifikasi ke Pembeli (via room pribadi 'user_[id]')
    this.eventsGateway.sendToUser(order.buyerId, 'status_update', order);
    this.logger.log(`Notif terkirim ke User: ${order.buyerId}`);

    // Kirim notifikasi ke Role CS terkait (via room role 'role_[roleName]')
    let targetRole: Role | null = null;
    if (order.status === OrderStatus.MENUNGGU_VERIFIKASI_CS1) {
      targetRole = Role.CS1;
    } else if (order.status === OrderStatus.MENUNGGU_DIPROSES_CS2) {
      targetRole = Role.CS2;
    }

    if (targetRole) {
      this.eventsGateway.sendToRole(targetRole, 'new_task', order);
      this.logger.log(`Notif terkirim ke Role: ${targetRole}`);
    }
  }

  // --- LOGIKA CRON JOB (IMPROVEMENT) ---
  // Merupakan cron job untuk auto-cancel pesanan yang kedaluwarsa
  @Cron(CronExpression.EVERY_5_MINUTES) // Berjalan setiap 5 menit
  async handleAutoCancel() {
    this.logger.log('CRON: Menjalankan job auto-cancel...');

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const ordersToCancel = await this.prisma.order.findMany({
      where: {
        OR: [
          {
            status: OrderStatus.MENUNGGU_UPLOAD_BUKTI,
            createdAt: { lt: twentyFourHoursAgo }, // Cek dari waktu order dibuat
          },
          {
            status: OrderStatus.MENUNGGU_VERIFIKASI_CS1,
            updatedAt: { lt: twentyFourHoursAgo }, // Cek dari waktu bukti di-upload
          },
        ],
      },
      select: { id: true, buyerId: true },
    });

    if (ordersToCancel.length === 0) {
      this.logger.log('CRON: Tidak ada pesanan untuk dibatalkan otomatis.');
      return;
    }

    const orderIds = ordersToCancel.map((o) => o.id);

    await this.prisma.order.updateMany({
      where: {
        id: { in: orderIds },
      },
      data: {
        status: OrderStatus.DIBATALKAN,
      },
    });

    this.logger.log(`CRON: Berhasil auto-cancel ${ordersToCancel.length} pesanan.`);

    for (const order of ordersToCancel) {
      this.eventsGateway.sendToUser(order.buyerId, 'status_update', {
        id: order.id,
        status: OrderStatus.DIBATALKAN,
        message: 'Pesanan Anda dibatalkan otomatis setelah 24 jam.',
      });
    }
  }

  // --- LOGIKA UNTUK PEMBELI ---
  // Merupakan logika checkout dari keranjang (Pembeli)
  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Keranjang Anda kosong');
    }

    let totalPrice = 0;
    const orderItemsData = cart.items.map((item) => {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `Stok untuk ${item.product.name} tidak mencukupi`,
        );
      }
      totalPrice += item.product.price * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      };
    });

    try {
      const newOrder = await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            buyerId: userId,
            status: OrderStatus.MENUNGGU_UPLOAD_BUKTI,
            totalPrice: totalPrice,
            ...dto,
            items: {
              create: orderItemsData,
            },
          },
          include: fullOrderInclude,
        });

        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        return order;
      });

      return newOrder;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Checkout gagal, stok mungkin berubah');
    }
  }

  // Merupakan logika upload bukti bayar (Pembeli)
  async uploadProof(orderId: string, userId: string, dto: UploadProofDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, buyerId: userId },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    if (order.status !== OrderStatus.MENUNGGU_UPLOAD_BUKTI) {
      throw new ForbiddenException('Hanya bisa upload bukti untuk pesanan baru');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentProofUrl: dto.paymentProofUrl,
        status: OrderStatus.MENUNGGU_VERIFIKASI_CS1,
      },
      include: fullOrderInclude,
    });

    // Kirim notifikasi ke CS1
    this.notifyStatusChange(updatedOrder);
    return updatedOrder;
  }

  // Merupakan logika mendapatkan riwayat pesanan (Pembeli)
  async getOrderHistory(userId: string) {
    return this.prisma.order.findMany({
      where: { buyerId: userId },
      include: fullOrderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Merupakan logika untuk pembeli menandai pesanan selesai
  async completeOrderByBuyer(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        buyerId: userId,
      },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan atau bukan milik Anda');
    }

    if (order.status !== OrderStatus.DIKIRIM) {
      throw new BadRequestException(
        'Hanya pesanan yang sedang DIKIRIM yang dapat diselesaikan',
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.SELESAI },
      include: fullOrderInclude,
    });

    this.notifyStatusChange(updatedOrder);
    return updatedOrder;
  }

  // --- LOGIKA UNTUK CS LAYER 1 ---
  // Merupakan logika mendapatkan list verifikasi (CS1)
  async getPendingVerification() {
    return this.prisma.order.findMany({
      where: { status: OrderStatus.MENUNGGU_VERIFIKASI_CS1 },
      include: fullOrderInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  // Merupakan logika menyetujui pembayaran (CS1)
  async approvePayment(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.status !== OrderStatus.MENUNGGU_VERIFIKASI_CS1) {
      throw new NotFoundException('Pesanan tidak valid untuk disetujui');
    }

    // Transaksi untuk update status DAN kurangi stok
    try {
      const updatedOrder = await this.prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product) {
            throw new BadRequestException(
              `Produk "${item.productId}" yang ada di pesanan tidak lagi ditemukan di database.`,
            );
          }

          if (product.stock < item.quantity) {
            throw new BadRequestException(
              `Stok ${product.name} tidak cukup (sisa ${product.stock}, butuh ${item.quantity})`,
            );
          }
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        return tx.order.update({
          where: { id: orderId },
          data: { status: OrderStatus.MENUNGGU_DIPROSES_CS2 },
          include: fullOrderInclude,
        });
      });

      // Kirim notifikasi ke Pembeli dan CS2
      this.notifyStatusChange(updatedOrder);
      return updatedOrder;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Gagal menyetujui, stok mungkin habis');
    }
  }

  // Merupakan logika menolak pembayaran (CS1)
  async rejectPayment(orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        status: OrderStatus.MENUNGGU_VERIFIKASI_CS1,
      },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak valid untuk ditolak');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.DIBATALKAN },
      include: fullOrderInclude,
    });

    this.notifyStatusChange(updatedOrder);
    return updatedOrder;
  }

  // --- LOGIKA UNTUK CS LAYER 2 ---
  // Merupakan logika mendapatkan list proses (CS2)
  async getPendingProcessing() {
    return this.prisma.order.findMany({
      where: { status: OrderStatus.MENUNGGU_DIPROSES_CS2 },
      include: fullOrderInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  // Merupakan logika update status pesanan (CS2)
  async updateOrderStatus(orderId: string, dto: UpdateStatusDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }

    // Logika validasi alur status
    const allowedStatuses: OrderStatus[] = [
      OrderStatus.MENUNGGU_DIPROSES_CS2,
      OrderStatus.SEDANG_DIPROSES,
      OrderStatus.DIKIRIM,
    ];
    if (!allowedStatuses.includes(order.status)) {
      throw new BadRequestException(`Pesanan ini tidak dapat diupdate statusnya`);
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
      include: fullOrderInclude,
    });

    // Kirim notifikasi ke Pembeli
    this.notifyStatusChange(updatedOrder);
    return updatedOrder;
  }

  // --- LOGIKA UMUM ---
  // Merupakan logika mendapatkan detail pesanan (Semua Role)
  async getOrderDetails(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: fullOrderInclude,
    });

    if (!order) {
      throw new NotFoundException('Pesanan tidak ditemukan');
    }
    return order;
  }
}