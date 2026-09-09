import { Temporal } from "@js-temporal/polyfill";
import { FastifyInstance } from "fastify";
import { db } from "../prisma/db";
import { authenticate } from "../auth/hooks/authenticate";

export async function weddingsRoutes(app: FastifyInstance) {
  app.post(
    "/weddings",
    {
      preHandler: authenticate,
      schema: {
        body: {
          type: "object",
          required: ["coupleName", "slug", "weddingDate"],
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

      if (!body.coupleName || !body.slug || !body.weddingDate) {
        return reply.code(400).send({
          error: "Missing required fields",
          required: ["coupleName", "slug", "weddingDate", "ownerId"],
        });
      }

      const wedding = await db.orm.public.Wedding.create({
        coupleName: body.coupleName,
        slug: body.slug,
        weddingDate: Temporal.Instant.from(body.weddingDate),
        ownerId: request.appSession?.ownerId,
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

  app.get("/weddings/:weddingId/gifts", async (request, reply) => {
    const { weddingId } = request.params as { weddingId: string };
    const id = Number(weddingId);

    if (!Number.isInteger(id) || id <= 0) {
      return reply.code(400).send({
        error: "Invalid weddingId",
      });
    }

    const gifts = await db.orm.public.Gift.where({ weddingId: id }).all();

    return reply.send({ gifts });
  });

  app.put(
    "/wedding/:weddingId",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const { weddingId } = request.params as { weddingId: string };
      const id = Number(weddingId);

      if (!Number.isInteger(id) || id <= 0) {
        return reply.code(400).send({
          error: "Invalid weddingId",
        });
      }

      const body = request.body as {
        newCoupleName?: string;
        newSlug?: string;
        NewWeddingDate?: string;
      };
      const wedding = await db.orm.public.Wedding.where({ id: id }).first();

      if (!wedding) {
        return reply.code(404).send({
          error: "Wedding not found",
        });
      }

      if (wedding.ownerId !== request.appSession?.ownerId) {
        return reply.code(401).send({
          error: "User without permission",
        });
      }

      const updates = {
        coupleName: body.newCoupleName ?? wedding.coupleName,
        slug: body.newSlug ?? wedding.slug,
        weddingDate: body.NewWeddingDate ?? wedding.weddingDate,
      };

      wedding.coupleName = updates.coupleName;
      wedding.slug = updates.slug;

      wedding.weddingDate = Temporal.Instant.from(updates.weddingDate);

      await db.orm.public.Wedding.where({ id: id }).update(wedding);

      reply.code(201).send({ wedding });
    },
  );

  app.get(
    "/wedding",
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      const ownerWeddings = await db.orm.public.Wedding.where({
        ownerId: request.appSession?.ownerId,
      }).all();

      return reply.code(200).send({
        ownerWeddings: ownerWeddings,
      });
    },
  );
}
