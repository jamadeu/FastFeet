import * as Yup from 'yup';

import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';
import DeliveryMan from '../models/DeliveryMan';
import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';
import Recipient from '../models/Recipient';

class DeliveryProblemController {
  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fail' });
    }

    const delivery = await Order.findByPk(req.params.deliveryId);

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

  async index(req, res) {
    const { page = 1 } = req.query;

    const problems = await DeliveryProblem.findAll({
      where: { delivery_id: req.params.deliveryId },
      order: ['id'],
      attributes: ['id', 'description'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: [
            'id',
            'product',
            'start_date',
            'end_date',
            'canceled_at',
          ],
          include: [
            {
              model: DeliveryMan,
              as: 'deliveryman',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });

    return res.json(problems);
  }

  async delete(req, res) {
    const problem = await DeliveryProblem.findByPk(req.params.problemId);

    if (!problem) {
      return res.status(400).json({ error: 'Problem not found' });
    }

    const order = await Order.findByPk(problem.delivery_id, {
      attributes: [
        'id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
        'signature_id',
      ],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'complement',
            'city',
            'state',
            'zip_code',
          ],
        },
        {
          model: DeliveryMan,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (order.canceled_at) {
      return res.status(400).json({ error: 'Order is canceled' });
    }

    if (order.end_date) {
      return res.status(400).json({ error: 'Order has already bee delivered' });
    }

    await Queue.add(CancellationMail.key, {
      order,
    });

    await order.update({ canceled_at: new Date() });

    return res.json(order);
  }
}

export default new DeliveryProblemController();
