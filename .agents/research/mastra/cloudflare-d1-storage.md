# Reference: Cloudflare D1 Storage | Storage

Documentation for the Cloudflare D1 SQL storage implementation in Mastra.

Source: https://mastra.ai/reference/storage/cloudflare-d1

---

# Cloudflare D1 Storage

The Cloudflare D1 storage implementation provides a serverless SQL database solution using Cloudflare D1, supporting relational operations and transactional consistency.

## Installation​

```
npm install @mastra/cloudflare-d1@latest
```

## Usage​

```
import { D1Store } from "@mastra/cloudflare-d1";type Env = {  // Add your bindings here, e.g. Workers KV, D1, Workers AI, etc.  D1Database: D1Database;};// --- Example 1: Using Workers Binding ---const storageWorkers = new D1Store({  binding: D1Database, // D1Database binding provided by the Workers runtime  tablePrefix: "dev_", // Optional: isolate tables per environment});// --- Example 2: Using REST API ---const storageRest = new D1Store({  accountId: process.env.CLOUDFLARE_ACCOUNT_ID!, // Cloudflare Account ID  databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID!, // D1 Database ID  apiToken: process.env.CLOUDFLARE_API_TOKEN!, // Cloudflare API Token  tablePrefix: "dev_", // Optional: isolate tables per environment});
```

And add the following to your `wrangler.toml`or `wrangler.jsonc`file:

```
[[d1_databases]]binding = "D1Database"database_name = "db-name"database_id = "db-id"
```

## Parameters​

### binding?:

D1Database Cloudflare D1 Workers binding (for Workers runtime)

### accountId?:

string Cloudflare Account ID (for REST API)

### databaseId?:

string Cloudflare D1 Database ID (for REST API)

### apiToken?:

string Cloudflare API Token (for REST API)

### tablePrefix?:

string Optional prefix for all table names (useful for environment isolation)

## Additional Notes​

### Schema Management​

The storage implementation handles schema creation and updates automatically. It creates the following tables:

- threads: Stores conversation threads
- messages: Stores individual messages
- metadata: Stores additional metadata for threads and messages

### Transactions & Consistency​

Cloudflare D1 provides transactional guarantees for single-row operations. This means that multiple operations can be executed as a single, all-or-nothing unit of work.

### Table Creation & Migrations​

Tables are created automatically when storage is initialized (and can be isolated per environment using the `tablePrefix`option), but advanced schema changes—such as adding columns, changing data types, or modifying indexes—require manual migration and careful planning to avoid data loss.
