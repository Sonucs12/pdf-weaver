//Formats a date into a readable format: "12 Jun 2025"

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const day = dateObj.getDate();
  const month = dateObj.toLocaleDateString("en-US", { month: "short" });
  const year = dateObj.getFullYear();

  return `${day} ${month} ${year}`;
}

//Formats a date for publishing context: "Publishing on 12 Jun 2025"

export function formatPublishDate(date?: Date | string): string {
  const dateObj = date
    ? typeof date === "string"
      ? new Date(date)
      : date
    : new Date();

  return `Publishing on ${formatDate(dateObj)}`;
}

//  Formats a date into a full format: "Monday, 12 June 2025"

export function formatFullDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return dateObj.toLocaleDateString("en-US", options);
}

//Formats a date for display with time: "12 Jun 2025, 3:45 PM"

export function formatDateWithTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const formattedDate = formatDate(dateObj);
  const time = dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${formattedDate}, ${time}`;
}

//  Gets a relative time string: "2 days ago", "Just now", etc.

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;

  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}
