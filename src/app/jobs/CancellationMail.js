import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { order } = data;

    await Mail.sendMail({
      to: `${order.deliveryman.name} <${order.deliveryman.email}>`,
      subject: 'Pacote cancelado',
      template: 'cancellation',
      context: {
        deliveryman: order.deliveryman.name,
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

export default new CancellationMail();
