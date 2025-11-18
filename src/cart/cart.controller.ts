import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, type User } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { RemoveFromCartDto } from './dto/remove-from-cart.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CartResponseDto } from './dto/cart-response.dto';
import { SetItemQuantityDto } from './dto/set-item-quantity.dto';

@ApiTags('3. Cart (Pembeli)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PEMBELI)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Endpoint untuk mendapatkan cart user
  @Get()
  @ApiOperation({ summary: 'Mendapatkan keranjang milik user (Pembeli)' })
  @ApiOkResponse({ type: CartResponseDto })
  getCart(@GetUser() user: User) {
    return this.cartService.getCart(user.id);
  }

  // Endpoint untuk menambah item ke cart
  @Post('add')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Menambah/mengurangi item ke keranjang (Pembeli)' })
  @ApiOkResponse({ type: CartResponseDto })
  addItem(@GetUser() user: User, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addItemToCart(user.id, addToCartDto);
  }

  // Endpoint untuk menghapus item dari cart
  @Post('remove')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Menghapus item dari keranjang (Pembeli)' })
  @ApiOkResponse({ type: CartResponseDto })
  removeItem(@GetUser() user: User, @Body() removeFromCartDto: RemoveFromCartDto) {
    return this.cartService.removeItemFromCart(user.id, removeFromCartDto);
  }

  // Endpoint untuk mengubah jumlah (sesuai spek "Ubah jumlah" )
  @Patch('item/:cartItemId')
  @ApiOperation({ summary: 'Mengubah jumlah item di keranjang (Pembeli)' })
  @ApiOkResponse({ type: CartResponseDto })
  setItemQuantity(
    @GetUser() user: User,
    @Param('cartItemId', ParseUUIDPipe) cartItemId: string,
    @Body() dto: SetItemQuantityDto,
  ) {
    return this.cartService.setItemQuantity(user.id, cartItemId, dto.quantity);
  }
}