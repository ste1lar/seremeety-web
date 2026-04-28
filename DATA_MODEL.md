# DATA_MODEL.md — seremeety-web

## 0. 문서 상태

이 문서는 **Phase 2 — Auth/Onboarding 및 데이터 모델 재설계**의 design draft이다.

- Phase 2-A (현재): 신규 도메인 타입 정의, onboarding 상태 머신, entry route resolver, 마이그레이션 매핑 초안
- Phase 2-B: 신규 `/onboarding/*` 라우트 스텁, `resolveEntryRoute` wire-up, 기존 → 신규 어댑터
- Phase 2-C: 실제 Firestore 데이터 마이그레이션, 기존 컴포넌트의 신규 타입 이전

신규 타입은 `src/shared/types/model/`, onboarding 유틸은 `src/shared/lib/onboarding/`에 있다. 아직 어떤 컴포넌트도 이를 import하지 않으며, 기존 `users` 컬렉션과 `UserProfile` 타입은 그대로 동작한다.

`ROADMAP.md` Phase 2 — 데이터 모델·온보딩 재설계의 명세에 기반한다.

---

## 1. 현재 vs 신규 — 한눈에

| | 현재 | 신규 (Phase 2 설계) |
|---|---|---|
| 컬렉션 수 | 3 (`users`, `chat_rooms`, `requests`) | 17 |
| 계정/프로필 | `users` 단일 문서에 모두 혼합 | `users`(계정), `profiles`(공개), `preferences`(비공개), `entitlements`(권한)로 분리 |
| 프로필 상태 | `profileStatus: 0 \| 1` (이진) | `ProfileStatus = 'draft' \| 'pending' \| 'approved' \| 'rejected' \| 'deleted'` |
| 온보딩 상태 | 없음 (UI 흐름에만 의존) | `OnboardingStatus` 8단계 + 명시적 transition |
| 신규/기존 사용자 구분 | `getUserDataByUid` null 체크 | `User.onboardingStatus` 기반, server-authoritative |
| 가입 완료 정의 | 전화번호 인증 = 가입 | 전화번호 인증 + 프로필 + 사진 + 선호 + 동의 + 관리자 승인 = 추천 가능 상태 |
| 매칭 데이터 | `requests` 단일 컬렉션 | `reactions`(좋아요/패스/슈퍼좋아요) + `matches`(상호 좋아요 결과) 분리 |
| 사진 | `users.profilePictureUrl` 단일 필드 | `profilePhotos` 컬렉션 (다중 사진, 승인 상태 포함) |
| 결제/권한 | `users.coin` 필드 | `entitlements`(권한) + `payments`(mock 결제 기록) |
| 본인확인 | 없음 (Phone Auth만) | `identityVerifications` 컬렉션 (mock/future_provider 상태만) |
| 신고/차단 | 없음 | `reports`, `blocks` 컬렉션 + 관리자 처리 흐름 |

---

## 2. 컬렉션 일람

| 컬렉션 | 역할 | 가시성 | 신규 여부 |
|--------|------|--------|----------|
| `users` | 계정·내부 운영 상태(`role`, `status`, `onboardingStatus`) | self/admin only | 기존 컬렉션 재정의 |
| `profiles` | 상대에게 보여줄 공개 프로필 | 승인된 경우 매칭 대상에 노출 | 신규 |
| `preferences` | 매칭 선호(상대에게 노출 X) | self only | 신규 |
| `profilePhotos` | 사진 메타데이터 + 승인 상태 | 승인된 사진만 노출 | 신규 |
| `reactions` | 좋아요/패스/슈퍼좋아요 | self only | 신규 (`requests` 대체) |
| `matches` | 상호 좋아요 결과 | 양 당사자 only | 신규 (`requests` 대체) |
| `messages` | 매칭 후 대화 | 매칭 당사자 only | 신규 (`chat_rooms/{id}/messages` 대체) |
| `blocks` | 사용자 간 차단 | self only | 신규 |
| `reports` | 신고 기록 | reporter / admin only | 신규 |
| `identityVerifications` | 본인확인 상태 (mock) | self/admin only | 신규 |
| `consents` | 약관·개인정보 동의 이력 | self/admin only | 신규 |
| `recommendationLogs` | 추천 노출/반응 이력 | server only (admin 분석) | 신규 |
| `plans` | 무료/프리미엄 정의 | public read | 신규 |
| `entitlements` | 사용자 권한 상태 | self only | 신규 |
| `payments` | mock 결제 기록 | self/admin only | 신규 |
| `adminReviews` | 관리자 심사 워크큐(프로필/사진 승인) | admin only | 신규 |
| `chat_rooms` | (참고) 현재 채팅방 컬렉션 | — | **deprecated**, `matches` + `messages`로 흡수 |

타입 정의는 `src/shared/types/model/` 참고.

---

## 3. Onboarding 상태 머신

