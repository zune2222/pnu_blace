import React from "react";

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">이용약관</h1>
            <p className="text-muted-foreground">
              PNU Blace 서비스 이용에 관한 약관입니다.
            </p>
            <p className="text-sm text-muted-foreground">
              최종 업데이트: 2025년 1월 1일
            </p>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                제1조 (목적)
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed break-keep">
                  이 약관은 PNU Blace(이하 &quot;서비스&quot;)가 제공하는 부산대학교
                  도서관 좌석 모니터링 및 자동 예약 서비스의 이용조건 및 절차,
                  회사와 회원의 권리, 의무, 책임사항과 기타 필요한 사항을
                  규정함을 목적으로 합니다.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                제2조 (정의)
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  이 약관에서 사용하는 용어의 정의는 다음과 같습니다:
                </p>
                <ul className="space-y-2 text-muted-foreground break-keep">
                  <li>
                    1. &quot;서비스&quot;란 PNU Blace가 제공하는 부산대학교 도서관 좌석
                    관련 모든 서비스를 의미합니다.
                  </li>
                  <li>
                    2. &quot;회원&quot;이란 서비스에 접속하여 이 약관에 따라 서비스를
                    이용하는 부산대학교 학생을 말합니다.
                  </li>
                  <li>
                    3. &quot;좌석 모니터링&quot;이란 부산대학교 도서관 좌석 현황을
                    실시간으로 확인할 수 있는 서비스를 말합니다.
                  </li>
                  <li>
                    4. &quot;자동 예약&quot;이란 사용자가 설정한 조건에 따라 자동으로
                    좌석을 예약하는 서비스를 말합니다.
                  </li>
                  <li>
                    5. &quot;알림 서비스&quot;란 좌석 현황 변경 등을 사용자에게 알려주는
                    서비스를 말합니다.
                  </li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                제3조 (서비스의 제공 및 변경)
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  1. 서비스는 다음과 같은 업무를 제공합니다:
                </p>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li>• 부산대학교 도서관 좌석 현황 실시간 모니터링</li>
                  <li>• 좌석 자동 예약 서비스</li>
                  <li>• 좌석 현황 변경 알림 서비스</li>
                  <li>• 이용 통계 제공 서비스</li>
                  <li>• 기타 관련 부가 서비스</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed break-keep">
                  2. 서비스는 부산대학교 학사일정 및 도서관 운영시간에 따라
                  제공되며, 시스템 점검 등의 사유로 일시적으로 중단될 수
                  있습니다.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                제4조 (서비스 이용)
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  1. 서비스 이용을 위해서는 부산대학교 포털 계정이 필요합니다.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  2. 회원은 서비스를 선량한 관리자의 주의 의무로 이용해야 하며,
                  다음 행위를 하여서는 안 됩니다:
                </p>
                <ul className="space-y-2 text-muted-foreground break-keep">
                  <li>• 타인의 정보 도용</li>
                  <li>• 서비스의 안정적 운영을 방해하는 행위</li>
                  <li>• 과도한 자동 예약 시도로 인한 시스템 부하 유발</li>
                  <li>• 부산대학교 도서관 이용 규칙 위반</li>
                  <li>• 기타 관련 법령에 위반되는 행위</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                제5조 (개인정보보호)
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed break-keep">
                  서비스는 관련 법령이 정하는 바에 따라 회원의 개인정보를
                  보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는
                  별도의 개인정보처리방침이 적용됩니다.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                제6조 (서비스 이용의 제한)
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  서비스는 다음 각 호의 경우에는 회원의 서비스 이용을 제한할 수
                  있습니다:
                </p>
                <ul className="space-y-2 text-muted-foreground break-keep">
                  <li>1. 이 약관을 위반한 경우</li>
                  <li>2. 부산대학교 도서관 이용 규칙을 위반한 경우</li>
                  <li>3. 서비스의 정상적인 운영을 방해한 경우</li>
                  <li>4. 기타 서비스 이용에 부적절하다고 판단되는 경우</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                제7조 (서비스의 성격 및 운영 방침)
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  1. PNU Blace는 부산대학교 공식 서비스가 아닌 개인이 개발한
                  서비스입니다.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  2. 본 서비스는 부산대학교의 공식적인 허가나 승인을 받지 않은
                  비공식 서비스이며, 부산대학교와는 어떠한 제휴 관계에 있지
                  않습니다.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  3. 서비스 운영 중 부산대학교 측에서 API 사용 중단 요청이나
                  서비스 중단 요청이 있을 경우, 즉시 해당 요청에 응하여 서비스를
                  중단하겠습니다.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  4. 본 서비스는 부산대학교 시스템에 과부하를 주지 않도록 적절한
                  요청 간격을 유지하며, 부산대학교의 정보시스템 운영에 지장을
                  주지 않는 범위 내에서만 운영됩니다.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                제8조 (면책조항)
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  1. 서비스는 부산대학교 공식 시스템이 아닌 개인 개발 서비스로,
                  도서관 좌석 예약 실패 등으로 인한 손해에 대해서는 책임을 지지
                  않습니다.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  2. 서비스는 부산대학교 도서관 시스템의 변경, 장애 등으로 인한
                  서비스 중단에 대해서는 책임을 지지 않습니다.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  3. 회원이 서비스를 이용하여 얻은 정보로 인한 손해에 대해서
                  서비스는 책임을 지지 않습니다.
                </p>
                <p className="text-muted-foreground leading-relaxed break-keep">
                  4. 부산대학교 측의 요청에 따른 서비스 중단으로 인한 손해에
                  대해서는 책임을 지지 않습니다.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                제9조 (분쟁해결)
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed break-keep">
                  이 약관에 관한 분쟁은 대한민국 법률에 따라 해결하며,
                  관할법원은 부산지방법원으로 합니다.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                제10조 (기타)
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  1. 이 약관은 2025년 1월 1일부터 시행됩니다.
                </p>
                <p className="text-muted-foreground leading-relaxed break-keep">
                  2. 약관의 변경이 있는 경우, 서비스 내 공지를 통해 안내합니다.
                </p>
              </div>
            </section>
          </div>

          <div className="border-t border-border pt-8">
            <div className="text-center space-y-4">
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
