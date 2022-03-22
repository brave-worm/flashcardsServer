
exports.up = function(knex) {
    return knex.schema.createTable('profiles', (table) => {
        table.increments('id').primary()
        table.string('name')
        table.text('description')

        table.integer('user_id').unsigned().unique().notNull()
        table.foreign('user_id').references('users.id')

        table.timestamps(false, true)
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('profiles')
};
