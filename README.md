# OL MCQ Practice App

> **OL Past Paper MCQ Practice Mobile Application for Sri Lankan Students (Sinhala Medium)**

A cross-platform mobile app that helps Sri Lankan Ordinary Level (OL) students practice past paper Multiple Choice Questions (MCQs) with instant feedback, explanations, and progress analytics.

---

## 📱 App Overview

| | |
|---|---|
| **Platform** | Android & iOS (React Native + Expo) |
| **Language** | Sinhala + English (toggle) |
| **Exam Board** | Sri Lankan National O Level |
| **Monetization** | Free with AdMob ads |
| **Backend** | Node.js + PostgreSQL |
| **Admin Panel** | React Web App |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native (Expo) |
| Backend API | Node.js + Express |
| Database | PostgreSQL |
| File Storage | AWS S3 / Cloudinary |
| Admin Panel | React (Web) |
| Authentication | Firebase Auth / JWT |
| Ads | react-native-google-mobile-ads (AdMob) |
| PDF Parsing | Python (pdfplumber / camelot) |

---

## 📂 Repository Structure

```
ol-mcq-practice/
├── docs/                  # Planning docs, API specs, design specs
│   └── PLAN.md            # Full project plan
├── mobile/                # React Native (Expo) app
├── backend/               # Node.js API server
├── admin-panel/          # React web admin panel
├── scripts/               # PDF digitization & utility scripts
└── README.md              # This file
```

---

## 🌿 Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | **Production releases only** — protected, stable code |
| `develop` | **Feature implementations** — active development branch |
| `feature/*` | Individual feature branches (merged into `develop`) |
| `hotfix/*` | Urgent production fixes (merged into `main` + `develop`) |

### Workflow

1. Create a new feature branch from `develop`:
   ```bash
   git checkout develop
   git checkout -b feature/your-feature-name
   ```
2. Implement your feature and commit:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
3. Push and create a Pull Request to `develop`:
   ```bash
   git push origin feature/your-feature-name
   ```
4. After review, merge into `develop`
5. When `develop` is stable, create a release PR to `main`

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- PostgreSQL 14+
- Python 3.9+ (for PDF scripts)

### Mobile App

```bash
cd mobile
npm install
npx expo start
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### Admin Panel

```bash
cd admin-panel
npm install
npm start
```

---

## 📋 Core Features

### MVP (Phase 1)
- [ ] Browse subjects → topics → practice MCQs
- [ ] Answer MCQ with instant feedback + explanation
- [ ] Timed practice sessions
- [ ] Basic progress tracking (score per session)
- [ ] Sinhala + English language toggle
- [ ] AdMob banner ads
- [ ] Admin panel: add/edit/delete questions
- [ ] PDF digitization pipeline

### Phase 2
- [ ] User accounts with cloud sync
- [ ] Full past paper simulation (real exam conditions)
- [ ] Advanced analytics (weak topics, progress charts)
- [ ] Spaced repetition review
- [ ] Push notifications (daily practice reminders)

### Phase 3
- [ ] Leaderboards & achievements
- [ ] More subjects
- [ ] Offline mode
- [ ] Community features

---

## 📊 Data Model

```
Subject
  └── Topic
        └── Question (text_si, text_en, options, correct_answer, explanation)
              └── PastPaper (year, paper_number, title)

User
  └── UserProgress (question_id, is_correct, answered_at)
  └── UserStats (subject_id, total_answered, correct_count, streak)
```

---

## 🔧 Content Pipeline

1. **Collect PDFs** — Gather 5-10 years of past papers per subject
2. **Python digitization** — Parse PDFs to extract questions & answer keys
3. **Manual review** — Human verifies extracted data for accuracy
4. **Admin panel entry** — Manual entry for questions scripts can't parse
5. **Sinhala translation** — All questions translated to Sinhala

---

## 👥 Team Roles

| Role | Responsibility |
|---|---|
| Mobile Developer | React Native app |
| Backend Developer | API, database, auth |
| Content/Subject Expert | Digitize papers, verify answers, translate |
| UI/UX Designer | App & admin panel design |
| QA Tester | Device testing, content accuracy |

---

## 📅 Timeline

| Phase | Duration | Milestone |
|---|---|---|
| Planning & Design | 2-3 weeks | UI/UX designs, DB schema, API spec |
| Backend + Admin Panel | 3-4 weeks | API ready, admin panel functional |
| Mobile App MVP | 4-6 weeks | Core practice flow working |
| Content Digitization | 4-6 weeks | 500+ questions entered |
| Testing & Polish | 2-3 weeks | Bug fixes, device testing |
| **Total to launch** | **~12-16 weeks** | |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch from `develop`
3. Make your changes
4. Submit a Pull Request to `develop`

---

## 📮 Contact

**SiyanaCode Org** — [github.com/siyana-code](https://github.com/siyana-code)
