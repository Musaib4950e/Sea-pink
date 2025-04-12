

```
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;
const dbUrl = 'postgresql://neondb_owner:npg_WgQ8t0GRSFKB@ep-cold-feather-a52q8hd5-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

export const pool = new Pool({ connectionString: dbUrl });
export const db = drizzle({ client: pool, schema });
```
