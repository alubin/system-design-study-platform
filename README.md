# System Design Interview Study Platform

An interactive, full-featured web application to help prepare for senior backend engineer system design interviews. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 📊 Dashboard
- Progress tracking across all study areas
- Interview countdown timer
- Study streak tracking
- Total study time analytics
- Overall mastery visualization

### 📚 Topic Deep-Dives (20+ Topics)
Organized across 6 categories:
- **Data Pipeline & Sync Systems**: CDC, Batch vs Stream, Idempotency, Data Warehouses
- **Distributed Systems**: Async Jobs, Rate Limiting, Distributed Locking, Event-Driven Architecture
- **Multi-Tenant SaaS**: Tenant Isolation, Noisy Neighbor, Configuration Management
- **Access Control**: RBAC, ABAC, Google Zanzibar, Multi-Tenant Permissions
- **Reliability & Observability**: Retry Strategies, Circuit Breakers, Monitoring, Schema Evolution
- **Storage & Databases**: Database Selection, Caching, Data Modeling

Each topic includes:
- Detailed concept explanations
- ELI5 (simple) and technical explanations
- Key terminology with definitions
- Common mistakes and pitfalls
- Related topics linking

### 🎯 Flashcards with Spaced Repetition
- 80+ flashcards across 4 decks
- SM-2 spaced repetition algorithm
- Keyboard shortcuts (1-4 to rate, Space to flip)
- Intelligent card prioritization (overdue → due today → new)
- Mastery tracking per card
- Progress analytics per deck

### 💼 Practice Problems
- 6 detailed system design scenarios
- Timed sessions with customizable duration
- Progressive hint system
- Auto-saving scratchpad for notes
- Comprehensive sample solutions with:
  - System components
  - Data flow diagrams
  - Key design decisions with rationale
  - Scaling considerations
  - Alternative approaches

### 📝 Quiz System
- 40+ questions with explanations
- Multiple choice, true/false, and scenario-based questions
- Categorized by topic
- Immediate feedback with detailed explanations
- Score tracking and history
- Performance analytics

### ⚙️ Settings & Data Management
- Set interview date for countdown
- Configure daily study goals
- Dark/light/system theme toggle
- Export/import progress (JSON)
- Clear all data option

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Theme**: next-themes
- **Storage**: localStorage (no backend needed)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd system-design-course-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)
This project is optimized for Vercel deployment:

1. Push your code to GitHub
2. Import the project in Vercel
3. Deploy (zero configuration needed)

### Other Platforms
The app is a static Next.js site that can be deployed to:
- Netlify
- GitHub Pages
- AWS Amplify
- Any static hosting service

## Project Structure

```
├── app/                      # Next.js app directory
│   ├── flashcards/          # Flashcard study system
│   ├── practice/            # Practice problems
│   │   └── [problemId]/     # Individual problem pages
│   ├── quiz/                # Quiz system
│   ├── settings/            # Settings page
│   ├── topics/              # Topic pages
│   │   └── [category]/      # Category listings
│   │       └── [topicId]/   # Individual topic pages
│   ├── layout.tsx           # Root layout with header
│   └── page.tsx             # Dashboard/home page
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── flashcard.tsx        # Flashcard component
│   ├── header.tsx           # Navigation header
│   ├── progress-ring.tsx    # Circular progress indicator
│   ├── theme-provider.tsx   # Theme context provider
│   └── timer.tsx            # Countdown timer
├── content/                 # Study content (TypeScript)
│   ├── flashcards.ts        # Flashcard data
│   ├── problems.ts          # Practice problem data
│   ├── quiz.ts              # Quiz questions
│   └── topics.ts            # Topic content
├── lib/                     # Utilities
│   ├── spaced-repetition.ts # SM-2 algorithm
│   ├── storage.ts           # localStorage helpers
│   └── utils.ts             # Utility functions
└── public/                  # Static assets
```

## Features in Detail

### Spaced Repetition System
Uses the SM-2 algorithm to optimize flashcard review intervals:
- Quality 0-2: Reset card, review immediately
- Quality 3-5: Increase interval with ease factor
- Automatic scheduling of next review
- Prioritization: overdue > due today > new cards

### Progress Tracking
All progress is stored locally in the browser:
- Topics completed
- Flashcard mastery levels and review schedules
- Quiz scores with timestamps
- Practice problem completions with time spent
- Study sessions with duration tracking

### Keyboard Shortcuts
- **Flashcards**: Space (flip), 1-4 (rate difficulty)
- **Navigation**: Built-in browser shortcuts

## Content Overview

- **20+ System Design Topics** with detailed explanations
- **80+ Flashcards** for quick concept review
- **6 Practice Problems** with full solutions
- **40+ Quiz Questions** with explanations

All content is privacy-focused - no company names or specific interview details.

## Customization

### Adding Content
All content is in TypeScript files under `/content/`:

1. **Add Topics**: Edit `content/topics.ts`
2. **Add Flashcards**: Edit `content/flashcards.ts`
3. **Add Problems**: Edit `content/problems.ts`
4. **Add Quiz Questions**: Edit `content/quiz.ts`

### Styling
- Global styles: `app/globals.css`
- Theme colors: Tailwind config in `tailwind.config.ts`
- Component styles: Use Tailwind classes

## License

MIT License - feel free to use this for your own interview preparation!

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
