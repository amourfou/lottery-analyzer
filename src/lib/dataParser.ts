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

/**
 * PensionLottery.json 파일을 로드하고 파싱하여 분석 가능한 형태로 반환
 * @param url - JSON 파일의 URL (기본값: '/PensionLottery.json')
 * @returns 파싱된 데이터, 숫자 배열, 통계 정보
 */
export async function loadLotteryData(url: string = '/PensionLottery.json') {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const rawData = await response.json();
  const parsedData = parseLotteryData(rawData);
  const numbers = extractNumbers(parsedData);
  const statistics = getDataStatistics(parsedData);
  
  return {
    parsedData,
    numbers,
    statistics
  };
}

/**
 * 중복 숫자 패턴 분석
 * 각 회차의 6개 숫자를 6자리 문자열로 보고 내부 중복 패턴을 분석
 */
export interface DuplicatePatternAnalysisResult {
  // 중복 개수별 분류 (0개 중복, 1개 중복, 2개 중복, ...)
  duplicateCountDistribution: Record<number, number>;
  // 중복 개수별 비율
  duplicateCountRatio: Record<number, number>;
  // 1개만 중복된 경우, 어떤 숫자가 중복되었는지 카운트
  singleDuplicateDigitRanking: Array<{ digit: string; count: number }>;
  // 전체 데이터 개수
  totalCount: number;
}

/**
 * 6자리 숫자 문자열 내에서 중복된 숫자 찾기
 * @param digitString - 6자리 숫자 문자열 (예: "094678")
 * @returns 중복된 숫자 배열 (예: [] 또는 ["9"] 또는 ["0", "9"])
 */
function findDuplicateDigits(digitString: string): string[] {
  const digitCount: Record<string, number> = {};
  const digits = digitString.split('');
  
  // 각 숫자별 카운트
  digits.forEach(digit => {
    digitCount[digit] = (digitCount[digit] || 0) + 1;
  });
  
  // 2번 이상 나타난 숫자만 반환
  return Object.entries(digitCount)
    .filter(([_, count]) => count >= 2)
    .map(([digit, _]) => digit);
}

/**
 * 6자리 숫자 문자열 내에서 최대 등장 횟수 확인
 * @param digitString - 6자리 숫자 문자열
 * @returns 최대 등장 횟수
 */
function getMaxDigitCount(digitString: string): number {
  const digitCount: Record<string, number> = {};
  const digits = digitString.split('');
  
  // 각 숫자별 카운트
  digits.forEach(digit => {
    digitCount[digit] = (digitCount[digit] || 0) + 1;
  });
  
  // 최대 등장 횟수 반환
  return Math.max(...Object.values(digitCount));
}

/**
 * 복권 데이터에서 중복 숫자 패턴 분석
 * @param lotteryData - 파싱된 복권 데이터
 * @returns 중복 패턴 분석 결과
 */
