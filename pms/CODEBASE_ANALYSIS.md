# NEXUS Project Management System - Codebase Analysis

## Project Overview

**NEXUS** is a modern, AI-enabled project and team management system built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS**. It features role-based access control, task management with Kanban board, AI-assisted task generation, and team collaboration features.

---

## Architecture & Tech Stack

### Frontend Framework
- **Next.js 16.2.6** - Full-stack React framework with App Router
- **React 19.2.4** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework

### State Management & Database
- **Zustand 5.0.13** - Lightweight state management with persistence
- **Prisma 5.22.0** - ORM for database access
- **SQLite** - Lightweight relational database

### UI & Animation
- **Lucide React 1.16.0** - Icon library
- **Framer Motion 12.39.0** - Animation library
- **@hello-pangea/dnd 18.0.1** - Drag-and-drop functionality

### Authentication & Security
- **jose 6.2.3** - JWT signing and verification
- **bcryptjs 3.0.3** - Password hashing
- **Next.js Cookies API** - Secure session management

### Development Tools
- **ESLint 9** - Code linting
- **PostCSS 4** - CSS processing

---

## Directory Structure

```
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication routes (private)
│   │   └── login/
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── admin/               # Team management
│   │   ├── allotment/           # Daily task assignment
│   │   ├── meetings/            # Meeting scheduling
│   │   ├── projects/            # Project management
│   │   └── layout.tsx           # Dashboard wrapper
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
│
├── actions/                      # Server actions
│   ├── authActions.ts           # Login/logout
│   ├── projectActions.ts        # Project CRUD & task assignment
│   ├── taskActions.ts           # Task operations
│   ├── meetingActions.ts        # Meeting management
│   └── adminActions.ts          # Admin operations
│
├── components/                   # Reusable React components
│   ├── ai/
│   │   └── AiPrompt.tsx        # AI task generation interface
│   ├── kanban/
│   │   ├── KanbanBoard.tsx      # Main board component
│   │   ├── KanbanColumn.tsx     # Column container
│   │   └── TaskCard.tsx         # Individual task card
│   ├── layout/
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   └── TopNav.tsx           # Top navigation
│   ├── providers/
│   │   └── StoreInitializer.tsx # Zustand store setup
│   └── ui/                      # Base UI components
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Modal.tsx
│
├── lib/                          # Utility functions
│   ├── auth.ts                  # JWT authentication
│   ├── prisma.ts                # Prisma client singleton
│   └── utils.ts                 # Helper utilities (cn)
│
├── store/                        # State management
│   └── useStore.ts              # Zustand store (tasks, users, UI state)
│
├── types/                        # TypeScript definitions
│   └── index.ts                 # Type exports (User, Task, Project, etc.)
│
├── prisma/
│   └── schema.prisma            # Database schema
│
├── hooks/                        # Custom React hooks
│   └── useMounted.ts            # Hydration check
│
├── public/                       # Static assets
│
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── eslint.config.mjs            # ESLint rules
├── postcss.config.mjs           # PostCSS configuration
└── package.json                 # Dependencies

```

---

## Database Schema (Prisma)

### Models

