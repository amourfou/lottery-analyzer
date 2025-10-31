'use client';

import { useState } from 'react';
import { LotteryData, analyzePositionFrequency, analyzeDigitSum, analyzeDuplicatePatterns, analyzeDuplicatePositionPatterns } from '@/lib/dataParser';
import { Sparkles, RefreshCw, Target } from 'lucide-react';

interface PredictionGeneratorProps {
  lotteryData: LotteryData[];
}

/**
 * 분석 결과를 기반으로 랜덤 숫자 생성
 */
function generatePrediction(lotteryData: LotteryData[]): number[] {
  if (lotteryData.length === 0) {
    // 데이터가 없으면 완전 랜덤
    return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10));
  }

  const positionFreq = analyzePositionFrequency(lotteryData);
  const sumAnalysis = analyzeDigitSum(lotteryData);
  const duplicateAnalysis = analyzeDuplicatePatterns(lotteryData);
  const positionPatternAnalysis = analyzeDuplicatePositionPatterns(lotteryData);

  // 목표 합계 (평균과 최빈값의 중간값 근처)
  const targetSum = Math.round((sumAnalysis.statistics.avgSum + sumAnalysis.statistics.modeSum) / 2);
  
  // 배치 패턴을 고려한 숫자 생성 (50% 확률로 패턴 적용)
  const usePattern = Math.random() < 0.5 && positionPatternAnalysis.patternDetails.length > 0;
  
  let generatedDigits: number[];
  
  if (usePattern) {
    // 배치 패턴 기반 생성
    // 패턴 가중치 기반으로 선택
    const patternWeights = positionPatternAnalysis.patternDetails.map(p => ({
      pattern: p.pattern,
      weight: p.count
    }));
    
    const totalPatternWeight = patternWeights.reduce((sum, p) => sum + p.weight, 0);
    let patternRandom = Math.random() * totalPatternWeight;
    let selectedPattern = patternWeights[0].pattern;
    
    for (const { pattern, weight } of patternWeights) {
      patternRandom -= weight;
      if (patternRandom <= 0) {
        selectedPattern = pattern;
        break;
      }
    }
    
    // 중복될 숫자 선택 (1개 중복 숫자 빈도 순위 기반)
    const singleDuplicateWeights = duplicateAnalysis.singleDuplicateDigitRanking.map(item => ({
      digit: parseInt(item.digit),
      weight: item.count
    }));
    
    const totalDuplicateWeight = singleDuplicateWeights.reduce((sum, d) => sum + d.weight, 0);
    let duplicateRandom = totalDuplicateWeight > 0 ? Math.random() * totalDuplicateWeight : Math.random() * 10;
    let duplicateDigit = 0;
    
    if (singleDuplicateWeights.length > 0) {
      for (const { digit, weight } of singleDuplicateWeights) {
        duplicateRandom -= weight;
        if (duplicateRandom <= 0) {
          duplicateDigit = digit;
          break;
        }
      }
    } else {
      duplicateDigit = Math.floor(Math.random() * 10);
    }
    
    // 패턴에 따라 숫자 배치
    generatedDigits = Array(6).fill(-1);
    const patternChars = selectedPattern.split('');
    
    // 패턴의 O 위치에 중복 숫자 배치
    const oPositions: number[] = [];
    patternChars.forEach((char, index) => {
      if (char === 'O') {
        oPositions.push(index);
        generatedDigits[index] = duplicateDigit;
      }
    });
    
    // X 위치에 각 자리별 빈도를 고려한 숫자 배치
    for (let pos = 0; pos < 6; pos++) {
      if (generatedDigits[pos] === -1) {
        const posData = positionFreq[pos];
        const weights: { digit: number; weight: number }[] = [];
        
        // 중복 숫자 제외하고 가중치 계산
        for (let digit = 0; digit <= 9; digit++) {
          if (digit !== duplicateDigit) {
            const freq = posData.digitFrequency[digit] || 0;
            weights.push({
              digit,
              weight: freq + 1
            });
          }
        }
        
        // 가중치에 따라 숫자 선택
        const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const { digit, weight } of weights) {
          random -= weight;
          if (random <= 0) {
            generatedDigits[pos] = digit;
            break;
          }
        }
      }
    }
  } else {
    // 기존 방식: 각 자리별로 높은 빈도 숫자들의 가중치 리스트 생성
    const weightedDigits: number[][] = [];
    
    for (let pos = 0; pos < 6; pos++) {
      const posData = positionFreq[pos];
      const weights: { digit: number; weight: number }[] = [];
      
      // 각 숫자(0~9)의 빈도를 가중치로 사용
      for (let digit = 0; digit <= 9; digit++) {
        const freq = posData.digitFrequency[digit] || 0;
        // 빈도가 높을수록 높은 가중치 (최소 1은 보장)
        weights.push({
          digit,
          weight: freq + 1
        });
      }
      
      // 가중치에 따라 숫자 선택
      const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
      let random = Math.random() * totalWeight;
      
      for (const { digit, weight } of weights) {
        random -= weight;
        if (random <= 0) {
          weightedDigits.push([digit]);
          break;
        }
      }
    }

    // 가중치 기반으로 생성된 숫자들
    generatedDigits = weightedDigits.map(arr => arr[0]);
  }
  
  let currentSum = generatedDigits.reduce((sum, d) => sum + d, 0);

  // 합계 조정 (목표 합계에 근접하도록)
  const maxAttempts = 100;
  for (let attempt = 0; attempt < maxAttempts && Math.abs(currentSum - targetSum) > 3; attempt++) {
    const diff = targetSum - currentSum;
    const adjustCount = Math.min(Math.abs(diff), 6);
    
    for (let i = 0; i < adjustCount; i++) {
      const randomPos = Math.floor(Math.random() * 6);
      const oldDigit = generatedDigits[randomPos];
      
      if (diff > 0) {
        // 합계가 낮으면 증가 (최대 9)
        if (oldDigit < 9) {
          generatedDigits[randomPos] = Math.min(9, oldDigit + 1);
        }
      } else {
        // 합계가 높으면 감소 (최소 0)
        if (oldDigit > 0) {
          generatedDigits[randomPos] = Math.max(0, oldDigit - 1);
        }
      }
    }
    
    currentSum = generatedDigits.reduce((sum, d) => sum + d, 0);
    
    // 목표에 도달했으면 중단
    if (Math.abs(currentSum - targetSum) <= 3) break;
  }

  // 합계가 여전히 범위를 벗어나면 재조정
  if (currentSum < 0 || currentSum > 54) {
    generatedDigits = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10));
  }

  return generatedDigits;
}