export function analyzeDuplicatePatterns(lotteryData: LotteryData[]): DuplicatePatternAnalysisResult {
  // 중복 개수별 분류
  const duplicateCountDistribution: Record<number, number> = {};
  // 1개만 중복된 경우의 숫자별 카운트
  const singleDuplicateDigitCount: Record<string, number> = {};
  
  lotteryData.forEach(data => {
    // 6자리 숫자 문자열로 변환 (앞에 0 패딩)
    const digitString = data.numbers.map(n => n.toString()).join('').padStart(6, '0');
    
    // 각 숫자별 등장 횟수 계산
    const digitCount: Record<string, number> = {};
    digitString.split('').forEach(digit => {
      digitCount[digit] = (digitCount[digit] || 0) + 1;
    });
    
    // 중복된 숫자 찾기 (2번 이상 나타난 숫자)
    const duplicates = findDuplicateDigits(digitString);
    const duplicateCount = duplicates.length;
    
    // 기타 패턴 판별
    // 조건 1: 중복된 숫자 종류가 3개 이상인 경우 (예: 112233)
    // 조건 2: 중복된 숫자 종류가 2개인데, 둘 다 3번 이상인 경우 (예: 111222, 101019)
    // 조건 3: 1개 중복인데 그 숫자가 3번 이상 나타나는 경우 (예: 222456)
    let isOthers = false;
    if (duplicateCount >= 3) {
      // 3개 이상 종류가 중복 → 기타
      isOthers = true;
    } else if (duplicateCount === 2) {
      // 2개 종류가 중복 → 둘 다 3번 이상인지 확인
      const bothThreeOrMore = duplicates.every(digit => digitCount[digit] >= 3);
      if (bothThreeOrMore) {
        isOthers = true;
      }
    } else if (duplicateCount === 1) {
      // 1개만 중복인 경우, 그 숫자가 정확히 2번만 나타나는지 확인
      const duplicateDigit = duplicates[0];
      if (digitCount[duplicateDigit] >= 3) {
        // 3번 이상 나타나면 기타로 분류 (예: 222456)
        isOthers = true;
      }
    }
    
    if (isOthers) {
      // 기타 패턴으로 분류
      duplicateCountDistribution[-1] = (duplicateCountDistribution[-1] || 0) + 1;
    } else {
      // 일반 중복 개수별 분류
      duplicateCountDistribution[duplicateCount] = (duplicateCountDistribution[duplicateCount] || 0) + 1;
      
      // 1개만 중복된 경우, 어떤 숫자가 중복되었는지 카운트 (정확히 2번만 나타나는 경우만)
      if (duplicateCount === 1) {
        const duplicateDigit = duplicates[0];
        // 이미 위에서 3번 이상인 경우는 걸러졌으므로, 여기서는 정확히 2번인 경우만
        if (digitCount[duplicateDigit] === 2) {
          singleDuplicateDigitCount[duplicateDigit] = (singleDuplicateDigitCount[duplicateDigit] || 0) + 1;
        }
      }
    }
  });
  
  // 중복 개수별 비율 계산
  const totalCount = lotteryData.length;
  const duplicateCountRatio: Record<number, number> = {};
  Object.keys(duplicateCountDistribution).forEach(key => {
    const count = parseInt(key);
    duplicateCountRatio[count] = duplicateCountDistribution[count] / totalCount;
  });
  
  // 1개 중복 숫자별 순위 매기기 (빈도순 정렬)
  const singleDuplicateDigitRanking = Object.entries(singleDuplicateDigitCount)
    .map(([digit, count]) => ({ digit, count }))
    .sort((a, b) => b.count - a.count);
  
  return {
    duplicateCountDistribution,
    duplicateCountRatio,
    singleDuplicateDigitRanking,
    totalCount
  };
}

/**
 * 중복 숫자 배치 패턴 분석 결과 (1개 중복인 경우)
 */
export interface DuplicatePositionPatternAnalysis {
  // 패턴별 분포 (예: "OXOXXX": 10회)
  patternDistribution: Record<string, number>;
  // 패턴별 비율
  patternRatio: Record<string, number>;
  // 패턴별 상세 정보
  patternDetails: Array<{
    pattern: string;
    count: number;
    percentage: number;
    examples: number[]; // 예시 회차 (최대 5개)
  }>;
  totalCount: number;
}

/**
 * 1개 중복 숫자의 배치 패턴 분석
 * @param lotteryData - 파싱된 복권 데이터
 * @returns 중복 숫자 배치 패턴 분석 결과
 */
export function analyzeDuplicatePositionPatterns(lotteryData: LotteryData[]): DuplicatePositionPatternAnalysis {
  const patternDistribution: Record<string, number> = {};
  const patternExamples: Record<string, number[]> = {};
  
  lotteryData.forEach(data => {
    // 6자리 숫자 문자열로 변환
    const digitString = data.numbers.map(n => n.toString()).join('').padStart(6, '0');
    const digits = digitString.split('');
    
    // 각 숫자별 등장 횟수 계산
    const digitCount: Record<string, number> = {};
    digits.forEach(digit => {
      digitCount[digit] = (digitCount[digit] || 0) + 1;
    });
    
    // 중복된 숫자 찾기 (2번 이상 나타난 숫자)
    const duplicates = findDuplicateDigits(digitString);
    
    // 1개만 중복이고, 그 숫자가 정확히 2번만 나타나는 경우에만 분석
    if (duplicates.length === 1) {
      const duplicateDigit = duplicates[0];
      const duplicateCount = digitCount[duplicateDigit];
      
      // 같은 숫자가 정확히 2번만 나타나는 경우만 분석 (3개 이상 제외)
      if (duplicateCount === 2) {
        // 배치 패턴 생성 (O: 중복 숫자 위치, X: 다른 숫자 위치)
        const pattern = digits.map(d => d === duplicateDigit ? 'O' : 'X').join('');
        
        // 패턴별 카운트
        patternDistribution[pattern] = (patternDistribution[pattern] || 0) + 1;
        
        // 패턴별 예시 저장 (최대 5개)
        if (!patternExamples[pattern]) {
          patternExamples[pattern] = [];
        }
        if (patternExamples[pattern].length < 5) {
          patternExamples[pattern].push(data.order);
        }
      }
    }
  });
  
  // 패턴별 비율 계산
  const totalCount = Object.values(patternDistribution).reduce((sum, count) => sum + count, 0);
  const patternRatio: Record<string, number> = {};
  Object.keys(patternDistribution).forEach(pattern => {
    patternRatio[pattern] = patternDistribution[pattern] / totalCount;
  });
  
  // 패턴별 상세 정보 생성 (빈도순 정렬)
  const patternDetails = Object.entries(patternDistribution)
    .map(([pattern, count]) => ({
      pattern,
      count,
      percentage: patternRatio[pattern] * 100,
      examples: patternExamples[pattern] || []
    }))
    .sort((a, b) => b.count - a.count);
  
  return {
    patternDistribution,
    patternRatio,
    patternDetails,
    totalCount
  };
}

