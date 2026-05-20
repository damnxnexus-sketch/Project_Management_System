import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, User, TaskStatus } from '@/types';

interface AppState {
  tasks: Task[];
  users: User[];
  currentUser: User | null;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  addUser: (user: User) => void;
  setCurrentUser: (user: User | null) => void;
  generateAITasks: (prompt: string) => Promise<void>;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const initialUsers: User[] = [
  {
    id: 'u1',
    name: 'Master Admin',
    email: 'master@agency.com',
    avatar: 'https://i.pravatar.cc/150?u=u1',
    role: 'Master Admin',
  },
  {
    id: 'u2',
    name: 'Alice Designer',
    email: 'alice@agency.com',
    avatar: 'https://i.pravatar.cc/150?u=u2',
    role: 'Worker',
  },
];

const initialTasks: Task[] = [
  {
    id: 't1',
    title: 'Design System Update',
    description: 'Update the global CSS variables for the matte aesthetic.',
    status: 'todo',
    priority: 'high',
    assigneeId: 'u2',
    dueDate: '2026-06-01',
    aiRisk: false,
  },
  {
    id: 't2',
    title: 'Client Presentation Deck',
    description: 'Prepare the Q3 pitch deck.',
    status: 'in-progress',
    priority: 'medium',
    assigneeId: 'u1',
    dueDate: '2026-05-25',
    aiRisk: true,
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: initialTasks,
      users: initialUsers,
      currentUser: initialUsers[0],
      isSidebarOpen: false,

      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (taskId, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
        })),
      moveTask: (taskId, newStatus) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
        })),
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      setCurrentUser: (user) => set({ currentUser: user }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      generateAITasks: async (prompt) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const newTasks: Task[] = [
          {
            id: `ai1-${Date.now()}`,
            title: `Analyze: ${prompt.slice(0, 20)}...`,
            description: 'AI generated task',
            status: 'todo',
            priority: 'high',
            aiRisk: false,
          },
          {
            id: `ai2-${Date.now()}`,
            title: 'Draft Action Plan',
            description: 'AI generated task',
            status: 'todo',
            priority: 'medium',
            aiRisk: false,
          },
          {
            id: `ai3-${Date.now()}`,
            title: 'Review Deliverables',
            description: 'AI generated task',
            status: 'todo',
            priority: 'low',
            aiRisk: true,
          },
        ];
        set((state) => ({ tasks: [...newTasks, ...state.tasks] }));
      },
    }),
    {
      name: 'pms-storage',
    }
  )
);
