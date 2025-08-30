export const formatQueueStatus = (status: string) => {
  switch (status) {
    case "WAITING":
      return "대기 중";
    case "PROCESSING":
      return "처리 중";
    case "COMPLETED":
      return "완료";
    case "FAILED":
      return "실패";
    case "CANCELED":
      return "취소됨";
    default:
      return status;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "WAITING":
      return "text-blue-600 bg-blue-50 dark:bg-blue-950/50";
    case "PROCESSING":
      return "text-orange-600 bg-orange-50 dark:bg-orange-950/50";
    case "COMPLETED":
      return "text-green-600 bg-green-50 dark:bg-green-950/50";
    case "FAILED":
      return "text-red-600 bg-red-50 dark:bg-red-950/50";
    case "CANCELED":
      return "text-gray-600 bg-gray-50 dark:bg-gray-950/50";
    default:
      return "text-gray-600 bg-gray-50 dark:bg-gray-950/50";
  }
};

export const getRoomName = (roomNo: string): string => {
  const roomNames: Record<string, string> = {
    '2': '1미디어존',
    '1': '1f열람zone',
    '5': '2f 1노트북열람실',
    '3': '2f 1열람실-A',
    '4': '2f 1열람실-B',
    '29': '새벽별당-A',
    '30': '새벽별당-B',
    '8': '3f열람실a',
    '9': '3f열람실b',
    '10': '3f열람실c',
    '11': '3f열람실d',
    '15': '4f 2노트북a',
    '16': '4f 2노트북b',
    '12': '4f 3열람실-A',
    '13': '4f 3열람실-B',
    '14': '4f 3열람실-C',
    '17': '4f 3열람실-D (대학원생)',
  };

  return roomNames[roomNo] || `열람실 ${roomNo}`;
};