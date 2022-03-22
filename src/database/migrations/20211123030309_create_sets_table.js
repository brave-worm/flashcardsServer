
exports.up = function (knex) {
    return knex.schema.createTable('sets', (table) => {
        table.increments('id').primary()
        table.string('setTitle').notNull()
        table.string('setDescription')

        table.integer('user_id').unsigned().notNull()
        table.foreign('user_id').references('users.id')

        table.timestamps(false, true)
    })
};

exports.down = function (knex) {

};
