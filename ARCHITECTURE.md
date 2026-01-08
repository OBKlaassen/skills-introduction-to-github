# Smart Weekly Planner & Curriculum Tracker - Architecture

## Overview
This document describes the data architecture and core logic for the Smart Weekly Planner system for Dutch primary education (basisonderwijs).

## Data Schema

### 1. Master Schedule (Stamrooster)

```typescript
interface MasterSchedule {
  id: string;
  schoolYear: string;
  cycleType: "weekly" | "biweekly";
  weeks: {
    weekA: WeekSchedule;
    weekB?: WeekSchedule; // Only for biweekly cycles
  };
}

interface WeekSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
}

interface DaySchedule {
  slots: TimeSlot[];
}

interface TimeSlot {
  id: string;
  startTime: string; // "08:30"
  endTime: string;   // "09:15"
  subject: string;   // "Rekenen", "Taal", "Spelling", etc.
  isBreak: boolean;
}
```

### 2. Teaching Methods (Lesmethodes)

```typescript
interface TeachingMethod {
  id: string;
  name: string; // "Wereld in Getallen", "Staal"
  subject: string; // "Rekenen", "Spelling"
  groups: MethodGroup[];
}

interface MethodGroup {
  groupId: string; // "groep-4", "groep-5"
  blocks: Block[];
}

interface Block {
  blockId: string;
  blockNumber: number;
  name: string; // "Hoofdstuk 1: Getallen tot 100"
  lessons: Lesson[];
}

interface Lesson {
  lessonId: string;
  lessonNumber: number;
  sequenceOrder: number; // Global ordering across all blocks
  title: string;
  description?: string;
  estimatedDuration: number; // minutes
  materials?: string[];
}
```

### 3. Progress Tracking

```typescript
interface ProgressTracker {
  schoolYear: string;
  group: string;
  methodProgress: MethodProgress[];
}

interface MethodProgress {
  methodId: string;
  subject: string;
  completedLessons: CompletedLesson[];
  currentSequencePosition: number; // Last completed sequenceOrder
}

interface CompletedLesson {
  lessonId: string;
  completedDate: string; // ISO date
  weekNumber: number;
  notes?: string;
}
```

### 4. Weekly Schedule Instance

```typescript
interface WeeklyScheduleInstance {
  id: string;
  weekNumber: number;
  weekStartDate: string; // ISO date
  cycleWeek: "A" | "B" | null;
  scheduledLessons: ScheduledLesson[];
  exceptions: ScheduleException[];
  status: "draft" | "active" | "completed" | "evaluated";
}

interface ScheduledLesson {
  id: string;
  day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
  slotId: string; // References TimeSlot.id from master schedule
  lessonId: string;
  methodId: string;
  subject: string;
  lessonTitle: string;
  isBacklog: boolean; // True if from previous week's missed lessons
  completed: boolean;
}

interface ScheduleException {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  reason: string; // "School Trip", "Toetsweek", etc.
  affectedSlotIds: string[];
}
```

### 5. Weekly Evaluation

```typescript
interface WeeklyEvaluation {
  weeklyScheduleId: string;
  evaluationDate: string;
  completionCheck: {
    completedLessonIds: string[];
    missedLessonIds: string[];
  };
  extraProgress: {
    additionalCompletedLessonIds: string[];
  };
  nextWeekExceptions: ScheduleException[];
  notes?: string;
}
```

### 6. Application State

```typescript
interface AppState {
  masterSchedule: MasterSchedule;
  teachingMethods: TeachingMethod[];
  progressTracker: ProgressTracker;
  weeklySchedules: WeeklyScheduleInstance[];
  currentWeekId: string;
  settings: AppSettings;
}

interface AppSettings {
  schoolName: string;
  teacherName: string;
  groupName: string; // "Groep 4"
  schoolYear: string;
}
```

## Core Logic: Schedule Generation Algorithm

### Input
1. Master Schedule (template)
2. Progress Tracker (current position in curriculum)
3. Weekly Evaluation (backlog + exceptions)
4. Target week details (date, cycle week)

### Output
1. WeeklyScheduleInstance with all ScheduledLessons

### Algorithm Pseudocode

