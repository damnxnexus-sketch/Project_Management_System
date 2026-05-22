# NEXUS PMS - Incomplete Features & Product Roadmap

**Last Updated:** May 22, 2026  
**Project Status:** 75% Complete (58/77 features implemented)  
**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma, SQLite, Claude AI

---

## 📊 Executive Summary

NEXUS is a well-architected project management system with a **solid backend foundation** but **missing critical UI components** that prevent users from accessing advanced features. The database schema is complete, all server actions are functional, and the core task/project management works well. However, features like comments, file attachments, notifications, and activity logs are **implemented on the backend but have no frontend interface**.

### Current State:
- ✅ **Backend:** 95% complete - All CRUD operations, AI integration, authentication working
- ⚠️ **Frontend:** 60% complete - Core features visible, advanced features hidden
- ⚠️ **Real-time:** 0% complete - WebSocket infrastructure ready but not implemented
- ⚠️ **Analytics:** 20% complete - Basic stats only, no reporting dashboard

---

## 🚨 CRITICAL INCOMPLETE FEATURES (High Priority)

These features are **fully implemented on the backend** but users cannot access them because the UI components don't exist.

### 1. ❌ Task Detail Page/Modal
**Status:** Backend ✅ | Frontend ❌  
**Impact:** HIGH - Blocks access to comments, attachments, and activity logs

**Problem:**
- No dedicated page or modal to view full task details
- Users can only see task cards in Kanban board
- Cannot view or add comments, attachments, or see task history
- Task editing is limited to inline updates only

**Backend Ready:**
- `getTaskById()` - Fetch complete task data
- `updateTask()` - Update task properties
- All related data (comments, attachments, logs) can be fetched

**What's Needed:**
```tsx
// Create: app/(dashboard)/tasks/[id]/page.tsx
// OR: components/TaskDetailModal.tsx

- Full task information display
- Tabbed interface: Details | Comments | Attachments | Activity
- Edit task properties inline
- Delete task button with confirmation
- Breadcrumb navigation
```

**Files to Create:**
- `app/(dashboard)/tasks/[id]/page.tsx` - Task detail page
- OR `components/TaskDetailModal.tsx` - Modal version
- `components/task/TaskDetailTabs.tsx` - Tab navigation
- `components/task/TaskHeader.tsx` - Title, status, priority display

---

### 2. ❌ Comments UI Component
**Status:** Backend ✅ | Frontend ❌  
**Impact:** HIGH - Team collaboration feature completely hidden

**Problem:**
- Comment system fully functional on backend
- @mention detection and notifications working
- Zero UI to display or create comments
- Users cannot collaborate on tasks

**Backend Ready:**
- `createComment(taskId, content)` - Create comment with @mention parsing
- `getTaskComments(taskId)` - Fetch all comments with author info
- `updateComment(commentId, content)` - Edit own comments
- `deleteComment(commentId)` - Delete own comments
- Automatic notification creation for mentions and replies

**What's Needed:**
```tsx
// Create: components/comments/CommentSection.tsx

- Comment list with author avatars and timestamps
- Comment input with @mention autocomplete
- Edit/delete buttons for own comments
- Real-time comment updates (with WebSocket later)
- "Load more" pagination for long threads
```

**Files to Create:**
- `components/comments/CommentSection.tsx` - Main container
- `components/comments/CommentList.tsx` - Display comments
- `components/comments/CommentInput.tsx` - Create/edit form
- `components/comments/CommentCard.tsx` - Single comment display
- `components/comments/MentionAutocomplete.tsx` - @mention suggestions

---

### 3. ❌ Notification Bell Component
**Status:** Backend ✅ | Frontend ❌  
**Impact:** HIGH - Users miss important updates

**Problem:**
- Bell icon in TopNav is a placeholder (non-functional)
- Notifications are created but users never see them
- No unread count badge
- No notification dropdown/panel

**Backend Ready:**
- `getUserNotifications(userId)` - Fetch all notifications
- `markNotificationAsRead(notificationId)` - Mark single as read
- `markAllNotificationsAsRead(userId)` - Bulk mark as read
- `getUnreadNotificationCount(userId)` - Get badge count
- `deleteNotification(notificationId)` - Remove notification
- 4 notification types: task_assigned, task_updated, mentioned, comment

