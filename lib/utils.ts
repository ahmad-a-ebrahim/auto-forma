import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import parsePhoneNumberFromString from "libphonenumber-js";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validatePhone(val: string) {
  const phoneNumber = parsePhoneNumberFromString(val || "");
  return phoneNumber?.isValid() || false;
}

export function getFormattedDate(dateString: string) {
  const date = parseISO(dateString);

  return format(date, "dd MMM yyyy");
}
