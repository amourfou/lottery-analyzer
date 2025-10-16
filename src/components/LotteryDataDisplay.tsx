'use client';

import { LotteryData } from '@/lib/dataParser';
import { Calendar, Hash, TrendingUp } from 'lucide-react';

interface LotteryDataDisplayProps {
  lotteryData: LotteryData[];
}

export default function LotteryDataDisplay({ lotteryData }: LotteryDataDisplayProps) {
  if (lotteryData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Hash size={24} />
        복권 데이터 ({lotteryData.length}회차)
      </h2>
      
      <div className="space-y-4">
        {/* 최근 5개 데이터만 간단히 표시 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">최근 5회차</h3>
          <div className="space-y-2">
            {lotteryData.slice(0, 5).map((data, index) => (
              <div
                key={data.order}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar size={14} />
                    {data.order}회차
                  </div>
                  <div className="flex gap-1">
                    {data.numbers.map((num, i) => (
                      <span
                        key={i}
                        className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-gray-800">
                    {data.combinedNumber.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {Math.min(...lotteryData.map(d => d.combinedNumber)).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">최소값</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.max(...lotteryData.map(d => d.combinedNumber)).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">최대값</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(lotteryData.reduce((sum, d) => sum + d.combinedNumber, 0) / lotteryData.length).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">평균값</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {lotteryData.filter(d => d.combinedNumber % 2 === 0).length}
            </div>
            <div className="text-sm text-gray-600">짝수 개수</div>
          </div>
        </div>

        {/* 자릿수 분포 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">자릿수 분포</h3>
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => {
              const count = lotteryData.reduce((sum, data) => {
                return sum + data.numbers.filter(num => num === digit).length;
              }, 0);
              const percentage = (count / (lotteryData.length * 6) * 100).toFixed(1);
              
              return (
                <div key={digit} className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-800">{digit}</div>
                  <div className="text-xs text-gray-600">{count}회</div>
                  <div className="text-xs text-blue-600">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
