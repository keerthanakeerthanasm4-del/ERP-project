import "dotenv/config";
import { Client } from "pg";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const prismaCli = path.join(backendRoot, "node_modules", "prisma", "build", "index.js");
const baselineName = "000000000000_squashed_baseline";
const databaseUrl = process.env.DATABASE_URL;

function runPrisma(args, capture = false) {
  const result = spawnSync(process.execPath, [prismaCli, ...args], {
    cwd: backendRoot,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function stop(message) {
  console.error("Database setup stopped: " + message);
  process.exit(1);
}

if (!databaseUrl) {
  stop("DATABASE_URL is missing. Set it in backend/.env for your local database.");
}

const client = new Client({ connectionString: databaseUrl });

try {
  await client.connect();

  const tables = await client.query(
    "SELECT COUNT(*)::int AS count " +
      "FROM information_schema.tables " +
      "WHERE table_schema = 'public' " +
      "AND table_type = 'BASE TABLE' " +
      "AND table_name <> '_prisma_migrations'"
  );
  const migrationTable = await client.query(
    "SELECT to_regclass('public._prisma_migrations') IS NOT NULL AS present"
  );

  if (tables.rows[0].count === 0 && !migrationTable.rows[0].present) {
    console.log("Empty database found. Applying the baseline migration.");
    const migrationResult = runPrisma(["migrate", "deploy"]);
    if (migrationResult.status !== 0) process.exit(migrationResult.status);
  } else {
    console.log("Existing database found. Checking it against the current schema.");
    const diff = runPrisma(
      [
        "migrate",
        "diff",
        "--from-config-datasource",
        "--to-schema",
        "prisma/schema.prisma",
        "--exit-code",
      ],
      true
    );

    if (diff.status === 2) {
      stop("the existing database does not match the current schema. No database changes were made.");
    }
    if (diff.status !== 0) {
      process.stderr.write(diff.stderr);
      stop("schema comparison failed. No database changes were made.");
    }

    const baseline = migrationTable.rows[0].present
      ? await client.query(
          'SELECT EXISTS (SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1 AND finished_at IS NOT NULL AND rolled_back_at IS NULL) AS applied',
          [baselineName]
        )
      : { rows: [{ applied: false }] };

    if (!baseline.rows[0].applied) {
      console.log("Database schema matches. Recording the baseline without rerunning SQL.");
      const resolveResult = runPrisma(["migrate", "resolve", "--applied", baselineName]);
      if (resolveResult.status !== 0) process.exit(resolveResult.status);
    } else {
      console.log("Baseline is already recorded.");
    }
  }

  console.log("Generating Prisma Client.");
  const generateResult = runPrisma(["generate"]);
  if (generateResult.status !== 0) process.exit(generateResult.status);
  console.log("Database setup complete.");
} catch (error) {
  stop(error instanceof Error ? error.message : "could not connect to the database.");
} finally {
  await client.end().catch(() => {});
}