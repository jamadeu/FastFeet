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

    // validar se recipient e deliveryman existem

    const { id } = await Order.create(req.body);

    const order = await Order.findByPk(id, {
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
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
          attributes: ['name', 'email'],
        },
      ],
    });
    // await Notification.create({
    //   content: `Encomenda de ${name} disponível para coleta`,
    //   user: req.body.deliveryman_id,
    // });

    await Queue.add(OrderingMail.key, {
      order,
    });

    return res.json(order);
  }
}

export default new OrderController();