**What's Needed:**
```tsx
// Update: components/layout/TopNav.tsx

- Functional bell icon with unread count badge
- Dropdown panel showing recent notifications
- Click to mark as read and navigate to task
- "Mark all as read" button
- "View all notifications" link to dedicated page
```

**Files to Create/Update:**
- Update `components/layout/TopNav.tsx` - Add notification bell logic
- `components/notifications/NotificationDropdown.tsx` - Dropdown panel
- `components/notifications/NotificationItem.tsx` - Single notification
- `app/(dashboard)/notifications/page.tsx` - Full notifications page (optional)

---

### 4. ❌ File Upload Widget
**Status:** Backend ✅ | Frontend ❌  
**Impact:** MEDIUM - Cannot attach files to tasks

**Problem:**
- File upload system works (max 10MB, stored in `public/uploads/`)
- No UI to upload files
- No UI to view/download attachments
- File metadata tracked in database

**Backend Ready:**
- `uploadAttachment(taskId, file)` - Upload file to task
- `getTaskAttachments(taskId)` - Fetch all attachments
- `deleteAttachment(attachmentId)` - Remove file and delete from filesystem

**What's Needed:**
```tsx
// Create: components/attachments/AttachmentSection.tsx

- Drag-and-drop file upload zone
- File list with icons, names, sizes, upload dates
- Download button for each file
- Delete button (with permission check)
- Upload progress indicator
- File type validation (images, PDFs, docs, etc.)
```

**Files to Create:**
- `components/attachments/AttachmentSection.tsx` - Main container
- `components/attachments/FileUploadZone.tsx` - Drag-drop upload
- `components/attachments/AttachmentList.tsx` - Display files
- `components/attachments/AttachmentCard.tsx` - Single file display

---

### 5. ❌ Activity Timeline Component
**Status:** Backend ✅ | Frontend ❌  
**Impact:** MEDIUM - No audit trail visibility

**Problem:**
- All task/project actions are logged automatically
- Activity logs include before/after diffs (JSON)
- No UI to display activity history
- Cannot see who changed what and when

**Backend Ready:**
- `getTaskActivityLogs(taskId)` - Fetch task history
- `getProjectActivityLogs(projectId)` - Fetch project history
- `getRecentActivity(limit)` - Get recent actions across system
- Action types: created, updated, deleted, moved
- Entity types: task, project, comment

**What's Needed:**
```tsx
// Create: components/activity/ActivityTimeline.tsx

- Chronological timeline of all changes
- User avatars and names for each action
- Formatted change descriptions (e.g., "changed status from To Do to In Progress")
- Timestamps (relative: "2 hours ago")
- Expandable diffs for complex changes
- Filter by action type or user
```

**Files to Create:**
- `components/activity/ActivityTimeline.tsx` - Main timeline
- `components/activity/ActivityItem.tsx` - Single activity entry
- `components/activity/ActivityDiff.tsx` - Show before/after changes
- `lib/activityFormatter.ts` - Format activity logs into readable text

---

### 6. ❌ Error Toast/Alert System
**Status:** Backend ✅ | Frontend ❌  
**Impact:** HIGH - Users don't know if actions succeeded or failed

**Problem:**
- All server actions return `{ success, error }` objects
- Errors are logged to console only
- No visual feedback for users
- Success messages also missing

**What's Needed:**
```tsx
// Create: components/ui/Toast.tsx and lib/toast.ts

- Toast notification system (success, error, warning, info)
- Auto-dismiss after 3-5 seconds
- Stack multiple toasts
- Close button on each toast
- Slide-in animation from top-right
```

**Recommended Library:** `react-hot-toast` or `sonner`

**Files to Create:**
- `components/ui/Toast.tsx` - Toast component
- `lib/toast.ts` - Toast utility functions
- Update all forms/actions to show toasts on success/error

---

### 7. ❌ Loading States
**Status:** Partially implemented  
**Impact:** MEDIUM - Poor UX during async operations

**Problem:**
- Many buttons/forms have no loading indicators
- Users don't know if action is processing
- Can accidentally double-submit forms

**What's Needed:**
- Add `isPending` state from `useTransition()` or `useFormStatus()`
- Disable buttons during submission
- Show spinner or "Loading..." text
- Skeleton loaders for data fetching

