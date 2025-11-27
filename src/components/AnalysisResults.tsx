'use client';

import React from 'react';
import { NumberAnalysis } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface AnalysisResultsProps {
  analysis: NumberAnalysis | null;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

export default function AnalysisResults({ analysis }: AnalysisResultsProps) {
  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <BarChart3 className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-gray-500">숫자를 입력하고 분석을 시작하세요</p>
      </div>
    );
  }

  const digitChartData = Object.entries(analysis.distribution.digitFrequency).map(([digit, count]) => ({
    digit,
    count,
    fill: COLORS[parseInt(digit)]
  }));

  const trendIcon = analysis.predictions.trend === 'increasing' ? TrendingUp : 
                   analysis.predictions.trend === 'decreasing' ? TrendingDown : Minus;
  const trendColor = analysis.predictions.trend === 'increasing' ? 'text-green-600' : 
                    analysis.predictions.trend === 'decreasing' ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 통계 요약 */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">통계 분석</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{Math.round(analysis.statistics.mean)}</div>
            <div className="text-xs sm:text-sm text-gray-600">평균</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{Math.round(analysis.statistics.median)}</div>
            <div className="text-xs sm:text-sm text-gray-600">중앙값</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{analysis.statistics.mode.toString()}</div>
            <div className="text-xs sm:text-sm text-gray-600">최빈값</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{analysis.statistics.range.toString()}</div>
            <div className="text-xs sm:text-sm text-gray-600">범위</div>
          </div>
          <div className="text-center col-span-2 sm:col-span-1">
            <div className="text-xl sm:text-2xl font-bold text-red-600">{Math.round(analysis.statistics.standardDeviation)}</div>
            <div className="text-xs sm:text-sm text-gray-600">표준편차</div>
          </div>
        </div>
        
        {/* 표준편차 범위 분석 */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">표준편차 범위 분석</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            <div className="text-center p-2 sm:p-3 bg-white rounded-lg">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">범위 내</div>
              <div className="text-lg sm:text-xl font-bold text-green-600">
                {analysis.statistics.outOfRangeCount > 0 
                  ? Math.round((1 - analysis.statistics.outOfRangeRatio) * 100)
                  : 100}%
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500">
                {analysis.statistics.outOfRangeCount > 0
                  ? `${Math.round((1 - analysis.statistics.outOfRangeRatio) * 100)}%`
                  : '100%'} (평균 ± 표준편차 × 1.5)
              </div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-white rounded-lg">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">범위 밖</div>
              <div className="text-lg sm:text-xl font-bold text-red-600">
                {Math.round(analysis.statistics.outOfRangeRatio * 100)}%
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500">
                {analysis.statistics.outOfRangeCount}개
              </div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-white rounded-lg">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">상한 초과</div>
              <div className="text-lg sm:text-xl font-bold text-orange-600">
                {Math.round(analysis.statistics.aboveUpperBoundRatio * 100)}%
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500">
                평균 + 표준편차 × 1.5 초과 ({analysis.statistics.aboveUpperBoundCount}개)
              </div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-white rounded-lg">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">하한 미만</div>
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {Math.round(analysis.statistics.belowLowerBoundRatio * 100)}%
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500">
                평균 - 표준편차 × 1.5 미만 ({analysis.statistics.belowLowerBoundCount}개)
              </div>
            </div>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-300">
            <div className="text-[10px] sm:text-xs text-gray-600 text-center px-1">
              기준 범위: {Math.round(analysis.statistics.lowerBound)} ~ {Math.round(analysis.statistics.upperBound)} 
              (평균 {Math.round(analysis.statistics.mean)} ± 표준편차 × 1.5 {Math.round(analysis.statistics.standardDeviation * 1.5)})
            </div>
          </div>
        </div>
      </div>

      {/* 자릿수 분포 차트 */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
          <BarChart3 size={20} />
          자릿수 분포
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={digitChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="digit" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 패턴 분석 */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">패턴 분석</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{analysis.patterns.consecutiveDigits}</div>
            <div className="text-xs sm:text-sm text-gray-600">연속 자릿수</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{analysis.patterns.repeatedDigits}</div>
            <div className="text-xs sm:text-sm text-gray-600">반복 자릿수</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {analysis.patterns.ascendingSequence ? '✓' : '✗'}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">오름차순</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">
              {analysis.patterns.descendingSequence ? '✓' : '✗'}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">내림차순</div>
          </div>
        </div>
      </div>

      {/* 분포 정보 */}
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
          <PieChartIcon size={20} />
          분포 정보
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-2">
              {analysis.distribution.evenOddRatio.toFixed(2)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">짝수/홀수 비율</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600 mb-2">
              {analysis.distribution.primeCount}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">소수 개수</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-2">
              {Object.keys(analysis.distribution.digitFrequency).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">사용된 자릿수</div>
          </div>
        </div>
      </div>
    </div>
  );
}
