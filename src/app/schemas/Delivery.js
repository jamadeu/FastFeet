import mongoose from 'mongoose';

const DeliverySchema = new mongoose.Schema(
  {
    deliveryman_id: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Delivery', DeliverySchema);
