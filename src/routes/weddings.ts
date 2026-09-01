import { Temporal } from "@js-temporal/polyfill";
import { FastifyInstance } from "fastify";
import { db } from "../prisma/db";

export async function weddingsRoutes(app: FastifyInstance) {
  app.post(
    "/weddings",
    {
      schema: {
        body: {
          type: "object",
          required: ["coupleName", "slug", "weddingDate", "ownerId"],
          properties: {
            coupleName: { type: "string", minLength: 1 },
            slug: { type: "string", minLength: 1 },
            weddingDate: { type: "string", minLength: 1 },
            ownerId: { type: "integer", minimum: 1 },
          },
          additionalProperties: true,
        },
      },
    },
    async (request, reply) => {
      const body = request.body as {
        coupleName: string;
        slug: string;
        weddingDate: string;
        ownerId: number;
      };

      if (
        !body.coupleName ||
        !body.slug ||
        !body.weddingDate ||
        !body.ownerId
      ) {
        return reply.code(400).send({
          error: "Missing required fields",
          required: ["coupleName", "slug", "weddingDate", "ownerId"],
        });
      }

      const wedding = await db.orm.public.Wedding.create({
        coupleName: body.coupleName,
        slug: body.slug,
        weddingDate: Temporal.Instant.from(body.weddingDate),
        ownerId: body.ownerId,
      });

      return reply.code(201).send({ wedding });
    },
  );

  app.get("/weddings/:weddingId/guests", async (request, reply) => {
    const { weddingId } = request.params as { weddingId: string };

    const presenceConfirmations =
      await db.orm.public.PresenceConfirmation.where({
        weddingId: Number(weddingId),
      })
        .include("guest", (g) => g)
        .all();

    const guests = presenceConfirmations.map((pc) => pc.guest);

    return reply.send({ guests });
  });
}
