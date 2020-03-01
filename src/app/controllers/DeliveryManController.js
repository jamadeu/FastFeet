import * as Yup from 'yup';

import DeliveryMan from '../models/DeliveryMan';
import File from '../models/File';

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

  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveryMans = await DeliveryMan.findAll({
      order: ['name'],
      attributes: ['id', 'name', 'email'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(deliveryMans);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fail' });
    }

    if (req.body.email) {
      const deliveryManExists = await DeliveryMan.findOne({
        where: { email: req.body.email },
      });

      if (deliveryManExists) {
        return res.status(400).json({ error: 'Delivery man already exists' });
      }
    }

    const dm = await DeliveryMan.findByPk(req.params.id);

    if (!dm) {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    const { id, name, email, avatar_id } = await dm.update(req.body);

    return res.json({
      id,
      name,
      email,
      avatar_id,
    });
  }

  async delete(req, res) {
    const dm = await DeliveryMan.findByPk(req.params.id);

    if (!dm) {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    const { id, name, email, avatar_id } = await dm.destroy();

    return res.json({
      id,
      name,
      email,
      avatar_id,
    });
  }
}

export default new DeliveryManController();
