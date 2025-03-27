import express, { Router } from 'express';
import tokenChartRoute from './tokenChart.route';


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
  // Other routes can be added here
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;