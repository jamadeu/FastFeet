import { Router } from 'express';
import multer from 'multer';

import DeliveryManController from './app/controllers/DeliveryManController';
import FileController from './app/controllers/FileController';
import NotificationController from './app/controllers/NotificationController';
import OrderController from './app/controllers/OrderController';
import RecipientController from './app/controllers/RecipientController';
import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/notifications/:deliveryman_id', NotificationController.index);
routes.put('/notifications/:deliveryman_id', NotificationController.update);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.post('/deliverymans', DeliveryManController.store);
routes.get('/deliverymans', DeliveryManController.index);
routes.put('/deliverymans/:id', DeliveryManController.update);
routes.delete('/deliverymans/:id', DeliveryManController.delete);

routes.post('/orders', OrderController.store);
routes.put('/orders', OrderController.update);

export default routes;