#### User
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      String   @default("Worker") // "Master Admin", "Admin", "Worker"
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]   @relation("AssignedTasks")
  projects  Project[] @relation("ProjectWorkers")
}
```

#### Task
```prisma
model Task {
  id          String   @id @default(cuid())
  title       String
  description String
  status      String   @default("todo") // "todo", "in-progress", "in-review", "done"
  priority    String   @default("low") // "low", "medium", "high"
  progress    Int      @default(0)
  projectId   String?
  project     Project? @relation("ProjectTasks", fields: [projectId], references: [id])
  aiRisk      Boolean  @default(false)
  dueDate     DateTime?
  assigneeId  String?
  assignee    User?    @relation("AssignedTasks", fields: [assigneeId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### Project
```prisma
model Project {
  id          String   @id @default(cuid())
  name        String
  description String
  status      String   @default("active") // "active", "completed", "on-hold"
  progress    Int      @default(0)
  deadline    DateTime?
  tasks       Task[]   @relation("ProjectTasks")
  assignees   User[]   @relation("ProjectWorkers")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### Meeting
```prisma
model Meeting {
  id        String   @id @default(cuid())
  title     String
  date      DateTime
  meetLink  String
  createdAt DateTime @default(now())
}
```

---

## Core Features & Workflows

### 1. Authentication System
- **Login**: Email + password authentication with bcrypt hashing
- **Session Management**: JWT tokens stored in HTTP-only cookies (7-day expiration)
- **Role-Based Access**: Master Admin, Admin, Worker roles
- **Protected Routes**: Server-side session verification with redirects

**Key Files**: `lib/auth.ts`, `actions/authActions.ts`

### 2. Kanban Board (Task Management)
- **Columns**: To Do → In Progress → In Review → Done
- **Drag & Drop**: hello-pangea/dnd library for smooth reordering
- **Optimistic Updates**: Instant UI feedback with server sync
- **Filtering**: Workers see only their assigned tasks
- **Task Metadata**: Priority, progress %, due date, AI risk flag

**Key Files**: `components/kanban/*`, `(dashboard)/page.tsx`

### 3. AI Task Generation
- **Prompt-based Generation**: Users input natural language requests
- **Batch Creation**: Generates 3 related tasks from a single prompt
- **Default Properties**: Tasks set to "todo", "high" priority, some with aiRisk flag
- **Server Persistence**: Tasks saved to database via `createAiTasks` action

**Key Files**: `components/ai/AiPrompt.tsx`, `actions/taskActions.ts`

### 4. Project Management
- **CRUD Operations**: Create, read, update, delete projects
- **Worker Assignment**: Add/remove team members to projects
- **Task Nesting**: Tasks can be assigned to projects
- **Deadline Tracking**: Projects have configurable deadlines
- **Progress Monitoring**: Overall project progress calculation

**Key Files**: `app/(dashboard)/projects/*`, `actions/projectActions.ts`

### 5. Team Management (Admin)
- **User Management**: View all users, filter by role
- **Master Admin Controls**: Create users, assign roles
- **Team Visibility**: Display user avatars, names, email, roles
- **Role-Based UI**: Different controls based on user permissions

**Key Files**: `app/(dashboard)/admin/*`, `actions/adminActions.ts`

### 6. Daily Task Allotment
- **Task Assignment**: Managers assign daily tasks to team members
- **Scheduling**: Set due dates for daily deliverables
- **Project Context**: Optional project association
- **Status Tracking**: Monitor task completion throughout day

**Key Files**: `app/(dashboard)/allotment/*`, `actions/taskActions.ts`

### 7. Meetings
- **Scheduling**: Create meetings with date and time
- **Meet Links**: Store video conference URLs
- **Calendar View**: List of upcoming meetings

**Key Files**: `app/(dashboard)/meetings/*`

---

## State Management (Zustand)

### useStore
Located in `store/useStore.ts`

```typescript
interface AppState {
  // Data
  tasks: Task[]
  users: User[]
  currentUser: User | null
  
  // Actions
  setTasks(tasks: Task[]): void
  addTask(task: Task): void
  updateTask(taskId, updates): void
  moveTask(taskId, newStatus): void
  addUser(user: User): void
  setUsers(users: User[]): void
  setCurrentUser(user: User | null): void
  generateAITasks(prompt: string): Promise<void>
  
  // UI State
  isSidebarOpen: boolean
  toggleSidebar(): void
}
```

**Features**:
- Persisted to localStorage via `persist` middleware
- Initial fallback data for development
- Merges server data with local state on component mount
- Atomic updates for optimal performance

---

## Server Actions

All server actions use Next.js `'use server'` directive:

### authActions.ts
- `loginAction(formData)` - Authenticate user
- `logoutAction()` - Clear session and redirect

### projectActions.ts
- `createProjectAction(formData)` - New project
- `updateProjectProgress(projectId, progress)` - Update progress bar
- `deleteProject(projectId)` - Delete project & orphan tasks
- `updateProjectDeadline(projectId, deadlineStr)` - Change deadline
- `assignWorkerToProject(projectId, workerId)` - Add team member
- `removeWorkerFromProject(projectId, workerId)` - Remove team member
- `addProjectTask(formData)` - Add task to project

### taskActions.ts
- `fetchAllUsers()` - Get all users
- `assignDailyTask(formData)` - Create and assign task
- `updateTaskProgress(taskId, progress)` - Update progress (0-100)
- `updateTaskStatus(taskId, status)` - Move task to column
- `createAiTasks(tasks)` - Batch create AI-generated tasks
- `deleteTask(taskId)` - Remove task

All actions use `revalidatePath()` to sync UI with database changes.

---

## Key Type Definitions

```typescript
export type Role = 'Master Admin' | 'Admin' | 'Worker';
export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
  aiRisk?: boolean;
  progress: number;
  projectId?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
}
```

---

## Authentication & Security

### Session Management
- JWT-based stateless sessions
- 7-day expiration window
- HTTP-only cookies (prevents XSS access)
- Secure flag for HTTPS in production
- SameSite=Lax for CSRF protection

### Password Security
- bcryptjs with salting
- Server-side verification
- Never transmitted in plain text

### Authorization
- Server-side role checking in protected pages
- Worker users see only their tasks
- Admin features restricted by role validation

---

## Styling & Theming

### Tailwind CSS Configuration
- **TailwindCSS 4** with PostCSS
- **CSS Variables** for theming:
  - `--background`, `--foreground`
  - `--accent` (primary brand color)
  - `--surface`, `--surface-raised`
  - `--border-color`, `--border-focus`
  - `--muted`, `--foreground-heading`
  - `--glass-bg` (for glassmorphism)

### Design System
- Rounded corners (border-radius)
- Smooth transitions and animations
- Glassmorphism effects (backdrop blur)
- Responsive mobile-first layout

### Components
- `Button.tsx` - Primary action component
- `Input.tsx` - Form input component
- `Modal.tsx` - Dialog/modal wrapper
- `Badge.tsx` - Status/label badges
- `Avatar.tsx` - User profile pictures

---

## Data Flow

### Task Creation & Synchronization
```
User Input (Kanban/AI)
    ↓
Server Action (taskActions)
    ↓
Prisma ORM → SQLite Database
    ↓
revalidatePath()
    ↓
Page Refetch from DB
    ↓
useStore.setTasks() (Zustand)
    ↓
UI Re-render
```

### Real-time Updates
```
Drag & Drop (Local)
    ↓
Optimistic Update (moveTask)
    ↓
UI Reflects Change
    ↓
updateTaskStatus Server Action (Async)
    ↓
Database Update
    ↓
Page Revalidation
```

---

## Scripts & Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Development Notes

### MVP Status
- Core features functional
- Uses SQLite for simplicity
- Default JWT secret for development (`'super-secret-key-for-mvp-only'`)
- Initial seed data provided in `store/useStore.ts`

### Environment Variables
Required in `.env.local`:
- `DATABASE_URL` - SQLite connection string
- `JWT_SECRET` - Session signing key (optional, uses default in MVP)
- `NODE_ENV` - Set to `'production'` for secure cookies

### Hydration Handling
- `useMounted` hook prevents hydration mismatches
- Zustand store persists between sessions
- Server data merged with client state on dashboard load

### Performance Optimizations
- Image optimization via Next.js `<Image>`
- Code splitting per route
- CSS-in-JS via Tailwind (minimal runtime)
- Optimistic UI updates reduce perceived latency

---

## Known Limitations & Improvements

### Current Limitations
1. **AI Task Generation**: Uses mock data (not connected to real AI API)
2. **Real-time Collaboration**: No WebSocket for live updates
3. **Notifications**: No alert system for task assignments
4. **File Uploads**: No attachment support
5. **Search**: No full-text search across tasks/projects
6. **Audit Logs**: No activity history tracking

### Suggested Improvements
1. Integrate with OpenAI/Claude API for intelligent task generation
2. Add WebSocket support via Socket.io for live Kanban updates
3. Implement notification system (toast, email, in-app)
4. Add file/document attachments to tasks
5. Implement task filtering, sorting, and advanced search
6. Add activity logs and task history
7. Team collaboration features (comments, @mentions)
8. Custom workflows and status templates
9. Time tracking and estimation
10. Reporting and analytics dashboard

---

## File Summary

| File | Purpose | Type |
|------|---------|------|
| `app/layout.tsx` | Root HTML structure | Layout |
| `app/(auth)/login/page.tsx` | Login page UI | Page |
| `app/(dashboard)/page.tsx` | Kanban dashboard | Page |
| `app/(dashboard)/admin/page.tsx` | Team management | Page |
| `app/(dashboard)/projects/page.tsx` | Projects list | Page |
| `app/(dashboard)/allotment/page.tsx` | Daily task assignment | Page |
| `components/kanban/KanbanBoard.tsx` | Drag-drop board | Component |
| `components/ai/AiPrompt.tsx` | AI input interface | Component |
| `components/layout/Sidebar.tsx` | Navigation menu | Component |
| `lib/auth.ts` | JWT utilities | Utility |
| `lib/prisma.ts` | Database client | Utility |
| `store/useStore.ts` | Global state | Store |
| `actions/authActions.ts` | Login/logout logic | Server Action |
| `actions/projectActions.ts` | Project CRUD | Server Action |
| `actions/taskActions.ts` | Task operations | Server Action |
| `prisma/schema.prisma` | Database schema | Configuration |

---

## Conclusion

**NEXUS** is a well-structured, modern project management system leveraging Next.js 16's latest features. It follows React best practices with strong TypeScript support, role-based access control, and a polished UI with animations. The codebase is scalable and ready for feature expansion, particularly in AI integration, real-time collaboration, and advanced team workflows.
