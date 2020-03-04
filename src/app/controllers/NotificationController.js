import DeliveryMan from '../models/DeliveryMan';
import Notification from '../schemas/Notification';

class NotificationController {
  async index(req, res) {
    const deliveryManExists = await DeliveryMan.findByPk(
      req.params.deliveryman_id
    );

    if (!deliveryManExists) {
      return res.status(400).json({ error: 'Deliveryman not found.' });
    }

    const notifications = await Notification.find({
      deliveryman_id: req.params.deliveryman_id,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    const deliveryManExists = await DeliveryMan.findByPk(
      req.params.deliveryman_id
    );

    if (!deliveryManExists) {
      return res.status(400).json({ error: 'Deliveryman not found.' });
    }

    const notification = await Notification.findByIdAndUpdate(
      req.query.notification,
      { read: true },
      { new: true }
    );
    return res.json(notification);
  }
}

export default new NotificationController();
