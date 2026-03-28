import { checkNicknameDuplicate } from '@/shared/lib/firebase/users';
import type { UserProfile, ValidationRule } from '@/shared/types/domain';

export const validationRules: Partial<Record<keyof UserProfile, ValidationRule>> = {
  nickname: async (value) => {
    if (!/^[a-zA-Z0-9가-힣]{1,6}$/.test(value)) {
      return '6자리 이하의 한글, 영문, 숫자 닉네임만 가능해요';
    }

    const isDuplicate = await checkNicknameDuplicate(value);
    if (!isDuplicate) {
      return '이미 사용 중인 닉네임이에요';
    }

    return true;
  },
  age: (value) => {
    if (!value) {
      return '생년월일을 입력해주세요';
    }

    const matchedAge = value.match(/\d+/)?.[0];
    const age = matchedAge ? Number.parseInt(matchedAge, 10) : 0;
    if (age < 18) {
      return '유효한 생년월일을 입력해주세요';
    }

    return true;
  },
  gender: (value) => (value ? true : '성별을 선택해 주세요'),
  mbti: (value) => (value ? true : 'MBTI를 선택해 주세요'),
  university: (value) => (value ? true : '학교를 입력해 주세요'),
  place: (value) => (value ? true : '지역을 입력해 주세요'),
  introduce: (value) => {
    if (!value) {
      return '자기소개를 작성해 주세요';
    }

    if (value.length > 500) {
      return '자기소개는 최대 500자까지 작성할 수 있어요';
    }

    return true;
  },
};
