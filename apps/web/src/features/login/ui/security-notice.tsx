"use client";
import React, { useState } from "react";

export const SecurityNotice: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* 간단한 보안 안내 + 자세히 보기 링크 */}
      <div className="mt-8 text-center">
        <p className="text-slate-600 text-sm">
          비밀번호는 부산대 공식 서버로만 전송됩니다.{" "}
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
          >
            자세히 보기
          </button>
        </p>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          {/* 배경 오버레이 */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* 모달 컨텐츠 */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-slate-900 font-bold text-lg">보안 정책</h2>
                  <p className="text-slate-500 text-xs">PNU Blace 개인정보 보호</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 본문 */}
            <div className="px-6 py-5 space-y-6">
              {/* 핵심 메시지 */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-emerald-800 text-sm leading-relaxed">
                  입력하신 비밀번호는 <span className="font-bold">부산대학교 공식 인증 서버</span>로 직접 전송됩니다.
                  PNU Blace는 비밀번호를 저장하거나 열람하지 않습니다.
                </p>
              </div>

              {/* 보안 체크리스트 */}
              <div>
                <h3 className="text-slate-900 font-semibold text-sm mb-3">보안 체크리스트</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-slate-800 text-sm font-medium">비밀번호 서버 미저장</p>
                      <p className="text-slate-500 text-xs mt-0.5">비밀번호는 어떤 형태로도 저장되지 않습니다</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-slate-800 text-sm font-medium">부산대 공식 API 연동</p>
                      <p className="text-slate-500 text-xs mt-0.5">place.pusan.ac.kr을 통해 인증합니다</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-slate-800 text-sm font-medium">HTTPS 암호화 통신</p>
                      <p className="text-slate-500 text-xs mt-0.5">모든 데이터는 256-bit SSL로 암호화됩니다</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 인증 방식 */}
              <div>
                <h3 className="text-slate-900 font-semibold text-sm mb-2">인증 방식</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  부산대학교 도서관 공식 API를 통해 인증합니다. 로그인 시 비밀번호는 부산대 서버로 직접 전송되며,
                  PNU Blace는 인증 결과(세션 토큰)만 전달받아 서비스를 제공합니다.
                </p>
              </div>

              {/* 저장 정보 */}
              <div>
                <h3 className="text-slate-900 font-semibold text-sm mb-2">저장되는 정보</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  학번, 이름, 학과 정보만 저장됩니다. 이 정보는 부산대 서버에서 제공하는 공개 정보입니다.
                </p>
                <p className="text-red-600 text-sm font-medium mt-2">
                  비밀번호는 어떤 형태로도 저장되지 않습니다.
                </p>
              </div>

              {/* 참고사항 */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    <span className="font-semibold">참고:</span> 본 서비스는 부산대학교 공식 서비스가 아닌 학생 개발 프로젝트입니다.
                    도서관 좌석 시스템의 편의성 향상을 위해 제작되었습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 푸터 */}
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
