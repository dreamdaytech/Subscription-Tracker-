/**
 * Returns the time remaining in a human-readable format.
 * If the date is in the past, returns null.
 */
export function getTimeRemaining(dateString: string | null): string | null {
  if (!dateString) return null;

  const targetDate = new Date(dateString);
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) return null; // Already passed

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const hours = diffHours % 24;
  const minutes = diffMinutes % 60;

  if (diffDays > 0) {
    return `${diffDays}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `< 1m`;
}

export function isAvailable(dateString: string | null): boolean {
  if (!dateString) return true;
  return new Date(dateString).getTime() <= new Date().getTime();
}
