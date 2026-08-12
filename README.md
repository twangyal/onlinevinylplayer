# 🪩 Online Vinyl Player (Digital Turntable Simulator)

An interactive, web-based vinyl record player simulator built with **Next.js 16**, **React 19**, **TypeScript**, and the **Web Audio API**. Experience the tactile feel of physical vinyl records in your browser—complete with interactive tonearm scrubbing, real-time queue reordering, and cloud collection management.

---

## ✨ Features

- **🎧 Custom Web Audio Engine**: Wraps `AudioContext`, `AudioBufferSourceNode`, and `GainNode` pipelines to handle seamless track switching, precise seeking, volume adjustment, and audio preloading with `AbortController` memory cleanup.
- **🎛️ Interactive Physics-based Tonearm**: Drag and place the stylus onto record grooves using vector trigonometry (`Math.atan2`). Real-time needle tracking synchronizes smoothly with audio progress using `requestAnimationFrame`.
- **🔀 Drag-and-Drop Queueing**: Powered by `@dnd-kit`, permitting real-time reordering of queue items and custom track listings.
- **📦 Custom Record Creation**: Upload local audio files to create and customize vinyl albums dynamically with metadata generation.
- **☁️ Supabase Cloud Storage & Auth**: Full-stack integration via `@supabase/ssr` to persist user-created vinyl records and songs to PostgreSQL database schemas.
- **🎨 Glassmorphic Modern UI**: Styled with Tailwind CSS v4, dark/light theme accents, smooth CSS keyframe animations, and Lucide icons.

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19 |
| **Audio Processing** | Web Audio API (`AudioContext`, `GainNode`, `AudioBuffer`) |
| **Language & Types** | TypeScript |
| **Styling** | Tailwind CSS v4, Lucide React |
| **Drag & Drop** | `@dnd-kit/react`, `@dnd-kit/helpers` |
| **Backend & Database** | Supabase SSR (`@supabase/ssr`, PostgreSQL) |

---

## 📂 Project Architecture

```text
src/
├── app/                  # Next.js App Router pages, layouts & API handlers
├── client/
│   ├── audio/            # Web Audio API engine & buffer controllers
│   │   ├── AudioEngine.ts   # Core AudioContext & master gain setup
│   │   ├── VinylPlayer.ts   # Queue logic, duration calculation, scrubbing
│   │   ├── TrackNode.ts     # Individual track playback & offset manager
│   │   └── VinylBuffers.ts  # Async track preloader & memory management
│   ├── hooks/            # React hooks (useAudioEngine, useVinylPlayer)
│   └── ui/               # PlayView, Tonearm, SpinningVinyl & UI components
├── db/                   # Supabase server & client repositories
├── lib/                  # Auth and upload helpers
└── model/                # TypeScript domain entities (Vinyl, Track, Queue)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.x or higher
- **npm** / **yarn** / **pnpm** / **bun**

### Environment Setup

Create a `.env.local` file in the root directory with your Supabase credentials (if connecting to backend database):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/onlinevinylplayer.git
   cd onlinevinylplayer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Compiles the application for production.
- `npm run start`: Starts the production build server.
- `npm run lint`: Runs ESLint checks.

---

## 📄 License

Distributed under the MIT License.
