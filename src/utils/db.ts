import { Pool, PoolConfig } from 'pg';
import config from '../config/config';

let pool: Pool | null = null;
const pg = config.pg;

const initializePool = async (): Promise<Pool> => {
  const poolConfig: PoolConfig = {
    user: pg.user,
    host: pg.host,
    database: pg.database,
    password: pg.password,
    port: pg.port,
    max: 25,
    min: 1,
    idleTimeoutMillis: 30000,
    // ssl: {
    //   rejectUnauthorized: false,
    // },
  };

  const newPool = new Pool(poolConfig);
  return newPool;
};

const getPool = async (): Promise<Pool> => {
  if (!pool) {
    pool = await initializePool();
  }
  return pool;
};

export default getPool;