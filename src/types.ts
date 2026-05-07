export interface TutorialStep {
  title: string;
  description: string;
  timestamp?: string;
}

export interface StructuredTutorial {
  title: string;
  prerequisites: string[];
  steps: TutorialStep[];
  checklist: string[];
  summary: string;
  url?: string;
  isSynthesized?: boolean;
}

export interface HistoryItem {
  id: string;
  title: string;
  date: string;
  data: StructuredTutorial;
}
