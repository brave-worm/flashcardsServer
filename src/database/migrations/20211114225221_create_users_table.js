
exports.up = function(knex) {
    return knex.schema.createTable('users', (table) => {
        table.increments('id').primary()
        table.string('email').unique().notNull()
        table.string('password').notNull()
        table.timestamps(false, true)
    })
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExist('users')
  };
  