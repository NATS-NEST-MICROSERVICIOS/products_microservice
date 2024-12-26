import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/pagination.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to database');
  }
  create(createProductDto: CreateProductDto) {
    const { ...productData } = createProductDto;

    /* if (!category_ids || category_ids.length === 0) {
      throw new Error('At least one category must be provided.');
    }  */

    return this.product.create({
      data: productData,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.product.findMany({
        skip,
        take: limit,
      }),
      this.product.count(),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    console.log('ID recibido:', id);

    const product = await this.product.findFirst({
      where: {
        id: id,
      },
    });

    if (!product) {
      throw new RpcException({
        message: `Product #${id} not found`,
        status: 404,
      });
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;

    // Llamada a findOne para verificar la existencia
    await this.findOne(id);

    // Actualización del producto
    return this.product.update({
      where: {
        id,
      },
      data: data,
    });
  }

  async remove(id: number) {
    try {
      // Verificar existencia del producto
      await this.findOne(id);

      // Eliminar el producto
      return this.product.delete({
        where: { id },
      });
    } catch (error) {
      // Deja que el filtro maneje RpcException
      if (error instanceof RpcException) {
        throw error;
      }
      // Lanza una excepción genérica para otros errores
      throw new RpcException({
        message: 'Error while deleting product',
        statusCode: 500,
      });
    }
  }

  async validateProduct(id: number[]) {
    const ids = Array.isArray(id) ? Array.from(new Set(id)) : [id];
    console.log('IDs:', ids);

    const products = await this.product.findMany({
      where: {
        id: { in: ids },
      },
    });

    if (!products || products.length === 0) {
      throw new RpcException({
        message: `Products with the given IDs not found: ${ids.join(', ')}`,
        status: 404,
      });
    }

    console.log('Products found:', products);
    return products;
  }
}
