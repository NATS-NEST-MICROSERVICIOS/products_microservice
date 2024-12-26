import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/pagination.dto';
import {
  ClientProxy,
  MessagePattern,
  Payload,
  RpcException,
} from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  //@Post()
  @MessagePattern({ cmd: 'create_product' })
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  //@Get()
  @MessagePattern({ cmd: 'findAll_product' })
  findAll(@Payload() paginationDto: PaginationDto) {
    //return paginationDto;
    return this.productsService.findAll(paginationDto);
  }

  //@Get(':id')
  @MessagePattern({ cmd: 'findOne_product' })
  findOne(@Payload() payload: { id: string }) {
    const id = payload.id; // Accede al valor correcto de id
    console.log('ID recibido como string:', id);

    const idNumber = Number(id);
    console.log('ID convertido a número:', idNumber);

    // Verifica si la conversión fue exitosa
    if (isNaN(idNumber)) {
      throw new RpcException('Invalid ID provided. ID must be a valid number.');
    }

    return this.productsService.findOne(idNumber);
  }

  //@Patch(':id')
  @MessagePattern({ cmd: 'findUpdate_product' })
  update(
    //@Param('id') id: string,
    //@Body() updateProductDto: UpdateProductDto,
    @Payload() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(updateProductDto.id, updateProductDto);
  }

  //@Delete(':id')
  @MessagePattern({ cmd: 'findDelete_product' })
  remove(@Payload('id') id: string) {
    console.log('ID recibido como número:', id);
    return this.productsService.remove(+id);
  }

  @MessagePattern({ cmd: 'search_product' })
  async validateProduct(@Payload() ids: number[]) {
    console.log('ID recibido como número:', ids);
    return await this.productsService.validateProduct(ids);
  }
}
