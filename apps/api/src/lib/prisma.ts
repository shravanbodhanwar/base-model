import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PGlite } from '@electric-sql/pglite';
import { Pool } from 'pg';
import path from 'path';

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
