import { PrismaClient } from "@prisma/client";
import { join } from "path";
// import { copyDB } from "./copyDB";

export * from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // copyDB()
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: "file:" + join(process.cwd(), "data", "dev.db"),
        // url: "file:/data/dev.db",
      },
    },
    errorFormat: "minimal",
  });
} else {
  // copyDB()
  globalThis["prisma"] =
    globalThis["prisma"] ||
    new PrismaClient({
      errorFormat: "pretty",
      datasources: {
        db: {
          url: "file:" + join(process.cwd(), "data", "dev.db"),
          // url: "file:/data/dev.db",
        },
      },
    });
  prisma = globalThis["prisma"];
}

export default prisma;
