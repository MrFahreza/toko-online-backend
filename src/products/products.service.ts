import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PageOptionsDto } from 'src/common/dto/page-options.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Membuat produk baru
  create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({ data: createProductDto });
  }

  // Mendapatkan semua produk
  async findAll(pageOptionsDto: PageOptionsDto) {
    const { page = 1, limit = 10, search } = pageOptionsDto;
    const skip = (page - 1) * limit;
    const whereCondition: Prisma.ProductWhereInput = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {};

    const products = await this.prisma.product.findMany({
      skip: skip,
      take: limit,
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
    });

    return products;
  }

  // Mendapatkan satu produk berdasarkan ID
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Produk dengan ID ${id} tidak ditemukan`);
    }
    return product;
  }

  // Mengupdate produk berdasarkan ID
  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
      });
    } catch (error) {
      throw new NotFoundException(`Produk dengan ID ${id} tidak ditemukan`);
    }
  }

  // Menghapus produk berdasarkan ID
  async remove(id: string) {
    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Produk dengan ID ${id} tidak ditemukan`);
    }
  }
}