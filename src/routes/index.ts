import express, { Router } from 'express';
import tokenChartRoute from './tokenChart.route';
import coinChatsRoute from './coinChats.route';
import emojiCoinRoute from './emojiCoin.route';
import emojicoinApiRoute from './emojicoin.api.route';

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
    path: '/emoji-coins',
    route: emojiCoinRoute,
  },
  {
    path: '/api/emojicoin',
    route: emojicoinApiRoute,
  },
  // Other routes can be added here
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;