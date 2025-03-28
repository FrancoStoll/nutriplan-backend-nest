import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

@Injectable()
export class MailService {

    private transporter: nodemailer.Transporter;


    constructor(

    ) {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_MAIL,
                pass: process.env.GMAIL_PASSWORD
            }
        })

    }


    async sendPurchaseEmail(email: string, data: { productName: string, pdfPath: string }) {



        const pathFile = path.resolve(__dirname, "../../uploads/pdf")
        const fileName = data.pdfPath.split("/").pop()

        const pdfContent = fs.readFileSync(`${pathFile}/${fileName}`)

        const mailOptions: nodemailer.SendMailOptions = {
            from: process.env.GMAIL_MAIL,
            to: email,
            subject: `Compra de producto ${data.productName}`,
            text: `Gracias por comprar el producto ${data.productName} adjuntamos el PDF con toda la informacion `,
            html: `
                <p>Gracias por tu compra. Adjuntamos el PDF de <strong>${data.productName}</strong></p>
            `,
            attachments: [
                {
                    filename: `${data.productName}.pdf`,
                    content: pdfContent,
                    contentType: "application/pdf"
                }
            ]

        }

        return await this.transporter.sendMail(mailOptions)

    }



}
