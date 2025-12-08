import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class SeatOperationService {
  private readonly logger = new Logger(SeatOperationService.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseURL = 'https://place.pusan.ac.kr/PUSAN_MOBILE';

  constructor(private authService: AuthenticationService) {
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
        sessionID || (await this.authService.loginAsSystem()).sessionID;

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

      if (response.status === 200 && typeof response.data === 'string') {
        const xmlResult = this.parseReserveSeatXml(response.data);
        return xmlResult;
      }

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

  async returnSeat(
    userID: string,
    sessionID: string | null,
    roomNo: string,
    seatNo: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const currentSessionID =
        sessionID || (await this.authService.loginAsSystem()).sessionID;

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

      if (response.status === 200 && typeof response.data === 'string') {
        const xmlResult = this.parseReturnSeatXml(response.data);
        return xmlResult;
      }

      const isSuccess =
        response.status === 200 && response.data?.success !== false;
      return { success: isSuccess };
    } catch (error: any) {
      this.logger.error(`Return seat error: ${error.message}`);
      return { success: false, message: '좌석 반납 중 오류가 발생했습니다.' };
    }
  }

  async extendSeat(
    userID: string,
    sessionID: string | null,
    roomNo: string,
    seatNo: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const currentSessionID =
        sessionID || (await this.authService.loginAsSystem()).sessionID;

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

      if (response.status === 200 && typeof response.data === 'string') {
        const xmlResult = this.parseExtendSeatXml(response.data);
        return xmlResult;
      }

      const isSuccess =
        response.status === 200 && response.data?.success !== false;
      return { success: isSuccess };
    } catch (error: any) {
      this.logger.error(`Extend seat error: ${error.message}`);
      return { success: false, message: '좌석 연장 중 오류가 발생했습니다.' };
    }
  }

  private parseReserveSeatXml(xmlData: string): {
    success: boolean;
    message?: string;
    requiresGateEntry?: boolean;
  } {
    try {
      this.logger.debug(`Parsing reserve seat XML: ${xmlData}`);

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

      if (resultCode === '0') {
        const message = resultMsg || '좌석이 성공적으로 발권되었습니다.';

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

  private parseReturnSeatXml(xmlData: string): {
    success: boolean;
    message?: string;
  } {
    try {
      this.logger.debug(`Parsing return seat XML: ${xmlData}`);

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

  private parseExtendSeatXml(xmlData: string): {
    success: boolean;
    message?: string;
  } {
    try {
      this.logger.debug(`Parsing extend seat XML: ${xmlData}`);

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

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
