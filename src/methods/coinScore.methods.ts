import {
  executeMultipleQueries,
  executeQuery,
} from '../utils/queryExecutor';
import { ICoinScore } from '../types';

/*
CREATE TABLE IF NOT EXISTS coin_score (
        coin_id VARCHAR(255) PRIMARY KEY REFERENCES coins(coin_id)
        score NUMERIC NULL,
        is_banned_panora BOOLEAN  NULL,
        is_permissioned_hippo BOOLEAN  NULL,
        coin_market_cap_rank INTEGER NULL,
        geckoterminal_score NUMERIC NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
)
*/

export const addCoinScoreIfNotExists = async (coinScoreData: ICoinScore): Promise<ICoinScore[]> => {
  const query = `
        INSERT INTO coin_score (coin_id, score, is_banned_panora, is_permissioned_hippo, coin_market_cap_rank, geckoterminal_score)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (coin_id)
        DO NOTHING
        RETURNING *;
    `;
  return executeQuery<ICoinScore>(
    query,
    [
      coinScoreData.coin_id,
      coinScoreData.score,
      coinScoreData.is_banned_panora,
      coinScoreData.is_permissioned_hippo,
      coinScoreData.coin_market_cap_rank,
      coinScoreData.geckoterminal_score,
    ],
    true
  );
};

export const addMultipleCoinScores = async (coinScoreData: ICoinScore[]): Promise<ICoinScore[]> => {
  const query = `
        INSERT INTO coin_score (coin_id, score, is_banned_panora, is_permissioned_hippo, coin_market_cap_rank, geckoterminal_score)
        VALUES ${coinScoreData
          .map(
            (_, index) =>
              `($${index * 6 + 1}, $${index * 6 + 2}, $${index * 6 + 3}, $${
                index * 6 + 4
              }, $${index * 6 + 5}, $${index * 6 + 6})`
          )
          .join(', ')}
        ON CONFLICT (coin_id)
        DO NOTHING
        RETURNING *;
    `;

  const values = coinScoreData.reduce<any[]>((acc, coinScore) => {
    acc.push(coinScore.coin_id);
    acc.push(coinScore.score);
    acc.push(coinScore.is_banned_panora);
    acc.push(coinScore.is_permissioned_hippo);
    acc.push(coinScore.coin_market_cap_rank);
    acc.push(coinScore.geckoterminal_score);
    return acc;
  }, []);

  return executeQuery<ICoinScore>(query, values);
};

export const addMultipleCoinScoresOrUpdate = async (coinScoreData: ICoinScore[]): Promise<ICoinScore[]> => {
  const query = `
        INSERT INTO coin_score (coin_id, score, is_banned_panora, is_permissioned_hippo, coin_market_cap_rank, geckoterminal_score)
        VALUES ${coinScoreData
          .map(
            (_, index) =>
              `($${index * 6 + 1}, $${index * 6 + 2}, $${index * 6 + 3}, $${
                index * 6 + 4
              }, $${index * 6 + 5}, $${index * 6 + 6})`
          )
          .join(', ')}
        ON CONFLICT (coin_id)
        DO UPDATE SET
        score = EXCLUDED.score,
        is_banned_panora = EXCLUDED.is_banned_panora,
        is_permissioned_hippo = EXCLUDED.is_permissioned_hippo,
        coin_market_cap_rank = EXCLUDED.coin_market_cap_rank,
        geckoterminal_score = EXCLUDED.geckoterminal_score
        RETURNING *;
    `;

  const values = coinScoreData.reduce<any[]>((acc, coinScore) => {
    acc.push(coinScore.coin_id);
    acc.push(coinScore.score);
    acc.push(coinScore.is_banned_panora);
    acc.push(coinScore.is_permissioned_hippo);
    acc.push(coinScore.coin_market_cap_rank);
    acc.push(coinScore.geckoterminal_score);
    return acc;
  }, []);

  return executeQuery<ICoinScore>(query, values);
};

export const getCoinScore = async (coinId: string): Promise<ICoinScore[]> => {
  const query = `
        SELECT * FROM coin_score WHERE coin_id = $1;
    `;
  return executeQuery<ICoinScore>(query, [coinId]);
};

export const getAllCoinScores = async (coinIds: string[] = []): Promise<ICoinScore[]> => {
  const query = `
        SELECT * FROM coin_score ${coinIds.length ? 'WHERE coin_id = ANY($1)' : ''};
    `;
  return executeQuery<ICoinScore>(query, coinIds.length ? [coinIds] : []);
};