**Files to Update:**
- All form components (CreateProjectModal, MeetingForm, AllotmentForm, etc.)
- All action buttons (delete, update, create)
- Add `components/ui/Spinner.tsx` component

---

## 🔧 MEDIUM PRIORITY FEATURES

### 8. ⚠️ WebSocket Real-Time Collaboration
**Status:** Infrastructure ready, not implemented  
**Impact:** MEDIUM - No live updates across users

**Problem:**
- `ws` library installed but not configured
- Task updates require page refresh to see changes from other users
- No live notifications
- No "User X is typing..." indicators

**What's Needed:**
```typescript
// Create: lib/websocket.ts (server)
// Create: hooks/useWebSocket.ts (client)

- WebSocket server setup
- Client connection hook
- Event emitters for task updates, comments, notifications
- Reconnection logic
- Presence indicators (who's online)
```

**Implementation Steps:**
1. Create WebSocket server in `lib/websocket.ts`
2. Create client hook `hooks/useWebSocket.ts`
3. Emit events on task updates in `taskActions.ts`
4. Listen for events in Kanban board and task detail pages
5. Add presence tracking for online users

**Files to Create:**
- `lib/websocket.ts` - WebSocket server
- `hooks/useWebSocket.ts` - Client connection hook
- `lib/websocketEvents.ts` - Event type definitions

---

### 9. ⚠️ TopNav Search Functionality
**Status:** UI exists, not functional  
**Impact:** MEDIUM - Search bar is a placeholder

**Problem:**
- Search input in TopNav does nothing
- Search page exists at `/search` but not linked from TopNav
- No autocomplete or suggestions
- No keyboard shortcuts (Cmd+K)

**What's Needed:**
```tsx
// Update: components/layout/TopNav.tsx

- Make search input functional
- Add onChange handler to search as user types
- Show autocomplete dropdown with results
- Navigate to /search on Enter key
- Add Cmd+K keyboard shortcut to focus search
- Show recent searches
```

**Files to Update:**
- `components/layout/TopNav.tsx` - Add search logic
- `components/search/SearchAutocomplete.tsx` - Dropdown results
- `hooks/useSearch.ts` - Debounced search hook

---

### 10. ⚠️ Confirmation Dialogs
**Status:** Missing  
**Impact:** MEDIUM - Accidental deletions possible

**Problem:**
- Delete buttons have no confirmation
- Users can accidentally delete tasks, projects, meetings
- No "Are you sure?" prompts

**What's Needed:**
```tsx
// Create: components/ui/ConfirmDialog.tsx

- Reusable confirmation dialog
- Customizable title, message, confirm/cancel buttons
- Danger variant for destructive actions
- Keyboard support (Enter to confirm, Esc to cancel)
```

**Files to Create:**
- `components/ui/ConfirmDialog.tsx` - Confirmation modal
- Update all delete buttons to use confirmation dialog

---

### 11. ⚠️ User Profile Page
**Status:** Missing  
**Impact:** MEDIUM - Cannot edit user settings

**Problem:**
- No user profile page
- Cannot change password
- Cannot update name or avatar
- No user preferences/settings

**What's Needed:**
```tsx
// Create: app/(dashboard)/profile/page.tsx

- Display user information (name, email, role, avatar)
- Edit name and email
- Change password form
- Upload custom avatar (currently uses pravatar.cc)
- User preferences (theme, notifications, etc.)
- Activity history
```

**Backend Actions Needed:**
- `updateUserProfile(userId, data)` - Update name, email
- `changePassword(userId, oldPassword, newPassword)` - Change password
- `uploadAvatar(userId, file)` - Upload custom avatar

**Files to Create:**
- `app/(dashboard)/profile/page.tsx` - Profile page
- `actions/userActions.ts` - User profile actions
- `components/profile/ProfileForm.tsx` - Edit profile form
- `components/profile/PasswordChangeForm.tsx` - Change password form
- `components/profile/AvatarUpload.tsx` - Avatar upload widget

---

### 12. ⚠️ Password Reset Flow
**Status:** Missing  
**Impact:** MEDIUM - Users locked out if they forget password

