import { executeQuery } from "../utils/queryExecutor";
import { IUptosPumpLegend } from "../types/coin.types";

export const addUptosPumpLegendIfNotExists = async (legendData: IUptosPumpLegend): Promise<IUptosPumpLegend[]> => {
  const query = `
    INSERT INTO uptos_pump_legend (
      addr, nsfw, img, name, ticker, description, twitter, telegram, website,
      virtual_aptos_reserves, virtual_token_reserves, initial_token_reserves,
      rep_count, created_by, bonding_curve, created_at, tx_at, tx_count,
      rep_at, legend_at, legend_tx, completed_at, completed_tx,
      lp_addr, user_addr, user_name, user_img, market_cap
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9,
      $10, $11, $12, $13, $14, $15, $16, $17, $18,
      $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
    )
    ON CONFLICT (addr)
    DO NOTHING
    RETURNING *;
  `;
  
  return executeQuery<IUptosPumpLegend>(
    query,
    [
      legendData.addr,
      legendData.nsfw,
      legendData.img,
      legendData.name,
      legendData.ticker,
      legendData.description,
      legendData.twitter,
      legendData.telegram,
      legendData.website,
      legendData.virtual_aptos_reserves,
      legendData.virtual_token_reserves,
      legendData.initial_token_reserves,
      legendData.rep_count,
      legendData.created_by,
      legendData.bonding_curve,
      legendData.created_at,
      legendData.tx_at,
      legendData.tx_count,
      legendData.rep_at,
      legendData.legend_at,
      legendData.legend_tx,
      legendData.completed_at,
      legendData.completed_tx,
      legendData.lp_addr,
      legendData.user_addr,
      legendData.user_name,
      legendData.user_img,
      legendData.market_cap
    ],
    true
  );
};

export const updateUptosPumpLegend = async (addr: string, legendData: Partial<IUptosPumpLegend>): Promise<IUptosPumpLegend[]> => {
  const query = `
    UPDATE uptos_pump_legend
    SET 
      nsfw = $1,
      img = $2,
      name = $3,
      ticker = $4,
      description = $5,
      twitter = $6,
      telegram = $7,
      website = $8,
      virtual_aptos_reserves = $9,
      virtual_token_reserves = $10,
      initial_token_reserves = $11,
      rep_count = $12,
      created_by = $13,
      bonding_curve = $14,
      created_at = $15,
      tx_at = $16,
      tx_count = $17,
      rep_at = $18,
      legend_at = $19,
      legend_tx = $20,
      completed_at = $21,
      completed_tx = $22,
      lp_addr = $23,
      user_addr = $24,
      user_name = $25,
      user_img = $26,
      market_cap = $27,
      updated_db_at = NOW()
    WHERE addr = $28
    RETURNING *;
  `;
  
  return executeQuery<IUptosPumpLegend>(
    query,
    [
      legendData.nsfw,
      legendData.img,
      legendData.name,
      legendData.ticker,
      legendData.description,
      legendData.twitter,
      legendData.telegram,
      legendData.website,
      legendData.virtual_aptos_reserves,
      legendData.virtual_token_reserves,
      legendData.initial_token_reserves,
      legendData.rep_count,
      legendData.created_by,
      legendData.bonding_curve,
      legendData.created_at,
      legendData.tx_at,
      legendData.tx_count,
      legendData.rep_at,
      legendData.legend_at,
      legendData.legend_tx,
      legendData.completed_at,
      legendData.completed_tx,
      legendData.lp_addr,
      legendData.user_addr,
      legendData.user_name,
      legendData.user_img,
      legendData.market_cap,
      addr
    ],
    true
  );
};

