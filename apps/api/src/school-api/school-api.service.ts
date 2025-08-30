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
  RoomInfo,
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
        loginResponse.data?.success !== false
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
   * 좌석 발급
   */
  async reserveSeat(
    userID: string,
    sessionID: string | null,
    roomNo: string,
    seatNo: string,
  ): Promise<{
    success: boolean;
    message?: string;
    requiresGateEntry?: boolean;
  }> {
    try {
      const currentSessionID =
        sessionID || (await this.loginAsSystem()).sessionID;

      this.logger.debug(
        `Attempting to reserve seat: ${userID} - ${roomNo}/${seatNo}`,
      );

      const response = await this.httpClient.post(
        '/assignSeat.do',
        `userID=${userID}&roomNo=${roomNo}&seatNo=${seatNo}`,
        {
          headers: {
            Cookie: `JSESSIONID=${currentSessionID}`,
          },
        },
      );

      this.logger.debug(`Reserve seat response status: ${response.status}`);
      this.logger.debug(
        `Reserve seat response data: ${JSON.stringify(response.data)}`,
      );

      // XML 응답인 경우 파싱
      if (response.status === 200 && typeof response.data === 'string') {
        const xmlResult = this.parseReserveSeatXml(response.data);
        return xmlResult;
      }

      // JSON 응답인 경우 (기존 로직)
      const isSuccess =
        response.status === 200 && response.data?.success !== false;
      this.logger.debug(`Reserve seat result: ${isSuccess}`);

      return { success: isSuccess };
    } catch (error: any) {
      this.logger.error(`Reserve seat error: ${error.message}`);
      if (error.response) {
        this.logger.error(`Error response status: ${error.response.status}`);
        this.logger.error(
          `Error response data: ${JSON.stringify(error.response.data)}`,
        );
      }
      return { success: false, message: '좌석 발권 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 좌석 발권 XML 응답 파싱
   */
  private parseReserveSeatXml(xmlData: string): {
    success: boolean;
    message?: string;
    requiresGateEntry?: boolean;
  } {
    try {
      this.logger.debug(`Parsing reserve seat XML: ${xmlData}`);

      // CDATA 섹션에서 값 추출하는 정규식
      const extractCDATA = (tagName: string): string => {
        const regex = new RegExp(
          `<${tagName}>\\s*<!\\[CDATA\\[([^\\]]+)\\]\\]>\\s*</${tagName}>`,
          'i',
        );
        const match = xmlData.match(regex);
        return match ? match[1].trim() : '';
      };

      const resultCode = extractCDATA('resultCode');
      const resultMsg = extractCDATA('resultMsg');

      this.logger.debug(
        `Reserve seat result - code: ${resultCode}, message: ${resultMsg}`,
      );

      // resultCode가 '0'이면 성공, '1'이면 실패
      if (resultCode === '0') {
        const message = resultMsg || '좌석이 성공적으로 발권되었습니다.';

        // 출입게이트 통과 안내 메시지 포함 여부 확인
        const requiresGateEntry =
          message.includes('출입게이트') || message.includes('15분');

        return {
          success: true,
          message,
          requiresGateEntry,
        };
      } else {
        return {
          success: false,
          message: resultMsg || '좌석 발권에 실패했습니다.',
        };
      }
    } catch (error) {
      this.logger.error(
        `Failed to parse reserve seat XML: ${this.getErrorMessage(error)}`,
      );
      return { success: false, message: '응답 처리 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 좌석 반납
   */
  async returnSeat(
    userID: string,
    sessionID: string | null,
    roomNo: string,
    seatNo: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const currentSessionID =
        sessionID || (await this.loginAsSystem()).sessionID;

      this.logger.debug(
        `Attempting to return seat: ${userID} - ${roomNo}/${seatNo}`,
      );
      const response = await this.httpClient.post(
        '/returnSeat.do',
        `userID=${userID}&seatNo=${seatNo}&roomNo=${roomNo}`,
        {
          headers: {
            Cookie: `JSESSIONID=${currentSessionID}`,
          },
        },
      );

      this.logger.debug(`Return seat response status: ${response.status}`);
      this.logger.debug(
        `Return seat response data: ${JSON.stringify(response.data)}`,
      );

      // XML 응답인 경우 파싱
      if (response.status === 200 && typeof response.data === 'string') {
        const xmlResult = this.parseReturnSeatXml(response.data);
        return xmlResult;
      }

      // JSON 응답인 경우 (기존 로직)
      const isSuccess =
        response.status === 200 && response.data?.success !== false;
      return { success: isSuccess };
    } catch (error: any) {
      this.logger.error(`Return seat error: ${error.message}`);
      return { success: false, message: '좌석 반납 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 좌석 반납 XML 응답 파싱
   */
  private parseReturnSeatXml(xmlData: string): {
    success: boolean;
    message?: string;
  } {
    try {
      this.logger.debug(`Parsing return seat XML: ${xmlData}`);

      // CDATA 섹션에서 값 추출하는 정규식
      const extractCDATA = (tagName: string): string => {
        const regex = new RegExp(
          `<${tagName}>\\s*<!\\[CDATA\\[([^\\]]+)\\]\\]>\\s*</${tagName}>`,
          'i',
        );
        const match = xmlData.match(regex);
        return match ? match[1].trim() : '';
      };

      const resultCode = extractCDATA('resultCode');
      const resultMsg = extractCDATA('resultMsg');

      this.logger.debug(
        `Return seat result - code: ${resultCode}, message: ${resultMsg}`,
      );

      // resultCode가 '0'이면 성공, '1'이면 실패
      if (resultCode === '0') {
        return {
          success: true,
          message: resultMsg || '좌석이 성공적으로 반납되었습니다.',
        };
      } else {
        return {
          success: false,
          message: resultMsg || '좌석 반납에 실패했습니다.',
        };
      }
    } catch (error) {
      this.logger.error(
        `Failed to parse return seat XML: ${this.getErrorMessage(error)}`,
      );
      return { success: false, message: '응답 처리 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 좌석 연장
   */
  async extendSeat(
    userID: string,
    sessionID: string | null,
    roomNo: string,
    seatNo: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const currentSessionID =
        sessionID || (await this.loginAsSystem()).sessionID;

      this.logger.debug(
        `Attempting to extend seat: ${userID} - ${roomNo}/${seatNo}`,
      );

      const response = await this.httpClient.post(
        '/contSeat.do',
        `userID=${userID}&roomNo=${roomNo}&seatNo=${seatNo}`,
        {
          headers: {
            Cookie: `JSESSIONID=${currentSessionID}`,
          },
        },
      );

      this.logger.debug(`Extend seat response status: ${response.status}`);
      this.logger.debug(
        `Extend seat response data: ${JSON.stringify(response.data)}`,
      );

      // XML 응답인 경우 파싱
      if (response.status === 200 && typeof response.data === 'string') {
        const xmlResult = this.parseExtendSeatXml(response.data);
        return xmlResult;
      }

      // JSON 응답인 경우 (기존 로직)
      const isSuccess =
        response.status === 200 && response.data?.success !== false;
      return { success: isSuccess };
    } catch (error: any) {
      this.logger.error(`Extend seat error: ${error.message}`);
      return { success: false, message: '좌석 연장 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 좌석 연장 XML 응답 파싱
   */
  private parseExtendSeatXml(xmlData: string): {
    success: boolean;
    message?: string;
  } {
    try {
      this.logger.debug(`Parsing extend seat XML: ${xmlData}`);

      // CDATA 섹션에서 값 추출하는 정규식
      const extractCDATA = (tagName: string): string => {
        const regex = new RegExp(
          `<${tagName}>\\s*<!\\[CDATA\\[([^\\]]+)\\]\\]>\\s*</${tagName}>`,
          'i',
        );
        const match = xmlData.match(regex);
        return match ? match[1].trim() : '';
      };

      const resultCode = extractCDATA('resultCode');
      const resultMsg = extractCDATA('resultMsg');

      this.logger.debug(
        `Extend seat result - code: ${resultCode}, message: ${resultMsg}`,
      );

      // resultCode가 '0'이면 성공, '1'이면 실패
      if (resultCode === '0') {
        return {
          success: true,
          message: resultMsg || '좌석이 성공적으로 연장되었습니다.',
        };
      } else {
        return {
          success: false,
          message: resultMsg || '좌석 연장에 실패했습니다.',
        };
      }
    } catch (error) {
      this.logger.error(
        `Failed to parse extend seat XML: ${this.getErrorMessage(error)}`,
      );
      return { success: false, message: '응답 처리 중 오류가 발생했습니다.' };
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
        const data = response.data;

        // 응답 데이터 디버깅 로그 추가
        this.logger.debug(
          `getMySeat response for ${userID}: ${JSON.stringify(data)}`,
        );

        // XML 형식 응답인지 확인
        if (typeof data === 'string') {
          // XML 파싱 사용
          return this.parseMySeatXml(data);
        } else {
          // JSON 형식 응답 처리 (기존 로직)
          if (data.item && data.item.library) {
            const library = data.item.library;

            // 라이브러리 섹션 디버깅 로그 추가
            this.logger.debug(`Library data: ${JSON.stringify(library)}`);

            // libDataEmpty가 'N'이면 데이터가 있음
            if (
              library.libDataEmpty === 'N' &&
              library.roomNo &&
              library.seatNo
            ) {
              const seatInfo = {
                roomNo: library.roomNo,
                seatNo: library.seatNo,
                startTime: library.startTm || '',
                endTime: library.endTm || '',
                remainingTime: library.remTm || '',
              };

              this.logger.debug(
                `Parsed seat info: ${JSON.stringify(seatInfo)}`,
              );
              return seatInfo;
            } else {
              this.logger.debug(
                `Seat data validation failed - libDataEmpty: ${library.libDataEmpty}, roomNo: ${library.roomNo}, seatNo: ${library.seatNo}`,
              );
            }
          } else {
            this.logger.debug('No library section found in response data');
          }
        }
      }

      return null;
    } catch (error: any) {
      this.logger.error(`Get my seat error: ${error.message}`);
      return null;
    }
  }

  /**
   * 내 좌석 정보 XML 파싱
   */
  private parseMySeatXml(xmlData: string): MySeatInfo | null {
    try {
      this.logger.debug(`Raw XML data for parsing: ${xmlData}`);

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
      this.logger.debug(`ResultCode: ${resultCode}`);

      if (resultCode !== '0') {
        this.logger.warn(`My seat request failed with code: ${resultCode}`);
        return null;
      }

      // library 섹션 찾기
      const libraryMatch = xmlData.match(/<library>([\s\S]*?)<\/library>/i);
      if (!libraryMatch) {
        this.logger.debug('No library section found in XML');
        return null;
      }

      const libraryXml = libraryMatch[1];
      this.logger.debug(`Library XML section: ${libraryXml}`);

      // library 섹션 내에서 값 추출
      const extractFromLibrary = (tagName: string): string => {
        const regex = new RegExp(
          `<${tagName}>\\s*<!\\[CDATA\\[([^\\]]+)\\]\\]>\\s*</${tagName}>`,
          'i',
        );
        const match = libraryXml.match(regex);
        return match ? match[1].trim() : '';
      };

      const libDataEmpty = extractFromLibrary('libDataEmpty');

      this.logger.debug(`libDataEmpty value: ${libDataEmpty}`);

      if (libDataEmpty === 'N') {
        const roomNo = extractFromLibrary('roomNo');
        const seatNo = extractFromLibrary('seatNo');
        const startTm = extractFromLibrary('startTm');
        const endTm = extractFromLibrary('endTm');

        const remTm = extractFromLibrary('remTm');

        this.logger.debug(
          `Extracted values - roomNo: ${roomNo}, seatNo: ${seatNo}, startTm: ${startTm}, endTm: ${endTm}, remTm: ${remTm}`,
        );

        if (roomNo && seatNo) {
          const seatInfo = {
            roomNo: roomNo,
            seatNo: seatNo,
            startTime: startTm || '',
            endTime: endTm || '',
            remainingTime: remTm || '',
          };

          this.logger.debug(
            `Successfully parsed seat info from XML: ${JSON.stringify(seatInfo)}`,
          );
          return seatInfo;
        } else {
          this.logger.debug(
            `Missing seat data - roomNo: ${roomNo}, seatNo: ${seatNo}`,
          );
        }
      } else {
        this.logger.debug(
          `No seat data available - libDataEmpty: ${libDataEmpty}`,
        );
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Failed to parse my seat XML: ${this.getErrorMessage(error)}`,
      );
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
        `/seatMap.do?roomNo=${roomNo}&searchGB=S&campGB=(null)&deviceGB=I`,
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
   * 특정 방의 정보 조회 (HTML에서 추출)
   */
  async getRoomInfo(
    roomNo: string,
    sessionID?: string,
  ): Promise<{ roomNo: string; roomName: string } | null> {
    try {
      const headers: any = {};
      if (sessionID) {
        headers.Cookie = `JSESSIONID=${sessionID}`;
      }

      const response: AxiosResponse = await this.httpClient.get(
        `/seatMap.do?roomNo=${roomNo}&searchGB=S&campGB=(null)&deviceGB=I`,
        {
          headers,
        },
      );

      if (response.status === 200 && response.data) {
        const html = response.data as string;

        // 방 번호와 방 이름 추출
        const roomNoMatch = html.match(/roomNo\s*=\s*"(\d+)";/);
        const roomNameMatch = html.match(/roomName\s*=\s*"([^"]+)";/);

        const extractedRoomNo = roomNoMatch ? roomNoMatch[1] : roomNo;
        const roomName = roomNameMatch ? roomNameMatch[1] : `열람실 ${roomNo}`;

        return {
          roomNo: extractedRoomNo,
          roomName: roomName,
        };
      }

      return null;
    } catch (error: any) {
      this.logger.error(`Get room info error: ${error.message}`);
      return null;
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

    // 고장난/사용불가 좌석 배열 추출 (seatFix 변수)
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

    // 방 번호와 방 이름 추출
    const roomNoMatch = html.match(/roomNo\s*=\s*"(\d+)";/);
    const roomNameMatch = html.match(/roomName\s*=\s*"([^"]+)";/);

    const roomNo = roomNoMatch ? roomNoMatch[1] : '';
    const roomName = roomNameMatch ? roomNameMatch[1] : '';

    this.logger.debug(`Parsing seats for room: ${roomNo} (${roomName})`);

    // td 태그에서 좌석 정보 추출 (id가 숫자인 것들)
    $('td[id]').each((_index, element) => {
      const $seat = $(element);
      const seatId = $seat.attr('id');
      const className = $seat.attr('class');

      // id가 숫자인 경우만 좌석으로 간주
      if (seatId && /^\d+$/.test(seatId) && className === 'desk') {
        const seatNo = seatId;
        let status: 'OCCUPIED' | 'AVAILABLE' | 'UNAVAILABLE' = 'AVAILABLE';

        if (unavailableSeatNumbers.has(seatNo)) {
          status = 'UNAVAILABLE';
        } else if (occupiedSeatNumbers.has(seatNo)) {
          status = 'OCCUPIED';
        }

        seats.push({ seatNo, status });
      }
    });

    // 좌석 번호로 정렬
    seats.sort((a, b) => parseInt(a.seatNo) - parseInt(b.seatNo));

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
   * 열람실 현황 조회
   */
  async getRoomStatus(): Promise<RoomInfo[]> {
    try {
      const response = await this.httpClient.post(
        '/seatStatusListNew.do',
        'libGB=S',
      );

      this.logger.log(`Room status response status: ${response.status}`);
      this.logger.log(
        `Room status response data: ${JSON.stringify(response.data)}`,
      );

      if (response.status === 200 && response.data) {
        return this.parseRoomStatusXml(response.data as string);
      }

      return [];
    } catch (error: any) {
      this.logger.error(`Get room status error: ${error.message}`);
      return [];
    }
  }

  /**
   * 열람실 현황 XML 파싱
   */
  private parseRoomStatusXml(xmlData: string): RoomInfo[] {
    try {
      const rooms: RoomInfo[] = [];

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
        this.logger.warn(`Room status request failed with code: ${resultCode}`);
        return [];
      }

      // 모든 item 태그 추출
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match: RegExpExecArray | null;

      while ((match = itemRegex.exec(xmlData)) !== null) {
        const itemXml = match[1];

        // 각 item에서 필드 추출
        const extractFromItem = (tagName: string): string => {
          const regex = new RegExp(
            `<${tagName}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tagName}>`,
            'i',
          );
          const match = itemXml.match(regex);
          return match ? match[1].trim() : '';
        };

        const room: RoomInfo = {
          roomNo: extractFromItem('roomNo'),
          roomName: extractFromItem('roomName'),
          useYN: extractFromItem('useYN'),
          timeStart: extractFromItem('timeStart'),
          timeEnd: extractFromItem('timeEnd'),
          totalSeat: parseInt(extractFromItem('totalSeat')) || 0,
          useSeat: parseInt(extractFromItem('useSeat')) || 0,
          remainSeat: parseInt(extractFromItem('remainSeat')) || 0,
          useRate: parseInt(extractFromItem('useRate')) || 0,
        };

        rooms.push(room);
      }

      this.logger.debug(`Parsed ${rooms.length} rooms from XML`);
      return rooms;
    } catch (error) {
      this.logger.error(
        `Failed to parse room status XML: ${this.getErrorMessage(error)}`,
      );
      return [];
    }
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

  /**
   * 방 번호에 따른 배경 이미지 URL 반환
   */
  getBackgroundImageUrl(roomNo: string): string {
    const backgroundMap: Record<string, string> = {
      // 1층
      '1': '/PUSAN_MOBILE/images/1f_reading_zone.jpg', // READING-ZONE-1F
      '2': '/PUSAN_MOBILE/images/1f_dvd_zone.jpg', // DVD-ZONE-1F

      // 2층
      '3': '/PUSAN_MOBILE/images/2f_reading_A.jpg', // READING-A-2F
      '4': '/PUSAN_MOBILE/images/2f_reading_B.jpg', // READING-B-2F
      '5': '/PUSAN_MOBILE/images/2f_notebook_reading.jpg', // NOTEBOOK-READING-2F
      '29': '/PUSAN_MOBILE/images/2F_dawn_A.jpg', // DAWN-A-2F
      '30': '/PUSAN_MOBILE/images/2F_dawn_B.jpg', // DAWN-B-2F

      // 3층
      '6': '/PUSAN_MOBILE/images/3f_2_reading_A.jpg', // READING2-A-3F
      '7': '/PUSAN_MOBILE/images/3f_2_reading_B.jpg', // READING2-B-3F
      '8': '/PUSAN_MOBILE/images/3f_2_reading_C.jpg', // READING2-C-3F
      '9': '/PUSAN_MOBILE/images/3f_2_reading_D.jpg', // READING2-D-3F

      // 4층
      '10': '/PUSAN_MOBILE/images/4f_3_reading_A.jpg', // READING3-A-4F
      '11': '/PUSAN_MOBILE/images/4f_3_reading_B.jpg', // READING3-B-4F
      '12': '/PUSAN_MOBILE/images/4f_3_reading_C.jpg', // READING3-C-4F
      '13': '/PUSAN_MOBILE/images/4f_3_reading_D.jpg', // READING3-D-4F
      '14': '/PUSAN_MOBILE/images/4f_2_notebook_A.jpg', // NOTEBOOK2-A-4F
      '15': '/PUSAN_MOBILE/images/4f_2_notebook_B.jpg', // NOTEBOOK2-B-4F
      '16': '/PUSAN_MOBILE/images/4f_carel.jpg', // CARREL-4F
    };

    return backgroundMap[roomNo] || '/PUSAN_MOBILE/images/1f_reading_zone.jpg';
  }
}
