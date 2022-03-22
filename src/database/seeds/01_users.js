const bcrypt = require('bcrypt')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {id: 1, email: 'user1@test.com', password: bcrypt.hashSync('user1password', 8)},
        {id: 2, email: 'user2@test.com', password: bcrypt.hashSync('user2password', 8)},
        {id: 3, email: 'user3@test.com', password: bcrypt.hashSync('user3password', 8)}
      ]);
    });
};
