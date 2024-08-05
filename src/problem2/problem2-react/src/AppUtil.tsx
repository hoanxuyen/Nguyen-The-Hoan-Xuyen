export const API_BASE = "https://interview.switcheo.com/prices.json";
export function getDate(date: string) {
  const convertedDate = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "short",
  };

  return convertedDate.toLocaleDateString("en-US", options);
}
