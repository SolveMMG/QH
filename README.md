# QuickHire - Job Board for Remote Freelancers

QuickHire is a comprehensive job board application designed to connect talented freelancers with employers looking for specific skills. This platform enables employers to post job listings and freelancers to discover and apply for opportunities that match their expertise.

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Installation & Setup](#installation--setup)
6. [Available Scripts](#available-scripts)
7. [API Endpoints](#api-endpoints)
8. [Database Schema](#database-schema)
9. [Authentication](#authentication)
10. [Design Decisions & Trade-offs](#design-decisions--trade-offs)
11. [Future Enhancements](#future-enhancements)
12. [License](#license)

## Features

### Core Functionality

- **User Authentication**: Secure email-based registration and login with role selection (Employer/Freelancer)
- **Job Management**: Complete CRUD operations for job listings
  - Create new job listings with titles, descriptions, budgets, and required skills
  - View detailed job information
  - Update job details and status
  - Archive jobs (soft delete)
- **Job Discovery**: Public job board with advanced filtering options
  - Filter by skills
  - Search by keywords
  - Filter by job status
  - Pagination support
- **Application System**: Streamlined application process
  - Submit applications with custom messages
  - View applications for specific jobs (employers)
  - Track submitted applications (freelancers)
- **Role-specific Dashboards**: Tailored experiences for both user types
  - Employer dashboard with job management tools
  - Freelancer dashboard with application tracking

### Enhanced Features

- **Rate Limiting**: Maximum of 10 applications per hour per freelancer
- **Soft Delete**: Archive jobs instead of permanent deletion
- **Last Login Tracking**: Monitor employer activity
- **Edge Case Handling**: Prevent applying to closed jobs and duplicate applications

## Tech Stack

### Frontend
- **React**: UI library for building interactive interfaces
- **TypeScript**: Type safety and improved developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Router**: Client-side routing
- **React Query**: Data fetching and state management
- **ShadCN UI**: Component library for consistent design
- **Zod**: Schema validation
- **Lucide React**: Icon library
- **React Hook Form**: Form handling

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework for Node.js
- **PostgreSQL**: Relational database
- **Prisma**: ORM for database operations
- **JWT**: Authentication mechanism
- **Bcrypt**: Password hashing

## Project Structure

```
quickhire/
├── frontend/               # Frontend React application
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # React context providers
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utility functions
│       ├── pages/          # Page components
│       ├── providers/      # Provider components
│       ├── services/       # API services
│       └── types/          # TypeScript type definitions
└── backend/                # Backend Express application
    ├── middleware/         # Express middleware
    ├── prisma/             # Prisma schema and migrations
    └── routes/             # API routes
```

## Prerequisites

- Node.js (v14 or higher)
- NPM or Yarn package manager
- PostgreSQL database

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```

4. Initialize the database and run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the backend API URL:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to http://localhost:8080

## Available Scripts

### Backend
- `npm run dev`: Start development server with hot reloading
- `npm start`: Start production server

### Frontend
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run build:dev`: Build for development
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint

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

## Authentication

QuickHire implements a secure authentication system using JWT (JSON Web Tokens):

1. **Registration Process**:
   - Users sign up by providing their name, email, password, and role (employer or freelancer)
   - Passwords are securely hashed using bcrypt before storage
   - A JWT token is generated and returned upon successful registration

2. **Login Process**:
   - Users provide their email and password
   - Credentials are verified against the database
   - A JWT token is generated and returned upon successful authentication
   - Last login timestamp is updated for employers

3. **Token-Based Authorization**:
   - Protected routes require a valid JWT token in the Authorization header
   - Middleware validates tokens and extracts user information
   - Role-specific middleware ensures appropriate access control

## Design Decisions & Trade-offs

1. **JWT Authentication**:
   - **Pro**: Stateless authentication requiring no session storage
   - **Pro**: Easy to scale across multiple servers
   - **Con**: Cannot invalidate tokens before expiration (mitigated with short-lived tokens)

2. **Prisma ORM**:
   - **Pro**: Type-safe database access with auto-generated client
   - **Pro**: Schema migrations and database versioning
   - **Pro**: Query optimization and connection pooling
   - **Con**: Learning curve for complex queries

3. **Rate Limiting**:
   - Current implementation uses in-memory storage
   - For production, would recommend Redis-based solution for distributed environments

4. **Soft Delete**:
   - Jobs are archived rather than deleted, preserving application history
   - Allows for potential restoration of erroneously archived jobs
   - Maintains data integrity for reporting and analytics

5. **Edge Case Handling**:
   - Application validation prevents applying to closed/archived jobs
   - Unique constraint prevents duplicate applications
   - Employer verification ensures only job owners can edit listings

## Future Enhancements

1. **Advanced Search & Filters**:
   - Experience level filtering
   - Budget range filtering
   - Location-based job search

2. **Notifications System**:
   - Email notifications for new applications
   - In-app notifications for job status changes
   - Application status updates

3. **Messaging System**:
   - Direct messaging between employers and applicants
   - Thread-based conversations per application

4. **Payment Integration**:
   - Escrow payment system
   - Milestone-based payments
   - Subscription plans for enhanced employer features

5. **Enhanced Analytics**:
   - Job performance metrics for employers
   - Application success rates for freelancers
   - Market demand trends for specific skills

6. **Profile Enhancement**:
   - Portfolio showcases for freelancers
   - Company profiles for employers
   - Skill verification and endorsements

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

