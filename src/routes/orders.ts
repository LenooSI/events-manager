import { FastifyInstance } from "fastify";
import { db } from "../prisma/db";

export async function ordersRoutes(app: FastifyInstance) {
  app.post(
    "/orders",
    {
      schema: {
        body: {
          type: "object",
          required: ["giftId", "guestId"],
          properties: {
            giftId: { type: "integer", minimum: 1 },
            guestId: { type: "integer", minimum: 1 },
            message: { type: "string" },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const body = request.body as {
        giftId: number;
        guestId: number;
        message?: string;
      };

      const gift = await db.orm.public.Gift
        .where({ id: body.giftId })
        .first();

      if (!gift) {
        return reply.code(404).send({
          error: "Gift not found",
        });
      }

      const guest = await db.orm.public.Guest
        .where({ id: body.guestId })
        .first();

      if (!guest) {
        return reply.code(404).send({
          error: "Guest not found",
        });
      }

      if (gift.price === null || gift.price === undefined) {
        return reply.code(400).send({
          error: "Gift has no price",
        });
      }

      const order = await db.orm.public.Order.create({
        giftId: gift.id,
        guestId: guest.id,
        guestName: guest.name,
        guestEmail: guest.email,
        message: body.message,
        amount: gift.price,
        status: "PENDING",
      });

      return reply.code(201).send({ order });
    },
  );
}