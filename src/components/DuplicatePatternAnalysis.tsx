'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Repeat, BarChart3, PieChart as PieChartIcon, Trophy } from 'lucide-react';
import { LotteryData, analyzeDuplicatePatterns, DuplicatePatternAnalysisResult, analyzeDuplicatePositionPatterns, analyzeDuplicateFrequency } from '@/lib/dataParser';

interface DuplicatePatternAnalysisProps {
  lotteryData: LotteryData[];
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

export default function DuplicatePatternAnalysis({ lotteryData }: DuplicatePatternAnalysisProps) {
  if (lotteryData.length === 0) {
    return null;
  }

  const analysis = analyzeDuplicatePatterns(lotteryData);

  // 중복 개수별 분포 차트 데이터
  const distributionData = Object.entries(analysis.duplicateCountDistribution)
    .map(([count, value]) => {
      const countNum = parseInt(count);
      let name: string;
      if (countNum === -1) {
        name = '기타 (3개 이상 중복)';
      } else if (countNum === 0) {
        name = '중복 없음';
      } else {
        name = `${countNum}개 중복`;
      }
      return {
        name,
        count: countNum === -1 ? 999 : countNum, // 기타는 정렬 시 마지막에 오도록
        originalCount: countNum,
        value,
        ratio: analysis.duplicateCountRatio[countNum] * 100
      };
    })
    .sort((a, b) => a.count - b.count);

  // 파이 차트 데이터
  const pieData = distributionData.map(item => ({
    name: item.name,
    value: item.value,
    ratio: item.ratio
  }));

  // 1개 중복 숫자별 순위 (상위 10개만)
  const topDuplicates = analysis.singleDuplicateDigitRanking.slice(0, 10);

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800">{data.name}</p>
          <p className="text-blue-600">
            개수: <span className="font-bold">{data.value}회</span>
          </p>
          <p className="text-green-600">
            비율: <span className="font-bold">{data.ratio.toFixed(2)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Repeat size={24} />
        중복 숫자 패턴 분석
      </h2>

      <div className="space-y-6">
        {/* 요약 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {distributionData.map((item) => (
            <div key={item.count} className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{item.value}</div>
              <div className="text-sm text-gray-600">{item.name}</div>
              <div className="text-xs text-gray-500 mt-1">{item.ratio.toFixed(1)}%</div>
            </div>
          ))}
        </div>

        {/* 중복 개수별 분포 막대 차트 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            중복 개수별 분포
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#374151"
                fontSize={12}
              />
              <YAxis 
                stroke="#374151"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 중복 개수별 비율 파이 차트 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <PieChartIcon size={20} />
            중복 개수별 비율
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, ratio }) => `${name}: ${ratio.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 1개 중복 숫자별 순위 */}
        {topDuplicates.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Trophy size={20} />
              1개 중복 숫자별 빈도 순위
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
              {topDuplicates.map((item, index) => (
                <div
                  key={item.digit}
                  className={`p-3 rounded-lg text-center ${
                    index === 0
                      ? 'bg-yellow-50 border-2 border-yellow-400'
                      : index < 3
                      ? 'bg-gray-50 border border-gray-300'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mx-auto mb-2 ${
                      index === 0
                        ? 'bg-yellow-500'
                        : index === 1
                        ? 'bg-gray-400'
                        : index === 2
                        ? 'bg-orange-400'
                        : 'bg-blue-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="text-xl font-bold text-gray-800 mb-1">숫자 {item.digit}</div>
                  <div className="text-lg font-bold text-blue-600 mb-1">{item.count}회</div>
                  <div className="text-xs text-gray-500">
                    ({(item.count / analysis.totalCount * 100).toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
            {analysis.singleDuplicateDigitRanking.length > 10 && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                상위 10개만 표시 (총 {analysis.singleDuplicateDigitRanking.length}개 숫자)
              </p>
            )}
          </div>
        )}

        {/* 1개 중복 숫자 배치 패턴 분석 */}
        {(() => {
          const positionPatternAnalysis = analyzeDuplicatePositionPatterns(lotteryData);
          
          if (positionPatternAnalysis.totalCount === 0) {
            return null;
          }

          return (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Repeat size={20} />
                1개 중복 숫자 배치 패턴 분석 (O: 중복 숫자, X: 다른 숫자)
              </h3>
              
              <div className="space-y-4">
                {/* 패턴별 분포 막대 차트 */}
                <div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={positionPatternAnalysis.patternDetails} 
                        margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="pattern" 
                          stroke="#374151"
                          fontSize={11}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          stroke="#374151"
                          fontSize={12}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                  <p className="font-bold text-gray-800">패턴: {data.pattern}</p>
                                  <p className="text-blue-600">
                                    개수: <span className="font-bold">{data.count}회</span>
                                  </p>
                                  <p className="text-green-600">
                                    비율: <span className="font-bold">{data.percentage.toFixed(2)}%</span>
                                  </p>
                                  {data.examples.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      예시: {data.examples.join(', ')}회차
                                    </p>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="count" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 패턴별 상세 리스트 */}
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-3">패턴별 상세 정보</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {positionPatternAnalysis.patternDetails.map((pattern, index) => (
                      <div
                        key={pattern.pattern}
                        className={`p-4 rounded-lg border ${
                          index === 0
                            ? 'bg-yellow-50 border-2 border-yellow-400'
                            : index < 3
                            ? 'bg-gray-50 border border-gray-300'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-600">
                              {index + 1}위
                            </span>
                            <span className="text-xl font-bold text-gray-800 font-mono">
                              {pattern.pattern.split('').map((char, i) => (
                                <span key={i} className={char === 'O' ? 'text-red-600' : 'text-gray-400'}>
                                  {char}
                                </span>
                              ))}
                            </span>
                          </div>
                        </div>
                        <div className="text-right mb-2">
                          <div className="text-2xl font-bold text-blue-600">{pattern.count}회</div>
                          <div className="text-xs text-gray-500">{pattern.percentage.toFixed(2)}%</div>
                        </div>
                        {pattern.examples.length > 0 && (
                          <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-300">
                            예시 회차: {pattern.examples.join(', ')}회차
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

               {/* 같은 숫자 중복 빈도 분석 */}
               {(() => {
                 const frequencyAnalysis = analyzeDuplicateFrequency(lotteryData);
                 
                 const frequencyData = [0, 2, 3, 4, 5, 6].map(freq => ({
                   frequency: freq,
                   label: freq === 0 ? '중복 없음' : `${freq}개 중복`,
                   count: frequencyAnalysis.frequencyDistribution[freq] || 0,
                   ratio: (frequencyAnalysis.frequencyRatio[freq] || 0) * 100
                 }));
                 
                 const FrequencyTooltip = ({ active, payload }: any) => {
                   if (active && payload && payload.length) {
                     const data = payload[0].payload;
                     return (
                       <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                         <p className="font-bold text-gray-800">{data.label}</p>
                         <p className="text-blue-600">
                           횟수: <span className="font-bold">{data.count}회</span>
                         </p>
                         <p className="text-green-600">
                           비율: <span className="font-bold">{data.ratio.toFixed(2)}%</span>
                         </p>
                       </div>
                     );
                   }
                   return null;
                 };
                 
                 return (
                   <div className="mt-6">
                     <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                       <Repeat size={20} />
                       같은 숫자 중복 빈도 분석
                     </h3>
                     
                     <div className="space-y-4">
                       {/* 통계 요약 */}
                       <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                         {frequencyData.map((item) => (
                           <div key={item.frequency} className={`text-center p-3 rounded-lg ${
                             item.frequency === 0 ? 'bg-green-50' : 'bg-blue-50'
                           }`}>
                             <div className="text-sm text-gray-600 mb-1">{item.label}</div>
                             <div className={`text-xl font-bold ${item.frequency === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                               {item.count}회
                             </div>
                             <div className="text-xs text-gray-500">{item.ratio.toFixed(1)}%</div>
                           </div>
                         ))}
                       </div>
                       
                       {/* 막대 차트 */}
                       <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={frequencyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                             <XAxis 
                               dataKey="label" 
                               stroke="#374151"
                               fontSize={11}
                               angle={-45}
                               textAnchor="end"
                               height={60}
                               label={{ value: '중복 빈도', position: 'insideBottom', offset: -5 }}
                             />
                             <YAxis 
                               stroke="#374151"
                               fontSize={12}
                               label={{ value: '회수', angle: -90, position: 'insideLeft' }}
                             />
                             <Tooltip content={<FrequencyTooltip />} />
                             <Bar dataKey="count" fill="#8b5cf6">
                               {frequencyData.map((entry, index) => (
                                 <Cell 
                                   key={`cell-${index}`} 
                                   fill={entry.frequency === 0 ? '#10b981' : ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index - 1]} 
                                 />
                               ))}
                             </Bar>
                           </BarChart>
                         </ResponsiveContainer>
                       </div>
                     </div>
                   </div>
                 );
               })()}

               {/* 전체 통계 요약 */}
               <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                 <h3 className="text-lg font-semibold text-gray-700 mb-2">전체 통계 요약</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="font-bold text-gray-800">전체 회차</div>
              <div className="text-blue-600 text-xl font-bold">{analysis.totalCount}회</div>
            </div>
            <div>
              <div className="font-bold text-gray-800">중복 없는 경우</div>
              <div className="text-green-600 text-xl font-bold">
                {analysis.duplicateCountDistribution[0] || 0}회
              </div>
              <div className="text-xs text-gray-500">
                ({(analysis.duplicateCountRatio[0] * 100 || 0).toFixed(1)}%)
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-800">1개 중복</div>
              <div className="text-blue-600 text-xl font-bold">
                {analysis.duplicateCountDistribution[1] || 0}회
              </div>
              <div className="text-xs text-gray-500">
                ({(analysis.duplicateCountRatio[1] * 100 || 0).toFixed(1)}%)
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-800">2개 중복</div>
              <div className="text-purple-600 text-xl font-bold">
                {analysis.duplicateCountDistribution[2] || 0}회
              </div>
              <div className="text-xs text-gray-500">
                ({(analysis.duplicateCountRatio[2] * 100 || 0).toFixed(1)}%)
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-800">기타 (3개 이상)</div>
              <div className="text-orange-600 text-xl font-bold">
                {analysis.duplicateCountDistribution[-1] || 0}회
              </div>
              <div className="text-xs text-gray-500">
                ({(analysis.duplicateCountRatio[-1] * 100 || 0).toFixed(1)}%)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

