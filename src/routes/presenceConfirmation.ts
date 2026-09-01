import { FastifyInstance } from "fastify";
import { db } from "../prisma/db";

export async function presenceConfirmationRoutes(app: FastifyInstance) {
  app.post("/wedding/:weddingId/guest", async (request, reply) => {
    const { weddingId } = request.params as { weddingId: string };
    const { guestId } = request.body as { guestId: number };

    const association = await db.orm.public.PresenceConfirmation.create({
      guestId,
      weddingId: Number(weddingId),
    });

    return reply.code(201).send({ association });
  });
}
