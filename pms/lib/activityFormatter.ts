interface ActivityLog {
  action: string;
  entityType: string;
  changes: string | null;
}

export function formatActivityMessage(log: ActivityLog): string {
  const { action, entityType, changes } = log;

  try {
    const parsedChanges = changes ? JSON.parse(changes) : {};

    switch (action) {
      case 'created':
        return `created a ${entityType}`;

      case 'deleted':
        return `deleted a ${entityType}`;

      case 'moved':
        if (parsedChanges.from && parsedChanges.to) {
          return `moved ${entityType} from ${formatStatus(parsedChanges.from)} to ${formatStatus(parsedChanges.to)}`;
        }
        return `moved a ${entityType}`;

      case 'updated':
        if (parsedChanges.field) {
          const field = parsedChanges.field;
          if (field === 'progress') {
            return `updated ${entityType} progress to ${parsedChanges.newValue}%`;
          } else if (field === 'flags') {
            return `updated ${entityType} flags`;
          } else {
            return `updated ${entityType} ${field}`;
          }
        }
        if (parsedChanges.action) {
          return parsedChanges.action;
        }
        return `updated a ${entityType}`;

      default:
        return `performed ${action} on ${entityType}`;
    }
  } catch (error) {
    console.error('Failed to parse activity changes:', error);
    return `${action} a ${entityType}`;
  }
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'in-review': 'In Review',
    'done': 'Done',
  };
  return statusMap[status] || status;
}
