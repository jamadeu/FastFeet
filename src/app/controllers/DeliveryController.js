import {
  setSeconds,
  setMinutes,
  setHours,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { Op } from 'sequelize';
import * as Yup from 'yup';

import DeliveryMan from '../models/DeliveryMan';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Delivery from '../schemas/Delivery';

class DeliveryController {
  async index(req, res) {
    const deliveryMan = req.params.deliverymanId;
    const deliveryManExisti = await DeliveryMan.findByPk(deliveryMan);

    if (!deliveryManExisti) {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    const { page = 1 } = req.query;

    const { delivered } = req.body;

    if (delivered) {
      const orders = await Order.findAll({
        where: {
          deliveryman_id: deliveryMan,
          canceled_at: null,
          end_date: { [Op.not]: null },
        },
        attributes: ['id', 'product', 'start_date'],
        limit: 20,
        offset: (page - 1) * 20,
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
        ],
      });
      return res.json(orders);
    }

    const orders = await Order.findAll({
      where: {
        deliveryman_id: deliveryMan,
        canceled_at: null,
        end_date: null,
      },
      attributes: ['id', 'product', 'start_date'],
      limit: 20,
      offset: (page - 1) * 20,
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
      ],
    });

    return res.json(orders);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      orderId: Yup.number().required(),
      startDate: Yup.date(),
      endDate: Yup.date(),
      signature_id: Yup.number().when('endDate', (endDate, field) =>
        endDate ? field.required() : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fail' });
    }

    const start_date = parseISO(req.body.startDate);
    const end_date = parseISO(req.body.endDate);

    if (!start_date && !end_date) {
      return res.status(400).json({ error: 'Inform start_date or end_date' });
    }

    const deliveryMan = req.params.deliverymanId;

    const order = await Order.findOne({
      where: {
        id: req.body.orderId,
        deliveryman_id: deliveryMan,
      },
    });

    if (!order) {
      return res.status(400).json({ error: 'Order not found' });
    }

    if (order.canceled_at) {
      return res.status(400).json({ error: 'Order canceled' });
    }

    if (req.body.startDate) {
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

      const deliveriesOfTheDay = await Delivery.findOne({
        deliveryman_id: deliveryMan,
        date: start_date,
      });

      if (!deliveriesOfTheDay) {
        await Delivery.create({
          deliveryman_id: deliveryMan,
          date: start_date,
          count: 1,
        });
      } else {
        const deliveries = deliveriesOfTheDay.count;
        if (deliveries === 5) {
          return res.status(400).json({
            error: 'Delivery man can only make 5 withdrawals per day.',
          });
        }

        await deliveriesOfTheDay.update({
          count: deliveries + 1,
        });
      }

      await order.update({ start_date });
      return res.json(order);
    }

    if (req.body.endDate) {
      if (order.end_date) {
        return res
          .status(400)
          .json({ error: 'Order has already been delivered' });
      }

      if (!order.start_date) {
        return res
          .status(400)
          .json({ error: 'Order has not yet been collected' });
      }

      await order.update({ end_date, signature_id: req.body.signature_id });
      return res.json(order);
    }

    return res.status(400).json({ error: 'Order was not update' });
  }
}

export default new DeliveryController();