/**
 * 각 자리별 숫자 빈도 분석 결과
 */
export interface PositionFrequencyAnalysis {
  position: number; // 1~6번째 자리
  digitFrequency: Record<number, number>; // 각 숫자(0~9)의 빈도
  highestFrequency: {
    digit: number;
    count: number;
    percentage: number;
  };
  lowestFrequency: {
    digit: number;
    count: number;
    percentage: number;
  };
}

/**
 * 각 자리별 숫자 빈도 분석
 * @param lotteryData - 파싱된 복권 데이터
 * @returns 각 자리별 빈도 분석 결과 (6개 자리)
 */
export function analyzePositionFrequency(lotteryData: LotteryData[]): PositionFrequencyAnalysis[] {
  const totalCount = lotteryData.length;
  const positionFrequencies: PositionFrequencyAnalysis[] = [];
  
  // 각 자리(1~6)별로 분석
  for (let position = 0; position < 6; position++) {
    const digitFrequency: Record<number, number> = {};
    
    // 해당 자리의 모든 숫자 카운트
    lotteryData.forEach(data => {
      // numbers 배열의 position번째 인덱스 (0~5)
      const digit = data.numbers[position];
      digitFrequency[digit] = (digitFrequency[digit] || 0) + 1;
    });
    
    // 가장 높은 빈도와 낮은 빈도 찾기
    let maxCount = 0;
    let minCount = Infinity;
    let maxDigit = 0;
    let minDigit = 0;
    
    for (let digit = 0; digit <= 9; digit++) {
      const count = digitFrequency[digit] || 0;
      if (count > maxCount) {
        maxCount = count;
        maxDigit = digit;
      }
      if (count < minCount) {
        minCount = count;
        minDigit = digit;
      }
    }
    
    positionFrequencies.push({
      position: position + 1, // 1~6
      digitFrequency,
      highestFrequency: {
        digit: maxDigit,
        count: maxCount,
        percentage: (maxCount / totalCount) * 100
      },
      lowestFrequency: {
        digit: minDigit,
        count: minCount,
        percentage: (minCount / totalCount) * 100
      }
    });
  }
  
  return positionFrequencies;
}

/**
 * 자릿수 합계 분포 분석 결과
 */
export interface DigitSumAnalysis {
  // 각 합계값별 개수
  sumDistribution: Record<number, number>;
  // 합계별 비율
  sumRatio: Record<number, number>;
  // 통계 정보
  statistics: {
    minSum: number;
    maxSum: number;
    avgSum: number;
    modeSum: number; // 최빈값
    medianSum: number;
  };
  // 전체 데이터 개수
  totalCount: number;
}

/**
 * 자릿수 합계 분포 분석
 * 각 복권 번호의 6자리 숫자를 모두 더한 합계의 분포를 분석
 * @param lotteryData - 파싱된 복권 데이터
 * @returns 자릿수 합계 분포 분석 결과
 */
export function analyzeDigitSum(lotteryData: LotteryData[]): DigitSumAnalysis {
  const totalCount = lotteryData.length;
  const sumDistribution: Record<number, number> = {};
  const sums: number[] = [];
  
  // 각 복권 번호의 자릿수 합계 계산
  lotteryData.forEach(data => {
    const digitSum = data.numbers.reduce((sum, digit) => sum + digit, 0);
    sums.push(digitSum);
    sumDistribution[digitSum] = (sumDistribution[digitSum] || 0) + 1;
  });
  
  // 통계 계산
  const sortedSums = [...sums].sort((a, b) => a - b);
  const minSum = Math.min(...sums);
  const maxSum = Math.max(...sums);
  const avgSum = sums.reduce((sum, val) => sum + val, 0) / totalCount;
  const medianSum = totalCount % 2 === 0
    ? (sortedSums[totalCount / 2 - 1] + sortedSums[totalCount / 2]) / 2
    : sortedSums[Math.floor(totalCount / 2)];
  
  // 최빈값 계산
  let modeSum = minSum;
  let maxCount = 0;
  Object.entries(sumDistribution).forEach(([sum, count]) => {
    if (count > maxCount) {
      maxCount = count;
      modeSum = parseInt(sum);
    }
  });
  
  // 합계별 비율 계산
  const sumRatio: Record<number, number> = {};
  Object.keys(sumDistribution).forEach(key => {
    const sum = parseInt(key);
    sumRatio[sum] = sumDistribution[sum] / totalCount;
  });
  
  return {
    sumDistribution,
    sumRatio,
    statistics: {
      minSum,
      maxSum,
      avgSum,
      modeSum,
      medianSum
    },
    totalCount
  };
}

