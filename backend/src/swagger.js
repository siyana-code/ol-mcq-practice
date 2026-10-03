const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OL MCQ Practice API',
      version: '1.0.0',
      description: 'API for OL Past Paper MCQ Practice Mobile App - Sri Lankan Students (Sinhala Medium)',
      contact: {
        name: 'SiyanaCode Org',
        url: 'https://github.com/siyana-code/ol-mcq-practice',
      },
    },
    servers: [
      {
        url: 'https://siyana-mcq.onrender.com',
        description: 'Production',
      },
      {
        url: 'http://localhost:3000',
        description: 'Local Development',
      },
    ],
    components: {
      schemas: {
        Subject: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name_si: { type: 'string', example: 'විද්‍යාව' },
            name_en: { type: 'string', example: 'Science' },
            icon: { type: 'string', example: 'flask' },
            sort_order: { type: 'integer' },
            category: {
              type: 'string',
              enum: ['mandatory', 'basket1', 'basket2', 'basket3'],
              description: 'Exam slot. One pick per basket is required from each candidate.',
            },
            is_mcq: {
              type: 'boolean',
              description:
                'False when the subject has no drillable MCQ Paper I (practical or essay based).',
              example: true,
            },
            topics: {
              type: 'array',
              items: { $ref: '#/components/schemas/Topic' },
              description: 'Present on /api/profile/my-subjects.',
            },
          },
        },
        MotherLanguage: {
          type: 'string',
          enum: ['sinhala', 'tamil'],
          example: 'sinhala',
        },
        Religion: {
          type: 'string',
          enum: ['buddhism', 'christianity', 'islam', 'shaivism'],
          example: 'buddhism',
        },
        SubjectSelection: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name_si: { type: 'string' },
            name_en: { type: 'string' },
            icon: { type: 'string' },
            is_mcq: { type: 'boolean' },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            mother_language: { $ref: '#/components/schemas/MotherLanguage' },
            religion: { $ref: '#/components/schemas/Religion' },
            onboarded_at: { type: 'string', format: 'date-time', nullable: true },
            onboarded: { type: 'boolean' },
            complete: { type: 'boolean' },
            selections: {
              type: 'object',
              properties: {
                basket1: { $ref: '#/components/schemas/SubjectSelection' },
                basket2: { $ref: '#/components/schemas/SubjectSelection' },
                basket3: { $ref: '#/components/schemas/SubjectSelection' },
              },
            },
          },
        },
        Topic: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            subject_id: { type: 'string', format: 'uuid' },
            name_si: { type: 'string', example: 'බිදුම්' },
            name_en: { type: 'string', example: 'Fractions' },
            sort_order: { type: 'integer' },
          },
        },
        Question: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            topic_id: { type: 'string', format: 'uuid' },
            paper_id: { type: 'string', format: 'uuid' },
            question_text_si: { type: 'string' },
            question_text_en: { type: 'string' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text_si: { type: 'string' },
                  text_en: { type: 'string' },
                },
              },
            },
            correct_answer: { type: 'integer' },
            explanation_si: { type: 'string' },
            explanation_en: { type: 'string' },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
            image_url: { type: 'string' },
          },
        },
        PastPaper: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            subject_id: { type: 'string', format: 'uuid' },
            year: { type: 'integer', example: 2023 },
            paper_number: { type: 'integer', example: 1 },
            title_si: { type: 'string' },
            title_en: { type: 'string' },
            pdf_url: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            avatar_url: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
