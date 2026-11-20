# ERP Project

## Backend setup after pulling

1. In the backend folder, run npm install.
2. Create backend/.env and set DATABASE_URL to your own PostgreSQL development database. Do not commit the .env file.
3. From the backend folder, run:

       npm run db:setup

4. Start the backend with npm run dev.

The setup command applies the single baseline to a fresh database. For an existing database, it checks that the database schema matches the current Prisma schema and records the baseline without rerunning SQL, preserving existing data. It stops without changing the database if the schema is only partially migrated or differs from the current schema.

When intentionally changing prisma/schema.prisma, create a new migration with npx prisma migrate dev --name <descriptive_name> and commit it with the schema change.
