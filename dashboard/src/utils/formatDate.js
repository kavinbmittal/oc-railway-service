export function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;

  const day = d.getDate();
  const suffix = day === 1 || day === 21 || day === 31 ? 'st'
    : day === 2 || day === 22 ? 'nd'
    : day === 3 || day === 23 ? 'rd'
    : 'th';

  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  const year = d.getFullYear();

  return `${dayName}, ${day}${suffix} ${month} ${year}`;
}

export function formatDateTime(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;

  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${formatDate(dateStr)} at ${time}`;
}

export function formatTimeAgo(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(dateStr);
}
