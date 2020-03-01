module.exports = {
  up: QueryInterface => {
    return QueryInterface.bulkInsert(
      'delivery_mans',
      [
        {
          name: 'Distribuidora FastFeet Deliveryman',
          email: 'deliveryman@fastfeet.com',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: () => {},
};