**Problem:**
- No "Forgot Password" link on login page
- No password reset email flow
- Admin must manually reset passwords

**What's Needed:**
```tsx
// Create: app/(auth)/forgot-password/page.tsx
// Create: app/(auth)/reset-password/[token]/page.tsx

- "Forgot Password" link on login page
- Email input to request reset
- Send reset token via email (requires email service)
- Reset password page with token validation
- Password strength indicator
```

**Backend Actions Needed:**
- `requestPasswordReset(email)` - Generate token, send email
- `validateResetToken(token)` - Check if token is valid
- `resetPassword(token, newPassword)` - Update password

**External Service Needed:**
- Email service (SendGrid, Resend, AWS SES, etc.)

**Files to Create:**
- `app/(auth)/forgot-password/page.tsx` - Request reset page
- `app/(auth)/reset-password/[token]/page.tsx` - Reset password page
- `actions/passwordActions.ts` - Password reset actions
- `lib/email.ts` - Email sending utility

---

## 📈 ADVANCED FEATURES TO ADD

### 13. 📊 Reporting & Analytics Dashboard
**Status:** Not started  
**Impact:** HIGH - No insights into team performance

**Current State:**
- Basic stats on dashboard (task counts, project counts)
- No charts or graphs
- No time-based analytics
- No team performance metrics

**What's Needed:**
```tsx
// Create: app/(dashboard)/reports/page.tsx

Charts & Visualizations:
- Task completion rate over time (line chart)
- Tasks by status (pie chart)
- Tasks by priority (bar chart)
- Project progress overview (progress bars)
- Team workload distribution (bar chart)
- Overdue tasks trend (line chart)
- Average task completion time
- High-risk task percentage

Filters:
- Date range selector
- Project filter
- Team member filter
- Export to PDF/CSV
```

**Recommended Library:** `recharts` or `chart.js`

**Backend Actions Needed:**
- `getTaskCompletionStats(startDate, endDate)` - Completion metrics
- `getTeamWorkloadStats()` - Tasks per user
- `getProjectProgressStats()` - Project completion rates
- `getOverdueTasksStats()` - Overdue trends

**Files to Create:**
- `app/(dashboard)/reports/page.tsx` - Reports dashboard
- `components/reports/TaskCompletionChart.tsx` - Line chart
- `components/reports/TaskStatusPieChart.tsx` - Pie chart
- `components/reports/TeamWorkloadChart.tsx` - Bar chart
- `components/reports/ProjectProgressList.tsx` - Progress bars
- `actions/reportActions.ts` - Analytics queries

---

### 14. 🔗 Task Dependencies
**Status:** Not started  
**Impact:** MEDIUM - Cannot link related tasks

**Problem:**
- No way to mark task A as blocking task B
- No dependency visualization
- Cannot auto-update dependent tasks

**What's Needed:**
```prisma
// Update: prisma/schema.prisma

model TaskDependency {
  id            String   @id @default(cuid())
  taskId        String   // The dependent task
  dependsOnId   String   // The task it depends on
  type          String   // "blocks", "blocked_by", "related"
  createdAt     DateTime @default(now())
  
  task          Task     @relation("DependentTask", fields: [taskId], references: [id])
  dependsOn     Task     @relation("DependsOnTask", fields: [dependsOnId], references: [id])
}

// Add to Task model:
dependencies     TaskDependency[] @relation("DependentTask")
dependedOnBy     TaskDependency[] @relation("DependsOnTask")
```

**UI Features:**
- Add dependency button in task detail
- Search/select tasks to link
- Dependency type selector (blocks, blocked by, related)
- Visual dependency graph
- Warning when completing task with incomplete dependencies

**Files to Create:**
- `components/dependencies/DependencySelector.tsx` - Add dependencies
- `components/dependencies/DependencyGraph.tsx` - Visualize dependencies
- `actions/dependencyActions.ts` - CRUD for dependencies

---

### 15. 📋 Subtasks
**Status:** Not started  
**Impact:** MEDIUM - Cannot break down complex tasks

**Problem:**
- No way to create subtasks
- Cannot track progress of task components
- Large tasks are monolithic

**What's Needed:**
```prisma
// Update: prisma/schema.prisma

model Task {
  // ... existing fields
  parentTaskId  String?
  parentTask    Task?   @relation("TaskSubtasks", fields: [parentTaskId], references: [id])
  subtasks      Task[]  @relation("TaskSubtasks")
}
```

