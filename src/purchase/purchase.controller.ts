import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, Res } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { Auth } from 'src/auth/decorator/auth.decorator';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

import { Request, Response } from 'express';
import { HasPurchaseDto } from './dto/has-product.dto';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) { }



  @Post('create-checkout-session')
  createCheckoutSession(@Body() createCheckoutSession: CreateCheckoutSessionDto) {
    return this.purchaseService.checkout(createCheckoutSession)
  }

  @Post("has-purchase")
  hasPurchase(@Body() hasPurchase: HasPurchaseDto) {

    return this.purchaseService.hasPurchase(hasPurchase)

  }

  @Post("webhook/stripe")
  stripeWebhook(
    @Req() req: Request,
    @Res() res: Response
  ) {

    
    return this.purchaseService.webhook(req,res)

  }
}
