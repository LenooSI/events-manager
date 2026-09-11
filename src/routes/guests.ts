import { FastifyInstance } from "fastify";
import { db } from "../prisma/db";
import { authenticate } from "../auth/hooks/authenticate";

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

    const presenceConfirmations =
      await db.orm.public.PresenceConfirmation.where({
        guestId: Number(guestId),
      })
        .include("wedding", (w) => w)
        .all();

    const weddings = presenceConfirmations.map((pc) => pc.wedding);

    return reply.send({ weddings });
  });

  app.delete(
    "/guest",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const { guestIds: guestIds } = request.query as { guestIds: string };

      const guestIdsList = guestIds.split(",").map((textId) => Number(textId));

      for (const guestId of guestIdsList) {
        const guest = await db.orm.public.Guest.where({
          id: guestId,
        }).first();

        if (!guest) {
          return reply.code(404).send({
            error: "Guest not found",
          });
        }

        const confirmations = await db.orm.public.PresenceConfirmation.where({
          guestId,
        })
          .include("wedding", (wedding) => wedding)
          .all();

        for (const confirmation of confirmations) {
          if (confirmation.wedding.ownerId === request.appSession?.ownerId) {
            await db.orm.public.PresenceConfirmation.where({
              guestId,
              weddingId: confirmation.weddingId,
            }).delete();
          }
        }
      }

      return reply.code(200).send({
        success: true,
      });
    },
  );
}