**UI Features:**
- "Add Subtask" button in task detail
- Checklist-style subtask display
- Auto-calculate parent task progress from subtasks
- Indent subtasks in task lists
- Collapse/expand subtask groups

**Files to Create:**
- `components/subtasks/SubtaskList.tsx` - Display subtasks
- `components/subtasks/SubtaskInput.tsx` - Create subtask
- Update `actions/taskActions.ts` - Add subtask CRUD

---

### 16. ⏱️ Time Tracking
**Status:** Not started  
**Impact:** MEDIUM - Cannot track actual time spent

**Problem:**
- No time tracking functionality
- Cannot compare estimated vs actual time
- No timesheet reports

**What's Needed:**
```prisma
// Update: prisma/schema.prisma

model Task {
  // ... existing fields
  estimatedHours  Float?
  actualHours     Float?   @default(0)
  timeEntries     TimeEntry[] @relation("TaskTimeEntries")
}

model TimeEntry {
  id          String   @id @default(cuid())
  taskId      String
  task        Task     @relation("TaskTimeEntries", fields: [taskId], references: [id])
  userId      String
  user        User     @relation("UserTimeEntries", fields: [userId], references: [id])
  hours       Float
  description String?
  date        DateTime
  createdAt   DateTime @default(now())
}
```

**UI Features:**
- Start/stop timer button on tasks
- Manual time entry form
- Time log display (date, hours, description)
- Total time vs estimated time comparison
- Timesheet view (calendar-based)

**Files to Create:**
- `components/time/TimeTracker.tsx` - Start/stop timer
- `components/time/TimeEntryForm.tsx` - Manual entry
- `components/time/TimeLogList.tsx` - Display time entries
- `app/(dashboard)/timesheet/page.tsx` - Timesheet view
- `actions/timeActions.ts` - Time tracking actions

---

### 17. 🔁 Recurring Tasks
**Status:** Not started  
**Impact:** LOW - Manual task creation for recurring work

**Problem:**
- No automated task creation
- Must manually create daily/weekly tasks
- No recurrence patterns

**What's Needed:**
```prisma
// Update: prisma/schema.prisma

model Task {
  // ... existing fields
  isRecurring     Boolean  @default(false)
  recurrenceRule  String?  // RRULE format (e.g., "FREQ=DAILY;INTERVAL=1")
  recurrenceEnd   DateTime?
}
```

**UI Features:**
- "Make Recurring" checkbox in task creation
- Recurrence pattern selector (daily, weekly, monthly, custom)
- End date or occurrence count
- View all instances of recurring task
- Edit single instance or all future instances

**Backend Logic:**
- Cron job to create task instances based on recurrence rules
- Use `node-cron` or similar library

**Files to Create:**
- `components/recurrence/RecurrenceSelector.tsx` - Pattern selector
- `lib/recurrence.ts` - RRULE parsing and task generation
- `lib/cron.ts` - Scheduled task creation job

---

### 18. 📧 Email Notifications
**Status:** Not started  
**Impact:** MEDIUM - Users miss notifications when not logged in

**Problem:**
- Notifications only visible in-app
- No email alerts for important events
- Users must check app constantly

**What's Needed:**
```typescript
// Create: lib/email.ts

Email Triggers:
- Task assigned to you
- Task due date approaching (24 hours before)
- Task overdue
- Mentioned in comment
- Project deadline approaching
- High-risk task flagged by AI

Email Service Options:
- SendGrid
- Resend
- AWS SES
- Postmark
```

**User Preferences:**
- Email notification settings page
- Toggle email notifications on/off per event type
- Digest mode (daily summary vs instant)

**Files to Create:**
- `lib/email.ts` - Email sending utility
- `lib/emailTemplates.ts` - HTML email templates
- `app/(dashboard)/settings/notifications/page.tsx` - Email preferences
- Update notification actions to send emails

---

### 19. 📁 Project Templates
**Status:** Not started  
**Impact:** LOW - Faster project setup

**Problem:**
- Must manually create projects and tasks each time
- No reusable project structures
- Repetitive setup for similar projects

**What's Needed:**
