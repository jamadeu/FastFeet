import Mail from '../../lib/Mail';

class OrderingMail {
  get key() {
    return 'OrderingMail';
  }

  async handle({ data }) {
    const { order } = data;

    await Mail.sendMail({
      to: `${order.deliveryman.name}<${order.deliveryman.email}>`,
      subject: 'Novo pacote',
      template: 'ordering',
      context: {
        name: order.recipient.name,
        street: order.recipient.street,
        number: order.recipient.number,
        complement: order.recipient.complement,
        city: order.recipient.city,
        state: order.recipient.state,
        zip_code: order.recipient.zip_code,
      },
    });
  }
}

export default new OrderingMail();
