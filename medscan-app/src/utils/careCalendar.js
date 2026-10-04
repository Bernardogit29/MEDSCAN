import { localDate } from "./careRecords.js";

export function calendarDate(value) {
  const [year,month,day] = value.split("-").map(Number);
  return new Date(year,month-1,day,12);
}
export function shiftDay(value, offset) {
  const date = calendarDate(value);
  date.setDate(date.getDate()+offset);
  return localDate(date);
}
export function monthCells(value) {
  const date = calendarDate(value), year = date.getFullYear(), month = date.getMonth();
  const start = new Date(year,month,1,12).getDay();
  const count = new Date(year,month+1,0,12).getDate();
  const length = Math.ceil((start+count)/7)*7;
  return Array.from({length},(_,index) => index < start || index >= start+count ? null : localDate(new Date(year,month,index-start+1,12)));
}
export function shiftMonth(value, offset) {
  const date = calendarDate(value);
  return localDate(new Date(date.getFullYear(),date.getMonth()+offset,1,12));
}
