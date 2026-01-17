import { useMemo, useState, useEffect } from 'react';
import { Course } from '../api/types/course';
import { isWorkingDay } from '../utils/holidays';

export const useClassDates = (
  startDateTime: string | undefined,
  courseId: number | null | undefined,
  courses: Course[]
) => {
  const [editedClassDates, setEditedClassDates] = useState<Date[]>([]);

  // Calculate proposed class dates based on course pattern and start date/time
  const proposedDates = useMemo(() => {
    if (!startDateTime || !courseId) return [];

    const selectedCourse = courses.find((c) => c.id === courseId);
    if (!selectedCourse) return [];

    // lessonLength is now a string (TIME), parse to minutes
    const parseTimeToMinutes = (time: string) => {
      if (!time) return 60;
      const [h, m] = time.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const lessonMinutes = parseTimeToMinutes(selectedCourse.lessonLength);
    const numberOfLessons = Math.ceil(selectedCourse.numberOfHours / lessonMinutes);
    const startDate = new Date(startDateTime);
    const dates: string[] = [];

    for (let i = 0; i < numberOfLessons; i++) {
      const lessonDate = new Date(startDate.getTime());
      
      if (selectedCourse.pattern === 'workdays') {
        // Add i days, skipping weekends and Polish holidays
        let daysToAdd = 0;
        let workdaysAdded = 0;
        
        while (workdaysAdded < i) {
          daysToAdd++;
          const tempDate = new Date(startDate.getTime());
          tempDate.setDate(tempDate.getDate() + daysToAdd);
          if (isWorkingDay(tempDate)) {
            workdaysAdded++;
          }
        }
        lessonDate.setDate(lessonDate.getDate() + daysToAdd);
      } else if (selectedCourse.pattern === 'weekly') {
        lessonDate.setDate(lessonDate.getDate() + (i * 7));
      }

      dates.push(lessonDate.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    }

    return dates;
  }, [startDateTime, courseId, courses]);

  // Generate Date objects for class creation
  const proposedClassDates = useMemo(() => {
    if (!startDateTime || !courseId) return [];

    const selectedCourse = courses.find((c) => c.id === courseId);
    if (!selectedCourse) return [];

    // lessonLength is now a string (TIME), parse to minutes
    const parseTimeToMinutes = (time: string) => {
      if (!time) return 60;
      const [h, m] = time.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    };
    const lessonMinutes = parseTimeToMinutes(selectedCourse.lessonLength);
    const numberOfLessons = Math.ceil(selectedCourse.numberOfHours / lessonMinutes);
    const startDate = new Date(startDateTime);
    const dateObjects: Date[] = [];

    for (let i = 0; i < numberOfLessons; i++) {
      const lessonDate = new Date(startDate.getTime());
      
      if (selectedCourse.pattern === 'workdays') {
        let daysToAdd = 0;
        let workdaysAdded = 0;
        
        while (workdaysAdded < i) {
          daysToAdd++;
          const tempDate = new Date(startDate.getTime());
          tempDate.setDate(tempDate.getDate() + daysToAdd);
          if (isWorkingDay(tempDate)) {
            workdaysAdded++;
          }
        }
        lessonDate.setDate(lessonDate.getDate() + daysToAdd);
      } else if (selectedCourse.pattern === 'weekly') {
        lessonDate.setDate(lessonDate.getDate() + (i * 7));
      }

      dateObjects.push(lessonDate);
    }

    return dateObjects;
  }, [startDateTime, courseId, courses]);

  // Update edited dates when proposed dates change
  useEffect(() => {
    setEditedClassDates(proposedClassDates);
  }, [proposedClassDates]);

  // Convert edited dates to ISO strings for API
  const finalClassDates = useMemo(() => {
    return editedClassDates.map((date) => date.toISOString());
  }, [editedClassDates]);

  const handleDateChange = (index: number, newDate: Date) => {
    const updatedDates = [...editedClassDates];
    updatedDates[index] = newDate;
    setEditedClassDates(updatedDates);
  };

  const handleDateRemove = (index: number) => {
    const updatedDates = editedClassDates.filter((_, i) => i !== index);
    setEditedClassDates(updatedDates);
  };

  return {
    proposedDates,
    editedClassDates,
    finalClassDates,
    handleDateChange,
    handleDateRemove,
  };
};
