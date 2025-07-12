# Wellum Client

This is the **client-side React application** for Wellum, a modern fitness and workout tracking platform.

## Features

- User authentication (Clerk)
- Responsive sidebar navigation
- Workout sheets management (create, edit, delete)
- Guided workout mode
- Exercise library with images and videos
- Workout history and dashboard with charts
- Agenda/calendar view for completed workouts

## Tech Stack

- **React** (with hooks)
- **TypeScript**
- **Tailwind CSS** for styling
- **Clerk** for authentication
- **Chart.js** (via react-chartjs-2) for data visualization
- **Vite** (or Create React App) as build tool

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/wellum.git
   cd wellum/client
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Copy the example environment variables and configure them:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` to set your API endpoints and Clerk keys.

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. The app will be available at [http://localhost:5173](http://localhost:5173) (or the port specified by Vite).

## Project Structure

```
client/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components (route targets)
│   ├── lib/           # Utility functions
│   ├── assets/        # Images, videos, etc.
│   └── App.tsx        # Main app component
├── public/            # Static files (served as root)
├── package.json
└── README.md
```

## Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run preview` – Preview production build

## API

This client expects a backend API (see `/api` endpoints in the code).  
You can find or implement the backend in the `server/` directory or as a separate service.

## Authentication

Authentication is handled via [Clerk](https://clerk.com/).  
You need to configure your Clerk project and set the public key in your `.env` file.

## Customization

- Update colors, branding, and assets in `src/assets/` and Tailwind config.
- Add or modify features in the `src/components/` and `src/pages/` directories.

## License

MIT

---

**Wellum** – Your digital fitness companion.