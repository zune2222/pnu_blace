import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SeatRendererService {
  private readonly logger = new Logger(SeatRendererService.name);

  /**
   * 원본 PNU HTML을 가져와서 좌석 버튼을 교체
   */
  async getSeatMapHtml(roomNo: string, sessionID: string): Promise<string> {
    try {
      const response = await fetch(
        `https://place.pusan.ac.kr/PUSAN_MOBILE/seatMap.do?roomNo=${roomNo}&searchGB=S&campGB=(null)&deviceGB=I`,
        {
          headers: {
            Cookie: `JSESSIONID=${sessionID}`,
            'User-Agent':
              'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            Connection: 'keep-alive',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let html = await response.text();

      const originalCSS = this.getCustomCSS();
      html = html.replace('</head>', `${originalCSS}</head>`);

      const clickEventScript = this.getClickEventScript();
      html = html.replace('</body>', `${clickEventScript}</body>`);

      return html;
    } catch (error) {
      this.logger.error('Error fetching seat map HTML:', error);
      throw error;
    }
  }

  private getCustomCSS(): string {
    return `
        <style>
          @font-face {
            font-family: NanumGothic;
            src: url(../images/NanumGothic.eot);
            src: url('../images/NanumGothic.ttf') format('truetype');
          }

          /* default definition */
          body {
            margin: 0;
            padding: 0;
            background-color: #fff;
            letter-spacing: 0px;
            color: #333333;
            line-height: 1.3em;
            font-size: 12px !important;
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          }

          a {
            color: #000000;
            text-decoration: none;
          }

          /* 좌석 배경 박스 스타일 */
          .desk {
            position: relative;
            background: rgba(34, 197, 94, 0.2) !important;
            border: 2px solid rgba(34, 197, 94, 0.6) !important;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          /* 사용중인 좌석 배경 */
          .desk_over {
            background: rgba(239, 68, 68, 0.25) !important;
            border: 2px solid rgba(239, 68, 68, 0.7) !important;
            box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
          }

          /* 고정석 배경 */
          .desk_unused {
            background: rgba(156, 163, 175, 0.25) !important;
            border: 2px solid rgba(156, 163, 175, 0.7) !important;
            box-shadow: 0 2px 4px rgba(156, 163, 175, 0.2);
          }

          /* 지정석 배경 */
          .desk_reserved {
            background: rgba(59, 130, 246, 0.25) !important;
            border: 2px solid rgba(59, 130, 246, 0.7) !important;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
          }

          /* 90도 좌석들도 동일하게 적용 */
          .deskL,
          .deskR,
          .deskT {
            position: relative;
            background: rgba(34, 197, 94, 0.2) !important;
            border: 2px solid rgba(34, 197, 94, 0.6) !important;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .deskL_over,
          .deskR_over,
          .deskT_over {
            background: rgba(239, 68, 68, 0.25) !important;
            border: 2px solid rgba(239, 68, 68, 0.7) !important;
            box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
          }

          .deskL_unused,
          .deskR_unused,
          .deskT_unused {
            background: rgba(156, 163, 175, 0.25) !important;
            border: 2px solid rgba(156, 163, 175, 0.7) !important;
            box-shadow: 0 2px 4px rgba(156, 163, 175, 0.2);
          }

          .deskL_reserved,
          .deskR_reserved,
          .deskT_reserved {
            background: rgba(59, 130, 246, 0.25) !important;
            border: 2px solid rgba(59, 130, 246, 0.7) !important;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
          }

          /* 작은 좌석들도 적용 */
          .sdesk {
            position: relative;
            background: rgba(34, 197, 94, 0.2) !important;
            border: 2px solid rgba(34, 197, 94, 0.6) !important;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .sdesk_over {
            background: rgba(239, 68, 68, 0.25) !important;
            border: 2px solid rgba(239, 68, 68, 0.7) !important;
            box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
          }

          .sdesk_unused {
            background: rgba(156, 163, 175, 0.25) !important;
            border: 2px solid rgba(156, 163, 175, 0.7) !important;
            box-shadow: 0 2px 4px rgba(156, 163, 175, 0.2);
          }

          ul, ol, li, dl, dt, dd {
            margin: 0px;
            padding: 0px;
            list-style: none;
            line-height: inherit;
          }

          img, fieldset {
            border: none;
          }

          /**************************************** layout ********************************************/
          #READING-ZONE-1F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/1f_reading_zone.jpg) no-repeat;
          }

          #DVD-ZONE-1F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/1f_dvd_zone.jpg) no-repeat;
          }

          #READING-A-2F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/2f_reading_A.jpg) no-repeat;
          }

          #READING-B-2F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/2f_reading_B.jpg) no-repeat;
          }

          #NOTEBOOK-READING-2F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/2f_notebook_reading.jpg) no-repeat;
          }

          #CARREL-2F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/2f_carrel.jpg) no-repeat;
          }

          #READING2-A-3F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/3f_2_reading_A.jpg) no-repeat;
          }

          #READING2-B-3F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/3f_2_reading_B.jpg) no-repeat;
          }

          #READING2-C-3F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/3f_2_reading_C.jpg) no-repeat;
          }

          #READING2-D-3F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/3f_2_reading_D.jpg) no-repeat;
          }

          #READING3-A-4F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/4f_3_reading_A.jpg) no-repeat;
          }

          #READING3-B-4F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/4f_3_reading_B.jpg) no-repeat;
          }

          #READING3-C-4F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/4f_3_reading_C.jpg) no-repeat;
          }

          #READING3-D-4F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/4f_3_reading_D.jpg) no-repeat;
          }

          #NOTEBOOK2-A-4F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/4f_2_notebook_A.jpg) no-repeat;
          }

          #NOTEBOOK2-B-4F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/4f_2_notebook_B.jpg) no-repeat;
          }

          #CARREL-4F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/4f_carel.jpg) no-repeat;
          }

          #READING-NAMU-3F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/3f_namu_reading.jpg) no-repeat;
          }

          #READING2-MIRINAE-2F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/2f_milyang_2_reading.jpg) no-repeat;
          }

          #iCOMMONS-1F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/1F_icommons.jpg) no-repeat;
          }

          #BandiSpace-1F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/1F_bandiSpace.png) no-repeat;
          }

          #GROUP1-2F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/2F_group1.jpg) no-repeat;
          }

          #GROUP2-2F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/2F_group2.jpg) no-repeat;
          }

          #GROUP3-2F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/2F_group3.jpg) no-repeat;
          }

          #GROUP4-2F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/2F_group4.jpg) no-repeat;
          }

          #GROUP5-2F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/2F_group5.jpg) no-repeat;
          }

          #GROUP6-2F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/2F_group6.jpg) no-repeat;
          }

          #GROUP7-2F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/2F_group7.jpg) no-repeat;
          }

          #SEMINAR-2F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/2F_seminar.jpg) no-repeat;
          }

          #MIRMARU-1F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1553px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/MIRMARU_1F.jpg) no-repeat;
          }

          #ACADEMEIA-4F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1451px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/4F_academeia.jpg) no-repeat;
          }

          #CARREL-A-4F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1451px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/4F_carrel_A.jpg) no-repeat;
          }

          #CARREL-B-4F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1451px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/4F_carrel_B.jpg) no-repeat;
          }

          #locker1 {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1677px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/locker_1.jpg) no-repeat;
          }

          #CENTER-A {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/center-A.png) no-repeat;
          }

          #CENTER-B {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/center-B.png) no-repeat;
          }

          #CENTER-C {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/center-C.png) no-repeat;
          }

          #CENTER-D {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/center-D.png) no-repeat;
          }

          #CENTER-E {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/center-E.png) no-repeat;
          }

          #READING-1 {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/reading-1.jpg) no-repeat;
          }

          #READING-2 {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/reading-2.jpg) no-repeat;
          }

          #READING-3 {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/reading-3.jpg) no-repeat;
          }

          #READING-4 {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/reading-4.jpg) no-repeat;
          }

          #READING-5 {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/reading-5.jpg) no-repeat;
          }

          #NOTEBOOK-1 {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/notebook-1.jpg) no-repeat;
          }

          #NOTEBOOK-2 {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/notebook-2.jpg) no-repeat;
          }

          #CARREL {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/carrel.jpg) no-repeat;
          }

          #MIRAE-NOTE {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/mirae-note.png) no-repeat;
          }

          #MIRAE-1 {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/mirae-1.png) no-repeat;
          }

          #DAWN-A-2F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/2F_dawn_A.jpg) no-repeat;
          }

          #DAWN-B-2F {
            margin: 0 auto;
            text-align: left;
            padding: 0;
            width: 1080px;
            height: 1920px;
            background: url(https://place.pusan.ac.kr/PUSAN_MOBILE/images/2F_dawn_B.jpg) no-repeat;
          }

          .font_align {
            margin-top: 5px;
            text-align: middle;
          }

          .sfont_align {
            margin-top: 11px;
            margin-bottom: 7px;
            text-align: middle;
          }

          .font_align_t {
            margin-top: 15px;
            text-align: bottom;
            display: text-bottom;
          }

          /*180도-사용가능*/
          .desk {
            background: none !important;
            width: 30px;
            height: 39px;
            line-height: 12px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
          }

          .sdesk {
            background: none !important;
            width: 30px;
            height: 30px;
            line-height: 12px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
          }

          /*180도-사용불가*/
          .desk_unused {
            background: none !important;
            width: 30px;
            height: 30px;
            line-height: 12px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
          }

          .sdesk_unused {
            background: none !important;
            width: 30px;
            height: 30px;
            line-height: 12px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
          }

          /*180도-사용중*/
          .desk_over {
            background: none !important;
            width: 30px;
            height: 39px;
            line-height: 12px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            color: #000
          }

          .sdesk_over {
            background: none !important;
            width: 30px;
            height: 30px;
            line-height: 12px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            color: #000
          }

          /*180도-사용중*/
          .desk_over_over {
            background: none !important;
            width: 30px;
            height: 39px;
            line-height: 12px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            color: #000
          }

          /*180도-사용중*/
          .desk_over_over_over {
            background: none !important;
            width: 30px;
            height: 39px;
            line-height: 12px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            color: #000
          }

          /*180도-지정석*/
          .desk_reserved {
            background: none !important;
            width: 30px;
            height: 39px;
            line-height: 12px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            color: #000
          }

          /*왼쪽90도-사용가능*/
          .deskL {
            background: url(../images/deskL.png) no-repeat top;
            width: 39px;
            height: 29px;
            overflow: hidden;
            line-height: 15px;
            letter-spacing: -0.3pt;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            padding-left: 6px;
            text-align: center;
            color: #000;
          }

          /*왼쪽90도-사용중*/
          .deskL_over {
            background: url(../images/deskL_over.png) no-repeat top;
            width: 39px;
            height: 29px;
            line-height: 15px;
            letter-spacing: -0.3pt;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            padding-left: 6px;
            text-align: center;
            color: #000
          }

          /*왼쪽90도-지정석*/
          .deskL_unused {
            background: url(../images/deskL_unused.png) no-repeat top;
            width: 39px;
            height: 29px;
            line-height: 15px;
            letter-spacing: -0.3pt;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            padding-left: 6px;
            text-align: center;
            color: #000
          }

          /*왼쪽90도-지정석*/
          .deskL_reserved {
            background: url(../images/deskL_reserved.png) no-repeat top;
            width: 39px;
            height: 29px;
            line-height: 15px;
            letter-spacing: -0.3pt;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            padding-left: 6px;
            text-align: center;
            color: #000
          }

          /*오른쪽90도-사용가능*/
          .deskR {
            background: url(../images/deskR.png) no-repeat top;
            width: 39px;
            height: 29px;
            line-height: 15px;
            font-family: gulim;
            font-size: 12px;
            padding-right: 8px;
            font-weight: bold;
            text-align: CENTER;
            color: #000
          }

          /*오른쪽90도-사용중*/
          .deskR_over {
            background: url(../images/deskR_over.png) no-repeat top;
            width: 39px;
            height: 29px;
            line-height: 15px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            padding-right: 8px;
            text-align: CENTER;
            color: #000
          }

          /*오른쪽90도-지정석*/
          .deskR_reserved {
            background: url(../images/deskR_reserved.png) no-repeat top;
            width: 39px;
            height: 29px;
            line-height: 15px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            padding-right: 6px;
            text-align: CENTER;
            color: #000
          }

          /*오른쪽90도-사용불가*/
          .deskR_unused {
            background: url(../images/deskR_unused.png) no-repeat top;
            width: 39px;
            height: 29px;
            line-height: 15px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            padding-right: 6px;
            text-align: CENTER;
            color: #000
          }

          /*0도 책상-사용가능*/
          .deskT {
            background: url(../images/deskT.png) no-repeat bottom;
            width: 30px;
            height: 39px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            vertical-align: bottom;
            line-height: 5px;
            color: #000
          }

          /*0도 책상-사용중*/
          .deskT_over {
            background: url(../images/deskT_over.png) no-repeat bottom;
            width: 30px;
            height: 39px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            vertical-align: bottom;
            line-height: 5px;
            color: #000
          }

          /*0도 책상-지정석*/
          .deskT_reserved {
            background: url(../images/deskT_reserved.png) no-repeat bottom;
            width: 30px;
            height: 39px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            vertical-align: bottom;
            line-height: 5px;
            color: #000
          }

          /*0도 책상-사용불가*/
          .deskT_unused {
            background: url(../images/deskT_unused.png) no-repeat top;
            width: 30px;
            height: 39px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            vertical-align: bottom;
            line-height: 5px;
            color: #000
          }

          .locker {
            background: url(../images/locker.png) no-repeat top;
            width: 30px;
            height: 28px;
            line-height: 24px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
          }

          /*180도-사용중*/
          .locker_over {
            background: url(../images/locker_over.png) no-repeat top;
            width: 30px;
            height: 28px;
            line-height: 24px;
            font-family: gulim;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            color: #000
          }

          .none {
            width: 35px;
            height: 36px;
          }

          .status {
            font-size: 12px;
            font-weight: bold;
            color: #FFF;
          }

          #info1 {
            height: 26px;
            font-weight: 12px;
            text-align: right;
            padding-left: 520px;
            color: #fff;
            font-weight: bold;
            padding-top: 8px;
          }

          #info2 {
            height: 26px;
            font-weight: 12px;
            text-align: right;
            padding-left: 710px;
            color: #fff;
            font-weight: bold;
            padding-top: 8px;
          }

          #info3 {
            height: 26px;
            font-weight: 12px;
            text-align: left;
            padding-left: 340px;
            color: #fff;
            font-weight: bold;
            padding-top: 8px;
          }

          #info4 {
            height: 26px;
            font-weight: 12px;
            text-align: right;
            padding-left: 620px;
            color: #fff;
            font-weight: bold;
            padding-top: 8px;
          }

          #info5 {
            height: 26px;
            font-weight: 12px;
            text-align: right;
            padding-left: 400px;
            color: #fff;
            font-weight: bold;
            padding-top: 8px;
          }

          #info6 {
            height: 26px;
            font-weight: 12px;
            text-align: left;
            padding-left: 300px;
            color: #fff;
            font-weight: bold;
            padding-top: 8px;
          }

          #info7 {
            height: 26px;
            font-weight: 12px;
            text-align: left;
            padding-left: 600px;
            color: #fff;
            font-weight: bold;
            padding-top: 8px;
          }

          #info8 {
            height: 26px;
            font-weight: 12px;
            text-align: left;
            padding-left: 170px;
            color: #fff;
            font-weight: bold;
            padding-top: 8px;
          }

          #info9 {
            height: 26px;
            font-weight: 12px;
            text-align: left;
            padding-left: 210px;
            color: #fff;
            font-weight: bold;
            padding-top: 8px;
          }

          #info10 {
            height: 26px;
            font-weight: 12px;
            text-align: left;
            padding-left: 240px;
            color: #fff;
            font-weight: bold;
            padding-top: 8px;
          }

          #info11 {
            height: 26px;
            font-weight: 12px;
            text-align: left;
            padding-left: 400px;
            color: #fff;
            font-weight: bold;
            padding-top: 8px;
          }

        </style>
      `;
  }

  private getClickEventScript(): string {
    return `
        <script>
          function sendSeatClick(seatNo) {
            if (window.parent && window.parent !== window) {
              window.parent.postMessage({
                type: 'SEAT_CLICK',
                seatNo: seatNo
              }, '*');
            }
          }

          document.addEventListener('DOMContentLoaded', function() {
            const seatButtons = document.querySelectorAll('.desk, .deskL, .deskR, .deskT, .sdesk');
            seatButtons.forEach(function(button) {
              const seatNo = button.textContent.trim();
              if (seatNo && !isNaN(seatNo)) {
                button.addEventListener('click', function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  sendSeatClick(seatNo);
                });
              }
            });
          });
        </script>
      `;
  }
}