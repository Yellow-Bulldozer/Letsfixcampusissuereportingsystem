export const getCurrentDay = (): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  return days[today.getDay()];
};

export const isSaturday = (): boolean => {
  return new Date().getDay() === 6;
};

export const isWeekday = (): boolean => {
  const day = new Date().getDay();
  return day >= 1 && day <= 5; // Monday to Friday
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
