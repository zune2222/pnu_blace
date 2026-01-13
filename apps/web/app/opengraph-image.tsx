import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'PNU Blace - 부산대학교 도서관을 더욱 편리하게';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          position: 'relative',
        }}
      >
        {/* 배경 그라디언트 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 50%, #F0F9FF 100%)',
          }}
        />

        {/* 장식 요소 - 좌상단 */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 40,
            width: 60,
            height: 60,
            borderLeft: '2px solid #E2E8F0',
            borderTop: '2px solid #E2E8F0',
          }}
        />

        {/* 장식 요소 - 우하단 */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 40,
            width: 60,
            height: 60,
            borderRight: '2px solid #E2E8F0',
            borderBottom: '2px solid #E2E8F0',
          }}
        />

        {/* 메인 콘텐츠 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            position: 'relative',
          }}
        >
          {/* 로고/브랜드명 */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: '#1a1a1a',
              letterSpacing: '-2px',
            }}
          >
            PNU Blace
          </div>

          {/* 태그라인 */}
          <div
            style={{
              fontSize: 24,
              fontWeight: 300,
              color: '#64748B',
              letterSpacing: '4px',
            }}
          >
            Bridge + Place
          </div>

          {/* 구분선 */}
          <div
            style={{
              width: 80,
              height: 2,
              backgroundColor: '#0055A8',
              marginTop: 16,
              marginBottom: 16,
            }}
          />

          {/* 설명 */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: '#475569',
            }}
          >
            부산대학교 도서관을 더욱 편리하게
          </div>

          {/* 기능 태그들 */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 24,
            }}
          >
            {['실시간 좌석', '공부 기록', '랭킹'].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#F1F5F9',
                  borderRadius: 100,
                  fontSize: 18,
                  fontWeight: 500,
                  color: '#0055A8',
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
