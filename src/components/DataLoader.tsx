'use client';

import { useState } from 'react';
import { Upload, Database, BarChart3 } from 'lucide-react';
import { parseLotteryData, getDataStatistics, getRecentData, LotteryData } from '@/lib/dataParser';

interface DataLoaderProps {
  onDataLoaded: (numbers: number[], lotteryData: LotteryData[]) => void;
  onStatisticsLoaded: (stats: any) => void;
  lotteryData: LotteryData[];
}

export default function DataLoader({ onDataLoaded, onStatisticsLoaded, lotteryData }: DataLoaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedData, setLoadedData] = useState<LotteryData[] | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

  const loadPensionLotteryData = async () => {
    console.log('데이터 로드 시작...');
    setIsLoading(true);
    try {
      console.log('PensionLottery.json 파일 요청 중...');
      const response = await fetch('/PensionLottery.json');
      console.log('응답 상태:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const rawData = await response.json();
      console.log('원시 데이터 로드 완료:', rawData.length, '개 항목');
      
      // 데이터 파싱
      const parsedData = parseLotteryData(rawData);
      console.log('데이터 파싱 완료:', parsedData.length, '개 항목');
      
      const numbers = parsedData.map(data => data.combinedNumber);
      const stats = getDataStatistics(parsedData);
      
      console.log('분석된 숫자들:', numbers.slice(0, 5), '...');
      console.log('통계:', stats);
      
      setLoadedData(parsedData);
      setStatistics(stats);
      onDataLoaded(numbers, parsedData);
      onStatisticsLoaded(stats);
      
      console.log('데이터 로드 및 분석 완료!');
      
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
      alert(`데이터 로드에 실패했습니다: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentData = (count: number) => {
    if (!loadedData) return;
    
    const recentData = getRecentData(loadedData, count);
    const numbers = recentData.map(data => data.combinedNumber);
    onDataLoaded(numbers, recentData);
  };


  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Database size={24} />
        데이터 범위 선택
      </h2>
      
      <div className="space-y-4">
        {/* 데이터 범위 선택 버튼들 */}
        {lotteryData.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">현재 {lotteryData.length}회차 데이터가 로드되었습니다.</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => loadRecentData(10)}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                최근 10회차
              </button>
              <button
                onClick={() => loadRecentData(20)}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                최근 20회차
              </button>
              <button
                onClick={() => loadRecentData(50)}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                최근 50회차
              </button>
              <button
                onClick={() => loadRecentData(100)}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                최근 100회차
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
