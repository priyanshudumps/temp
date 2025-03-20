import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import db from './db';

interface QueryParams {
  query: string;
  values: any[];
}

/**
 * Execute a database query
 * @param {string} query - SQL query string
 * @param {any[]} values - Parameter values for the query
 * @param {boolean} isTransaction - Whether the query should be executed in a transaction
 * @returns {Promise<T[]>} - Query results
 */
export const executeQuery = async <T extends QueryResultRow = any>(
  query: string, 
  values: any[] = [], 
  isTransaction = false
): Promise<T[]> => {
  const pool = await db();
  const client = await pool.connect();

  try {
    if (isTransaction) await client.query('BEGIN');
    const result = await client.query<T>(query, values);
    if (isTransaction) await client.query('COMMIT');
    return result.rows;
  } catch (error) {
    if (isTransaction) await client.query('ROLLBACK');
    console.log(query);
    console.log((error as Error).message);
    throw new Error(`Error executing query: ${query} - ${(error as Error).message}`);
  } finally {
    await client.release();
  }
};

/**
 * Execute multiple queries in a transaction
 * @param {QueryParams[]} queries - Array of query objects
 * @returns {Promise<void>}
 */
export const executeMultipleQueries = async (queries: QueryParams[]): Promise<void> => {
  const pool = await db();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    for (const query of queries) {
      await client.query(query.query, query.values);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.log(queries);
    console.log((error as Error).message);
    throw new Error(`Error executing multiple queries: ${(error as Error).message}`);
  } finally {
    await client.release();
  }
};

export default {
  executeQuery,
  executeMultipleQueries
};