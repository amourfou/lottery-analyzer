'use client';

import { useState, useEffect } from 'react';
import AnalysisResults from '@/components/AnalysisResults';
import DataLoader from '@/components/DataLoader';
import LotteryDataDisplay from '@/components/LotteryDataDisplay';
import TrendChart from '@/components/TrendChart';
import TrendAnalysis from '@/components/TrendAnalysis';
import { analyzeNumbers } from '@/lib/analysis';
import { NumberAnalysis } from '@/types';
import { LotteryData, parseLotteryData, getDataStatistics } from '@/lib/dataParser';

export default function Home() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [analysis, setAnalysis] = useState<NumberAnalysis | null>(null);
  const [lotteryData, setLotteryData] = useState<LotteryData[]>([]);
  const [dataStatistics, setDataStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);


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

  // 페이지 로드 시 자동으로 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('자동 데이터 로드 시작...');
        const response = await fetch('/PensionLottery.json');
        
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
        
        setNumbers(numbers);
        setLotteryData(parsedData);
        setDataStatistics(stats);
        
        // 분석 실행
        if (numbers.length > 0) {
          const analysisResult = analyzeNumbers(numbers);
          setAnalysis(analysisResult);
        }
        
        console.log('자동 데이터 로드 및 분석 완료!');
        console.log('최종 상태 - numbers:', numbers.length, 'lotteryData:', parsedData.length);
        
      } catch (error) {
        console.error('자동 데이터 로드 실패:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
        console.error('에러 메시지:', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🎯 연금복권 패턴 분석기
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          연금복권 데이터를 분석하여 패턴을 찾고 다음 숫자를 예측해보세요.
          트렌드 분석, 통계 분석, 분포 분석 등 다양한 기능을 제공합니다.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">연금복권 데이터를 로드하고 분석 중...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
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
        <div className="mt-8">
          <TrendAnalysis lotteryData={lotteryData} />
        </div>
      )}

      {/* 복권 데이터 표시 */}
      {lotteryData.length > 0 && (
        <div className="mt-8">
          <LotteryDataDisplay lotteryData={lotteryData} />
        </div>
      )}

      {numbers.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">분석 요약</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{numbers.length}</div>
              <div className="text-sm text-gray-600">입력된 숫자 개수</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analysis?.statistics.mean.toFixed(0) || 0}
              </div>
              <div className="text-sm text-gray-600">평균값</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {analysis?.predictions.nextNumber.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">예측 다음 숫자</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {analysis ? `${(analysis.predictions.confidence * 100).toFixed(0)}%` : '0%'}
              </div>
              <div className="text-sm text-gray-600">예측 신뢰도</div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-12 text-center text-gray-500">
        <p>© 2024 연금복권 패턴 분석기 - Next.js로 제작된 AI 기반 복권 분석 도구</p>
      </footer>
    </main>
  );
}
