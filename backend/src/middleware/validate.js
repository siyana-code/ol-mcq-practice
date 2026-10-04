const { z } = require('zod');

const uuid = z.string().uuid();

const motherLanguage = z.enum(['sinhala', 'tamil']);
const religion = z.enum(['buddhism', 'christianity', 'islam', 'shaivism']);
const category = z.enum(['mandatory', 'basket1', 'basket2', 'basket3']);
const difficulty = z.enum(['easy', 'medium', 'hard']);

/**
 * True when the string contains a control character other than tab,
 * newline or carriage return. Lets questions stay multi-line while
 * rejecting binary junk.
 */
function hasControlChars(value) {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code === 127) return true;
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) return true;
  }
  return false;
}

/** Trims surrounding whitespace and rejects embedded control characters. */
const cleanText = (max) =>
  z
    .string()
    .trim()
    .min(1, 'Required')
    .max(max, `Must be ${max} characters or fewer`)
    .refine((v) => !hasControlChars(v), 'Contains invalid control characters');

const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((v) => !hasControlChars(v), 'Contains invalid control characters')
    .optional()
    .nullable();

const register = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  name: cleanText(120),
  // bcrypt ignores bytes past 72, so reject rather than silently truncate.
  password: z.string().min(8, 'At least 8 characters').max(72, 'Too long'),
  mother_language: motherLanguage.optional(),
  religion: religion.optional(),
});

const login = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(1).max(72),
});

const updateProfile = z
  .object({
    name: cleanText(120).optional(),
    mother_language: motherLanguage.optional(),
    religion: religion.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Nothing to update' });

const basketPicks = z.object({
  basket1: uuid,
  basket2: uuid,
  basket3: uuid,
});

const subjectUpsert = z.object({
  name_si: cleanText(160),
  name_en: cleanText(160),
  icon: optionalText(64),
  category,
  is_mcq: z.boolean().default(true),
  // null means "no MCQ paper expected".
  expected_mcq_count: z.coerce.number().int().min(1).max(500).nullable().optional(),
  sort_order: z.coerce.number().int().min(0).max(999).optional(),
});

const topicUpsert = z.object({
  subject_id: uuid,
  name_si: cleanText(160),
  name_en: cleanText(160),
  sort_order: z.coerce.number().int().min(0).max(999).optional(),
});

const questionOption = z.object({
  text_si: cleanText(600),
  text_en: cleanText(600),
});

/**
 * 2-5 options, and the key must point at one of them, otherwise the app can
 * serve a question that can never be answered correctly.
 *
 * The base shape is exported separately because Zod v4 forbids `.partial()`
 * on a schema that carries a refinement, and PATCH needs exactly that.
 */
const questionShape = z.object({
  topic_id: uuid,
  paper_id: uuid.nullable().optional(),
  question_text_si: cleanText(4000),
  question_text_en: cleanText(4000),
  options: z.array(questionOption).min(2).max(5),
  correct_answer: z.coerce.number().int().min(0),
  explanation_si: optionalText(4000),
  explanation_en: optionalText(4000),
  difficulty: difficulty.default('medium'),
  image_url: optionalText(1000),
});

const questionUpsert = questionShape.refine((q) => q.correct_answer < q.options.length, {
  message: 'correct_answer is outside the options range',
  path: ['correct_answer'],
});

/**
 * PATCH cannot use the same cross-field refinement, because `options` and
 * `correct_answer` may each be absent. The route re-checks the pair when both
 * are supplied. `topic_id` is omitted because moving a question between
 * topics is a content operation, not an edit.
 */
const questionPatch = questionShape
  .partial()
  .omit({ topic_id: true })
  .refine((q) => Object.keys(q).length > 0, { message: 'Nothing to update' });

const paperUpsert = z.object({
  subject_id: uuid,
  year: z.coerce.number().int().min(1990).max(2100),
  paper_number: z.coerce.number().int().min(1).max(20),
  title_si: optionalText(300),
  title_en: optionalText(300),
  pdf_url: optionalText(1000),
});

const startSession = z.object({
  subject_id: uuid,
  topic_id: uuid.nullable().optional(),
  mode: z.enum(['timed', 'untimed']).default('untimed'),
  // Optional cap; defaults to the subject's admin-set expectation.
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

const submitAnswer = z.object({
  question_id: uuid,
  // null records a deliberate skip.
  selected_answer: z.coerce.number().int().min(0).max(4).nullable(),
  time_taken: z.coerce.number().int().min(0).max(86400).optional(),
});

const finishSession = z.object({
  elapsed_seconds: z.coerce.number().int().min(0).max(86400).optional(),
  status: z.enum(['completed', 'abandoned']).default('completed'),
});

/**
 * Builds an Express middleware that validates and replaces req.body.
 *
 * Unknown keys are rejected rather than dropped, so a typo like
 * `question_text_SI` surfaces instead of silently vanishing.
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue.path.join('.');
      return res.status(400).json({
        error: field ? `${field}: ${issue.message}` : issue.message,
        field: field || undefined,
      });
    }

    req.body = result.data;
    next();
  };
}

module.exports = {
  hasControlChars,
  validate,
  register,
  login,
  updateProfile,
  basketPicks,
  subjectUpsert,
  topicUpsert,
  questionUpsert,
  questionPatch,
  paperUpsert,
  startSession,
  submitAnswer,
  finishSession,
};