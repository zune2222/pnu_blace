import { Injectable } from '@nestjs/common';
import {
  UserInfoFromAPI,
  LoginResult,
  SeatInfo,
  MySeatInfo,
  RoomInfo,
} from '@pnu-blace/types';
import { AuthenticationService } from './authentication.service';
import { SeatOperationService } from './seat-operation.service';
import { SeatQueryService } from './seat-query.service';

@Injectable()
export class SchoolApiService {
  constructor(
    private authService: AuthenticationService,
    private seatOperationService: SeatOperationService,
    private seatQueryService: SeatQueryService,
  ) {}

  async login(studentId: string, password: string): Promise<LoginResult> {
    return this.authService.login(studentId, password);
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
    return this.seatOperationService.reserveSeat(
      userID,
      sessionID,
      roomNo,
      seatNo,
    );
  }

  async returnSeat(
    userID: string,
    sessionID: string | null,
    roomNo: string,
    seatNo: string,
  ): Promise<{ success: boolean; message?: string }> {
    return this.seatOperationService.returnSeat(
      userID,
      sessionID,
      roomNo,
      seatNo,
    );
  }

  async extendSeat(
    userID: string,
    sessionID: string | null,
    roomNo: string,
    seatNo: string,
  ): Promise<{ success: boolean; message?: string }> {
    return this.seatOperationService.extendSeat(
      userID,
      sessionID,
      roomNo,
      seatNo,
    );
  }

  async getMySeat(
    userID: string,
    sessionID: string,
  ): Promise<MySeatInfo | null> {
    return this.seatQueryService.getMySeat(userID, sessionID);
  }

  async getSeatMap(roomNo: string, sessionID?: string): Promise<SeatInfo[]> {
    return this.seatQueryService.getSeatMap(roomNo, sessionID);
  }

  async getRoomInfo(
    roomNo: string,
    sessionID?: string,
  ): Promise<{ roomNo: string; roomName: string } | null> {
    return this.seatQueryService.getRoomInfo(roomNo, sessionID);
  }

  async getRoomStatus(): Promise<RoomInfo[]> {
    return this.seatQueryService.getRoomStatus();
  }

  async getMySeatHistory(userID: string, sessionID: string) {
    return this.seatQueryService.getMySeatHistory(userID, sessionID);
  }

  async getUserInfo(sessionID: string): Promise<UserInfoFromAPI | null> {
    return this.authService.getUserInfo(sessionID);
  }

  async loginAsSystem() {
    return this.authService.loginAsSystem();
  }

  getBackgroundImageUrl(roomNo: string): string {
    return this.seatQueryService.getBackgroundImageUrl(roomNo);
  }
}
