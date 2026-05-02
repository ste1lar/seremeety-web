import { Timestamp } from 'firebase/firestore';

// Firestore Timestamp는 클래스 인스턴스라 Redux 직렬화 검사를 통과하지 못한다.
// firebase 헬퍼가 raw doc.data()를 반환하기 전에 본 함수를 거쳐 Timestamp를
// `{ seconds, nanoseconds }` plain object로 바꾼다. 기존 TimestampLike 타입에
// `{ seconds: number }` 케이스가 포함되어 있어 호환된다.
export const toPlainTimestamps = <T>(value: T): T => {
  if (value === null || value === undefined) {
    return value;
  }
  if (value instanceof Timestamp) {
    return {
      seconds: value.seconds,
      nanoseconds: value.nanoseconds,
    } as unknown as T;
  }
  if (Array.isArray(value)) {
    return (value as unknown[]).map((item) => toPlainTimestamps(item)) as unknown as T;
  }
  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = toPlainTimestamps(val);
    }
    return result as T;
  }
  return value;
};