```
function generateNextWeekSchedule(
  masterSchedule,
  progressTracker,
  weeklyEvaluation,
  targetWeekNumber,
  targetWeekStartDate
) {
  // 1. Initialize new weekly schedule
  const newSchedule = {
    weekNumber: targetWeekNumber,
    weekStartDate: targetWeekStartDate,
    cycleWeek: determineCycleWeek(masterSchedule, targetWeekNumber),
    scheduledLessons: [],
    exceptions: weeklyEvaluation.nextWeekExceptions,
    status: "draft"
  };

  // 2. Get the template for this cycle week
  const templateWeek = masterSchedule.weeks[newSchedule.cycleWeek === "A" ? "weekA" : "weekB"];

  // 3. Identify available slots (exclude exceptions)
  const availableSlots = getAvailableSlots(templateWeek, newSchedule.exceptions);

  // 4. Group available slots by subject
  const slotsBySubject = groupSlotsBySubject(availableSlots);

  // 5. For each subject, fill slots with lessons
  for (const [subject, slots] of Object.entries(slotsBySubject)) {
    // 5a. Get backlog lessons for this subject (PRIORITY)
    const backlogLessons = getBacklogLessonsForSubject(
      weeklyEvaluation.completionCheck.missedLessonIds,
      subject
    );

    // 5b. Get next lessons from curriculum for this subject
    const nextLessons = getNextLessonsForSubject(
      progressTracker,
      subject,
      slots.length - backlogLessons.length
    );

    // 5c. Combine: backlog first, then next lessons
    const lessonsToSchedule = [...backlogLessons, ...nextLessons];

    // 5d. Assign lessons to slots
    slots.forEach((slot, index) => {
      if (index < lessonsToSchedule.length) {
        const lesson = lessonsToSchedule[index];
        newSchedule.scheduledLessons.push({
          id: generateId(),
          day: slot.day,
          slotId: slot.id,
          lessonId: lesson.lessonId,
          methodId: lesson.methodId,
          subject: subject,
          lessonTitle: lesson.title,
          isBacklog: index < backlogLessons.length,
          completed: false
        });
      }
    });
  }

  return newSchedule;
}

// Helper: Determine if it's week A or B based on cycle and week number
function determineCycleWeek(masterSchedule, weekNumber) {
  if (masterSchedule.cycleType === "weekly") return "A";
  return weekNumber % 2 === 0 ? "A" : "B";
}

// Helper: Get available slots excluding exceptions
function getAvailableSlots(templateWeek, exceptions) {
  const allSlots = [];

  for (const [day, daySchedule] of Object.entries(templateWeek)) {
    daySchedule.slots.forEach(slot => {
      // Check if this slot is blocked by an exception
      const isBlocked = exceptions.some(exception =>
        exception.day === day &&
        exception.affectedSlotIds.includes(slot.id)
      );

      if (!isBlocked && !slot.isBreak) {
        allSlots.push({ ...slot, day });
      }
    });
  }

  return allSlots;
}

// Helper: Group slots by subject
function groupSlotsBySubject(slots) {
  return slots.reduce((acc, slot) => {
    if (!acc[slot.subject]) acc[slot.subject] = [];
    acc[slot.subject].push(slot);
    return acc;
  }, {});
}

// Helper: Get backlog lessons for a specific subject
function getBacklogLessonsForSubject(missedLessonIds, subject) {
  return missedLessonIds
    .map(id => findLessonById(id))
    .filter(lesson => lesson.subject === subject);
}

// Helper: Get next lessons from curriculum
function getNextLessonsForSubject(progressTracker, subject, count) {
  const methodProgress = progressTracker.methodProgress.find(
    mp => mp.subject === subject
  );

  if (!methodProgress) return [];

  const nextSequenceStart = methodProgress.currentSequencePosition + 1;

  // Get lessons with sequenceOrder >= nextSequenceStart, sorted by sequenceOrder
  const availableLessons = getAllLessonsForMethod(methodProgress.methodId)
    .filter(lesson => lesson.sequenceOrder >= nextSequenceStart)
    .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
    .slice(0, count);

  return availableLessons;
}
```

## Data Flow

1. **Onboarding Phase**
   - Teacher creates Master Schedule
   - System loads Teaching Methods (with mock data)
   - Progress Tracker initialized at sequence position 0 for each method

2. **First Week Generation**
   - System generates Week 1 schedule using only "next lessons" (no backlog yet)
   - Teacher can manually adjust via drag-and-drop

3. **During the Week**
   - Schedule is "active"
   - Teacher can check off completed lessons in real-time (optional)

4. **End of Week - Evaluation**
   - Teacher enters Evaluation Mode
   - Q1: Review completion (creates backlog if needed)
   - Q2: Record extra progress (updates Progress Tracker)
   - Q3: Add exceptions for next week
   - Progress Tracker updated with new currentSequencePosition

5. **Next Week Generation**
   - Algorithm runs with backlog + next lessons
   - Teacher reviews and adjusts
   - Finalize schedule
   - Generate Weektaak
   - Export PDF

## Key Design Principles

1. **Separation of Concerns**
   - Master Schedule = Template/Pattern
   - Weekly Schedule Instance = Actual implementation
   - Progress Tracker = Curriculum position
   - Evaluation = Feedback mechanism

2. **Flexibility**
   - Manual override always possible
   - Drag-and-drop for adjustments
   - Teacher maintains control

3. **Sequencing Logic**
   - Curriculum lessons have global sequenceOrder
   - Progress Tracker knows current position
   - Algorithm always knows "what comes next"

4. **Priority System**
   - Backlog lessons always scheduled first
   - Ensures no lessons are permanently lost
   - New lessons fill remaining slots

5. **Exception Handling**
   - Exceptions block specific time slots
   - Algorithm works around them
   - Transparent to teacher
