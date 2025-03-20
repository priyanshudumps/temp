import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import db from '../utils/db';

async function runMigrations(direction: string, targetFile?: string): Promise<void> {
  const pool: Pool = await db();
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        file_name VARCHAR(255) UNIQUE,
        run_at TIMESTAMP DEFAULT NOW()
      );
    `);

    let migrationFiles = fs
      .readdirSync(path.join(__dirname, "sql"))
      .filter((file) => file.endsWith(`_${direction}.sql`))
      .sort();

    if (direction === "down") {
      migrationFiles = migrationFiles.reverse();
    }

    for (const file of migrationFiles) {
      const baseFileName = file.replace(`_${direction}.sql`, "");
      const { rows } = await client.query(
        "SELECT 1 FROM migrations WHERE file_name = $1",
        [baseFileName]
      );

      if (direction === "up" && rows.length > 0) {
        console.log(`Skipping already run migration: ${baseFileName}`);
        continue;
      }

      if (direction === "down" && rows.length === 0) {
        console.log(`Skipping already reverted migration: ${baseFileName}`);
        continue;
      }

      const filePath = path.join(__dirname, "sql", file);
      const sql = fs.readFileSync(filePath, "utf-8");
      console.log(`Running migration: ${file}`);
      await client.query(sql);

      if (direction === "up") {
        await client.query("INSERT INTO migrations (file_name) VALUES ($1)", [
          baseFileName,
        ]);
      } else {
        await client.query("DELETE FROM migrations WHERE file_name = $1", [
          baseFileName,
        ]);
      }

      if (baseFileName === targetFile) {
        console.log(`Reached target migration file: ${baseFileName}`);
        break;
      }
    }

    console.log(`All ${direction} migrations ran successfully.`);
  } catch (err) {
    console.error("Error running migrations:", err);
  } finally {
    client.release();
  }
}

const direction = process.argv[2]; // 'up' or 'down'
const targetFile = process.argv[3]; // target file name without suffix
if (!["up", "down"].includes(direction)) {
  console.error(
    `'${direction}' is an invalid migration direction choose: up or down.`
  );
  process.exit(1);
}

runMigrations(direction, targetFile);