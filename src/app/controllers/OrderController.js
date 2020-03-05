import { setSeconds, setMinutes, setHours, isWithinInterval } from 'date-fns';
import * as Yup from 'yup';

import Queue from '../../lib/Queue';
import OrderingMail from '../jobs/OrderingMail';
import DeliveryMan from '../models/DeliveryMan';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Notification from '../schemas/Notification';

class OrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fail' });
    }

    const recipientExists = await Recipient.findByPk(req.body.recipient_id);

    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient not found.' });
    }

    const deliveryManExists = await Recipient.findByPk(req.body.deliveryman_id);

    if (!deliveryManExists) {
      return res.status(400).json({ error: 'Deliveryman not found.' });
    }

    const { id } = await Order.create(req.body);

    const order = await Order.findByPk(id, {
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

    await Notification.create({
      content: `Nova encomenda disponível para coleta`,
      deliveryman_id: req.body.deliveryman_id,
    });

    await Queue.add(OrderingMail.key, {
      order,
    });

    return res.json(order);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fail' });
    }

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ error: 'Order not found' });
    }

    if (order.canceled_at) {
      return res.status(400).json({ error: 'Order canceled' });
    }

    const { recipient_id, deliveryman_id } = req.body;

    if (recipient_id) {
      const recipientExists = await Recipient.findByPk(recipient_id);

      if (!recipientExists) {
        return res.status(400).json({ error: 'Ricipient not found' });
      }
    }

    if (deliveryman_id) {
      const deliveryManExists = await DeliveryMan.findByPk(deliveryman_id);

      if (!deliveryManExists) {
        return res.status(400).json({ error: 'Ricipient not found' });
      }
    }

    const start_date = Number(req.query.date);

    if (start_date) {
      if (order.start_date) {
        return res.status(400).json({ error: 'Order already withdraw' });
      }

      const startTime = setSeconds(
        setMinutes(setHours(start_date, '08'), '00'),
        '00'
      );
      const endTime = setSeconds(
        setMinutes(setHours(start_date, '18'), '00'),
        '00'
      );

      if (!isWithinInterval(start_date, { start: startTime, end: endTime })) {
        return res.status(401).json({
          error: 'Withdrawals can only be made between 08:00h and 18:00h.',
        });
      }

      await order.update({ start_date });
    }

    await order.update(req.body);

    return res.json(order);
  }
}

export default new OrderController();
