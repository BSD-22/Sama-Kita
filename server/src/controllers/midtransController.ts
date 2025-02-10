import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import midtransClient from 'midtrans-client';
import axios from 'axios';
const prisma = new PrismaClient();

export default class midtransController {
  static async midtransPayment(
    req: Request<unknown, unknown, { renterId: number }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.loginInfo?.userId;
      const { renterId } = req.body;

      const renter = await prisma.renter.findUnique({
        where: {
          id: +renterId,
        },
        include: {
          room: true,
        },
      });
      if (!renter) throw { name: 'NotFoundError' };

      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.SERVER_MIDTRANS_KEY || '',
        clientKey: process.env.CLIENT_MIDTRANS_KEY || '',
      });

      const orderId = `order_${Math.floor(Math.random() * 10000) + 10000}_${userId}`;

      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: renter.room.price,
        },
        customer_details: {
          first_name: renter.renterName,
          email: renter.renterEmail,
        },
      };

      await prisma.renterTransaction.upsert({
        where: {
          renterId: renter.id,
          orderId: orderId,
        },
        update: {},
        create: {
          renterId: renter.id,
          orderId: orderId,
          amount: renter.room.price,
        },
      });

      const { redirect_url, token } = await snap.createTransaction(parameter);

      res.status(200).json({ redirect_url, order_id: orderId, token });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  static async checkPaymentStatus(
    req: Request<{ orderId: string; renterId: number }, unknown, { orderId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { orderId, renterId } = req.params;

      const { data } = await axios.get(`https://api.sandbox.midtrans.com/v2/${orderId}/status`, {
        headers: {
          accept: 'application/json',
          Authorization: `Basic ${Buffer.from('SB-Mid-server-pliyYz_wmQ5p1BEa_YlhNmET').toString('base64')}`,
        },
      });

      res.status(200).json(data);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }

  //   static async getHistoryList(req: Request<{ orderId: string }, unknown, { orderId: string }>, res: Response, next: NextFunction) {
  //     try {
  //       const data = {
  //         transaction_details: {
  //           order_id: 'order_10761_2',
  //           gross_amount: 10000,
  //         },
  //         item_details: [
  //           {
  //             id: 'ITEM1',
  //             price: 10000,
  //             quantity: 1,
  //             name: 'Midtrans Bear',
  //             brand: 'Midtrans',
  //             category: 'Toys',
  //             merchant_name: 'Midtrans',
  //           },
  //         ],
  //         customer_details: {
  //           first_name: 'John',
  //           last_name: 'Watson',
  //           email: 'test@example.com',
  //           phone: '+628123456',
  //           billing_address: {
  //             first_name: 'John',
  //             last_name: 'Watson',
  //             email: 'test@example.com',
  //             phone: '081 2233 44-55',
  //             address: 'Sudirman',
  //             city: 'Jakarta',
  //             postal_code: '12190',
  //             country_code: 'IDN',
  //           },
  //           shipping_address: {
  //             first_name: 'John',
  //             last_name: 'Watson',
  //             email: 'test@example.com',
  //             phone: '0 8128-75 7-9338',
  //             address: 'Sudirman',
  //             city: 'Jakarta',
  //             postal_code: '12190',
  //             country_code: 'IDN',
  //           },
  //         },
  //         enabled_payments: ['credit_card', 'mandiri_clickpay', 'cimb_clicks', 'bca_klikbca', 'bca_klikpay', 'bri_epay', 'echannel', 'mandiri_ecash', 'permata_va', 'bca_va', 'bni_va', 'other_va', 'gopay', 'indomaret', 'alfamart', 'danamon_online', 'akulaku'],
  //         credit_card: {
  //           secure: true,
  //           bank: 'bca',
  //           installment: {
  //             required: false,
  //             terms: {
  //               bni: [3, 6, 12],
  //               mandiri: [3, 6, 12],
  //               cimb: [3],
  //               bca: [3, 6, 12],
  //               offline: [6, 12],
  //             },
  //           },
  //           whitelist_bins: ['48111111', '41111111'],
  //         },
  //         bca_va: {
  //           va_number: '12345678911',
  //           sub_company_code: '00000',
  //           free_text: {
  //             inquiry: [
  //               {
  //                 en: 'text in English',
  //                 id: 'text in Bahasa Indonesia',
  //               },
  //             ],
  //             payment: [
  //               {
  //                 en: 'text in English',
  //                 id: 'text in Bahasa Indonesia',
  //               },
  //             ],
  //           },
  //         },
  //         bni_va: {
  //           va_number: '12345678',
  //         },
  //         permata_va: {
  //           va_number: '1234567890',
  //           recipient_name: 'SUDARSONO',
  //         },
  //         callbacks: {
  //           finish: 'https://demo.midtrans.com',
  //         },
  //         expiry: {
  //           start_time: '2019-12-13 18:11:08 +0700',
  //           unit: 'minutes',
  //           duration: 1,
  //         },
  //         custom_field1: 'custom field 1 content',
  //         custom_field2: 'custom field 2 content',
  //         custom_field3: 'custom field 3 content',
  //       };
  //       const response = await axios.post('https://app.sandbox.midtrans.com/snap/v1/transactions', data, {
  //         headers: {
  //           Accept: 'application/json',
  //           'Content-Type': 'application/json',
  //         },
  //       });

  //       console.log(response);
  //     } catch (error) {
  //       console.log(error);
  //       next(error);
  //     }
  //   }
}
