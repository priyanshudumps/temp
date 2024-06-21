import { executeQuery } from '../../utils/queryExecutor';

const addCoinLinksIfNotExists = async (coinLinksData) => {
    const query = `
        INSERT INTO coin_links (coin_id, twitter, telegram, discord, github, website, whitepaper, medium, linkedin, youtube, reddit, facebook, instagram, tiktok, forum, other_links, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (coin_id)
        DO NOTHING
        RETURNING *;
    `;
    return executeQuery(query, [
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
    ], true);
}

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
    return executeQuery(query, [
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
        coinId
    ], true);
}

const getCoinLinksByCoinId = async (coinId) => {
    const query = `
        SELECT * FROM coin_links WHERE coin_id = $1;
    `;
    return executeQuery(query, [coinId]);
}

const getCoinLinks = async () => {
    const query = `
        SELECT * FROM coin_links;
    `;
    return executeQuery(query);
}

export default{
    addCoinLinksIfNotExists,
    updateCoinLinks,
    getCoinLinksByCoinId,
    getCoinLinks,
}
