import React from "react";

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              개인정보보호정책
            </h1>
            <p className="text-muted-foreground">
              PNU Blace는 이용자의 개인정보를 중요하게 생각하며, 관련 법령에
              따라 개인정보를 보호하고 있습니다.
            </p>
            <p className="text-sm text-muted-foreground">
              최종 업데이트: 2025년 1월 1일
            </p>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                1. 서비스의 성격 및 데이터 처리 방침
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  PNU Blace는 부산대학교 공식 서비스가 아닌 개인이 개발한 비공식
                  서비스입니다. 본 서비스는 다음과 같은 원칙을 준수합니다:
                </p>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>
                    • 부산대학교 시스템에 과부하를 주지 않는 적절한 API 호출
                    간격 유지
                  </li>
                  <li>• 사용자의 개인정보는 서비스 제공 목적으로만 사용</li>
                  <li>• 부산대학교 측 요청 시 즉시 데이터 처리 중단 및 삭제</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed break-keep">
                  본 서비스는 부산대학교의 정보시스템 운영에 지장을 주지 않는
                  범위 내에서만 운영되며, 필요시 서비스를 중단할 수 있습니다.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                2. 개인정보의 처리목적
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  PNU Blace는 다음의 목적을 위하여 개인정보를 처리합니다:
                </p>
                <ul className="space-y-2 text-muted-foreground break-keep">
                  <li>• 부산대학교 포털 연동을 통한 사용자 인증</li>
                  <li>• 도서관 좌석 예약 서비스 제공</li>
                  <li>• 좌석 현황 알림 서비스 제공</li>
                  <li>• 서비스 이용 통계 분석 및 개선</li>
                  <li>• 고객 문의 응답 및 서비스 안내</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                3. 처리하는 개인정보의 항목
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  PNU Blace는 다음과 같은 개인정보를 처리합니다:
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      [필수정보]
                    </h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• 부산대학교 학번</li>
                      <li>• 이름</li>
                      <li>• 부산대학교 포털 인증 정보</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      [자동수집정보]
                    </h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• 서비스 이용 기록</li>
                      <li>• 접속 로그</li>
                      <li>• 쿠키, 접속 IP 정보</li>
                      <li>• 좌석 예약 이력</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                4. 개인정보의 처리 및 보유기간
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  PNU Blace는 법령에 따른 개인정보 보유·이용기간 또는
                  정보주체로부터 개인정보를 수집 시에 동의받은 개인정보
                  보유·이용기간 내에서 개인정보를 처리·보유합니다.
                </p>
                <ul className="space-y-2 text-muted-foreground break-keep">
                  <li>• 사용자 계정 정보: 서비스 이용 종료 시까지</li>
                  <li>• 좌석 예약 이력: 수집일로부터 1년</li>
                  <li>• 서비스 이용 로그: 수집일로부터 3개월</li>
                  <li>• 고객 문의 기록: 처리 완료 후 1년</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                5. 개인정보의 제3자 제공
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  PNU Blace는 정보주체의 개인정보를 개인정보의 처리목적에서
                  명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한
                  규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만
                  개인정보를 제3자에게 제공합니다.
                </p>
                <p className="text-muted-foreground leading-relaxed break-keep">
                  현재 PNU Blace는 개인정보를 제3자에게 제공하지 않습니다.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                6. 개인정보처리의 위탁
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed break-keep">
                  현재 PNU Blace는 개인정보 처리업무를 외부에 위탁하지 않습니다.
                  향후 위탁이 필요한 경우 위탁받는 자, 위탁하는 업무의 내용을
                  사전에 공지하겠습니다.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                7. 정보주체의 권리·의무 및 행사방법
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  정보주체는 PNU Blace에 대해 언제든지 다음 각 호의 개인정보
                  보호 관련 권리를 행사할 수 있습니다:
                </p>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>• 개인정보 처리현황 통지요구</li>
                  <li>• 개인정보 열람요구</li>
                  <li>• 개인정보 정정·삭제요구</li>
                  <li>• 개인정보 처리정지요구</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed break-keep">
                  위의 권리 행사는 개인정보보호법 시행령 제41조제1항에 따라
                  서면, 전자우편을 통하여 하실 수 있으며, PNU Blace는 이에 대해
                  지체없이 조치하겠습니다.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                8. 개인정보의 파기
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  PNU Blace는 개인정보 보유기간의 경과, 처리목적 달성 등
                  개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를
                  파기합니다.
                </p>
                <div className="space-y-2">
                  <p className="text-muted-foreground leading-relaxed break-keep">
                    <strong>파기절차:</strong> 보유기간이 경과하거나 처리목적이
                    달성된 개인정보는 별도의 DB로 옮겨져 내부 방침 및 기타 관련
                    법령에 따라 파기됩니다.
                  </p>
                  <p className="text-muted-foreground leading-relaxed break-keep">
                    <strong>파기방법:</strong> 전자적 파일 형태의 정보는 기록을
                    재생할 수 없는 기술적 방법을 사용하여 파기합니다.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                9. 개인정보의 안전성 확보조치
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  PNU Blace는 개인정보보호법 제29조에 따라 다음과 같이 안전성
                  확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다:
                </p>
                <ul className="space-y-2 text-muted-foreground break-keep">
                  <li>• 개인정보 처리 직원의 최소화 및 교육</li>
                  <li>• 개인정보에 대한 접근 제한</li>
                  <li>
                    • 개인정보를 안전하게 저장/전송할 수 있는 암호화 기술 사용
                  </li>
                  <li>
                    • 해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을
                    막기 위한 보안프로그램 설치
                  </li>
                  <li>
                    • 개인정보 처리시스템 접속기록의 보관 및 위조/변조 방지를
                    위한 조치
                  </li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                10. 개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  PNU Blace는 이용자에게 개별적인 맞춤서비스를 제공하기 위해
                  이용정보를 저장하고 수시로 불러오는 &apos;쿠키(cookie)&apos;를
                  사용합니다.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  쿠키는 웹사이트를 운영하는데 이용되는 서버(http)가 이용자의
                  컴퓨터 브라우저에게 보내는 소량의 정보이며 이용자의 PC
                  컴퓨터내의 하드디스크에 저장되기도 합니다.
                </p>
                <ul className="space-y-2 text-muted-foreground break-keep">
                  <li>
                    • 쿠키의 사용목적: 이용자가 방문한 각 서비스와 웹 사이트들에
                    대한 방문 및 이용형태, 인기 검색어, 보안접속 여부 등을
                    파악하여 이용자에게 최적화된 정보 제공을 위해 사용됩니다.
                  </li>
                  <li>
                    • 쿠키의 설치∙운영 및 거부: 웹브라우저 상단의 도구 &gt;
                    인터넷 옵션 &gt; 개인정보 메뉴의 옵션 설정을 통해 쿠키
                    저장을 거부할 수 있습니다.
                  </li>
                  <li>
                    • 쿠키 저장을 거부할 경우 맞춤형 서비스 이용에 어려움이
                    발생할 수 있습니다.
                  </li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                11. 개인정보보호책임자
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  PNU Blace는 개인정보 처리에 관한 업무를 총괄해서 책임지고,
                  개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을
                  위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다:
                </p>
                <div className="bg-secondary rounded-lg p-6">
                  <h4 className="font-semibold text-foreground mb-3">
                    개인정보보호책임자
                  </h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 이메일: zun_e@kakao.com</li>
                    <li>• 담당부서: PNU Blace 개발팀</li>
                  </ul>
                </div>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  정보주체께서는 PNU Blace의 서비스를 이용하시면서 발생한 모든
                  개인정보보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을
                  개인정보보호책임자에게 문의하실 수 있습니다.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                12. 개인정보 처리방침의 변경
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed break-keep">
                  이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에
                  따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의
                  시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                13. 권익침해 구제방법
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  정보주체는 아래의 기관에 대해 개인정보 침해에 대한 신고나
                  상담을 하실 수 있습니다:
                </p>
                <div className="space-y-4">
                  <div className="bg-secondary rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      개인정보보호위원회
                    </h4>
                    <ul className="space-y-1 text-muted-foreground text-sm">
                      <li>• 소관업무: 개인정보보호법 위반신고</li>
                      <li>• 홈페이지: privacy.go.kr</li>
                      <li>• 전화: (국번없이) 182</li>
                      <li>
                        • 주소: (03171) 서울특별시 종로구 세종대로 209
                        정부서울청사 4층
                      </li>
                    </ul>
                  </div>
                  <div className="bg-secondary rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      개인정보 분쟁조정위원회
                    </h4>
                    <ul className="space-y-1 text-muted-foreground text-sm">
                      <li>• 소관업무: 개인정보 분쟁조정신청</li>
                      <li>• 홈페이지: www.kopico.go.kr</li>
                      <li>• 전화: (국번없이) 1833-6972</li>
                      <li>
                        • 주소: (03171) 서울특별시 종로구 세종대로 209
                        정부서울청사 4층
                      </li>
                    </ul>
                  </div>
                  <div className="bg-secondary rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      대검찰청 사이버범죄수사단
                    </h4>
                    <ul className="space-y-1 text-muted-foreground text-sm">
                      <li>• 소관업무: 사이버범죄신고</li>
                      <li>• 홈페이지: www.spo.go.kr</li>
                      <li>• 전화: 02-3480-3573</li>
                    </ul>
                  </div>
                  <div className="bg-secondary rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      경찰청 사이버테러대응센터
                    </h4>
                    <ul className="space-y-1 text-muted-foreground text-sm">
                      <li>• 소관업무: 사이버테러신고</li>
                      <li>• 홈페이지: www.netan.go.kr</li>
                      <li>• 전화: (국번없이) 182</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="border-t border-border pt-8">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                이 개인정보처리방침은 2025년 1월 1일부터 적용됩니다.
              </p>
              <p className="text-muted-foreground">
                문의사항이 있으시면{" "}
                <a
                  href="mailto:zun_e@kakao.com"
                  className="text-blue-600 hover:underline"
                >
                  zun_e@kakao.com
                </a>
                으로 연락해 주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
