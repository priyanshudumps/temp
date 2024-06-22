const { executeQuery } = require("../utils/queryExecutor");

/*

CREATE TABLE IF NOT EXISTS coin_links (
        coin_id VARCHAR(255) PRIMARY KEY REFERENCES coins(coin_id),
        twitter VARCHAR(255) NULL,
        telegram VARCHAR(255) NULL,
        discord VARCHAR(255) NULL,
        github VARCHAR(255) NULL,
        website VARCHAR(255) NULL,
        whitepaper VARCHAR(255) NULL,
        medium VARCHAR(255) NULL,
        linkedin VARCHAR(255) NULL,
        youtube VARCHAR(255) NULL,
        reddit VARCHAR(255) NULL,
        facebook VARCHAR(255) NULL,
        instagram VARCHAR(255) NULL,
        tiktok VARCHAR(255) NULL,
        forum VARCHAR(255) NULL,
        other_links VARCHAR(255)[] Null,
        tags VARCHAR(255)[] NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
)

*/

const addCoinLinksIfNotExists = async (coinLinksData) => {
  const query = `
        INSERT INTO coin_links (coin_id, twitter, telegram, discord, github, website, whitepaper, medium, linkedin, youtube, reddit, facebook, instagram, tiktok, forum, other_links, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (coin_id)
        DO NOTHING
        RETURNING *;
    `;
  return executeQuery(
    query,
    [
      coinLinksData.coin_id,
      coinLinksData.twitter,
      coinLinksData.telegram,
      coinLinksData.discord,
      coinLinksData.github,
      coinLinksData.website,
      coinLinksData.whitepaper,
      coinLinksData.medium,
      coinLinksData.linkedin,
      coinLinksData.youtube,
      coinLinksData.reddit,
      coinLinksData.facebook,
      coinLinksData.instagram,
      coinLinksData.tiktok,
      coinLinksData.forum,
      coinLinksData.other_links,
      coinLinksData.tags,
    ],
    true
  );
};

const addMultipleCoinLinksOrUpdate = async (coinLinksData) => {
  const query = `
        INSERT INTO coin_links (coin_id, twitter, telegram, discord, github, website, whitepaper, medium, linkedin, youtube, reddit, facebook, instagram, tiktok, forum, other_links, tags)
        VALUES ${coinLinksData
          .map(
            (_, index) =>
              `($${index * 17 + 1}, $${index * 17 + 2}, $${index * 17 + 3}, $${
                index * 17 + 4
              }, $${index * 17 + 5}, $${index * 17 + 6}, $${index * 17 + 7}, $${
                index * 17 + 8
              }, $${index * 17 + 9}, $${index * 17 + 10}, $${
                index * 17 + 11
              }, $${index * 17 + 12}, $${index * 17 + 13}, $${
                index * 17 + 14
              }, $${index * 17 + 15}, $${index * 17 + 16}, $${index * 17 + 17})`
          )
          .join(", ")}
        ON CONFLICT (coin_id)
        DO UPDATE
        SET twitter = EXCLUDED.twitter,
            telegram = EXCLUDED.telegram,
            discord = EXCLUDED.discord,
            github = EXCLUDED.github,
            website = EXCLUDED.website,
            whitepaper = EXCLUDED.whitepaper,
            medium = EXCLUDED.medium,
            linkedin = EXCLUDED.linkedin,
            youtube = EXCLUDED.youtube,
            reddit = EXCLUDED.reddit,
            facebook = EXCLUDED.facebook,
            instagram = EXCLUDED.instagram,
            tiktok = EXCLUDED.tiktok,
            forum = EXCLUDED.forum,
            other_links = EXCLUDED.other_links,
            tags = EXCLUDED.tags,
            updated_at = NOW()  
        RETURNING *;
    `;

  // console.log(`{${coinLinks.tags.join(',')}}`);
  const values = coinLinksData.reduce((acc, coinLinks) => {
    let tags = coinLinks.tags ? coinLinks.tags : [];
    acc.push(coinLinks.coin_id);
    acc.push(coinLinks.twitter);
    acc.push(coinLinks.telegram);
    acc.push(coinLinks.discord);
    acc.push(coinLinks.github);
    acc.push(coinLinks.website);
    acc.push(coinLinks.whitepaper);
    acc.push(coinLinks.medium);
    acc.push(coinLinks.linkedin);
    acc.push(coinLinks.youtube);
    acc.push(coinLinks.reddit);
    acc.push(coinLinks.facebook);
    acc.push(coinLinks.instagram);
    acc.push(coinLinks.tiktok);
    acc.push(coinLinks.forum);
    acc.push(coinLinks.other_links);
    acc.push(`{${tags.join(",")}}`);
    return acc;
  }, []);
  // console.log(values);

  return executeQuery(query, values);
};

const updateCoinLinks = async (coinId, coinLinksData) => {
  const query = `
        UPDATE coin_links
        SET twitter = $1,
            telegram = $2,
            discord = $3,
            github = $4,
            website = $5,
            whitepaper = $6,
            medium = $7,
            linkedin = $8,
            youtube = $9,
            reddit = $10,
            facebook = $11,
            instagram = $12,
            tiktok = $13,
            forum = $14,
            other_links = $15,
            tags = $16
        WHERE coin_id = $17
        RETURNING *;
    `;
  return executeQuery(
    query,
    [
      coinLinksData.twitter,
      coinLinksData.telegram,
      coinLinksData.discord,
      coinLinksData.github,
      coinLinksData.website,
      coinLinksData.whitepaper,
      coinLinksData.medium,
      coinLinksData.linkedin,
      coinLinksData.youtube,
      coinLinksData.reddit,
      coinLinksData.facebook,
      coinLinksData.instagram,
      coinLinksData.tiktok,
      coinLinksData.forum,
      coinLinksData.other_links,
      coinLinksData.tags,
      coinId,
    ],
    true
  );
};

const getCoinLinksByCoinId = async (coinId) => {
  const query = `
        SELECT * FROM coin_links WHERE coin_id = $1;
    `;
  return executeQuery(query, [coinId]);
};

const getAllCoinLinks = async () => {
  const query = `
        SELECT * FROM coin_links;
    `;
  return executeQuery(query);
};

module.exports = {
  addCoinLinksIfNotExists,
  updateCoinLinks,
  getCoinLinksByCoinId,
  getAllCoinLinks,
  addMultipleCoinLinksOrUpdate,
};
