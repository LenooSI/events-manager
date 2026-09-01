import { FastifyInstance } from "fastify";
import { db } from "../prisma/db";

export async function guestsRoutes(app: FastifyInstance) {
  app.get("/guests", async () => {
    const guest = await db.orm.public.Guest.all();
    return guest;
  });

  app.post("/guests", async (request, reply) => {
    const body = request.body as {
      name: string;
      email: string;
    };

    const guest = await db.orm.public.Guest.create({
      name: body.name,
      email: body.email,
    });

    return reply.code(201).send({ guest });
  });

  app.get("/guests/:guestId/weddings", async (request, reply) => {
    const { guestId } = request.params as { guestId: string };

    const presenceConfirmations = await db.orm.public.PresenceConfirmation
      .where({ guestId: Number(guestId) })
      .include('wedding', (w) => w)
      .all();

    const weddings = presenceConfirmations.map((pc) => pc.wedding);

    return reply.send({ weddings });
  });
}
