import type { D1Database } from "@cloudflare/workers-types";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB: D1Database;
      BETTER_AUTH_SECRET: string;
      NEXT_PUBLIC_APP_URL: string;
    }
  }
}
