# @pnu-blace/types

이 패키지는 PNU Blace 프로젝트의 공통 타입 정의와 DTO(Data Transfer Objects)를 포함합니다.

## 사용법

```typescript
// 사용자 관련 DTO
import { LoginRequestDto, UserProfileDto } from "@pnu-blace/types/user";

// 좌석 관련 DTO
import { SeatStatusDto, ReserveSeatRequestDto } from "@pnu-blace/types/seat";

// 알림 관련 DTO
import { CreateNotificationRequestDto } from "@pnu-blace/types/notification";
```

## 포함된 DTO들

### User DTOs

- `LoginRequestDto`: 로그인 요청 데이터
- `UserProfileDto`: 사용자 프로필 데이터

### Seat DTOs

- `SeatStatusDto`: 좌석 상태 데이터
- `ReserveSeatRequestDto`: 좌석 예약 요청 데이터

### Notification DTOs

- `CreateNotificationRequestDto`: 알림 요청 생성 데이터
