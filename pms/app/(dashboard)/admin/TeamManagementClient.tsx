'use client';

import * as React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Role } from '@/types';
import { ShieldAlert, Plus, Mail, User as UserIcon } from 'lucide-react';
import { createUserAction } from '@/actions/adminActions';
import { useTransition } from 'react';

type UserData = { id: string; name: string; email: string; role: string; avatar: string | null };

interface TeamManagementClientProps {
  users: UserData[];
  isMasterAdmin: boolean;
}

export function TeamManagementClient({ users, isMasterAdmin }: TeamManagementClientProps) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newRole, setNewRole] = React.useState<Role>('Worker');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const formData = new FormData();
    formData.append('name', newName);
    formData.append('email', newEmail);
    formData.append('role', newRole);

    startTransition(async () => {
      const result = await createUserAction(formData);
      if (!result?.error) {
        setIsModalOpen(false);
        setNewName('');
        setNewEmail('');
        setNewRole('Worker');
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <div className="flex h-full flex-col max-w-5xl mx-auto w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] mb-2">Team Management</h2>
          <p className="text-[var(--muted)]">Manage your team members, roles, and permissions.</p>
        </div>
        {isMasterAdmin && (
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus size={16} />
            Add Member
          </Button>
        )}
      </div>

      {!isMasterAdmin && (
        <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 flex items-start gap-3">
          <ShieldAlert className="text-amber-500 mt-0.5" size={20} />
          <div>
            <h4 className="font-medium text-amber-500">Restricted Access</h4>
            <p className="text-sm text-amber-500/80">Only Master Admins can add new users to the workspace. You can only view the current team.</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--glass-bg)] overflow-hidden">
        <table className="w-full text-left text-sm text-[var(--muted)]">
          <thead className="bg-[var(--background)]/50 text-xs uppercase text-[var(--foreground)]">
            <tr>
              <th className="px-6 py-4 font-medium">Member</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatar || undefined} alt={user.name} />
                    <span className="font-medium text-[var(--foreground)]">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={user.role === 'Master Admin' ? 'danger' : user.role === 'Admin' ? 'warning' : 'outline'}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-6 py-4">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Team Member">
        <form onSubmit={handleCreateUser} className="flex flex-col gap-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
              <Input
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Jane Doe"
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
              <Input
                required
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="jane@agency.com"
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              className="flex h-10 w-full rounded-md border border-[var(--border-color)] bg-[var(--background)]/50 px-3 py-2 text-sm text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] transition-colors appearance-none"
            >
              <option value="Worker" className="bg-[var(--background)]">Worker</option>
              <option value="Admin" className="bg-[var(--background)]">Admin</option>
              <option value="Master Admin" className="bg-[var(--background)]">Master Admin</option>
            </select>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
