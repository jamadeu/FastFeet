module.exports = {
  up: QueryInterface => {
    return QueryInterface.bulkInsert(
      'delivery_problems',
      [
        {
          delivery_id: 1,
          description: 'Destinatário ausente',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: () => {},
};
