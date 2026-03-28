import type { TimestampLike } from '@/shared/types/domain';

const timestampToDate = (timestamp: TimestampLike): Date | null => {
  if (timestamp instanceof Date) {
    return timestamp;
  }

  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date(timestamp.seconds * 1000);
  }

  return null;
};

const getStartOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

export const toComparableTime = (timestamp: TimestampLike): number => {
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }

  if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
    return timestamp.seconds * 1000;
  }

  return 0;
};

export const toLocalePhoneNumber = (input: string): string => {
  const cleanText = input.replace(/-/g, '');
  const maxLength = 11;
  const firstHyphenIndex = 3;
  const secondHyphenIndex = 7;

  let localePhoneNumber = cleanText.slice(0, maxLength);

  if (localePhoneNumber.length > secondHyphenIndex) {
    localePhoneNumber =
      localePhoneNumber.slice(0, secondHyphenIndex) +
      '-' +
      localePhoneNumber.slice(secondHyphenIndex);
  }

  if (localePhoneNumber.length > firstHyphenIndex) {
    localePhoneNumber =
      localePhoneNumber.slice(0, firstHyphenIndex) +
      '-' +
      localePhoneNumber.slice(firstHyphenIndex);
  }

  return localePhoneNumber;
};

export const toIntlPhoneNumber = (input: string): string => {
  let intlPhoneNumber = input.replace(/-/g, '');

  if (intlPhoneNumber.length > 0 && intlPhoneNumber[0] === '0') {
    intlPhoneNumber = `+82${intlPhoneNumber.substring(1)}`;
  } else {
    intlPhoneNumber = `+82${intlPhoneNumber}`;
  }

  return intlPhoneNumber;
};

export const getAgeByBirthDate = (birthdate: string): number => {
  const today = new Date();
  const dateOfBirth = new Date(birthdate);

  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const todayMonthDay = today.getMonth() * 100 + today.getDate();
  const birthMonthDay = dateOfBirth.getMonth() * 100 + dateOfBirth.getDate();
  if (todayMonthDay < birthMonthDay) {
    age -= 1;
  }

  return age;
};

export const formatTimeStampForList = (timestamp: TimestampLike): string => {
  const date = timestampToDate(timestamp);
  if (!date) {
    return ' ';
  }

  const now = new Date();
  const isSameYear = date.getFullYear() === now.getFullYear();
  const dayDifference = Math.floor((getStartOfDay(now) - getStartOfDay(date)) / 86_400_000);

  if (!isSameYear) {
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  if (dayDifference === 0) {
    return date.toLocaleString('ko-KR', { hour: 'numeric', minute: 'numeric', hour12: true });
  }

  if (dayDifference === 1) {
    return '어제';
  }

  return date.toLocaleString('ko-KR', { month: 'long', day: 'numeric' });
};

export const formatTimeStampForMessage = (timestamp: TimestampLike): string => {
  const date = timestampToDate(timestamp);
  if (!date) {
    return '';
  }

  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const formatDateLabel = (timestamp: TimestampLike): string => {
  const date = timestampToDate(timestamp);
  if (!date) {
    return '';
  }

  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

  return `${year}.${month}.${day}. (${weekday})`;
};

export const isSameDate = (leftTimestamp: TimestampLike, rightTimestamp: TimestampLike): boolean => {
  const leftDate = timestampToDate(leftTimestamp);
  const rightDate = timestampToDate(rightTimestamp);

  if (!leftDate || !rightDate) {
    return false;
  }

  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  );
};