```
auth_only
  ↓
profile_required
  ↓
photo_required
  ↓
preference_required
  ↓
consent_required
  ↓
review_pending ──→ approved (관리자 승인)
       │
       └────────→ review_rejected ──→ profile_required (재작성)
                                  ──→ photo_required (사진만 재제출)
```

`User.status`는 `OnboardingStatus`와 별개의 축이다.

- `User.status` ∈ {`active`, `suspended`, `deleted`} — 계정 자체의 운영 상태
- `User.onboardingStatus` ∈ 위 8단계 — 온보딩 진행도

`active` + `approved`만 추천/매칭 진입이 가능하다.

허용 transition은 `src/shared/lib/onboarding/transitions.ts`의 `allowedTransitions`에 정의되어 있다. 이는 클라이언트에서 가드 용도로만 쓰고, 실제 전환은 Phase 3 Firebase Functions에서 enforce한다.

---

## 4. Entry Route Resolution

비로그인 → 로그인 → 온보딩 단계별 → 추천 진입까지의 라우트 결정은 `src/shared/lib/onboarding/resolveEntryRoute.ts`의 `resolveEntryRoute(state)`에 정의되어 있다.

| 조건 | 라우트 |
|------|--------|
| 비로그인 | `/login` |
| 로그인 + user doc 없음 | `/onboarding/bootstrap` |
| `User.status === 'suspended'` | `/account/suspended` |
| `User.status === 'deleted'` | `/account/deleted` |
| profile 없음 또는 `status === 'draft'` | `/onboarding/profile` |
| `hasRequiredPhotos === false` | `/onboarding/photos` |
| preference 없음 | `/onboarding/preferences` |
| `hasRequiredConsents === false` | `/onboarding/consent` |
| `profile.status === 'pending'` | `/onboarding/review-pending` |
| `profile.status === 'rejected'` | `/onboarding/rejected` |
| `profile.status === 'approved'` | `/recommendations` |

이 함수는 Phase 2-A에서 정의만 한다. 실제 라우팅(현재의 `AuthEntryPage` → `/matching` 직행 흐름 대체)은 Phase 2-B에서 wire up한다.

---

## 5. 가시성/접근 분리 원칙

ROADMAP §4 Phase 2 핵심 원칙 그대로:

- **공개 데이터** (`profiles`, 승인된 `profilePhotos`): 추천 대상 프로필이 상대에게 보여진다. **매칭 점수 계산 입력으로 사용 가능**.
- **비공개 매칭 데이터** (`preferences`): 본인만 읽고 쓴다. 상대에게 보이지 않는다. **매칭 점수 계산 입력으로 사용** 단 결과로만 노출.
- **운영 데이터** (`users.role/status/onboardingStatus`, `adminReviews`, `reports`): 일반 사용자에게 노출하지 않는다. admin role + 본인 외 read 금지.
- **결제 데이터** (`payments`, `entitlements`): self only. 공개 프로필에 어떤 식으로도 노출하지 않는다.
- **본인확인 결과** (`identityVerifications.ciHash` 등): self/admin only. 공개 프로필에 노출하지 않는다.
- **승인 상태**: 클라이언트에서만 관리하면 안 된다. `profile.status`, `photo.status`는 Phase 3에서 Firebase Functions가 변경한다.

---

## 6. 마이그레이션 매핑 (현재 → 신규)

기존 `users` 단일 문서를 다음과 같이 분해한다.

### `users/{uid}` (현재) → `users/{uid}` (신규, 재정의)

```
phone               → phoneNumberMasked (마스킹 처리, 평문 저장 X)
                    + phoneAuthVerified: true (Phone Auth 성공 사실)
createdAt           → createdAt
(미존재)            → role: 'user' (기본값)
                    + status: 'active' (기본값)
                    + authProvider: 'firebase_phone'
profileStatus 0     → onboardingStatus: 'profile_required'
profileStatus 1     → onboardingStatus: 'approved' (이전 데이터의 approval은
                      manager가 한 것이 아니므로 마이그레이션 시 일괄 'approved'
                      처리할지, 'review_pending'으로 돌릴지 운영 정책 필요)
```

### `users/{uid}` (현재) → `profiles/{profileId}` (신규)

```
nickname            → nickname
birthdate           → birthYear (YYYY 추출)
age                 → 파생 필드, 저장하지 않음 (런타임 계산)
gender              → gender
place               → location
introduce           → bio
mbti                → tags: [..., 'mbti:ENTJ'] 형태로 합쳐서 저장
                      (또는 Profile 타입에 mbti 필드 추가 — Open Question)
university          → educationLevel 또는 별도 필드 (Open Question)
profilePictureUrl   → profilePhotos/{photoId}.displayUrl
                      + profile.mainPhotoId = photoId
profileStatus 0     → status: 'draft'
profileStatus 1     → status: 'approved' (운영 정책에 따라)
```

### `users/{uid}` (현재) → `entitlements/{uid}` (신규)

```
coin                → 직접적인 매핑 없음 — Open Question §8 참조
                      (Entitlement에 coinBalance 추가 vs 별도 wallets 컬렉션)
```

