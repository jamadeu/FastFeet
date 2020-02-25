module.exports = {
  up: queryInterface => {
    return queryInterface.bulkInsert(
      'recipients',
      [
        {
          name: 'John Doe',
          street: 'Av Paulista',
          number: 900,
          complement: '9th floor',
          state: 'SP',
          city: 'São Paulo',
          zip_code: '01310-940',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: () => {},
};