/**
 * 직전 회차 대비 변화 분석 결과
 */
export interface PreviousRoundComparisonAnalysis {
  // 증가/감소/동일 개수
  increaseCount: number; // 직전보다 큰 경우
  decreaseCount: number; // 직전보다 작은 경우
  sameCount: number; // 직전과 같은 경우
  // 비율
  increaseRatio: number;
  decreaseRatio: number;
  sameRatio: number;
  // 연속 패턴
  maxConsecutiveIncrease: number; // 최대 연속 증가
  maxConsecutiveDecrease: number; // 최대 연속 감소
  // 변화량 통계
  changeStatistics: {
    avgIncrease: number; // 평균 증가량
    avgDecrease: number; // 평균 감소량
    maxIncrease: number; // 최대 증가량
    maxDecrease: number; // 최대 감소량
  };
  totalComparisons: number; // 비교 가능한 회차 수 (첫 회차 제외)
}

/**
 * 직전 회차 대비 변화 분석
 * @param lotteryData - 파싱된 복권 데이터
 * @returns 직전 회차 대비 변화 분석 결과
 */
export function analyzePreviousRoundComparison(lotteryData: LotteryData[]): PreviousRoundComparisonAnalysis {
  if (lotteryData.length < 2) {
    return {
      increaseCount: 0,
      decreaseCount: 0,
      sameCount: 0,
      increaseRatio: 0,
      decreaseRatio: 0,
      sameRatio: 0,
      maxConsecutiveIncrease: 0,
      maxConsecutiveDecrease: 0,
      changeStatistics: {
        avgIncrease: 0,
        avgDecrease: 0,
        maxIncrease: 0,
        maxDecrease: 0
      },
      totalComparisons: 0
    };
  }

  // 회차 순서대로 정렬 (1회차부터)
  const sortedData = [...lotteryData].sort((a, b) => a.order - b.order);
  
  let increaseCount = 0;
  let decreaseCount = 0;
  let sameCount = 0;
  const increases: number[] = [];
  const decreases: number[] = [];
  
  let currentIncreaseStreak = 0;
  let currentDecreaseStreak = 0;
  let maxConsecutiveIncrease = 0;
  let maxConsecutiveDecrease = 0;
  
  for (let i = 1; i < sortedData.length; i++) {
    const currentNumber = sortedData[i].combinedNumber;
    const previousNumber = sortedData[i - 1].combinedNumber;
    const change = currentNumber - previousNumber;
    
    if (change > 0) {
      increaseCount++;
      increases.push(change);
      currentIncreaseStreak++;
      currentDecreaseStreak = 0;
      maxConsecutiveIncrease = Math.max(maxConsecutiveIncrease, currentIncreaseStreak);
    } else if (change < 0) {
      decreaseCount++;
      decreases.push(Math.abs(change));
      currentDecreaseStreak++;
      currentIncreaseStreak = 0;
      maxConsecutiveDecrease = Math.max(maxConsecutiveDecrease, currentDecreaseStreak);
    } else {
      sameCount++;
      currentIncreaseStreak = 0;
      currentDecreaseStreak = 0;
    }
  }
  
  const totalComparisons = sortedData.length - 1;
  const increaseRatio = totalComparisons > 0 ? increaseCount / totalComparisons : 0;
  const decreaseRatio = totalComparisons > 0 ? decreaseCount / totalComparisons : 0;
  const sameRatio = totalComparisons > 0 ? sameCount / totalComparisons : 0;
  
  // 변화량 통계
  const avgIncrease = increases.length > 0 
    ? increases.reduce((sum, val) => sum + val, 0) / increases.length 
    : 0;
  const avgDecrease = decreases.length > 0
    ? decreases.reduce((sum, val) => sum + val, 0) / decreases.length
    : 0;
  const maxIncrease = increases.length > 0 ? Math.max(...increases) : 0;
  const maxDecrease = decreases.length > 0 ? Math.max(...decreases) : 0;
  
  return {
    increaseCount,
    decreaseCount,
    sameCount,
    increaseRatio,
    decreaseRatio,
    sameRatio,
    maxConsecutiveIncrease,
    maxConsecutiveDecrease,
    changeStatistics: {
      avgIncrease,
      avgDecrease,
      maxIncrease,
      maxDecrease
    },
    totalComparisons
  };
}
