import { toPng } from 'html-to-image';

/**
 * HTML 요소를 인스타그램 스토리 사이즈(1080x1920) 이미지로 변환
 */
export async function generateStoryImage(
  element: HTMLElement
): Promise<Blob> {
  // 폰트 로딩 완료 대기
  await document.fonts.ready;

  const dataUrl = await toPng(element, {
    width: 1080,
    height: 1920,
    pixelRatio: 1,
    cacheBust: true,
    style: {
      // html-to-image용 스타일 오버라이드
    },
  });

  // dataURL을 Blob으로 변환
  const response = await fetch(dataUrl);
  return response.blob();
}
