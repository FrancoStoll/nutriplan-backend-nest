import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/common/services/prisma.service';
import { SeedProductDto } from './dto/seed-product.dto';
import { ProductCategory } from './interface/product.interface';
import * as fs from 'fs/promises';
import * as path from 'path';
import Stripe from 'stripe';

@Injectable()
export class ProductService {



  private readonly stripe: Stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(createProductDto: CreateProductDto) {

    try {
      const product = await this.prisma.product.create({
        data: createProductDto
      })

      return product

    } catch (error) {

      if (createProductDto.pdfUrl != null) {
        await fs.unlink(createProductDto.pdfUrl).catch(() => {
          console.log("Error deleting file")
        })
      }

      throw new BadRequestException("Error creating product")

    }


  }

  async findAll({ limit, page, category }: { limit: number, page: number, category: ProductCategory }) {

    const whereCondition = category !== "ALL" as any ? { category } : {}

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        omit: { pdfUrl: true },
        take: limit,
        skip: (page - 1) * limit,
        where: whereCondition
      }),
      this.prisma.product.count({ where: whereCondition })
    ])

    return {
      data: products,
      meta: {
        total,
        page: Math.floor(page / limit) + 1,
        limit: limit,
        totalPages: Math.ceil(total / limit)
      }
    }

  }

  async findOne(id: string) {

    const product = await this.prisma.product.findFirst({
      where: { id },
      omit: { pdfUrl: true }
    })

    if (!product) throw new NotFoundException(`Product with id ${id} not found`)

    return product

  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const existProduct = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!existProduct) throw new NotFoundException(`Product with id ${id} not found`)

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    })

    return product
  }

  async remove(id: string) {

    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { pdfUrl: true }
    })

    const productName = product?.pdfUrl?.split("/").pop()
    const filePath = path.join(process.cwd(), 'uploads', 'pdf', productName!)




    if (product?.pdfUrl) await fs.unlink(filePath).catch(() => {
      console.log("Error deleting file")
    })


    await this.prisma.product.delete({
      where: { id }
    })



    return "SUCCESSFULLY"
  }



  async seed(seedProductDto: SeedProductDto) {

    const count = seedProductDto.count ?? 10;


    const products = Array.from({ length: count }).map((_, i) => ({
      name: `Producto de prueba ${i + 1}`,
      category: this.getRandomCategory() as ProductCategory,
      description: `Descrición de prueba ${i + 1} de producto de prueba`,
      pdfUrl: `https://example.com/product/${i + 1}.pdf`,
      isFree: Math.random() > 0.7,
      price: Math.random() > 0.7 ? Math.floor(Math.random() * 100) : null,
      days: Math.floor(Math.random() * 100)
    }));


    await this.prisma.product.createMany({
      data: products
    })


    return `${count} Products was created`
  }


  private getRandomCategory(): string {

    const categories = Object.values(ProductCategory)

    return categories[Math.floor(Math.random() * categories.length)]
  }


  async downloadPdf(id: string) {

    const paymentIntent = await this.stripe.checkout.sessions.retrieve(id)

    const paymentIntentId = typeof paymentIntent.payment_intent === 'string'
      ? paymentIntent.payment_intent
      : (paymentIntent.payment_intent as Stripe.PaymentIntent)?.id;
 

    const product = await this.prisma.purchase.findFirst({
      where: { stripeId: paymentIntentId },
      include: {
        product: {
          select: {
            pdfUrl: true
          }
        }
      }
    })
  

    return product
  }

}
