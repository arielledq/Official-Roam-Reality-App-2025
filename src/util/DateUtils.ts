import dayjs from 'dayjs';

export const DateFormat = {
  DMMMYYYY: 'D MMM YYYY',
  YYYYMMDD: 'YYYY-MM-DD',
  DMMMYY: 'D MMM YY',
  MMDDYY: 'MM/DD/YY'
};

export function formatDate(date: Date | string, format: string) {
  return dayjs(date).format(format);
}

export function getDateFromString(date: string) {
  return dayjs(date).toDate();
}
