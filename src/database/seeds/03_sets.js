
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('sets').del()
    .then(function () {
      // Inserts seed entries
      return knex('sets').insert([
        {id: 1, setTitle: 'setTitle1', user_id: 1},
        {id: 2, setTitle: 'setTitle2', user_id: 2},
        {id: 3, setTitle: 'setTitle3', user_id: 3},
        {id: 4, setTitle: 'setTitle4', user_id: 3}
      ]);
    });
};
