exports.up = function (knex) {
  return knex.schema.createTable('user_stats', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('subject_id').notNullable().references('id').inTable('subjects').onDelete('CASCADE');
    table.integer('total_answered').defaultTo(0);
    table.integer('correct_count').defaultTo(0);
    table.integer('streak').defaultTo(0);
    table.timestamp('last_active');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('user_stats');
};
