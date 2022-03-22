
exports.up = function (knex) {
    return knex.schema.createTable('flashcards', (table) => {
        table.increments('id').primary()
        table.string('front').notNull()
        table.string('back')
        table.integer('correctNumber').unsigned().defaultTo(0)

        table.integer('set_id').unsigned().notNull()
        table.foreign('set_id').references('sets.id').onDelete('CASCADE')
    })
};

exports.down = function (knex) {

};
