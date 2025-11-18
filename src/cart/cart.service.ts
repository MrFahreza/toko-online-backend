import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';
import { User } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // Mendapatkan atau membuat cart untuk user
  private async getOrCreateUserCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }
    return cart;
  }

  // Mendapatkan detail isi cart user
  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { product: { name: 'asc' } },
        },
      },
    });

    // Jika user belum punya cart (misal user baru)
    if (!cart) {
      return {
        id: '',
        userId,
        items: [],
        totalPrice: 0,
      };
    }

    // Kalkulasi total harga
    const totalPrice = cart.items.reduce((total, item) => {
      return total + item.quantity * item.product.price;
    }, 0);

    return { ...cart, totalPrice };
  }

  // Menambah atau mengupdate item di cart
  async addItemToCart(userId: string, dto: AddToCartDto) {
    const { productId, quantity } = dto;
    const cart = await this.getOrCreateUserCart(userId);

    // Cek apakah produk ada
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    // Cek apakah item sudah ada di cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity <= 0) {
        // Jika kuantitas jadi 0 or negatif, hapus item dari cart
        await this.prisma.cartItem.delete({
          where: { id: existingItem.id },
        });
      } else {
        // Jika masih ada, update kuantitasnya
        await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });
      }
    } else if (quantity > 0) {
      // Jika item baru, HANYA buat jika kuantitasnya positif
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  // Menghapus item dari cart
  async removeItemFromCart(userId: string, dto: RemoveFromCartDto) {
    const { cartItemId } = dto;

    // Verifikasi bahwa item ini milik user yang sedang login
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: {
          userId: userId,
        },
      },
    });

    if (!cartItem) {
      throw new ForbiddenException('Item tidak ditemukan di keranjang Anda');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return this.getCart(userId);
  }

  // Mengubah jumlah item
  async setItemQuantity(userId: string, cartItemId: string, quantity: number) {
    // Jika quantity 0 atau kurang, hapus item
    if (quantity <= 0) {
      return this.removeItemFromCart(userId, { cartItemId });
    }

    // Verifikasi kepemilikan
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: {
          userId: userId,
        },
      },
    });
    if (!cartItem) {
      throw new ForbiddenException('Item tidak ditemukan di keranjang Anda');
    }

    // Update quantity
    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: quantity },
    });

    return this.getCart(userId);
  }
}