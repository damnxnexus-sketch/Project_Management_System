# Project Dedication Feature for Master Admin

## Overview
Added a new feature that allows Master Admin to dedicate projects and tasks to Admins, in addition to the existing task allotment functionality.

## Changes Made

### 1. **AllotmentForm.tsx** (`app/(dashboard)/allotment/AllotmentForm.tsx`)
- **Added toggle buttons** to switch between "Task Allotment" and "Project Dedication" modes (visible only to Master Admin)
- **Conditional rendering** of form fields based on selected mode:
  - **Task Allotment Mode**: Original functionality with support for assigning tasks to Admins or Workers
  - **Project Dedication Mode**: New functionality for dedicating entire projects to Admins
- **Dynamic button text** that changes based on mode (Assign Task / Dedicate Project)
- **Updated user selection label** to reflect that Master Admin can assign to both Admins and Workers
- **Added adminId field** for project dedication form
- **Added projectId field** for project dedication

### 2. **Allotment Page** (`app/(dashboard)/allotment/page.tsx`)
- **Updated page logic** to filter users appropriately based on Master Admin role:
  - Master Admin: Can assign to Workers and Admins
  - Admin: Can only assign to Workers
- **Passed userRole prop** to AllotmentForm component for role-based UI rendering
- **Updated page title and description** to reflect new capabilities for Master Admin

### 3. **Project Actions** (`actions/projectActions.ts`)
- **Added `dedicateProjectToAdmin` function** that:
  - Takes admin ID and project ID from form data
  - Validates that required fields are present
  - Checks if admin is already assigned to avoid duplicates
  - Connects the admin to the project as an assignee
  - Revalidates paths to refresh UI
  - Returns appropriate success/error messages

## Features

### Task Allotment Mode
- Assign daily tasks to workers or admins (Master Admin only)
- Set allotment date
- Optional project association
- Title and description required

### Project Dedication Mode (Master Admin Only)
- Select an admin to dedicate the project to
- Choose from available projects
- Prevents duplicate assignments
- Automatically connects admin to project

## User Permissions

| Role | Task Allotment | Project Dedication |
|------|---|---|
| Master Admin | ✅ (to Admins & Workers) | ✅ |
| Admin | ✅ (to Workers only) | ❌ |
| Worker | ❌ | ❌ |

## Usage Flow

1. Navigate to `/allotment` page
2. If Master Admin, see two toggle buttons: "Task Allotment" and "Project Dedication"
3. Select desired mode
4. Fill in the form fields:
   - **Task Mode**: Select worker/admin, date, optional project, title, description
   - **Project Mode**: Select admin, select project
5. Click submit button (text changes based on mode)
6. Success message confirms the action

## Technical Details

- **Form State Management**: Uses React state (`assignmentType`) to track current mode
- **Conditional Rendering**: Different form sections render based on `assignmentType` value
- **Dynamic Required Fields**: Form fields have conditional `required` attribute based on mode
- **Server Actions**: Both `assignDailyTask` and `dedicateProjectToAdmin` are server actions
- **Error Handling**: Comprehensive error messages for various failure scenarios
- **Duplicate Prevention**: Checks before assigning admin to project

## Files Modified
- `/app/(dashboard)/allotment/AllotmentForm.tsx`
- `/app/(dashboard)/allotment/page.tsx`
- `/actions/projectActions.ts`

## Database Schema
No schema changes required. The feature uses existing:
- `User` model (for admin/worker relationships)
- `Project` model with `assignees` relation (User[] relation)
- `Task` model (for task creation)
