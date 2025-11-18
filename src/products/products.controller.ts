import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductListResponseDto } from './dto/product-list-response.dto';

@ApiTags('2. Products')
@ApiBearerAuth() // Menandakan endpoint ini butuh Bearer Token
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Endpoint untuk membuat produk (Hanya CS1 dan CS2)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CS1, Role.CS2)
  @ApiOperation({ summary: 'Buat produk baru (Hanya CS1/CS2)' })
  @ApiCreatedResponse({ type: ProductResponseDto })
  @ApiForbiddenResponse({ description: 'Dilarang' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // Endpoint untuk melihat semua produk (Semua user terotentikasi)
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lihat semua produk (Semua user login)' })
  @ApiOkResponse({ type: ProductListResponseDto })
  findAll() {
    return this.productsService.findAll();
  }

  // Endpoint untuk melihat satu produk (Semua user terotentikasi)
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lihat detail produk (Semua user login)' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Produk tidak ditemukan' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  // Endpoint untuk update produk (Hanya CS1 dan CS2)
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CS1, Role.CS2)
  @ApiOperation({ summary: 'Update produk (Hanya CS1/CS2)' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Produk tidak ditemukan' })
  @ApiForbiddenResponse({ description: 'Dilarang' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  // Endpoint untuk hapus produk (Hanya CS1 dan CS2)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CS1, Role.CS2)
  @ApiOperation({ summary: 'Hapus produk (Hanya CS1/CS2)' })
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: 'Produk tidak ditemukan' })
  @ApiForbiddenResponse({ description: 'Dilarang' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}