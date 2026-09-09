import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PGlite } from '@electric-sql/pglite';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const dataDir = path.join(__dirname, '../../pgdata');
export const pgliteDb = new PGlite(dataDir);

const poolProxy = Object.create(Pool.prototype);
poolProxy.options = {};

function formatPgLiteValue(v: any): any {
  if (v instanceof Date) {
    return v.toISOString();
  }
  return v;
}

let initPromise: Promise<void> | null = null;

poolProxy.query = async function (configOrSql: any, values?: any[]) {
  const sql = typeof configOrSql === 'string' ? configOrSql : configOrSql.text;
  const params = values || (typeof configOrSql === 'object' ? configOrSql.values : []) || [];
  const opts = typeof configOrSql === 'object' && configOrSql.rowMode ? { rowMode: configOrSql.rowMode } : undefined;

  const res = await pgliteDb.query(sql, params, opts);

  if (res && res.rows) {
    for (let i = 0; i < res.rows.length; i++) {
      const row: any = res.rows[i];
      if (Array.isArray(row)) {
        for (let j = 0; j < row.length; j++) {
          row[j] = formatPgLiteValue(row[j]);
        }
      } else if (row && typeof row === 'object') {
        for (const k of Object.keys(row)) {
          row[k] = formatPgLiteValue(row[k]);
        }
      }
    }
  }

  return res;
};

poolProxy.connect = async function () {
  return {
    query: poolProxy.query,
    release: () => {},
  };
};

const adapter = new PrismaPg(poolProxy);
export const prisma = new PrismaClient({ adapter });

async function tableExists(table: string): Promise<boolean> {
  const res = await pgliteDb.query<{ exists: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    [table]
  );
  return Boolean(res.rows[0]?.exists);
}

async function applySchema(): Promise<void> {
  const utf8Path = path.join(__dirname, '../../prisma/schema_utf8.sql');
  const schemaPath = fs.existsSync(utf8Path)
    ? utf8Path
    : path.join(__dirname, '../../prisma/schema.sql');
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Missing Prisma SQL schema at ${schemaPath}`);
  }
  const raw = fs.readFileSync(schemaPath);
  const sql = (raw[0] === 0xff && raw[1] === 0xfe
    ? raw.toString('utf16le')
    : raw.toString('utf8')
  ).replace(/^\uFEFF/, '');
  console.log('[Database] Applying embedded PostgreSQL schema...');
  await pgliteDb.exec(sql);
  console.log('[Database] Schema ready.');
}

async function seedIfEmpty(): Promise<void> {
  const countRes = await pgliteDb.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM "User"`);
  const count = Number(countRes.rows[0]?.count || 0);
  if (count > 0) {
    return;
  }
  console.log('[Database] No users found. Seeding demo accounts...');
  const { seedDatabase } = await import('../../prisma/seed');
  await seedDatabase();
}

export async function ensureDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await pgliteDb.query('SELECT 1');
        const hasUserTable = await tableExists('User');
        if (!hasUserTable) {
          await applySchema();
        }
        await seedIfEmpty();
      } catch (err) {
        initPromise = null;
        console.error('[Database] Failed to initialize embedded PostgreSQL:', err);
        throw err;
      }
    })();
  }
  return initPromise;
}
