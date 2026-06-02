export const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(number);
};

export const imageUrl = (url: string) => {
  if (!url) {
    return "images/image-placeholder.png";
  }
  return `http://127.0.0.1:8000/storage/${url}`;
};
export const formatDate = (
  dateInput: string | Date | number | undefined,
): string => {
  if (!dateInput) return "-";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};


export const formatTimeOnly = (dateTimeString: unknown): string => {
  if (typeof dateTimeString !== "string") {
    return "--:--";
  }
  const cleanString = dateTimeString.trim();
  const spaceIndex = cleanString.indexOf(" ");
  if (spaceIndex === -1) {
    return "--:--";
  }
  const timePart = cleanString.substring(spaceIndex + 1);
  return timePart.substring(0, 5);
};