export default function PredictionGenerator({ lotteryData }: PredictionGeneratorProps) {
  const [predictedNumbers, setPredictedNumbers] = useState<number[] | null>(null);
  const [predictionSum, setPredictionSum] = useState<number | null>(null);
  const [predictionPattern, setPredictionPattern] = useState<string | null>(null);
  const [patternCount, setPatternCount] = useState<number | null>(null);
  const [patternPercentage, setPatternPercentage] = useState<number | null>(null);
  const [digitDuplicateProbability, setDigitDuplicateProbability] = useState<number | null>(null);
  const [digitProbabilities, setDigitProbabilities] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const numbers = generatePrediction(lotteryData);
      const sum = numbers.reduce((s, n) => s + n, 0);
      
      // 생성된 숫자의 패턴 분석
      const digitCount: Record<number, number> = {};
      numbers.forEach(d => {
        digitCount[d] = (digitCount[d] || 0) + 1;
      });
      
      const duplicates = Object.entries(digitCount).filter(([_, count]) => count >= 2);
      let pattern: string | null = null;
      let patternCount: number | null = null;
      let patternPercentage: number | null = null;
      let digitDuplicateProbability: number | null = null;
      
      // 중복 패턴 분석을 위해 전체 데이터 분석
      const duplicateAnalysis = analyzeDuplicatePatterns(lotteryData);
      const totalCount = lotteryData.length;
      
      if (duplicates.length === 0) {
        // 중복 없음 비율
        const count = duplicateAnalysis.duplicateCountDistribution[0] || 0;
        patternCount = count;
        patternPercentage = duplicateAnalysis.duplicateCountRatio[0] ? duplicateAnalysis.duplicateCountRatio[0] * 100 : null;
        digitDuplicateProbability = null;
      } else if (duplicates.length === 1) {
        const duplicateDigit = parseInt(duplicates[0][0]);
        const duplicateCount = digitCount[duplicateDigit];
        
        // 해당 숫자의 중복 확률 계산 (1개 중복으로 나타난 횟수)
        const digitRanking = duplicateAnalysis.singleDuplicateDigitRanking.find(
          item => item.digit === duplicateDigit.toString()
        );
        if (digitRanking) {
          digitDuplicateProbability = (digitRanking.count / totalCount) * 100;
        }
        
        if (duplicateCount === 2) {
          // 1개 숫자가 정확히 2번 중복
          pattern = numbers.map(d => d === duplicateDigit ? 'O' : 'X').join('');
          
          // 해당 패턴의 카운트와 비율 찾기
          const positionPatternAnalysis = analyzeDuplicatePositionPatterns(lotteryData);
          const patternData = positionPatternAnalysis.patternDetails.find(p => p.pattern === pattern);
          if (patternData) {
            patternCount = patternData.count;
            patternPercentage = patternData.percentage;
          } else {
            // 전체 1개 중복 비율
            const count = duplicateAnalysis.duplicateCountDistribution[1] || 0;
            patternCount = count;
            patternPercentage = duplicateAnalysis.duplicateCountRatio[1] ? duplicateAnalysis.duplicateCountRatio[1] * 100 : null;
          }
        } else {
          // 1개 숫자가 3번 이상 중복
          pattern = numbers.map(d => d === duplicateDigit ? 'O' : 'X').join('');
          // 기타 패턴 비율
          const count = duplicateAnalysis.duplicateCountDistribution[-1] || 0;
          patternCount = count;
          patternPercentage = duplicateAnalysis.duplicateCountRatio[-1] ? duplicateAnalysis.duplicateCountRatio[-1] * 100 : null;
        }
      } else if (duplicates.length === 2) {
        // 2개 숫자가 중복
        const duplicate1 = parseInt(duplicates[0][0]);
        const duplicate2 = parseInt(duplicates[1][0]);
        const count1 = digitCount[duplicate1];
        const count2 = digitCount[duplicate2];
        
        // 패턴 생성 (첫 번째 중복: O, 두 번째 중복: A, 나머지: X)
        pattern = numbers.map(d => {
          if (d === duplicate1) return 'O';
          if (d === duplicate2) return 'A';
          return 'X';
        }).join('');
        
        // 2개 중복 비율 확인
        const digitString = numbers.map(n => n.toString()).join('');
        const digitCountCheck: Record<string, number> = {};
        digitString.split('').forEach(d => {
          digitCountCheck[d] = (digitCountCheck[d] || 0) + 1;
        });
        const duplicateCountCheck = Object.values(digitCountCheck).filter(c => c >= 2).length;
        
        // 기타 패턴인지 확인 (3개 이상 종류 중복이거나, 둘 다 3번 이상)
        const isOthers = duplicateCountCheck >= 3 || (duplicateCountCheck === 2 && count1 >= 3 && count2 >= 3);
        
        if (isOthers) {
          const count = duplicateAnalysis.duplicateCountDistribution[-1] || 0;
          patternCount = count;
          patternPercentage = duplicateAnalysis.duplicateCountRatio[-1] ? duplicateAnalysis.duplicateCountRatio[-1] * 100 : null;
        } else {
          const count = duplicateAnalysis.duplicateCountDistribution[2] || 0;
          patternCount = count;
          patternPercentage = duplicateAnalysis.duplicateCountRatio[2] ? duplicateAnalysis.duplicateCountRatio[2] * 100 : null;
        }
        digitDuplicateProbability = null;
      } else {
        // 3개 이상 중복
        pattern = numbers.map((d, idx) => {
          const count = digitCount[d];
          if (count >= 2) {
            // 중복된 숫자는 O로 표시
            return 'O';
          }
          return 'X';
        }).join('');
        
        // 기타 패턴 비율
        const count = duplicateAnalysis.duplicateCountDistribution[-1] || 0;
        patternCount = count;
        patternPercentage = duplicateAnalysis.duplicateCountRatio[-1] ? duplicateAnalysis.duplicateCountRatio[-1] * 100 : null;
        digitDuplicateProbability = null;
      }
      
      // 각 자릿수별 확률 계산
      const positionFreq = analyzePositionFrequency(lotteryData);
      const probabilities: number[] = numbers.map((digit, pos) => {
        const posData = positionFreq[pos];
        const count = posData.digitFrequency[digit] || 0;
        const percentage = (count / lotteryData.length) * 100;
        return percentage;
      });
      
      setPredictedNumbers(numbers);
      setPredictionSum(sum);
      setPredictionPattern(pattern);
      setPatternCount(patternCount);
      setPatternPercentage(patternPercentage);
      setDigitDuplicateProbability(digitDuplicateProbability);
      setDigitProbabilities(probabilities);
      setIsGenerating(false);
    }, 300); // 애니메이션 효과를 위한 딜레이
  };

  if (lotteryData.length === 0) {
    return null;
  }

  const sumAnalysis = analyzeDigitSum(lotteryData);

  return (
    <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 rounded-lg shadow-lg p-6 mb-8 border-2 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="text-purple-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">AI 기반 숫자 예측</h2>
            <p className="text-sm text-gray-600">
              자릿수 합계, 각 자리별 빈도, 중복 배치 패턴을 기반으로 예측된 숫자
            </p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              <span>생성 중...</span>
            </>
          ) : (
            <>
              <Target size={20} />
              <span>숫자 생성</span>
            </>
          )}
        </button>
      </div>

      {predictedNumbers && (
        <div className="mt-6 p-6 bg-white rounded-lg border-2 border-purple-300">
          <div className="mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              {predictedNumbers.map((num, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg animate-pulse"
                  >
                    {num}
                  </div>
                  {digitProbabilities[index] !== undefined && (
                    <div className="mt-1 text-xs font-semibold text-gray-600">
                      {digitProbabilities[index].toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="text-sm font-semibold text-gray-700 mb-3 text-center">합계 정보</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">자릿수 합계</div>
                  <div className="text-xl font-bold text-green-600">
                    {predictionSum}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">평균 합계</div>
                  <div className="text-xl font-bold text-purple-600">
                    {sumAnalysis.statistics.avgSum.toFixed(1)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">합계 차이</div>
                  <div className={`text-xl font-bold ${Math.abs(predictionSum! - sumAnalysis.statistics.avgSum) <= 5 ? 'text-green-600' : 'text-orange-600'}`}>
                    {predictionSum && (predictionSum - sumAnalysis.statistics.avgSum).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="text-sm font-semibold text-gray-700 mb-2">배치 패턴</div>
              {predictionPattern ? (
                <>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <span className="text-xl font-bold text-gray-800 font-mono">
                      {predictionPattern.split('').map((char, i) => {
                        let colorClass = 'text-gray-400';
                        if (char === 'O') colorClass = 'text-red-600';
                        else if (char === 'A') colorClass = 'text-blue-600';
                        return (
                          <span key={i} className={colorClass}>
                            {char}
                          </span>
                        );
                      })}
                    </span>
                  </div>
                  {patternCount !== null && patternPercentage !== null && (
                    <div className="text-xs font-semibold text-indigo-600">
                      {patternCount}회 / {lotteryData.length}회 ({patternPercentage.toFixed(1)}%)
                    </div>
                  )}
                  {digitDuplicateProbability !== null && (
                    <div className="text-xs text-gray-600 mt-1">
                      해당 숫자 중복 확률: {digitDuplicateProbability.toFixed(1)}%
                    </div>
                  )}
                </>
              ) : (
                <>
                  {patternCount !== null && patternPercentage !== null && (
                    <div className="text-sm font-bold text-indigo-600">
                      {patternCount}회 / {lotteryData.length}회 ({patternPercentage.toFixed(1)}%)
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {predictionSum && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 text-center">
                {predictionSum < sumAnalysis.statistics.avgSum - 5 && '⚠️ 합계가 평균보다 낮습니다'}
                {predictionSum >= sumAnalysis.statistics.avgSum - 5 && predictionSum <= sumAnalysis.statistics.avgSum + 5 && '✅ 합계가 평균 범위 내입니다'}
                {predictionSum > sumAnalysis.statistics.avgSum + 5 && '⚠️ 합계가 평균보다 높습니다'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

