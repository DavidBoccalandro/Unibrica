export function addHoursToDate(hours: string): Date {
  const hoursToAdd = parseInt(hours);
  const date = new Date();
  date.setHours(date.getHours() + hoursToAdd);
  return date;
}
