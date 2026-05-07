export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatDateInput = (dateStr) => {
  const d = new Date(dateStr);
  // Returns YYYY-MM-DD for <input type="date">
  return d.toISOString().split('T')[0];
};

export const pad = (n) => String(n).padStart(2, '0');

export const todayInputValue = () => new Date().toISOString().split('T')[0];
