import { executeQuery } from "../utils/queryExecutor";
import { ICoinChat } from "../types/coin.types";

export const addCoinChatsIfNotExists = async (coinChatData: ICoinChat): Promise<ICoinChat[]> => {
  const query = `
    INSERT INTO coin_chats (
      id, 
      coin_id, 
      content, 
      image_url, 
      created_by, 
      reply_to, 
      like_count, 
      user_name, 
      user_image_url, 
      is_dev, 
      is_liked, 
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (id)
    DO NOTHING
    RETURNING *;
  `;
  return executeQuery<ICoinChat>(
    query,
    [
      coinChatData.id,
      coinChatData.coin_id,
      coinChatData.content,
      coinChatData.image_url,
      coinChatData.created_by,
      coinChatData.reply_to,
      coinChatData.like_count,
      coinChatData.user_name,
      coinChatData.user_image_url,
      coinChatData.is_dev,
      coinChatData.is_liked,
      coinChatData.created_at,
    ],
    true
  );
};

export const addMultipleCoinChatsOrUpdate = async (coinChatsData: ICoinChat[]): Promise<ICoinChat[]> => {
  const query = `
    INSERT INTO coin_chats (
      id, 
      coin_id, 
      content, 
      image_url, 
      created_by, 
      reply_to, 
      like_count, 
      user_name, 
      user_image_url, 
      is_dev, 
      is_liked, 
      created_at
    )
    VALUES ${coinChatsData
      .map(
        (_, index) =>
          `($${index * 12 + 1}, $${index * 12 + 2}, $${index * 12 + 3}, $${
            index * 12 + 4
          }, $${index * 12 + 5}, $${index * 12 + 6}, $${index * 12 + 7}, $${
            index * 12 + 8
          }, $${index * 12 + 9}, $${index * 12 + 10}, $${index * 12 + 11}, $${index * 12 + 12})`
      )
      .join(", ")}
    ON CONFLICT (id)
    DO UPDATE SET
      coin_id = EXCLUDED.coin_id,
      content = EXCLUDED.content,
      image_url = EXCLUDED.image_url,
      created_by = EXCLUDED.created_by,
      reply_to = EXCLUDED.reply_to,
      like_count = EXCLUDED.like_count,
      user_name = EXCLUDED.user_name,
      user_image_url = EXCLUDED.user_image_url,
      is_dev = EXCLUDED.is_dev,
      is_liked = EXCLUDED.is_liked,
      created_at = EXCLUDED.created_at,
      updated_at = NOW()
    RETURNING *;
  `;

  const values = coinChatsData.reduce<any[]>((acc, chat) => {
    acc.push(chat.id);
    acc.push(chat.coin_id);
    acc.push(chat.content);
    acc.push(chat.image_url);
    acc.push(chat.created_by);
    acc.push(chat.reply_to);
    acc.push(chat.like_count);
    acc.push(chat.user_name);
    acc.push(chat.user_image_url);
    acc.push(chat.is_dev);
    acc.push(chat.is_liked);
    acc.push(chat.created_at);
    return acc;
  }, []);

  return executeQuery<ICoinChat>(query, values);
};

export const getCoinChatsByCoinId = async (coinId: string, limit = 100, offset = 0): Promise<ICoinChat[]> => {
  const query = `
    SELECT * FROM coin_chats 
    WHERE coin_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
  `;
  return executeQuery<ICoinChat>(query, [coinId, limit, offset]);
};

export const getAllCoinChats = async (): Promise<ICoinChat[]> => {
  const query = `
    SELECT * FROM coin_chats;
  `;
  return executeQuery<ICoinChat>(query);
};

export default {
  addCoinChatsIfNotExists,
  addMultipleCoinChatsOrUpdate,
  getCoinChatsByCoinId,
  getAllCoinChats,
};