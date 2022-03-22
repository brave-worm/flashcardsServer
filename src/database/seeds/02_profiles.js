
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('profiles').del()
    .then(function () {
      // Inserts seed entries
      return knex('profiles').insert([
        {id: 1, user_id: 1},
        {id: 2, user_id: 2},
        {id: 3, user_id: 3}
      ]);
    });
};
