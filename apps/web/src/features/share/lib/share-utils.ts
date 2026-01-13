/**
 * 인스타그램 스토리 공유 유틸리티
 */

/**
 * Web Share API를 사용하여 이미지 공유
 */
export async function shareImage(blob: Blob): Promise<boolean> {
  // Web Share API 지원 확인
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], 'pnu-blace-story.png', { type: 'image/png' });

    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'PNU Blace 공부 기록',
          text: '오늘도 열심히 공부했어요! #PNUBlace #부산대도서관',
        });
        return true;
      } catch (error) {
        // 사용자가 공유를 취소한 경우
        if ((error as Error).name === 'AbortError') {
          return false;
        }
        throw error;
      }
    }
  }
  return false;
}

/**
 * 이미지 다운로드
 */
export function downloadImage(blob: Blob, filename?: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `pnu-blace-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Web Share API 지원 여부 확인
 */
export function canShareFiles(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (!navigator.share || !navigator.canShare) return false;
  
  // 테스트용 빈 파일로 확인
  const testFile = new File([''], 'test.png', { type: 'image/png' });
  return navigator.canShare({ files: [testFile] });
}
