import html2canvas from 'html2canvas';

/**
 * HTML 요소를 인스타그램 스토리 사이즈(1080x1920) 이미지로 변환
 */
export async function generateStoryImage(
  element: HTMLElement
): Promise<Blob> {
  const canvas = await html2canvas(element, {
    width: 1080,
    height: 1920,
    scale: 1,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('이미지 생성에 실패했습니다.'));
        }
      },
      'image/png',
      1.0
    );
  });
}
