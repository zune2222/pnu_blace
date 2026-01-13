import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { SeatInfo, MySeatInfo, RoomInfo } from '@pnu-blace/types';

@Injectable()
export class SeatQueryService {
  private readonly logger = new Logger(SeatQueryService.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseURL = 'https://place.pusan.ac.kr/PUSAN_MOBILE';

  constructor() {
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

        this.logger.debug(
          `getMySeat response for ${userID}: ${JSON.stringify(data)}`,
        );

        if (typeof data === 'string') {
          return this.parseMySeatXml(data);
        } else {
          if (data.item && data.item.library) {
            const library = data.item.library;

            this.logger.debug(`Library data: ${JSON.stringify(library)}`);

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

  async getRoomStatus(): Promise<RoomInfo[]> {
    try {
      const response = await this.httpClient.post(
        '/seatStatusListNew.do',
        'libGB=S',
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

  async getMySeatHistory(userID: string, sessionID: string) {
    try {
      this.logger.debug(`Getting seat history for user: ${userID}`);

      let allRecords: any[] = [];
      let currentPage = 1;
      let totalCount = 0;
      const rowsPerPage = 100;

      do {
        this.logger.debug(`Fetching page ${currentPage} for user: ${userID}`);

        const response = await this.httpClient.post(
          '/mySeatHist.do',
          `rows=${rowsPerPage}&userID=${userID}&roomGB=R&page=${currentPage}`,
          {
            headers: {
              Cookie: `JSESSIONID=${sessionID}`,
            },
          },
        );

        if (response.status === 200 && response.data) {
          const xmlData = response.data as string;
          const pageData = this.parseSeatHistoryXml(xmlData);

          if (currentPage === 1) {
            totalCount = this.extractTotalCount(xmlData);
            this.logger.debug(`Total records available: ${totalCount}`);
          }

          if (pageData.records) {
            allRecords = allRecords.concat(pageData.records);
          }

          if (
            pageData.records.length < rowsPerPage ||
            allRecords.length >= totalCount
          ) {
            break;
          }

          currentPage++;
        } else {
          break;
        }
      } while (currentPage <= 50);

      this.logger.debug(
        `Fetched total ${allRecords.length} records for user: ${userID}`,
      );
      return allRecords;
    } catch (error: any) {
      this.logger.error(`Get seat history error: ${error.message}`);
      return [];
    }
  }

  getBackgroundImageUrl(roomNo: string): string {
    const backgroundMap: Record<string, string> = {
      '1': '/PUSAN_MOBILE/images/1f_reading_zone.jpg',
      '2': '/PUSAN_MOBILE/images/1f_dvd_zone.jpg',
      '3': '/PUSAN_MOBILE/images/2f_reading_A.jpg',
      '4': '/PUSAN_MOBILE/images/2f_reading_B.jpg',
      '5': '/PUSAN_MOBILE/images/2f_notebook_reading.jpg',
      '29': '/PUSAN_MOBILE/images/2F_dawn_A.jpg',
      '30': '/PUSAN_MOBILE/images/2F_dawn_B.jpg',
      '6': '/PUSAN_MOBILE/images/3f_2_reading_A.jpg',
      '7': '/PUSAN_MOBILE/images/3f_2_reading_B.jpg',
      '8': '/PUSAN_MOBILE/images/3f_2_reading_C.jpg',
      '9': '/PUSAN_MOBILE/images/3f_2_reading_D.jpg',
      '10': '/PUSAN_MOBILE/images/4f_3_reading_A.jpg',
      '11': '/PUSAN_MOBILE/images/4f_3_reading_B.jpg',
      '12': '/PUSAN_MOBILE/images/4f_3_reading_C.jpg',
      '13': '/PUSAN_MOBILE/images/4f_3_reading_D.jpg',
      '14': '/PUSAN_MOBILE/images/4f_2_notebook_A.jpg',
      '15': '/PUSAN_MOBILE/images/4f_2_notebook_B.jpg',
      '16': '/PUSAN_MOBILE/images/4f_carel.jpg',
    };

    return backgroundMap[roomNo] || '/PUSAN_MOBILE/images/1f_reading_zone.jpg';
  }

  private parseMySeatXml(xmlData: string): MySeatInfo | null {
    try {
      this.logger.debug(`Raw XML data for parsing: ${xmlData}`);

      const extractCDATA = (tagName: string): string => {
        const regex = new RegExp(
          `<${tagName}>\\s*<!\\[CDATA\\[([^\\]]+)\\]\\]>\\s*</${tagName}>`,
          'i',
        );
        const match = xmlData.match(regex);
        return match ? match[1].trim() : '';
      };

      const resultCode = extractCDATA('resultCode');
      this.logger.debug(`ResultCode: ${resultCode}`);

      if (resultCode !== '0') {
        this.logger.warn(`My seat request failed with code: ${resultCode}`);
        return null;
      }

      const libraryMatch = xmlData.match(/<library>([\s\S]*?)<\/library>/i);
      if (!libraryMatch) {
        this.logger.debug('No library section found in XML');
        return null;
      }

      const libraryXml = libraryMatch[1];
      this.logger.debug(`Library XML section: ${libraryXml}`);

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

  private parseSeatMapHtml(html: string): SeatInfo[] {
    const $ = cheerio.load(html);
    const seats: SeatInfo[] = [];

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

    const seatFixMatch = html.match(/seatFix\s*=\s*"([^"]+)";/);
    const unavailableSeatNumbers = new Set<string>();

    if (seatFixMatch) {
      const seatFixStr = seatFixMatch[1];
      if (seatFixStr && seatFixStr !== '') {
        const fixedSeats = seatFixStr.split(',');
        fixedSeats.forEach((seat) => {
          seat = seat.trim();
          if (seat.includes('-')) {
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

    const roomNoMatch = html.match(/roomNo\s*=\s*"(\d+)";/);
    const roomNameMatch = html.match(/roomName\s*=\s*"([^"]+)";/);

    const roomNo = roomNoMatch ? roomNoMatch[1] : '';
    const roomName = roomNameMatch ? roomNameMatch[1] : '';

    this.logger.debug(`Parsing seats for room: ${roomNo} (${roomName})`);

    $('td[id]').each((_index, element) => {
      const $seat = $(element);
      const seatId = $seat.attr('id');
      const className = $seat.attr('class');

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

  private parseRoomStatusXml(xmlData: string): RoomInfo[] {
    try {
      const rooms: RoomInfo[] = [];

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
        this.logger.warn(`Room status request failed with code: ${resultCode}`);
        return [];
      }

      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match: RegExpExecArray | null;

      while ((match = itemRegex.exec(xmlData)) !== null) {
        const itemXml = match[1];

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

  private parseSeatHistoryXml(xmlData: string) {
    try {
      this.logger.debug(
        `Parsing seat history XML: ${xmlData.substring(0, 200)}...`,
      );

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
        this.logger.warn(
          `Seat history request failed with code: ${resultCode}`,
        );
        return { records: [], totalCount: 0 };
      }

      const seatHistory: any[] = [];

      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match: RegExpExecArray | null;

      while ((match = itemRegex.exec(xmlData)) !== null) {
        const itemXml = match[1];

        const extractFromItem = (tagName: string): string => {
          const regex = new RegExp(
            `<${tagName}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tagName}>`,
            'i',
          );
          const match = itemXml.match(regex);
          return match ? match[1].trim() : '';
        };

        const seatRecord = {
          useDt: extractFromItem('useDt'),
          roomNo: extractFromItem('roomNo'),
          roomNm: extractFromItem('roomNm'),
          seatNo: extractFromItem('seatNo'),
          startTm: extractFromItem('startTm'),
          endTm: extractFromItem('endTm'),
          sRoomStat: extractFromItem('sRoomStat'),
          sRoomStatNm: extractFromItem('sRoomStatNm'),
          sRoomMainChkj: extractFromItem('sRoomMainChkj'),
          sRoomRerveNoj: extractFromItem('sRoomRerveNoj'),
        };

        if (seatRecord.useDt && seatRecord.roomNm) {
          seatHistory.push(seatRecord);
        }
      }

      const totalCount = this.extractTotalCount(xmlData);

      this.logger.debug(
        `Parsed ${seatHistory.length} seat history records from page`,
      );
      return { records: seatHistory, totalCount };
    } catch (error) {
      this.logger.error(
        `Failed to parse seat history XML: ${this.getErrorMessage(error)}`,
      );
      return { records: [], totalCount: 0 };
    }
  }

  private extractTotalCount(xmlData: string): number {
    try {
      const extractCDATA = (tagName: string): string => {
        const regex = new RegExp(
          `<${tagName}>\\s*<!\\[CDATA\\[([^\\]]+)\\]\\]>\\s*</${tagName}>`,
          'i',
        );
        const match = xmlData.match(regex);
        return match ? match[1].trim() : '';
      };

      const totCnt = extractCDATA('totCnt');
      return parseInt(totCnt) || 0;
    } catch (error) {
      this.logger.warn(
        `Failed to extract total count: ${this.getErrorMessage(error)}`,
      );
      return 0;
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
