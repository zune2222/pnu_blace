# @pnu-blace/db

이 패키지는 PNU Blace 프로젝트의 데이터베이스 엔티티와 TypeORM 설정을 포함합니다.

## 사용법

```typescript
// 모든 엔티티 import
import {
	User,
	SeatEventLog,
	MyUsageLog,
	NotificationRequest,
} from "@pnu-blace/db";

// 개별 엔티티 import
import { User } from "@pnu-blace/db";
```

## 포함된 엔티티들

### User

- 학생 정보를 저장하는 엔티티
- `studentId`를 Primary Key로 사용
- `MyUsageLog`와 `NotificationRequest`와 1:N 관계

### SeatEventLog

- 좌석 이벤트(점유/해제) 로그를 저장하는 엔티티
- 실시간 좌석 상태 추적에 사용

### MyUsageLog

- 사용자의 좌석 이용 기록을 저장하는 엔티티
- `User`와 N:1 관계

### NotificationRequest

- 사용자의 알림 요청을 저장하는 엔티티
- `User`와 N:1 관계
- 상태 관리: PENDING, COMPLETED, CANCELED
