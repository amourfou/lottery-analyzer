import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { newData } = body;
    
    // 입력 데이터 검증 (14개 숫자)
    if (!Array.isArray(newData) || newData.length !== 14) {
      return NextResponse.json(
        { error: '데이터는 14개의 숫자 배열이어야 합니다.' },
        { status: 400 }
      );
    }
    
    // 모든 요소가 숫자인지 확인
    if (!newData.every(item => typeof item === 'number')) {
      return NextResponse.json(
        { error: '모든 요소는 숫자여야 합니다.' },
        { status: 400 }
      );
    }
    
    // 파일 경로
    const filePath = path.join(process.cwd(), 'public', 'PensionLottery.json');
    
    // 기존 데이터 읽기
    const existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // 회차 중복 확인
    const existingOrder = existingData.find((row: number[]) => row[0] === newData[0]);
    if (existingOrder) {
      return NextResponse.json(
        { error: `회차 ${newData[0]}번이 이미 존재합니다.` },
        { status: 400 }
      );
    }
    
    // 새로운 데이터 추가 (회차 순서대로 정렬을 위해 맨 앞에 추가)
    existingData.unshift(newData);
    
    // 회차 순서대로 정렬 (내림차순 - 최신이 앞에)
    existingData.sort((a: number[], b: number[]) => b[0] - a[0]);
    
    // 파일 저장
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf-8');
    
    return NextResponse.json({
      success: true,
      message: `회차 ${newData[0]}번 데이터가 추가되었습니다.`,
      totalCount: existingData.length
    });
    
  } catch (error) {
    console.error('데이터 추가 실패:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '데이터 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

