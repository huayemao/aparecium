import { PrismaClient } from "@prisma/client";
import { join } from "path";

export * from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    datasources: {
      db: {
        // url: "file:" + join(process.cwd(), "tmp", "dev.db"),
        url: "file:/tmp/dev.db",
      },
    },
    errorFormat: "minimal",
  });
} else {
  globalThis["prisma"] =
    globalThis["prisma"] ||
    new PrismaClient({
      errorFormat: "pretty",
    });
  prisma = globalThis["prisma"];
}

export default prisma;