export const addMultipleUptosPumpLegendsOrUpdate = async (legendsData: IUptosPumpLegend[]): Promise<IUptosPumpLegend[]> => {
  if (legendsData.length === 0) return [];

  const placeholders = legendsData.map((_, index) => {
    const offset = index * 28;
    const values = [];
    for (let i = 1; i <= 28; i++) {
      values.push(`$${offset + i}`);
    }
    return `(${values.join(', ')})`;
  }).join(', ');

  const query = `
    INSERT INTO uptos_pump_legend (
      addr, nsfw, img, name, ticker, description, twitter, telegram, website,
      virtual_aptos_reserves, virtual_token_reserves, initial_token_reserves,
      rep_count, created_by, bonding_curve, created_at, tx_at, tx_count,
      rep_at, legend_at, legend_tx, completed_at, completed_tx,
      lp_addr, user_addr, user_name, user_img, market_cap
    )
    VALUES ${placeholders}
    ON CONFLICT (addr)
    DO UPDATE SET
      nsfw = EXCLUDED.nsfw,
      img = EXCLUDED.img,
      name = EXCLUDED.name,
      ticker = EXCLUDED.ticker,
      description = EXCLUDED.description,
      twitter = EXCLUDED.twitter,
      telegram = EXCLUDED.telegram,
      website = EXCLUDED.website,
      virtual_aptos_reserves = EXCLUDED.virtual_aptos_reserves,
      virtual_token_reserves = EXCLUDED.virtual_token_reserves,
      initial_token_reserves = EXCLUDED.initial_token_reserves,
      rep_count = EXCLUDED.rep_count,
      created_by = EXCLUDED.created_by,
      bonding_curve = EXCLUDED.bonding_curve,
      created_at = EXCLUDED.created_at,
      tx_at = EXCLUDED.tx_at,
      tx_count = EXCLUDED.tx_count,
      rep_at = EXCLUDED.rep_at,
      legend_at = EXCLUDED.legend_at,
      legend_tx = EXCLUDED.legend_tx,
      completed_at = EXCLUDED.completed_at,
      completed_tx = EXCLUDED.completed_tx,
      lp_addr = EXCLUDED.lp_addr,
      user_addr = EXCLUDED.user_addr,
      user_name = EXCLUDED.user_name,
      user_img = EXCLUDED.user_img,
      market_cap = EXCLUDED.market_cap,
      updated_db_at = NOW()
    RETURNING *;
  `;

  const values = legendsData.reduce<any[]>((acc, legend) => {
    acc.push(
      legend.addr,
      legend.nsfw,
      legend.img,
      legend.name,
      legend.ticker,
      legend.description,
      legend.twitter,
      legend.telegram,
      legend.website,
      legend.virtual_aptos_reserves,
      legend.virtual_token_reserves,
      legend.initial_token_reserves,
      legend.rep_count,
      legend.created_by,
      legend.bonding_curve,
      legend.created_at,
      legend.tx_at,
      legend.tx_count,
      legend.rep_at,
      legend.legend_at,
      legend.legend_tx,
      legend.completed_at,
      legend.completed_tx,
      legend.lp_addr,
      legend.user_addr,
      legend.user_name,
      legend.user_img,
      legend.market_cap
    );
    return acc;
  }, []);

  return executeQuery<IUptosPumpLegend>(query, values);
};

export const getUptosPumpLegendByAddr = async (addr: string): Promise<IUptosPumpLegend[]> => {
  const query = `
    SELECT * FROM uptos_pump_legend WHERE addr = $1;
  `;
  return executeQuery<IUptosPumpLegend>(query, [addr]);
};

export const getAllUptosPumpLegends = async (): Promise<IUptosPumpLegend[]> => {
  const query = `
    SELECT * FROM uptos_pump_legend ORDER BY legend_at DESC;
  `;
  return executeQuery<IUptosPumpLegend>(query);
};

export const getRecentUptosPumpLegends = async (limit: number = 10): Promise<IUptosPumpLegend[]> => {
  const query = `
    SELECT * FROM uptos_pump_legend 
    ORDER BY legend_at DESC 
    LIMIT $1;
  `;
  return executeQuery<IUptosPumpLegend>(query, [limit]);
};

export default {
  addUptosPumpLegendIfNotExists,
  updateUptosPumpLegend,
  addMultipleUptosPumpLegendsOrUpdate,
  getUptosPumpLegendByAddr,
  getAllUptosPumpLegends,
  getRecentUptosPumpLegends
};