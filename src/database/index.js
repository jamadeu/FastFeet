import mongoose from 'mongoose';
import Sequelize from 'sequelize';

import DeliveryMan from '../app/models/DeliveryMan';
import File from '../app/models/File';
import Recipient from '../app/models/Recipient';
import User from '../app/models/User';
import databaseConfig from '../config/database';

const models = [User, Recipient, File, DeliveryMan];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
    });
  }
}

export default new Database();
