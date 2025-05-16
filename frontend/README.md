
# QuickHire - Mini Job Board for Remote Freelancers

A mini job board application where employers can post freelance jobs and freelancers can apply. Built with a React frontend and Express/Node.js backend with PostgreSQL database.

## Features

- **Authentication**: Email-based login with role selection (Employer/Freelancer)
- **Job Management**: Create, edit, archive job listings with titles, descriptions, budgets and skills
- **Job Discovery**: Public job board with filtering, search and pagination
- **Applications**: Submit and view job applications
- **Role-specific Dashboards**: For both employers and freelancers

### Bonus Features

- **Rate limiting** for job applications: Max 10 applications per hour per freelancer
- **Soft-delete** for jobs instead of permanent deletion
- **Last login tracking** for employers displayed on dashboard
- **Edge case handling** for applying to closed jobs

## Tech Stack

- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL (hosted on Aiven.io)
- **ORM**: Prisma
- **Authentication**: Custom JWT implementation
- **Validation**: Zod

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- NPM or Yarn
- PostgreSQL database (or the provided Aiven.io database)

### Backend Setup

1. Clone the repository
2. Navigate to the backend folder:

```bash
cd backend
```

3. Install dependencies:

```bash
npm install
```

4. Create a .env file with the following variables:


5. Initialize the database and run migrations:

```bash
npx prisma migrate dev --name init
```

6. Start the backend server:

```bash
npm run dev
```

### Frontend Setup

1. Open a new terminal
2. Navigate to the frontend folder:

```bash
cd <project_root>
```

3. Install dependencies:

```bash
npm install
```

4. Start the frontend development server:

```bash
npm run dev
```

5. Open your browser and navigate to http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user info

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get a specific job
- `POST /api/jobs` - Create a new job (employer only)
- `PUT /api/jobs/:id` - Update a job (employer only)
- `DELETE /api/jobs/:id` - Archive a job (employer only)
- `GET /api/jobs/employer/dashboard` - Get employer's jobs and stats

### Applications
- `POST /api/applications/jobs/:jobId` - Apply to a job (freelancer only)
- `GET /api/applications/jobs/:jobId` - Get applications for a job (employer only)
- `GET /api/applications/freelancer/dashboard` - Get freelancer's applications

### Skills
- `GET /api/skills` - Get all available skills
- `POST /api/skills` - Create a new skill (employer only)
- `POST /api/skills/seed` - Seed initial skills for development

## Database Schema

```
Model User {
  id        String      @id @default(uuid())
  name      String
  email     String      @unique
  password  String
  role      Role
  lastLogin DateTime?
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  jobs      Job[]
  applications Application[]
}

Model Job {
  id          String    @id @default(uuid())
  title       String
  description String
  budget      Float
  status      JobStatus @default(OPEN)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?
  employerId  String
  employer    User      @relation(fields: [employerId], references: [id])
  skills      JobSkill[]
  applications Application[]
}

Model Skill {
  id    String @id @default(uuid())
  name  String @unique
  jobs  JobSkill[]
}

Model JobSkill {
  jobId   String
  skillId String
  job     Job    @relation(fields: [jobId], references: [id])
  skill   Skill  @relation(fields: [skillId], references: [id])
  @@id([jobId, skillId])
}

Model Application {
  id          String   @id @default(uuid())
  message     String
  createdAt   DateTime @default(now())
  jobId       String
  job         Job      @relation(fields: [jobId], references: [id])
  freelancerId String
  freelancer   User    @relation(fields: [freelancerId], references: [id])
  @@unique([jobId, freelancerId])
}
```

## Design Decisions and Trade-offs

1. **JWT Authentication**: Used JWT for authentication instead of session-based auth for simplicity and statelessness.

2. **Prisma ORM**: Chose Prisma for type safety, ease of use, and excellent developer experience.

3. **Rate Limiting**: Implemented a simple in-memory rate limiter. In production, this would be replaced with a Redis-based solution for distributed environments.

4. **Soft Delete**: Jobs are soft-deleted (marked with deletedAt timestamp) rather than removed from the database, preserving application history.

5. **Edge Cases**: 
   - Blocked applying to non-open jobs
   - Prevented multiple applications to the same job
   - Added validation of ownership for employers
   - Tracked last login time for employers
