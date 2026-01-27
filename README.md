# Gym Session Tracker

Track your workouts, log sets and reps, and visualize your progress over time. This project focuses on simple, fast logging with insightful analytics—especially total weight lifted and trends across sessions.

## Features

- User registration and login with basic validation
- Create workout sessions per user
- Log sets (exercise, set number, reps, weight) for each session
- View session details and historical sessions
- Aggregate analytics (e.g., total weight lifted, per-exercise trends)
- Designed to be simple, fast, and local-first with SQLite

## Tech Stack

- Backend: Node.js, Express
- Database: SQLite via `better-sqlite3` (synchronous and fast)
- Language: TypeScript
- Graphing/Visualization: TBD (client-side, not covered here)
