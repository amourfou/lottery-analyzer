// PensionLottery.json 데이터 파싱 함수들

export interface LotteryData {
  order: number;
  numbers: number[];
  combinedNumber: number;
}

/**
 * PensionLottery.json의 원시 데이터를 파싱하여 분석 가능한 형태로 변환
 * @param rawData - JSON 파일의 원시 데이터
 * @returns 파싱된 복권 데이터 배열
 */
export function parseLotteryData(rawData: number[][]): LotteryData[] {
  return rawData.map((row, index) => {
    // 0번째: 순서, 1번째: 무시, 2~7번째: 숫자들
    const order = row[0];
    const numbers = row.slice(2, 8); // 2,3,4,5,6,7번째 인덱스
    
    // 6자리 숫자로 조합 (0~999999 범위)
    const combinedNumber = parseInt(numbers.join(''));
    
    return {
      order,
      numbers,
      combinedNumber
    };
  });
}

/**
 * 파싱된 데이터에서 숫자들만 추출
 * @param lotteryData - 파싱된 복권 데이터
 * @returns 숫자 배열
 */
export function extractNumbers(lotteryData: LotteryData[]): number[] {
  return lotteryData.map(data => data.combinedNumber);
}

/**
 * 데이터 통계 정보 계산
 * @param lotteryData - 파싱된 복권 데이터
 * @returns 통계 정보
 */
export function getDataStatistics(lotteryData: LotteryData[]) {
  const numbers = extractNumbers(lotteryData);
  const totalCount = numbers.length;
  const minNumber = Math.min(...numbers);
  const maxNumber = Math.max(...numbers);
  const avgNumber = numbers.reduce((sum, num) => sum + num, 0) / totalCount;
  
  // 자릿수별 분포
  const digitDistribution: Record<string, number> = {};
  numbers.forEach(num => {
    const digits = num.toString().split('');
    digits.forEach(digit => {
      digitDistribution[digit] = (digitDistribution[digit] || 0) + 1;
    });
  });
  
  // 짝수/홀수 분포
  const evenCount = numbers.filter(num => num % 2 === 0).length;
  const oddCount = totalCount - evenCount;
  
  return {
    totalCount,
    minNumber,
    maxNumber,
    avgNumber,
    digitDistribution,
    evenCount,
    oddCount,
    evenOddRatio: evenCount / oddCount
  };
}

/**
 * 최근 N개 데이터 추출
 * @param lotteryData - 파싱된 복권 데이터
 * @param count - 추출할 개수
 * @returns 최근 N개 데이터
 */
export function getRecentData(lotteryData: LotteryData[], count: number = 10): LotteryData[] {
  return lotteryData.slice(0, count); // order가 높은 순으로 정렬되어 있으므로 앞에서부터
}

/**
 * 특정 범위의 데이터 추출
 * @param lotteryData - 파싱된 복권 데이터
 * @param startOrder - 시작 순서
 * @param endOrder - 끝 순서
 * @returns 범위 내 데이터
 */
export function getDataByRange(lotteryData: LotteryData[], startOrder: number, endOrder: number): LotteryData[] {
  return lotteryData.filter(data => data.order >= startOrder && data.order <= endOrder);
}
