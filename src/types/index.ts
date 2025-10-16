export interface NumberAnalysis {
  input: number;
  statistics: {
    mean: number;
    median: number;
    mode: number;
    range: number;
    standardDeviation: number;
  };
  distribution: {
    digitFrequency: Record<string, number>;
    evenOddRatio: number;
    primeCount: number;
  };
  patterns: {
    consecutiveDigits: number;
    repeatedDigits: number;
    ascendingSequence: boolean;
    descendingSequence: boolean;
  };
  predictions: {
    nextNumber: number;
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}
