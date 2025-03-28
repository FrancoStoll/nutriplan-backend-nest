import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import Stripe from 'stripe'
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { HasPurchaseDto } from './dto/has-product.dto';

@Injectable()
export class PurchaseService {


    private readonly stripe: Stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    constructor(
        private readonly mailService: MailService,
        private readonly prisma: PrismaService,
    ) { }


    async checkout(createCheckoutSession: CreateCheckoutSessionDto) {

        const { productId, email, userId } = createCheckoutSession


        const product = await this.prisma.product.findFirst({ where: { id: productId, isFree: false } })

        if (!product) throw new BadRequestException("Can create checkout product undefined");

        const session = await this.stripe.checkout.sessions.create({
            mode: "payment",
            currency: 'usd',
            success_url: `http://localhost:5173/success?id=${product.id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:5173/cancel`,
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: product.name,

                        },
                        unit_amount: product.price! * 100,

                    },

                }
            ],
            payment_intent_data: {
                metadata: {
                    productId: product.id,
                    userId: userId || '',
                    price: product.price,
                    productName: product.name,
                    productUrl: product.pdfUrl
                },
            }

        })



        return session.url

    }


    async webhook(req: Request, res: Response) {

        const endpointSecret = process.env.STRIPE_SECRET_END_POINT!

        let event: Stripe.Event = req.body

        const signature = req.headers['stripe-signature'] as string



        try {
            event = this.stripe.webhooks.constructEvent(req['rawBody'], signature, endpointSecret)

        } catch (error) {

            console.log('Webhook signature verification failed')
            return res.sendStatus(400)
        }

        switch (event.type) {


            case "charge.succeeded":

        
                
                const stripeId = event.data.object.payment_intent
                const email = event.data.object.billing_details.email
                const productId = event.data.object.metadata!.productId
                const userId = event.data.object.metadata?.userId
                const pricePaid = event.data.object.amount ? event.data.object.amount / 100 : 0
                const receiptUrl = event.data.object.receipt_url
                const productName = event.data.object.metadata.productName
                const pdfUrl = event.data.object.metadata.productUrl



                await this.prisma.purchase.create({
                    data: {
                        email,
                        stripeId: typeof stripeId === 'string' ? stripeId : stripeId?.id || null,
                        productId,
                        userId: userId || null,
                        pricePaid: pricePaid,
                        receiptUrl,
                    }
                })


                // TODO: Send email to user with a product in case not have a user send to email with a pdf, info and a link to the product.

                if (email) {

                    await this.mailService.sendPurchaseEmail(email, { pdfPath: pdfUrl, productName: productName })
                }

                break;


            default:
                console.log(`Unhandled event type ${event.type}`)

        }


        return res.sendStatus(200)
    }


    async hasPurchase(hasPurchase: HasPurchaseDto) {
        const { productId, userId } = hasPurchase

        const product = await this.prisma.purchase.findFirst({ where: { productId, userId } })

        if (!product) throw new BadRequestException("Product not found")

        return true

    }

}
