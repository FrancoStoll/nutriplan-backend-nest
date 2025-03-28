import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, ParseUUIDPipe, BadRequestException, UseInterceptors, UploadedFile, Res, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SeedProductDto } from './dto/seed-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer'
import { extname } from 'path';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { ProductCategory } from './interface/product.interface';
import { PaginationDto } from './dto/pagination.dto';
import { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';


@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }


  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/pdf',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9); // 1 billion
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          cb(null, filename)
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // limit 5mb
    }),
  )
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile(new FileValidationPipe()) file: Express.Multer.File
  ) {
    if (file) createProductDto.pdfUrl = `/uploads/pdf/${file.filename}`;
    return this.productService.create(createProductDto)

  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
    return this.productService.findAll({ page: paginationDto.page, limit: paginationDto.limit, category: paginationDto.category as ProductCategory })
  }


  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {

    return this.productService.findOne(id)
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {

    if (Object.keys(updateProductDto).length === 0) throw new BadRequestException("Update Product Dto is empty")
    return this.productService.update(id, updateProductDto)

  }

  @Delete(':id')
  remove(@Param('id') id: string) {

    return this.productService.remove(id)

  }

  @Get("download-pdf/:id/:session_id")
  async downloadPdf(
    @Res() res: Response, @Req() req: Request) {

      const productId = req.params.id
      const session_id = req.params.session_id


    try {

      const product = await this.productService.downloadPdf(session_id) // O obtén el ID del producto

      const pdfUrl = product?.product.pdfUrl

      if (!product || !pdfUrl) {
        return res.status(404).json({ error: "Producto o PDF no encontrado" });
      }

      const filename = pdfUrl!.split("/").pop();

      if (!filename) {
        return res.status(400).json({ error: "Nombre de archivo inválido" });
      }


      if (filename.includes('../') || filename.includes('..\\')) {
        return res.status(400).json({ error: "Nombre de archivo inválido" });
      }


      // Validación básica
      const filePath = path.join(process.cwd(), 'uploads', 'pdf', filename)

      
      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: "No se encontró el PDF" });
      }
      
      
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${"NutriPlan"}"`);

      res.sendFile(filePath)

    } catch (error) {
      console.error("Error al descargar PDF:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }


  }


  @Auth("ADMIN")
  @Post('seed')
  seed(@Body() seedProductDto: SeedProductDto) {

    return this.productService.seed(seedProductDto)

  }




}