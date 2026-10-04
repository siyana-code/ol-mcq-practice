exports.up = async function (knex) {
  // 1. Roles
  await knex.schema.alterTable('users', (table) => {
    table.text('role').notNullable().defaultTo('student');
  });
  await knex.raw(
    `ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('student','admin'))`,
  );

  // 2. Admin-managed expectation per subject
  await knex.schema.alterTable('subjects', (table) => {
    table.integer('expected_mcq_count');
  });
  await knex.raw(`
    ALTER TABLE subjects
    ADD CONSTRAINT subjects_expected_mcq_count_check
    CHECK (expected_mcq_count IS NULL OR expected_mcq_count > 0)
  `);
  await knex('subjects')
    .where({ is_mcq: true })
    .whereNull('expected_mcq_count')
    .update({ expected_mcq_count: 40 });

  // 3. Practice sessions
  await knex.schema.createTable('practice_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('user_id')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table
      .uuid('subject_id')
      .notNullable()
      .references('id')
      .inTable('subjects')
      .onDelete('CASCADE');
    table.uuid('topic_id').references('id').inTable('topics').onDelete('SET NULL');
    table.text('mode').notNullable().defaultTo('untimed');
    table.text('status').notNullable().defaultTo('active');
    table.specificType('question_ids', 'uuid[]').notNullable().defaultTo('{}');
    table.integer('total_questions').notNullable().defaultTo(0);
    table.integer('answered_count').notNullable().defaultTo(0);
    table.integer('correct_count').notNullable().defaultTo(0);
    table.integer('skipped_count').notNullable().defaultTo(0);
    table.integer('elapsed_seconds').notNullable().defaultTo(0);
    table.timestamp('started_at').defaultTo(knex.fn.now());
    table.timestamp('ended_at');
    table.timestamps(true, true);
  });

  await knex.raw(`
    ALTER TABLE practice_sessions
    ADD CONSTRAINT practice_sessions_mode_check CHECK (mode IN ('timed','untimed'))
  `);
  await knex.raw(`
    ALTER TABLE practice_sessions
    ADD CONSTRAINT practice_sessions_status_check
    CHECK (status IN ('active','completed','abandoned'))
  `);

  // Partial unique index: one live session per student, history unconstrained.
  await knex.raw(
    'CREATE UNIQUE INDEX idx_practice_sessions_one_active ON practice_sessions (user_id) WHERE status = \'active\'',
  );
  await knex.raw(
    'CREATE INDEX idx_practice_sessions_started_at ON practice_sessions (started_at DESC)',
  );

  // 4. Answers. selected_answer nullable so a skip is recorded without a grade.
  await knex.schema.createTable('practice_answers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table
      .uuid('session_id')
      .notNullable()
      .references('id')
      .inTable('practice_sessions')
      .onDelete('CASCADE');
    table
      .uuid('question_id')
      .notNullable()
      .references('id')
      .inTable('questions')
      .onDelete('CASCADE');
    table.integer('selected_answer');
    table.boolean('is_correct');
    table.integer('time_taken');
    table.timestamp('answered_at').defaultTo(knex.fn.now());
    table.unique(['session_id', 'question_id']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('practice_answers');
  await knex.schema.dropTableIfExists('practice_sessions');
  await knex.raw(
    'ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_expected_mcq_count_check',
  );
  await knex.schema.alterTable('subjects', (table) => {
    table.dropColumn('expected_mcq_count');
  });
  await knex.raw('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('role');
  });
};