# OL MCQ Practice App — Full Project Plan

## 1. Vision

A cross-platform mobile application that helps Sri Lankan Ordinary Level (OL) students practice past paper Multiple Choice Questions (MCQs) in Sinhala medium, with instant feedback, detailed explanations, and progress analytics.

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Mobile App** | React Native (Expo) | OTA updates, easy builds, AdMob integration |
| **Backend** | Node.js + Express | REST API |
| **Database** | PostgreSQL | Structured data for questions, papers, users |
| **File Storage** | AWS S3 / Cloudinary | PDFs, images in questions |
| **Admin Panel** | React (web) | Content management |
| **Auth** | Firebase Auth or custom JWT | Email + Google sign-in |
| **Ads** | react-native-google-mobile-ads | AdMob banners + interstitials |
| **PDF Parsing** | Python (pdfplumber / camelot) | One-time digitization |

---

## 3. Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Mobile App     │────▶│  Backend API │────▶│  PostgreSQL DB  │
│  (React Native) │◀────│  (Node.js)   │◀────│                 │
└─────────────────┘     └──────────────┘     └─────────────────┘
                               │
                        ┌──────┴──────┐
                        │  Admin Panel │
                        │  (React Web) │
                        └─────────────┘
```

---

## 4. Data Model

### Subject
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| name_si | String | Sinhala name |
| name_en | String | English name |
| icon | String | Icon identifier |
| created_at | Timestamp | |

### Topic
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| subject_id | UUID | FK → Subject |
| name_si | String | Sinhala name |
| name_en | String | English name |

### PastPaper
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| subject_id | UUID | FK → Subject |
| year | Integer | Exam year |
| paper_number | Integer | Paper 1, Paper 2, etc. |
| title_si | String | Sinhala title |
| title_en | String | English title |
| pdf_url | String | Link to PDF in storage |

### Question
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| topic_id | UUID | FK → Topic |
| paper_id | UUID | FK → PastPaper |
| question_text_si | Text | Sinhala question |
| question_text_en | Text | English question |
| options | JSONB | Array of {text_si, text_en} |
| correct_answer | Integer | Index of correct option |
| explanation_si | Text | Sinhala explanation |
| explanation_en | Text | English explanation |
| difficulty | Enum | easy, medium, hard |
| image_url | String | Optional image for question |

### User
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| email | String | Unique |
| name | String | Display name |
| avatar_url | String | Optional |
| created_at | Timestamp | |

### UserProgress
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK → User |
| question_id | UUID | FK → Question |
| selected_answer | Integer | User's answer |
| is_correct | Boolean | |
| time_taken | Integer | Seconds |
| answered_at | Timestamp | |

### UserStats
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | FK → User |
| subject_id | UUID | FK → Subject |
| total_answered | Integer | |
| correct_count | Integer | |
| streak | Integer | Daily streak |
| last_active | Timestamp | |

---

## 5. Feature Breakdown

### MVP (Phase 1 — Launch)
- [ ] Browse subjects → topics → practice MCQs
- [ ] Answer MCQ with instant feedback + explanation
- [ ] Timed practice sessions (e.g., 10 questions in 10 min)
- [ ] Basic progress tracking (score per session)
- [ ] Sinhala + English toggle for questions
- [ ] AdMob banner ads
- [ ] Admin panel: add/edit/delete questions manually
- [ ] PDF digitization pipeline (Python script → DB import)

### Phase 2 (Post-Launch)
- [ ] User accounts with cloud sync
- [ ] Full past paper simulation (real exam conditions)
- [ ] Advanced analytics (weak topics, progress over time, charts)
- [ ] Spaced repetition review
- [ ] Push notifications (daily practice reminder)
- [ ] Interstitial ads between sessions

### Phase 3 (Growth)
- [ ] Leaderboards & achievements
- [ ] More subjects
- [ ] Discussion/hint community feature
- [ ] Offline mode (download papers for offline use)

---

## 6. Content Pipeline

This is the **hardest part** of the project.

### Step 1: Collect PDFs
- Gather 5-10 years of past papers per subject
- Source from Department of Examinations Sri Lanka, school resources, etc.

### Step 2: Python Digitization Script
- Parse PDFs using `pdfplumber` or `camelot`
- Extract questions, options, and answer keys
- Output structured JSON for review

### Step 3: Manual Review
- Subject expert reviews extracted data
- Fix parsing errors, formatting issues
- Verify answer keys

### Step 4: Admin Panel Entry
- Questions that can't be auto-parsed are entered manually
- Bulk import via CSV/JSON

### Step 5: Sinhala Translation
- All questions need Sinhala text
- Professional translation or subject expert translation
- Review for accuracy

---

## 7. Key Challenges

| Challenge | Details | Mitigation |
|---|---|---|
| **Sinhala content** | All questions need Sinhala text | Hire translators or use subject experts |
| **PDF parsing accuracy** | Complex layouts (two columns, tables) | Expect 70-80% auto-extraction, rest manual |
| **Answer keys** | Official keys may not be available | Subject experts verify |
| **Content volume** | 10 years × 50 questions × 2 subjects = ~1,000 questions | Start with 500 for MVP |
| **App store compliance** | Ads + educational content policies | Follow Google Play / App Store guidelines |

---

## 8. Team Roles

| Role | Responsibility |
|---|---|
| **Mobile Developer** | React Native app |
| **Backend Developer** | API, database, auth |
| **Content/Subject Expert** | Digitize papers, verify answers, translate to Sinhala |
| **UI/UX Designer** | App design, admin panel design |
| **QA Tester** | Test on devices, verify content accuracy |

---

## 9. Timeline

| Phase | Duration | Milestone |
|---|---|---|
| Planning & Design | 2-3 weeks | UI/UX designs, DB schema, API spec |
| Backend + Admin Panel | 3-4 weeks | API ready, admin panel functional |
| Mobile App MVP | 4-6 weeks | Core practice flow working |
| Content Digitization | 4-6 weeks (parallel) | 500+ questions entered |
| Testing & Polish | 2-3 weeks | Bug fixes, device testing |
| **Total to launch** | **~12-16 weeks** | |

---

## 10. Monetization

- **AdMob banner ads** — Non-intrusive, always visible
- **Interstitial ads** — Between practice sessions (frequency capped)
- **Future: Freemium** — Premium features (advanced analytics, offline mode)

---

## 11. Success Metrics

| Metric | Target (6 months post-launch) |
|---|---|
| Downloads | 10,000+ |
| Daily Active Users | 1,000+ |
| Questions in DB | 2,000+ |
| Subjects | 3-5 |
| Average Session Length | 8+ minutes |
| Retention (Day 7) | 25%+ |