### `users/{uid}` (현재) → `preferences/{prefId}` (신규)

현재 데이터에 선호 정보가 없다. 마이그레이션 시 모든 사용자에 대해
`preferences` 문서를 생성하지 않는다 (기본값 강제 X). 사용자가
`/onboarding/preferences`에서 입력하기 전까지 문서가 존재하지 않는 상태로 둔다.

### `requests/{requestId}` (현재) → `reactions/{reactionId}` + `matches/{matchId}` (신규)

```
현재 requests:
{ from, to, status: 'pending' | 'accepted' | 'rejected', createdAt }

신규 reactions: 항상 from→to 단방향 기록 (좋아요/패스/슈퍼좋아요)
{ fromUserId: from, toUserId: to, type: 'like', createdAt }

신규 matches: 상호 좋아요가 성립한 결과로만 생성
{ userIds: [from, to], status: 'active', createdByReactionIds: [...] }

마이그레이션 규칙:
- requests.status === 'pending'  → reactions(type='like') 1건만 생성
- requests.status === 'accepted' → reactions 양쪽(from→to, to→from)
                                   + matches(active) 1건
- requests.status === 'rejected' → reactions(type='pass', to→from) 1건
                                   (또는 마이그레이션에서 제외하고 무시)
```

### `chat_rooms/{id}` + `chat_rooms/{id}/messages/{msgId}` (현재) → `matches/{matchId}` + `messages/{msgId}` (신규)

```
chat_rooms.users      → matches.userIds
chat_rooms.lastMessage → matches.lastMessage (또는 matches에서 분리하여
                         별도 인덱스 컬렉션, Open Question §8)
chat_rooms.createdAt  → matches.createdAt
chat_rooms/{id}/messages/{mid} → messages/{mid} (matchId = chatRoomId 매핑 후
                                  top-level 컬렉션으로 이동)
```

---

## 7. 본인확인 (Identity Verification)

ROADMAP §3.7대로 **현재는 외부 본인확인 API(NICE/KMC/PASS)를 붙이지 않는다.**

- `identityVerifications` 컬렉션은 정의해두되, 모든 사용자의 default는
  `{ provider: 'none', status: 'not_started' }`이다.
- CI/DI 등 민감정보는 실운영 + 법무 검토 + 약관 정비 전까지 저장하지 않는다.
  타입에 필드는 있지만 Firestore 문서에는 비워둔다.
- `recommendationLogs.reasonCodes`의 `identity_verified`는 mock/future로만 사용.
  Phase 5 추천 점수에서 가중치 비중을 크게 두지 않는다.

---

## 8. Resolved Decisions

Slice 2-B 진입 전 §8 Open Questions에 대한 결정.

1. **`coin` 폐기, `Entitlement` 한도 모델로 일원화** — ROADMAP의 `dailyRecommendationLimit` / `dailyLikeLimit` / `dailySuperLikeLimit` 기반으로 권한을 표현한다. 기존 `users.coin` 필드는 신규 데이터 모델에 매핑하지 않는다.

2. **`Profile.mbti`, `Profile.university` optional 필드 추가** — 매칭 필터/정렬 쿼리 사용성을 위해 dedicated 필드로 둔다.

3. **기존 사용자 마이그레이션 무시** — 운영 데이터 없음 가정. Slice 2-B에서는 grandfather logic으로만 처리: 기존 old-shape `users/{uid}` 문서가 발견되면 `onboardingStatus = 'approved'` + `profile.status = 'approved'`로 간주.

4. **`matches.lastMessage` denormalize** — 채팅 목록 read 비용 최소화.

5. **`profile.tags` 사전 정의 리스트** — 실제 어휘는 Phase 5 (매칭 로직 재구축) 또는 Phase 4 (프로필 시스템 개선) 시점에 정의. Slice 2-B onboarding form은 임시 어휘로 진행.

6. **승인 자동화는 Phase 8 영역** — Phase 2 범위 외.

7. **라우트명**: ROADMAP의 `/recommendations`는 본 코드베이스의 실제 라우트인 `/matching`으로 매핑. `resolveEntryRoute`도 `/matching`을 반환한다.

---

## 9. 실운영 전 필요 항목 (Phase 11에서 다시 다룰 것)

이 모델 변경 자체로 실서비스 전환이 가능해지는 것이 아니다. ROADMAP §11.4의
실운영 전 필요 항목은 별개이며, 본 문서의 데이터 모델은 그 항목들을 위한
**기반**일 뿐이다.

- 사업자 등록, PG 계약, 약관/개인정보 법무 검토
- 한국 본인확인 API 계약 / CI·DI 저장 정책 확정
- 환불 / 신고 / 탈퇴 / 개인정보 삭제 정책
- 보안 점검, 모니터링, 백업 정책

---

## 10. 변경 이력

- 2026-04-28: 초안 작성 (Phase 2-A). 신규 타입 + onboarding 상태 머신 +
  resolveEntryRoute + 마이그레이션 매핑 정리. 기존 컬렉션·UI에는 영향 없음.
