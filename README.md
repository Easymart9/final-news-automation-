# 🗞️ Worldwide AI News Platform
> **Fact-Checked Automated AI Journalism & Technical Reporting System**

A production-grade, automated artificial intelligence news publication built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, and **Groq Llama-3.3-70B AI Engine**. Featuring automated RSS research, multi-source claim verification, atomic JSON database storage, password-protected administrative controls, and Google News compliant SEO sitemaps.

---

## 🚀 Key System Features

- **📰 Publication-Grade Editorial Front Page**: Styled like *The New York Times*, *Wired*, and *The Verge* with breaking news tickers, lead spotlight stories, and visual coverage desks.
- **⚡ Automated News Ingestion Pipeline**: Scans ArXiv preprints, MIT CSAIL, and TechCrunch RSS feeds for high-demand AI topics.
- **🧠 Groq Llama-3.3-70B Synthesis**: Generates structured editorial articles complete with executive summaries, key takeaways, deep dives, author signatures, and citations.
- **🛡️ Automated Multi-Source Fact Checking**: Evaluates empirical claims against external source URLs, generating a 0–100% Trust Score.
- **💾 Zero-Data-Loss Atomic JSON Database**: Prevents data corruption during concurrent writes using temporary file creation and atomic `fs.renameSync` file swaps (`data/db.json`).
- **🔐 Password-Protected Admin Panel**: Secured `/admin` dashboard behind server-side HTTP-Only session cookies with live telemetry and pipeline execution tools.
- **🔍 Full SEO & Google News Compatibility**: Auto-generated Google News XML Sitemaps (`/google-news-sitemap.xml`), standard sitemaps (`/sitemap.xml`), and JSON-LD Structured Data.

---

## ⚡ How News Automation Works

The platform includes an end-to-end automated news generation and fact-checking engine accessible from the Admin Panel (`/admin/automation`) or via background API calls (`/api/automation/run`).

