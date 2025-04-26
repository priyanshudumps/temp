import express, { Router } from 'express';
import tokenChartRoute from './tokenChart.route';
import coinChatsRoute from './coinChats.route';
import coinHoldersRoute from './coinHolders.route';
import emojiCoinRoute from './emojiCoin.route';
import emojicoinApiRoute from './emojicoin.api.route';
import uptosPumpChartRoute from './uptosPumpChart.route';
import aptosPriceRoute from './aptosPrice.route';

const router: Router = express.Router();

interface Route {
  path: string;
  route: Router;
}

const defaultRoutes: Route[] = [
  {
    path: '/token-charts',
    route: tokenChartRoute,
  },
  {
    path: '/coin-chats',
    route: coinChatsRoute,
  },
  {
    path: '/coin-holders',
    route: coinHoldersRoute,
  },
  {
    path: '/emoji-coins',
    route: emojiCoinRoute,
  },
  {
    path: '/api/emojicoin',
    route: emojicoinApiRoute,
  },
  {
    path: '/uptos-pump-charts',
    route: uptosPumpChartRoute,
  },
  {
    path: '/aptos-price',
    route: aptosPriceRoute,
  },
  // Other routes can be added here
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;