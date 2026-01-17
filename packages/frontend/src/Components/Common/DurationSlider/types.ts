
export interface StepLessonLengthProps {
  lessonLength: string | number // 'HH:mm' or minutes
  setLessonLength: (value: string) => void;
  compact?: boolean;
}
