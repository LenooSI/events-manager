import { FastifyInstance } from "fastify";
import { db } from "../prisma/db";

export async function presenceConfirmationRoutes(app: FastifyInstance) {
  app.post("/wedding/:weddingId/guest", async (request, reply) => {
    const { weddingId } = request.params as { weddingId: string };
    const { name, email } = request.body as {
      name: string;
      email: string;
    };

    let guest = await db.orm.public.Guest.where({ email }).first();

    if (!guest) {
      guest = await db.orm.public.Guest.create({
        name,
        email,
      });
    }

    const association = await db.orm.public.PresenceConfirmation.create({
      guestId: guest.id,
      weddingId: Number(weddingId),
    });

    return reply.code(201).send({ association });
  });
}
