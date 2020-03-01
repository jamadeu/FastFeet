import * as Yup from 'yup';

import DeliveryMan from '../models/DeliveryMan';

class DeliveryManController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const deliveryManExists = await DeliveryMan.findOne({
      where: { email: req.body.email },
    });

    if (deliveryManExists) {
      return res.status(400).json({ error: 'Delivery man already exists' });
    }

    const { id, name, email, avatar_id } = await DeliveryMan.create(req.body);

    return res.json({
      id,
      name,
      email,
      avatar_id,
    });
  }
}

export default new DeliveryManController();