```
┌────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│ 1. Ingest RSS Feeds    │ ───► │ 2. Groq Llama-3.3 AI    │ ───► │ 3. Claim Fact-Checker   │
│ (ArXiv, TechCrunch)    │      │    Article Synthesis    │      │    (Trust Score 0-100%) │
└────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
                                                                              │
                                                                              ▼
┌────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│ 6. Google News XML     │ ◄─── │ 5. Atomic DB Swap       │ ◄─── │ 4. Review Queue Check   │
│    Sitemap Generated   │      │    (data/db.json)       │      │    (Score <80% held)    │
└────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

### Step-by-Step Execution Flow:
1. **Ingestion & Research**: The parser fetches real-time RSS feeds from ArXiv (`cs.AI`), MIT CSAIL, and TechCrunch, identifying trending topics in LLMs, AI Chips, Autonomous Agents, Safety, and Robotics.
2. **Groq LLM Generation**: Sends research prompts to the Groq Cloud API (`llama-3.3-70b-versatile`) to generate a complete, structured journalistic article with valid HTML body markup.
3. **Multi-Source Fact Verification**: The verifier extracts empirical claims (*e.g., "94.2% accuracy on quantum mechanics benchmarks"*) and cross-references them against source URLs, assigning a Trust Score (0–100%).
4. **Confidence Threshold & Review Queue**:
   - **Trust Score ≥ 80%**: Marked as `VERIFIED` and published directly to the public homepage feed.
   - **Trust Score < 80%**: Marked as `NEEDS_REVIEW` and held in the **Admin Article Review Queue** for manual approval.
5. **Atomic Database Swap**: Writes the new article to a `.tmp` file and performs an atomic `fs.renameSync` swap to update `data/db.json` without data corruption.

### 📊 How Many News Articles Are Generated Per Pipeline Run?
- **Standard Pipeline Execution**: Each single trigger of the pipeline fetches and generates **1 to 3 verified high-priority stories** per run.
- **Batch Automation Runs**: Configurable up to **10+ stories per batch execution** during scheduled cron runs.

---

## 🔐 Admin Panel Credentials & Password Protection

Access to the Admin Panel (`/admin/*`) is strictly isolated behind server-side HTTP-Only session authentication. The Admin Panel link and automation trigger buttons do **NOT** appear anywhere on the public website.

- **Admin Login Route**: [`http://localhost:3000/admin/login`](http://localhost:3000/admin/login)
- **Default Username**: `admin` *(or `admin@ainews.org`)*
- **Default Password**: `admin123`

---

## 📖 Comprehensive Page & Section Breakdown

### 🌐 Public Website Pages

#### 1. 📰 Public Front Page (`/`)
- **Top Utility Wire**: Displays live date, world edition indicator, and direct link to Editorial Standards.
- **Publication Masthead**: Serif header titled **WORLDWIDE AI NEWS** (*"The Independent Artificial Intelligence Journal"*).
- **Primary Category Navbar**: Navigation links for *Latest News*, *Models & LLMs*, *AI Tools & Agents*, *Hardware & Silicon*, *Safety & Policy*, and *Robotics*.
- **Breaking News Ticker (`src/components/NewsTicker.tsx`)**: Live breaking headlines ticker bar.
- **Front-Page Spotlight Grid**:
  - **Lead Spotlight Story (7 Columns)**: 460px high-resolution feature image with rounded corners, category pill, publication date, read time, large serif headline, and author signature with avatar.
  - **Top Headlines (5 Columns)**: 3 breaking secondary stories with side-by-side thumbnails, bold headlines, and author lines.
- **Coverage Desks Index**: Interactive 5-column visual card strip displaying coverage hubs with story counts and descriptions.
- **Latest Reporting Stream**: Chronological feed of all verified database articles sorted from newest to oldest.

#### 2. 📄 Individual Article Reader (`/news/[slug]`)
- Displays full article headline, category badge, publication date, read time, and hero photograph with caption.
- **Key Takeaways Box**: Executive bullet points summarizing core technical claims.
- **Journalistic Citation Footnote (`src/components/VerificationBadge.tsx`)**: Citation box listing external reporting sources, verified claims, and Trust Score.
- **Reporter Credential Profile (`src/components/AuthorCard.tsx`)**: Author avatar, bio, academic degrees, and social profiles.
- **Structured JSON-LD Data**: Embedded `NewsArticle` schema for search engines.

#### 3. 🏷️ Category Coverage Desks (`/topics/[slug]`)
- Archive desk pages for specific technical fields (*LLMs*, *AI Chips*, *Autonomous Agents*, *Safety & Policy*, *Robotics*).
- Displays desk description, total article count, and filtered article cards.

#### 4. ✍️ Reporter Profiles (`/authors/[slug]`)
- Journalist profile page detailing background, verified article count, academic credentials, and published reporting history.

#### 5. 📜 Editorial Standards Policy (`/editorial-standards`)
- Public ethics document detailing multi-source verification rules, correction policies, and AI transparency guidelines.

---

### 🛡️ Admin Dashboard Pages

#### 1. 🔑 Admin Login (`/admin/login`)
- Glassmorphic authentication portal enforcing username/password validation and issuing HTTP-Only session cookies.

#### 2. 📊 System Control Dashboard (`/admin`)
- **4 Real-Time Metric Cards**: Total Published Stories, Average Trust Score %, Review Queue count, and Organic Reads.
- **Recent Articles Manager**: Table displaying stored database records with category badges, author names, trust scores, and direct article links.
- **AI Engine Status & Logs**: Displays Groq API connection state, atomic database sync status, and recent automation logs.

#### 3. ⚡ Automation Control Console (`/admin/automation`)
- Live pipeline execution panel with a **Live TTY Stream Console** showing real-time logs as RSS feeds are scanned, articles generated, and claims verified.

#### 4. 📝 Article Review Queue (`/admin/articles`)
- Full CRUD management table to view, edit, approve, or delete articles stored in `data/db.json`.

#### 5. 🛡️ Fact-Check Audit Logs (`/admin/verification-logs`)
- Cross-reference claim logs detailing verified statements, sources checked, and hallucination risk scores.

#### 6. 📋 System Logs & Diagnostics (`/admin/logs`)
- Execution history detailing task runtimes in milliseconds, execution status, and retry diagnostic logs.

---

### 📡 Automated SEO Sitemaps & Feeds

- **`/google-news-sitemap.xml`**: Specialized Google News XML sitemap featuring article titles, publication dates, languages, and news publication metadata.
- **`/sitemap.xml`**: Standard XML sitemap indexing all public pages, articles, categories, and author profiles.
- **`/robots.txt`**: Search engine crawling directives.

---

## 💾 Database Architecture & Data Protection

All data is stored in `data/db.json`. To eliminate data corruption or zero-byte write errors during concurrent pipeline runs, `src/lib/db/index.ts` uses an **atomic file swap mechanism**:

```typescript
export function writeDb(data: DatabaseSchema): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write to temporary file first, then perform atomic rename
  const tempPath = `${DB_PATH}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_PATH);
}
```

---

## 💻 Installation & Local Running

### Prerequisites:
- Node.js 18+ installed

### Setup Commands:

```bash
# 1. Clone the repository
git clone https://github.com/zoaibahmed/client-automtion.git
cd client-automtion

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
# Public Website:  http://localhost:3000
# Admin Dashboard: http://localhost:3000/admin/login
```

### Environment Variables (Optional):
Create a `.env.local` file in the root directory to enable live Groq Cloud API calls:

```env
GROQ_API_KEY=your_groq_api_key_here
ADMIN_PASSWORD=admin123
```
*Note: If `GROQ_API_KEY` is not provided, the platform automatically uses built-in high-quality fallback seed models.*

---

## 🛠️ Tech Stack Overview

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router, Server Components, Route Handlers) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS (Light Theme Editorial Styling) |
| **Icons** | Lucide React |
| **AI LLM Engine** | Groq Cloud API (`llama-3.3-70b-versatile`) |
| **Database** | Atomic JSON File Storage Engine (`src/lib/db/index.ts`) |
| **Authentication** | HTTP-Only Session Cookies (`src/lib/auth.ts`) |
| **SEO** | Google News XML Sitemaps, JSON-LD Schema Markup |

---

## 📄 License & Rights

© 2026 Worldwide AI News. Developed for automated AI journalism and technical reporting.
