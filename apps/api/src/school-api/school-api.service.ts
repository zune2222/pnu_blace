import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import * as CryptoJS from 'crypto-js';
import {
  UserInfoFromAPI,
  LoginResult,
  SeatInfo,
  MySeatInfo,
} from '@pnu-blace/types';

@Injectable()
export class SchoolApiService {
  private readonly logger = new Logger(SchoolApiService.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseURL = 'https://place.pusan.ac.kr/PUSAN_MOBILE';

  constructor(private configService: ConfigService) {
    this.httpClient = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        Accept: 'application/json, text/plain, */*',
      },
    });

    // 응답 인터셉터 추가 (로깅용)
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(
          `Response from ${response.config?.url}: ${response.status}`,
        );
        return response;
      },
      (error) => {
        this.logger.error(`Request failed: ${error.message}`);
        return Promise.reject(error);
      },
    );
  }

  /**
   * 학교 API 3단계 인증 과정을 수행합니다.
   */
  async login(studentId: string, password: string): Promise<LoginResult> {
    try {
      // 1단계: 버전 체크 및 세션 시작
      this.logger.debug('Step 1: Version check');
      const versionCheckResponse = await this.httpClient.post(
        '/versionCheck.do',
        'appVersion=1.2.0&deviceGB=I',
      );

      const cookies = versionCheckResponse.headers['set-cookie'];
      if (!cookies) {
        throw new UnauthorizedException('JSESSIONID 획득 실패');
      }

      const jsessionId = this.extractJSessionId(cookies);
      if (!jsessionId) {
        throw new UnauthorizedException('JSESSIONID 파싱 실패');
      }

      // 2단계: 유저 키 요청
      this.logger.debug('Step 2: User key request');
      const userKeyResponse = await this.httpClient.post(
        '/userKey.do',
        `userID=${studentId}`,
        {
          headers: {
            Cookie: `JSESSIONID=${jsessionId}`,
          },
        },
      );

      if (userKeyResponse.status !== 200) {
        throw new UnauthorizedException('유저 키 요청 실패');
      }

      const userKey = userKeyResponse.data as string;
      if (!userKey) {
        throw new UnauthorizedException('유저 키 획득 실패');
      }

      // 3단계: 비밀번호 암호화 및 로그인
      this.logger.debug('Step 3: Login with encrypted password');
      const encryptedPassword = this.encryptPassword(password, userKey);

      const loginResponse = await this.httpClient.post(
        '/mLogin.do',
        `userID=${studentId}&pwd=${encryptedPassword}&deviceGB=I`,
        {
          headers: {
            Cookie: `JSESSIONID=${jsessionId}`,
          },
        },
      );

      // 로그인 결과 검증
      if (
        loginResponse.status === 200 &&
        (loginResponse.data as any)?.success !== false
      ) {
        return {
          success: true,
          userID: studentId,
          sessionID: jsessionId,
        };
      } else {
        return {
          success: false,
          errorMessage: '학번 또는 비밀번호가 올바르지 않습니다.',
        };
      }
    } catch (error: any) {
      this.logger.error(`Login error: ${error.message}`);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new BadRequestException('학교 시스템 연결 오류가 발생했습니다.');
    }
  }

  /**
   * 좌석 예약
   */
  async reserveSeat(
    userID: string,
    sessionID: string,
    roomNo: string,
    setNo: string,
  ): Promise<boolean> {
    try {
      const response = await this.httpClient.post(
        '/assignSeat.do',
        `userID=${userID}&roomNo=${roomNo}&setNo=${setNo}`,
        {
          headers: {
            Cookie: `JSESSIONID=${sessionID}`,
          },
        },
      );

      return (
        response.status === 200 && (response.data as any)?.success !== false
      );
    } catch (error: any) {
      this.logger.error(`Reserve seat error: ${error.message}`);
      return false;
    }
  }

  /**
   * 좌석 반납
   */
  async returnSeat(
    userID: string,
    sessionID: string,
    roomNo: string,
    setNo: string,
  ): Promise<boolean> {
    try {
      const response = await this.httpClient.post(
        '/returnSeat.do',
        `userID=${userID}&roomNo=${roomNo}&setNo=${setNo}`,
        {
          headers: {
            Cookie: `JSESSIONID=${sessionID}`,
          },
        },
      );

      return (
        response.status === 200 && (response.data as any)?.success !== false
      );
    } catch (error: any) {
      this.logger.error(`Return seat error: ${error.message}`);
      return false;
    }
  }

  /**
   * 좌석 연장
   */
  async extendSeat(
    userID: string,
    sessionID: string,
    roomNo: string,
    setNo: string,
  ): Promise<boolean> {
    try {
      const response = await this.httpClient.post(
        '/contSeat.do',
        `userID=${userID}&roomNo=${roomNo}&setNo=${setNo}`,
        {
          headers: {
            Cookie: `JSESSIONID=${sessionID}`,
          },
        },
      );

      return (
        response.status === 200 && (response.data as any)?.success !== false
      );
    } catch (error: any) {
      this.logger.error(`Extend seat error: ${error.message}`);
      return false;
    }
  }

  /**
   * 내 좌석 정보 조회
   */
  async getMySeat(
    userID: string,
    sessionID: string,
  ): Promise<MySeatInfo | null> {
    try {
      const response = await this.httpClient.post(
        '/mySeatStatusNew.do',
        `userID=${userID}`,
        {
          headers: {
            Cookie: `JSESSIONID=${sessionID}`,
          },
        },
      );

      if (response.status === 200 && response.data) {
        const data = response.data as any;
        if (data.roomNo && data.setNo) {
          return {
            roomNo: data.roomNo,
            setNo: data.setNo,
            startTime: data.startTime || '',
            endTime: data.endTime || '',
          };
        }
      }

      return null;
    } catch (error: any) {
      this.logger.error(`Get my seat error: ${error.message}`);
      return null;
    }
  }

  /**
   * 열람실 좌석 현황 조회 (HTML 파싱)
   */
  async getSeatMap(roomNo: string, sessionID?: string): Promise<SeatInfo[]> {
    try {
      const headers: any = {};
      if (sessionID) {
        headers.Cookie = `JSESSIONID=${sessionID}`;
      }

      const response: AxiosResponse = await this.httpClient.get(
        `/seatMap.do?roomNo=${roomNo}`,
        {
          headers,
        },
      );

      if (response.status === 200 && response.data) {
        return this.parseSeatMapHtml(response.data as string);
      }

      return [];
    } catch (error: any) {
      this.logger.error(`Get seat map error: ${error.message}`);
      return [];
    }
  }

  /**
   * JSESSIONID를 쿠키에서 추출
   */
  private extractJSessionId(cookies: string[]): string | null {
    for (const cookie of cookies) {
      const match = cookie.match(/JSESSIONID=([^;]+)/);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * 비밀번호 암호화 (부산대 도서관 API 방식)
   * AES-256-CBC 암호화를 사용합니다.
   */
  private encryptPassword(password: string, userKey: string): string {
    try {
      // 키: userKey의 UTF-8 (32바이트)
      // userKey는 2단계에서 /userKey.do 응답으로 받은 값을 사용
      const key = CryptoJS.enc.Utf8.parse(userKey);

      // IV: 16바이트 0값
      const iv = CryptoJS.enc.Hex.parse('0'.repeat(32));

      // AES-256-CBC 암호화 수행
      const encrypted = CryptoJS.AES.encrypt(password, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      // Base64 문자열로 변환
      const base64EncryptedPassword = encrypted.toString();

      // URL 인코딩 적용
      const urlEncodedPassword = encodeURIComponent(base64EncryptedPassword);

      this.logger.debug(`Password encrypted successfully`);
      return urlEncodedPassword;
    } catch (error: any) {
      this.logger.error(`Password encryption failed: ${error.message}`);
      throw new Error('비밀번호 암호화에 실패했습니다.');
    }
  }

  /**
   * 좌석 현황 HTML을 파싱하여 좌석 정보 추출
   */
  private parseSeatMapHtml(html: string): SeatInfo[] {
    const $ = cheerio.load(html);
    const seats: SeatInfo[] = [];

    // JavaScript에서 사용 중인 좌석 배열 추출
    const useSeatNoMatch = html.match(/useSeatNo\.push\("(\d+)"\);/g);
    const occupiedSeatNumbers = new Set<string>();

    if (useSeatNoMatch) {
      useSeatNoMatch.forEach((match) => {
        const seatNoMatch = match.match(/useSeatNo\.push\("(\d+)"\);/);
        if (seatNoMatch) {
          occupiedSeatNumbers.add(seatNoMatch[1]);
        }
      });
    }

    // 고장난/사용불가 좌석 배열 추출
    const seatFixMatch = html.match(/seatFix\s*=\s*"([^"]+)";/);
    const unavailableSeatNumbers = new Set<string>();

    if (seatFixMatch) {
      const seatFixStr = seatFixMatch[1];
      if (seatFixStr && seatFixStr !== '') {
        // "100,101,99,98" 또는 "1-5,10,15-20" 형태 파싱
        const fixedSeats = seatFixStr.split(',');
        fixedSeats.forEach((seat) => {
          seat = seat.trim();
          if (seat.includes('-')) {
            // 범위 형태 (예: "1-5")
            const [start, end] = seat.split('-').map((n) => parseInt(n.trim()));
            for (let i = start; i <= end; i++) {
              unavailableSeatNumbers.add(i.toString());
            }
          } else if (seat !== '') {
            unavailableSeatNumbers.add(seat);
          }
        });
      }
    }

    // td 태그에서 좌석 정보 추출 (id가 숫자인 것들)
    $('td[id]').each((index, element) => {
      const $seat = $(element);
      const seatId = $seat.attr('id');
      const className = $seat.attr('class');

      // id가 숫자인 경우만 좌석으로 간주
      if (seatId && /^\d+$/.test(seatId) && className === 'desk') {
        const setNo = seatId;
        let status: 'OCCUPIED' | 'AVAILABLE' | 'UNAVAILABLE' = 'AVAILABLE';

        if (unavailableSeatNumbers.has(setNo)) {
          status = 'UNAVAILABLE';
        } else if (occupiedSeatNumbers.has(setNo)) {
          status = 'OCCUPIED';
        }

        seats.push({ setNo, status });
      }
    });

    this.logger.debug(`Parsed ${seats.length} seats from HTML`);
    this.logger.debug(
      `Occupied seats: ${Array.from(occupiedSeatNumbers).join(', ')}`,
    );
    this.logger.debug(
      `Unavailable seats: ${Array.from(unavailableSeatNumbers).join(', ')}`,
    );

    return seats;
  }

  /**
   * 사용자 정보 조회 (로그인 후)
   */
  async getUserInfo(sessionID: string): Promise<UserInfoFromAPI | null> {
    try {
      const response = await this.httpClient.get('/idCard.do', {
        headers: {
          Cookie: `JSESSIONID=${sessionID}`,
        },
      });

      if (response.status !== 200) {
        this.logger.error('Failed to get user info');
        return null;
      }

      const xmlData = response.data as string;
      return this.parseUserInfoXml(xmlData);
    } catch (error) {
      this.logger.error(
        `Failed to get user info: ${this.getErrorMessage(error)}`,
      );
      return null;
    }
  }

  /**
   * 사용자 정보 XML 파싱
   */
  private parseUserInfoXml(xmlData: string): UserInfoFromAPI | null {
    try {
      // CDATA 섹션에서 값 추출하는 정규식
      const extractCDATA = (tagName: string): string => {
        const regex = new RegExp(
          `<${tagName}>\\s*<!\\[CDATA\\[([^\\]]+)\\]\\]>\\s*</${tagName}>`,
          'i',
        );
        const match = xmlData.match(regex);
        return match ? match[1].trim() : '';
      };

      // resultCode 확인
      const resultCode = extractCDATA('resultCode');
      if (resultCode !== '0') {
        this.logger.warn(`User info request failed with code: ${resultCode}`);
        return null;
      }

      const userInfo: UserInfoFromAPI = {
        userID: extractCDATA('userID'),
        userName: extractCDATA('userName'),
        deptName: extractCDATA('deptName'),
        patName: extractCDATA('patName'),
        qrCode: extractCDATA('qrCode'),
        photoUrl: extractCDATA('photoUrl'),
        mainNoti: extractCDATA('mainNoti'),
      };

      this.logger.debug(
        `Parsed user info for: ${userInfo.userName} (${userInfo.userID})`,
      );
      return userInfo;
    } catch (error) {
      this.logger.error(
        `Failed to parse user info XML: ${this.getErrorMessage(error)}`,
      );
      return null;
    }
  }

  /**
   * 시스템 계정으로 로그인 (백그라운드 작업용)
   */
  async loginAsSystem(): Promise<LoginResult> {
    const systemUserId = this.configService.get<string>('SYSTEM_STUDENT_ID');
    const systemPassword = this.configService.get<string>('SYSTEM_PASSWORD');

    if (!systemUserId || !systemPassword) {
      throw new Error('시스템 계정 정보가 설정되지 않았습니다.');
    }

    return this.login(systemUserId, systemPassword);
  }

  /**
   * 에러 메시지 안전하게 추출
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
