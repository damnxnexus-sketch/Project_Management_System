import { verifySession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/actions/userActions';
import { ProfileForm } from './ProfileForm';
import { PasswordChangeForm } from './PasswordChangeForm';

export default async function ProfilePage() {
  const session = await verifySession();
  if (!session) {
    redirect('/login');
  }

  const user = await getUserProfile(session.userId);
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground-heading)] mb-2">
          Profile Settings
        </h1>
        <p className="text-[var(--muted)]">
          Manage your account settings and preferences
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-4">
          <p className="text-sm text-[var(--muted)] mb-1">Tasks Assigned</p>
          <p className="text-2xl font-bold text-[var(--foreground-heading)]">
            {user._count.tasks}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-4">
          <p className="text-sm text-[var(--muted)] mb-1">Projects</p>
          <p className="text-2xl font-bold text-[var(--foreground-heading)]">
            {user._count.projects}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-4">
          <p className="text-sm text-[var(--muted)] mb-1">Comments</p>
          <p className="text-2xl font-bold text-[var(--foreground-heading)]">
            {user._count.comments}
          </p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-6">
        <h2 className="text-xl font-semibold text-[var(--foreground-heading)] mb-4">
          Profile Information
        </h2>
        <ProfileForm user={user} />
      </div>

      {/* Change Password */}
      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-6">
        <h2 className="text-xl font-semibold text-[var(--foreground-heading)] mb-4">
          Change Password
        </h2>
        <PasswordChangeForm />
      </div>

      {/* Account Info */}
      <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-6">
        <h2 className="text-xl font-semibold text-[var(--foreground-heading)] mb-4">
          Account Information
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Role:</span>
            <span className="text-[var(--foreground)] font-medium">{user.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">Member Since:</span>
            <span className="text-[var(--foreground)] font-medium">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted)]">User ID:</span>
            <span className="text-[var(--foreground)] font-mono text-xs">{user.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
