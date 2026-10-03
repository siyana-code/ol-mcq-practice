# Supabase Setup

## Quick Start

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open **SQL Editor** in your Supabase dashboard
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Click **Run**

That's it! Your database is ready.

## Database URL

After creating your project, find your connection string at:
**Settings → Database → Connection string → URI**

It looks like:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

Add this to your Render environment variables as `DATABASE_URL`.

## Tables

| Table | Description |
|---|---|
| `subjects` | OL subjects (Math, Science, English) |
| `topics` | Topics within each subject |
| `past_papers` | Past paper metadata |
| `questions` | MCQ questions with Sinhala + English |
| `users` | Registered users |
| `user_progress` | Answer history |
| `user_stats` | Aggregated stats per user per subject |

## Useful Queries

```sql
-- Get all subjects with topic counts
SELECT s.*, COUNT(t.id) as topic_count
FROM subjects s
LEFT JOIN topics t ON t.subject_id = s.id
GROUP BY s.id
ORDER BY s.sort_order;

-- Get question count per subject
SELECT s.name_en, COUNT(q.id) as question_count
FROM subjects s
LEFT JOIN topics t ON t.subject_id = s.id
LEFT JOIN questions q ON q.topic_id = t.id
GROUP BY s.id
ORDER BY s.sort_order;

-- Get user leaderboard
SELECT u.name, us.total_answered, us.correct_count,
       ROUND(us.correct_count::numeric / NULLIF(us.total_answered, 0) * 100, 1) as accuracy
FROM user_stats us
JOIN users u ON u.id = us.user_id
ORDER BY accuracy DESC
LIMIT 10;
```
