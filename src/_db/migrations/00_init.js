const m001_users = {
  name: '001_users',

  up: (db, schema) => {
    schema.createTable('users', t => {
      t.string('name');
      t.string('email');
      t.number('balance');
      t.timestamp('created_at');
      t.timestamp('updated_at');
    });
  },

  /*seed: db => {
    db.table('users').insert({
      name: 'Admin',
      email: 'admin@test.com',
      balance: 0,
      created_at: new Date().toISOString()
    });
  }*/
};
