exports.up = function (knex) {
  return knex.schema.createTable('questions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('topic_id').notNullable().references('id').inTable('topics').onDelete('CASCADE');
    table.uuid('paper_id').references('id').inTable('past_papers').onDelete('SET NULL');
    table.text('question_text_si').notNullable();
    table.text('question_text_en').notNullable();
    table.jsonb('options').notNullable();
    table.integer('correct_answer').notNullable();
    table.text('explanation_si');
    table.text('explanation_en');
    table.enu('difficulty', ['easy', 'medium', 'hard']).defaultTo('medium');
    table.string('image_url');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('questions');
};
