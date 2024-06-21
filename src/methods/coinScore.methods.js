const {
  executeMultipleQueries,
  executeQuery,
} = require("../utils/queryExecutor");

const addCoinScoreIfNotExists = async (coinScoreData) => {
  const query = `
        INSERT INTO coin_score (coin_id, score, is_banned, coin_market_cap_rank, geckoterminal_score)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (coin_id)
        DO NOTHING
        RETURNING *;
    `;
  return executeQuery(
    query,
    [
      coinScoreData.coin_id,
      coinScoreData.score,
      coinScoreData.is_banned,
      coinScoreData.coin_market_cap_rank,
      coinScoreData.geckoterminal_score,
    ],
    true
  );
};

const updateCoinScore = async (coinId, coinScoreData) => {
  const query = `
        UPDATE coin_score
        SET score = $1,
            is_banned = $2,
            coin_market_cap_rank = $3,
            geckoterminal_score = $4
        WHERE coin_id = $5
        RETURNING *;
    `;
  return executeQuery(
    query,
    [
      coinScoreData.score,
      coinScoreData.is_banned,
      coinScoreData.coin_market_cap_rank,
      coinScoreData.geckoterminal_score,
      coinId,
    ],
    true
  );
};

// get functions

const getCoinScoreByCoinId = async (coinId) => {
  const query = `
        SELECT * FROM coin_score
        WHERE coin_id = $1;
    `;
  return executeQuery(query, [coinId]);
};

const getCoinScores = async () => {
  const query = `
        SELECT * FROM coin_score;
    `;
  return executeQuery(query);
};

module.exports = {
  addCoinScoreIfNotExists,
  updateCoinScore,
  getCoinScoreByCoinId,
  getCoinScores,
};
