const { Pool } = require("pg");
const config = require("../config/config");

let pool;
const pg = config.pg;

const initializePool = async () => {
  const poolConfig = {
    user: pg.user,
    host: pg.host,
    database: pg.database,
    password: pg.password,
    port: pg.port,
    max: 25,
    min: 1,
    idleTimeoutMillis: 30000,
    ssl: {
      rejectUnauthorized: false,
    },
  };

  const newPool = new Pool(poolConfig);
  return newPool;
};

module.exports = async () => {
  if (!pool) {
    pool = await initializePool();
  }
  return pool;
};
