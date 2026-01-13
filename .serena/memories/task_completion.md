# PNU Blace - 작업 완료 체크리스트

작업을 완료한 후 다음 사항들을 확인하세요.

## 필수 체크

### 1. 타입 체크
```bash
yarn check-types
# 또는
yarn type-check
```
TypeScript 컴파일 오류가 없는지 확인합니다.

### 2. 린트
```bash
yarn lint
```
ESLint 경고/오류를 확인하고 수정합니다.
- Web: `yarn lint --max-warnings 0`으로 경고도 허용하지 않음

### 3. 코드 포맷팅
```bash
yarn format
```
Prettier로 코드 스타일을 일관되게 유지합니다.

## 선택적 체크 (변경 범위에 따라)

### 4. 단위 테스트 (Web)
```bash
cd apps/web
yarn test:run
```
변경된 기능에 대한 테스트가 통과하는지 확인합니다.

### 5. 단위 테스트 (API)
```bash
cd apps/api
yarn test
```
NestJS 서비스/컨트롤러 테스트를 실행합니다.

### 6. E2E 테스트 (Web)
```bash
cd apps/web
yarn e2e
```
주요 사용자 플로우가 정상 동작하는지 확인합니다.

### 7. 빌드 확인
```bash
yarn build
```
프로덕션 빌드가 성공하는지 확인합니다.

## 빠른 검증 명령어

전체 코드 품질 체크를 한 번에 실행:
```bash
yarn lint && yarn check-types && yarn format
```

## 커밋 전 체크리스트

- [ ] 타입 오류 없음 (`yarn check-types`)
- [ ] 린트 통과 (`yarn lint`)
- [ ] 포맷팅 적용 (`yarn format`)
- [ ] 관련 테스트 통과
- [ ] 빌드 성공 (중요 변경 시)
- [ ] 커밋 메시지 컨벤션 준수 (`feat:`, `fix:`, `refactor:`, etc.)

## PR 전 체크리스트

- [ ] 위 커밋 전 체크리스트 완료
- [ ] E2E 테스트 통과 (주요 기능 변경 시)
- [ ] 문서 업데이트 (필요 시)
- [ ] 환경변수 추가 시 `.env.example` 업데이트
