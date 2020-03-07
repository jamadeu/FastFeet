import * as Yup from 'yup';

import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';

class DeliveryProblemController {
  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fail' });
    }

    const delivery = await Order.findByPk(req.params.deliverId);

    if (!delivery) {
      return res.status(400).json({ error: 'Order not found' });
    }

    if (delivery.canceled_at) {
      return res.status(400).json({ error: 'Order is canceled' });
    }

    if (delivery.end_date) {
      return res.status(400).json({ error: 'Order has already bee delivered' });
    }

    const {
      id,
      description,
      delivery_id: order_id,
    } = await DeliveryProblem.create({
      delivery_id: delivery.id,
      description: req.body.description,
    });

    return res.json({
      id,
      order_id,
      description,
    });
  }
}

export default new DeliveryProblemController();
