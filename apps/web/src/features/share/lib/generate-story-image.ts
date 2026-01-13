import { toPng } from 'html-to-image';

/**
 * HTML 요소를 인스타그램 스토리 사이즈(1080x1920) 이미지로 변환
 */
export async function generateStoryImage(
  element: HTMLElement
): Promise<Blob> {
  // 폰트 로딩 완료 대기
  await document.fonts.ready;

  // Pretendard 폰트가 실제로 로드됐는지 확인
  const fontLoaded = document.fonts.check('16px "Pretendard Variable"');
  if (!fontLoaded) {
    // 폰트 로드 시도
    try {
      await document.fonts.load('16px "Pretendard Variable"');
    } catch {
      // 폰트 로드 실패해도 계속 진행
    }
  }

  const dataUrl = await toPng(element, {
    width: 1080,
    height: 1920,
    pixelRatio: 1,
    cacheBust: true,
    skipFonts: false,
  });

  // dataURL을 Blob으로 변환
  const response = await fetch(dataUrl);
  return response.blob();
}
