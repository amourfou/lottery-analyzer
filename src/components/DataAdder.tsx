'use client';

import { useState } from 'react';
import { Plus, Save, Download } from 'lucide-react';

interface DataAdderProps {
  onDataAdded?: () => void;
}

export default function DataAdder({ onDataAdded }: DataAdderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<number[]>(() => {
    // 기본값: 14개 0으로 초기화
    return Array(14).fill(0);
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 필드 이름 정의
  const fieldLabels = [
    '회차',
    '조',
    '십만자리',
    '만자리',
    '천자리',
    '백자리',
    '십자리',
    '일자리',
    '보너스번호십만자리',
    '보너스번호만자리',
    '보너스번호천자리',
    '보너스번호백자리',
    '보너스번호십자리',
    '보너스번호일자리'
  ];

  const handleChange = (index: number, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    
    // 조 필드(index 1)는 1~5 범위만 허용
    if (index === 1) {
      if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
        const newData = [...formData];
        newData[index] = numValue;
        setFormData(newData);
        setMessage(null);
      }
    } else {
      // 다른 필드는 0~9 범위 허용
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 9) {
        const newData = [...formData];
        newData[index] = numValue;
        setFormData(newData);
        setMessage(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 회차와 조 검증
    if (formData[0] === 0) {
      setMessage({ type: 'error', text: '회차는 0일 수 없습니다.' });
      return;
    }
    if (formData[1] === 0 || formData[1] < 1 || formData[1] > 5) {
      setMessage({ type: 'error', text: '조는 1~5 사이의 값이어야 합니다.' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/add-lottery-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newData: formData }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        // 폼 초기화
        setFormData(Array(14).fill(0));
        // 데이터 재로드 콜백 호출
        if (onDataAdded) {
          setTimeout(() => {
            onDataAdded();
          }, 500);
        }
      } else {
        setMessage({ type: 'error', text: result.error || '데이터 추가에 실패했습니다.' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '데이터 추가 중 오류가 발생했습니다.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch('/PensionLottery.json');
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PensionLottery.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={handleDownload}
          className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          title="현재 데이터 다운로드"
        >
          <Download size={18} />
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title={isOpen ? '닫기' : '데이터 추가'}
        >
          <Plus size={18} />
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        {/* 첫 줄: 회차 */}
        <div className="flex gap-1.5 items-center">
          <input
            type="number"
            min="0"
            value={formData[0]}
            onChange={(e) => handleChange(0, e.target.value)}
            placeholder="회차"
            className="w-14 px-1 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-base font-bold"
            required
          />
        </div>
        
        {/* 두 번째 줄: 조 | 구분자 | 번호 6개 */}
        <div className="flex gap-1.5 items-center">
          <input
            type="number"
            min="1"
            max="5"
            value={formData[1]}
            onChange={(e) => handleChange(1, e.target.value)}
            placeholder="조"
            className="w-12 px-1 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-base font-bold"
            required
          />
          
          {/* 구분자 */}
          <span className="text-lg font-bold text-gray-400">|</span>
          
          {/* 번호 6개 (십만자리 ~ 일자리) */}
          {formData.slice(2, 8).map((value, idx) => (
            <input
              key={idx + 2}
              type="number"
              min="0"
              max="9"
              value={value}
              onChange={(e) => handleChange(idx + 2, e.target.value)}
              placeholder={fieldLabels[idx + 2]}
              className="w-12 px-1 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-base font-bold"
              required
            />
          ))}
        </div>
        
        {/* 세 번째 줄: 보너스번호 6개 */}
        <div className="flex gap-1.5 items-center">
          {formData.slice(8, 14).map((value, idx) => (
            <input
              key={idx + 8}
              type="number"
              min="0"
              max="9"
              value={value}
              onChange={(e) => handleChange(idx + 8, e.target.value)}
              placeholder={fieldLabels[idx + 8]}
              className="w-12 px-1 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-base font-bold"
              required
            />
          ))}
          
          {/* 데이터 추가 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={isSubmitting ? '추가 중...' : '데이터 추가'}
          >
            {isSubmitting ? (
              <Save size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        </form>
      )}
    </div>
  );
}

