const db = require("./db");

const executeQuery = async (query, values = [], isTransaction = false) => {
  const pool = await db();
  const client = await pool.connect();

  try {
    if (isTransaction) await client.query("BEGIN");
    const result = await client.query(query, values);
    if (isTransaction) await client.query("COMMIT");
    return result.rows;
  } catch (error) {
    if (isTransaction) await client.query("ROLLBACK");
    console.log(query);
    console.log(error.message);
    throw new Error(`Error executing query: ${query} - ${error.message}`);
  } finally {
    await client.release();
  }
};

//  execute multiple queries in a transaction-

const executeMultipleQueries = async (queries) => {
  const pool = await db();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    for (const query of queries) {
      await client.query(query.query, query.values);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(queries);
    console.log(error.message);
    throw new Error(`Error executing multiple queries: ${error.message}`);
  } finally {
    await client.release();
  }
};

module.exports = {
  executeQuery,
  executeMultipleQueries,
};
