'use client';

import { useState, useEffect } from 'react';
import AnalysisResults from '@/components/AnalysisResults';
import DataLoader from '@/components/DataLoader';
import LotteryDataDisplay from '@/components/LotteryDataDisplay';
import TrendChart from '@/components/TrendChart';
import TrendAnalysis from '@/components/TrendAnalysis';
import DuplicatePatternAnalysis from '@/components/DuplicatePatternAnalysis';
import PositionTransitionAnalysis from '@/components/PositionTransitionAnalysis';
import PredictionGenerator from '@/components/PredictionGenerator';
import DataAdder from '@/components/DataAdder';
import { analyzeNumbers } from '@/lib/analysis';
import { NumberAnalysis } from '@/types';
import { LotteryData, loadLotteryData } from '@/lib/dataParser';

export default function Home() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [analysis, setAnalysis] = useState<NumberAnalysis | null>(null);
  const [lotteryData, setLotteryData] = useState<LotteryData[]>([]);
  const [dataStatistics, setDataStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataReloadKey, setDataReloadKey] = useState(0);


  const handleDataLoaded = (newNumbers: number[], newLotteryData: LotteryData[]) => {
    setNumbers(newNumbers);
    setLotteryData(newLotteryData);
    if (newNumbers.length > 0) {
      const analysisResult = analyzeNumbers(newNumbers);
      setAnalysis(analysisResult);
    }
  };

  const handleStatisticsLoaded = (stats: any) => {
    setDataStatistics(stats);
  };

  // 데이터 로드 함수
  const loadData = async () => {
    try {
      console.log('데이터 로드 시작...');
      
      const { parsedData, numbers, statistics } = await loadLotteryData();
      
      console.log('데이터 로드 및 파싱 완료:', parsedData.length, '개 항목');
      console.log('분석된 숫자들:', numbers.slice(0, 5), '...');
      
      setNumbers(numbers);
      setLotteryData(parsedData);
      setDataStatistics(statistics);
      
      // 분석 실행
      if (numbers.length > 0) {
        const analysisResult = analyzeNumbers(numbers);
        setAnalysis(analysisResult);
      }
      
      console.log('데이터 로드 및 분석 완료!');
      console.log('최종 상태 - numbers:', numbers.length, 'lotteryData:', parsedData.length);
      
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
      console.error('에러 메시지:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드 시 자동으로 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  // 데이터 추가 후 재로드
  useEffect(() => {
    if (dataReloadKey > 0) {
      loadData();
    }
  }, [dataReloadKey]);

  const handleDataAdded = () => {
    setDataReloadKey(prev => prev + 1);
  };

  return (
    <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="text-center mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">
          🎯 연금복권 패턴 분석기
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">
          연금복권 데이터를 분석하여 패턴을 찾고 다음 숫자를 예측해보세요.
          트렌드 분석, 통계 분석, 분포 분석 등 다양한 기능을 제공합니다.
        </p>
      </div>

            {/* AI 기반 숫자 예측 */}
            {!isLoading && lotteryData.length > 0 && (
              <PredictionGenerator lotteryData={lotteryData} analyzedNumbers={numbers} />
            )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">연금복권 데이터를 로드하고 분석 중...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="space-y-4 sm:space-y-6">
            <div className="hidden md:block">
              <DataAdder onDataAdded={handleDataAdded} lotteryData={lotteryData} />
            </div>
            
            <DataLoader 
              onDataLoaded={handleDataLoaded}
              onStatisticsLoaded={handleStatisticsLoaded}
              lotteryData={lotteryData}
            />
          </div>
          
          <div className="lg:col-span-2">
            <AnalysisResults analysis={analysis} />
          </div>
        </div>
      )}

      {/* 트렌드 차트 */}
      {!isLoading && lotteryData.length > 0 && (
        <div className="mt-8 p-4" style={{ border: '4px solid #10b981', backgroundColor: '#f0fdf4' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#059669', marginBottom: '1rem' }}>
            트렌드 차트 영역 (녹색 테두리)
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.5rem' }}>
            조건 확인: isLoading={isLoading.toString()}, lotteryData.length={lotteryData.length}
          </p>
          <TrendChart lotteryData={lotteryData} />
        </div>
      )}
      
      {/* 트렌드 차트가 안 보이는 이유 디버깅 */}
      {!isLoading && lotteryData.length === 0 && (
        <div className="mt-8 border-4 border-red-500 p-4">
          <h2 className="text-xl font-bold text-red-600 mb-4">트렌드 차트가 안 보이는 이유</h2>
          <p className="text-sm text-red-600">lotteryData.length가 0입니다!</p>
        </div>
      )}
      
      {isLoading && (
        <div className="mt-8 border-4 border-yellow-500 p-4">
          <h2 className="text-xl font-bold text-yellow-600 mb-4">트렌드 차트가 안 보이는 이유</h2>
          <p className="text-sm text-yellow-600">아직 로딩 중입니다!</p>
        </div>
      )}
      

      {/* 트렌드 분석 */}
      {lotteryData.length > 0 && (
        <div className="mt-4 sm:mt-6 lg:mt-8">
          <TrendAnalysis lotteryData={lotteryData} />
        </div>
      )}

      {/* 중복 숫자 패턴 분석 */}
      {lotteryData.length > 0 && (
        <div className="mt-4 sm:mt-6 lg:mt-8">
          <DuplicatePatternAnalysis lotteryData={lotteryData} />
        </div>
      )}

      {/* 각 자리별 전이 패턴 분석 */}
      {lotteryData.length > 0 && (
        <div className="mt-4 sm:mt-6 lg:mt-8">
          <PositionTransitionAnalysis lotteryData={lotteryData} />
        </div>
      )}

      {/* 복권 데이터 표시 */}
      {lotteryData.length > 0 && (
        <div className="mt-4 sm:mt-6 lg:mt-8">
          <LotteryDataDisplay lotteryData={lotteryData} />
        </div>
      )}

      <footer className="mt-6 sm:mt-8 lg:mt-12 text-center text-gray-500 px-2">
        <p className="text-xs sm:text-sm">© 2024 연금복권 패턴 분석기 - Next.js로 제작된 AI 기반 복권 분석 도구</p>
      </footer>
    </main>
  );
}
