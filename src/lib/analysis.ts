import { NumberAnalysis } from '@/types';

// 소수 판별 함수
function isPrime(num: number): boolean {
  if (num < 2) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;
  
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

// 숫자의 각 자릿수 추출
function getDigits(num: number): number[] {
  return num.toString().split('').map(Number);
}

// 통계 계산
function calculateStatistics(numbers: number[]) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const n = numbers.length;
  
  const mean = numbers.reduce((sum, num) => sum + num, 0) / n;
  const median = n % 2 === 0 
    ? (sorted[n/2 - 1] + sorted[n/2]) / 2 
    : sorted[Math.floor(n/2)];
  
  // 최빈값 계산
  const frequency: Record<number, number> = {};
  numbers.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
  });
  const mode = Object.keys(frequency).reduce((a, b) => 
    frequency[Number(a)] > frequency[Number(b)] ? a : b
  );
  
  const range = Math.max(...numbers) - Math.min(...numbers);
  const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / n;
  const standardDeviation = Math.sqrt(variance);
  
  // 평균 ± 표준편차 × 1.5 범위를 벗어나는 숫자 분석
  const lowerBound = mean - (standardDeviation * 1.5);
  const upperBound = mean + (standardDeviation * 1.5);
  let outOfRangeCount = 0;
  let aboveUpperBoundCount = 0;
  let belowLowerBoundCount = 0;
  
  // 각 숫자를 체크하여 범위 밖인지 확인
  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    if (typeof num !== 'number' || isNaN(num)) {
      continue; // 유효하지 않은 숫자는 건너뛰기
    }
    
    if (num < lowerBound) {
      belowLowerBoundCount++;
      outOfRangeCount++;
    } else if (num > upperBound) {
      aboveUpperBoundCount++;
      outOfRangeCount++;
    }
  }
  
  const outOfRangeRatio = outOfRangeCount / n;
  const aboveUpperBoundRatio = aboveUpperBoundCount / n;
  const belowLowerBoundRatio = belowLowerBoundCount / n;
  
  return { 
    mean, 
    median, 
    mode: Number(mode), 
    range, 
    standardDeviation,
    outOfRangeCount,
    outOfRangeRatio,
    aboveUpperBoundCount,
    aboveUpperBoundRatio,
    belowLowerBoundCount,
    belowLowerBoundRatio,
    lowerBound,
    upperBound
  };
}

// 분포 분석
function analyzeDistribution(numbers: number[]) {
  const digitFrequency: Record<string, number> = {};
  let evenCount = 0;
  let primeCount = 0;
  
  numbers.forEach(num => {
    // 자릿수 빈도 계산
    const digits = getDigits(num);
    digits.forEach(digit => {
      digitFrequency[digit.toString()] = (digitFrequency[digit.toString()] || 0) + 1;
    });
    
    // 짝수/홀수 비율
    if (num % 2 === 0) evenCount++;
    
    // 소수 개수
    if (isPrime(num)) primeCount++;
  });
  
  const evenOddRatio = evenCount / (numbers.length - evenCount);
  
  return { digitFrequency, evenOddRatio, primeCount };
}

// 패턴 분석
function analyzePatterns(numbers: number[]) {
  let consecutiveDigits = 0;
  let repeatedDigits = 0;
  let ascendingSequence = 0;
  let descendingSequence = 0;
  
  numbers.forEach(num => {
    const digits = getDigits(num);
    
    // 연속된 자릿수 체크
    for (let i = 0; i < digits.length - 1; i++) {
      if (Math.abs(digits[i] - digits[i + 1]) === 1) {
        consecutiveDigits++;
      }
    }
    
    // 반복된 자릿수 체크
    const uniqueDigits = new Set(digits);
    if (uniqueDigits.size < digits.length) {
      repeatedDigits++;
    }
    
    // 오름차순/내림차순 체크
    let isAscending = true;
    let isDescending = true;
    for (let i = 0; i < digits.length - 1; i++) {
      if (digits[i] >= digits[i + 1]) isAscending = false;
      if (digits[i] <= digits[i + 1]) isDescending = false;
    }
    if (isAscending) ascendingSequence++;
    if (isDescending) descendingSequence++;
  });
  
  return {
    consecutiveDigits,
    repeatedDigits,
    ascendingSequence: ascendingSequence > 0,
    descendingSequence: descendingSequence > 0
  };
}

// 예측 알고리즘
function predictNext(numbers: number[]): { nextNumber: number; confidence: number; trend: 'increasing' | 'decreasing' | 'stable' } {
  if (numbers.length < 2) {
    return { nextNumber: Math.floor(Math.random() * 1000000), confidence: 0.1, trend: 'stable' };
  }
  
  // 최근 10개 숫자의 평균 변화율 계산
  const recentNumbers = numbers.slice(-10);
  const changes: number[] = [];
  
  for (let i = 1; i < recentNumbers.length; i++) {
    changes.push(recentNumbers[i] - recentNumbers[i - 1]);
  }
  
  const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
  const lastNumber = numbers[numbers.length - 1];
  
  // 트렌드 결정
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (avgChange > 1000) trend = 'increasing';
  else if (avgChange < -1000) trend = 'decreasing';
  
  // 다음 숫자 예측 (평균 변화율 기반)
  let nextNumber = lastNumber + avgChange;
  
  // 범위 제한
  nextNumber = Math.max(0, Math.min(999999, Math.round(nextNumber)));
  
  // 신뢰도 계산 (변화율의 일관성 기반)
  const variance = changes.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / changes.length;
  const confidence = Math.max(0.1, Math.min(0.9, 1 - (variance / 1000000)));
  
  return { nextNumber, confidence, trend };
}

export function analyzeNumbers(inputNumbers: number[]): NumberAnalysis {
  const statistics = calculateStatistics(inputNumbers);
  const distribution = analyzeDistribution(inputNumbers);
  const patterns = analyzePatterns(inputNumbers);
  const predictions = predictNext(inputNumbers);
  
  return {
    input: inputNumbers[inputNumbers.length - 1] || 0,
    statistics,
    distribution,
    patterns,
    predictions
  };
}
