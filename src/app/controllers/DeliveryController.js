import { Op } from 'sequelize';

import DeliveryMan from '../models/DeliveryMan';
import Order from '../models/Order';
import Recipient from '../models/Recipient';

class DeliveryController {
  async index(req, res) {
    const deliveryManExisti = await DeliveryMan.findByPk(
      req.params.deliverymanId
    );

    if (!deliveryManExisti) {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    const { page = 1 } = req.query;

    const { delivered } = req.body;

    if (delivered) {
      const orders = await Order.findAll({
        where: {
          deliveryman_id: req.params.deliverymanId,
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
        deliveryman_id: req.params.deliverymanId,
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
}

export default new DeliveryController();
