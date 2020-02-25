import { Router } from 'express';

import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import adminMiddleware from './app/middlewares/admin';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.use(adminMiddleware);
routes.put('/users', UserController.update);
routes.post('/recipients', RecipientController.store);

export default routes;
