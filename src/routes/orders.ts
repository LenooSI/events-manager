import { FastifyInstance } from "fastify";
import { db } from "../prisma/db";

export async function ordersRoutes(app: FastifyInstance) {
  app.post("/orders", async (request, reply) => {
    const body = request.body as {
      giftId: number;
      guestId: number;
      guestName: string;
      guestEmail: string;
      message?: string;
      amount: number;
      status: string;
      paymentId?: string;
      paidAt?: string;
    };

    const order = await db.orm.public.Order.create({
      giftId: body.giftId,
      guestId: body.guestId,
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      message: body.message,
      amount: body.amount,
      status: body.status,
      paymentId: body.paymentId,
      paidAt: body.paidAt ? new Date(body.paidAt) : undefined,
    });

    return reply.code(201).send({ order });
  });
}
