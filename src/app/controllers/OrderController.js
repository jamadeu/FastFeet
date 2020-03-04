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
}

export default new OrderController();
