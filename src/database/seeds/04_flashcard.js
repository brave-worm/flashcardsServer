
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('flashcards').del()
    .then(function () {
      // Inserts seed entries
      return knex('flashcards').insert([
        {id: 1, front: 'front1', back: 'back1', set_id: 1},
        {id: 2, front: 'front2', back: 'back2', set_id: 1},
        {id: 3, front: 'front3', back: 'back3', set_id: 1},
        {id: 4, front: 'front4', back: 'back4', set_id: 2},
        {id: 5, front: 'front5', back: 'back5', set_id: 2},
        {id: 6, front: 'front6', back: 'back6', set_id: 2},
        {id: 7, front: 'front7', back: 'back7', set_id: 3},
        {id: 8, front: 'front8', back: 'back8', set_id: 3},
        {id: 9, front: 'front9', back: 'back9', set_id: 3}
      ]);
    });
};
