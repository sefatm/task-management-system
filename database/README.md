# Database (MySQL 8)

| File | Purpose |
|------|---------|
| `schema.sql` | mysqldump-style script (same conventions as the govt DB): creates `taskdb`, tables `app_user` + `task`, seed data with BCrypt hashes |

Local: `docker compose up -d db` from the repo root auto-runs `schema.sql`.
Cloud (Railway / any MySQL): import `schema.sql` (remove the `CREATE DATABASE` / `USE` lines if your provider pre-creates the DB).
