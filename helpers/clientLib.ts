import { CalendarDate, CalendarDateTime } from "@internationalized/date";

export const formatCalendarDateToDDMMYYYY = (date: CalendarDate): string => {
    const day = String(date.day).padStart(2, "0");
    const month = String(date.month).padStart(2, "0");
    const year = String(date.year);
    return `${year}-${month}-${day}`;
  };

  export const formatCalendarTime = (time: CalendarDateTime): string => {
    const hour = String(time.hour).padStart(2, "0");
    const minute = String(time.minute).padStart(2, "0");
    // const year = String(date.year);
    return `${hour}:${minute}`;
  }; 