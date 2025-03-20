import express, { Router } from 'express';

const router: Router = express.Router();

interface Route {
  path: string;
  route: Router;
}

const defaultRoutes: Route[] = [];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;