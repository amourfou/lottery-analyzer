'use client';

import { useState } from 'react';
import { Upload, Database, BarChart3 } from 'lucide-react';
import { loadLotteryData, getRecentData, extractNumbers, LotteryData } from '@/lib/dataParser';

interface DataLoaderProps {
  onDataLoaded: (numbers: number[], lotteryData: LotteryData[]) => void;
  onStatisticsLoaded: (stats: any) => void;
  lotteryData: LotteryData[];
}

export default function DataLoader({ onDataLoaded, onStatisticsLoaded, lotteryData }: DataLoaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedData, setLoadedData] = useState<LotteryData[] | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [includeBonus, setIncludeBonus] = useState(false);

  const loadPensionLotteryData = async () => {
    console.log('데이터 로드 시작...');
    setIsLoading(true);
    try {
      console.log('PensionLottery.json 파일 요청 중...');
      
      const { parsedData, numbers, statistics } = await loadLotteryData();
      
      console.log('데이터 로드 및 파싱 완료:', parsedData.length, '개 항목');
      console.log('분석된 숫자들:', numbers.slice(0, 5), '...');
      console.log('통계:', statistics);
      
      setLoadedData(parsedData);
      setStatistics(statistics);
      
      // 보너스 번호 포함 여부에 따라 숫자 추출
      const extractedNumbers = extractNumbers(parsedData, includeBonus);
      onDataLoaded(extractedNumbers, parsedData);
      onStatisticsLoaded(statistics);
      
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
    const dataToUse = loadedData || lotteryData;
    if (!dataToUse || dataToUse.length === 0) return;
    
    const recentData = getRecentData(dataToUse, count);
    const numbers = extractNumbers(recentData, includeBonus);
    onDataLoaded(numbers, recentData);
  };

  const handleBonusToggle = () => {
    const newIncludeBonus = !includeBonus;
    setIncludeBonus(newIncludeBonus);
    
    // 즉시 분석 결과 반영 - 현재 로드된 데이터나 lotteryData 사용
    const dataToUse = loadedData || lotteryData;
    if (dataToUse.length > 0) {
      const numbers = extractNumbers(dataToUse, newIncludeBonus);
      onDataLoaded(numbers, dataToUse);
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Database size={24} />
        데이터 범위 선택
      </h2>
      
      <div className="space-y-4">
        {/* 보너스 번호 포함 옵션 */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <input
            type="checkbox"
            id="includeBonus"
            checked={includeBonus}
            onChange={handleBonusToggle}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="includeBonus" className="text-sm font-medium text-gray-700 cursor-pointer">
            보너스 번호 포함
          </label>
          <span className="text-xs text-gray-500 ml-2">
            ({includeBonus ? '보너스 번호 포함하여 분석' : '일반 번호만 분석'})
          </span>
        </div>

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
