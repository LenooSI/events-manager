import "@js-temporal/polyfill";
import { Temporal } from "@js-temporal/polyfill";
import cors from "@fastify/cors";

(globalThis as typeof globalThis & { Temporal?: typeof Temporal }).Temporal =
  Temporal;

import Fastify from "fastify";
import { db } from "./prisma/db";
import { userRoutes } from "./routes/users";
import { ordersRoutes } from "./routes/orders";
import { giftsRoutes } from "./routes/gifts";
import { guestsRoutes } from "./routes/guests";
import { weddingsRoutes } from "./routes/weddings";
import { presenceConfirmationRoutes } from "./routes/presenceConfirmation";

const app = Fastify({ logger: true });

app.register(cors, {
  origin: true,
});

app.decorateRequest('appSession', null);
app.register(userRoutes);
app.register(ordersRoutes);
app.register(giftsRoutes);
app.register(guestsRoutes);
app.register(weddingsRoutes);
app.register(presenceConfirmationRoutes);

app.get("/health", async () => {
  return { status: "ok" };
});

app.get("/hello", async () => {
  const users = await db.orm.public.User.all();
  return { message: "Hello, World!", users };
});

app.listen({ port: 3000 }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});