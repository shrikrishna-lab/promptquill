export function timeAgo(date) {
  return new Date(date).toLocaleString(undefined, {
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  });
}
