import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as CryptoJS from 'crypto-js';
import { LoginResult, UserInfoFromAPI } from '@pnu-blace/types';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseURL = 'https://place.pusan.ac.kr/PUSAN_MOBILE';

  constructor(private configService: ConfigService) {
    this.httpClient = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'PNUPlace/2 CFNetwork/3860.200.71 Darwin/2',
        Accept: 'application/json, text/plain, */*',
      },
    });

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

  async login(studentId: string, password: string): Promise<LoginResult> {
    try {
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

      const userKeyXml = userKeyResponse.data as string;
      const userKey = this.parseUserKeyXml(userKeyXml);
      if (!userKey) {
        throw new UnauthorizedException('유저 키 획득 실패');
      }

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

      this.logger.debug(
        `Login response: ${JSON.stringify(loginResponse.data)}`,
      );

      if (loginResponse.status === 200 && loginResponse.data) {
        const xmlData = loginResponse.data as string;
        const loginResult = this.parseLoginXml(xmlData);

        if (loginResult.success) {
          return {
            success: true,
            userID: studentId,
            sessionID: jsessionId,
          };
        } else {
          return {
            success: false,
            errorMessage:
              loginResult.errorMessage ||
              '학번 또는 비밀번호가 올바르지 않습니다.',
          };
        }
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

  async loginAsSystem(): Promise<LoginResult> {
    const systemUserId = this.configService.get<string>('SYSTEM_STUDENT_ID');
    const systemPassword = this.configService.get<string>('SYSTEM_PASSWORD');

    if (!systemUserId || !systemPassword) {
      throw new Error('시스템 계정 정보가 설정되지 않았습니다.');
    }

    return this.login(systemUserId, systemPassword);
  }

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

  private extractJSessionId(cookies: string[]): string | null {
    for (const cookie of cookies) {
      const match = cookie.match(/JSESSIONID=([^;]+)/);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  private encryptPassword(password: string, userKey: string): string {
    try {
      const key = CryptoJS.enc.Utf8.parse(userKey);
      const iv = CryptoJS.enc.Hex.parse('0'.repeat(32));

      const encrypted = CryptoJS.AES.encrypt(password, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const base64EncryptedPassword = encrypted.toString();
      const urlEncodedPassword = encodeURIComponent(base64EncryptedPassword);

      this.logger.debug(
        `Password encrypted successfully`,
        `base64EncryptedPassword: ${base64EncryptedPassword}`,
        `urlEncodedPassword: ${urlEncodedPassword}`,
      );
      return urlEncodedPassword;
    } catch (error: any) {
      this.logger.error(`Password encryption failed: ${error.message}`);
      throw new Error('비밀번호 암호화에 실패했습니다.');
    }
  }

  private parseUserKeyXml(xmlData: string): string {
    try {
      this.logger.debug(`Parsing user key XML: ${xmlData}`);

      const extractCDATA = (tagName: string): string => {
        const regex = new RegExp(
          `<${tagName}>\\s*<!\\[CDATA\\[([^\\]]+)\\]\\]>\\s*</${tagName}>`,
          'i',
        );
        const match = xmlData.match(regex);
        return match ? match[1].trim() : '';
      };

      const resultCode = extractCDATA('resultCode');
      const secKey = extractCDATA('secKey');

      this.logger.debug(
        `UserKey result - code: ${resultCode}, secKey: ${secKey}`,
      );

      if (resultCode === '0' && secKey) {
        return secKey;
      } else {
        throw new Error(`Invalid response code: ${resultCode}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to parse user key XML: ${this.getErrorMessage(error)}`,
      );
      throw error;
    }
  }

  private parseLoginXml(xmlData: string): {
    success: boolean;
    errorMessage?: string;
  } {
    try {
      this.logger.debug(`Parsing login XML: ${xmlData}`);

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
        `Login result - code: ${resultCode}, message: ${resultMsg}`,
      );

      if (resultCode === '0') {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          errorMessage: resultMsg || '로그인에 실패했습니다.',
        };
      }
    } catch (error) {
      this.logger.error(
        `Failed to parse login XML: ${this.getErrorMessage(error)}`,
      );
      return {
        success: false,
        errorMessage: '응답 처리 중 오류가 발생했습니다.',
      };
    }
  }

  private parseUserInfoXml(xmlData: string): UserInfoFromAPI | null {
    try {
      const extractCDATA = (tagName: string): string => {
        const regex = new RegExp(
          `<${tagName}>\\s*<!\\[CDATA\\[([^\\]]+)\\]\\]>\\s*</${tagName}>`,
          'i',
        );
        const match = xmlData.match(regex);
        return match ? match[1].trim() : '';
      };

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

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
