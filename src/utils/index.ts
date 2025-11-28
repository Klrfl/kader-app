export function formatDate(date: string | Date) {
  const parsedDate = new Date(date);

  const formatter = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  });
  const parsed = formatter.format(parsedDate);
  return parsed;
}
