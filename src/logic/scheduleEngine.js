/**
 * Smart Weekly Planner - Core Scheduling Engine
 *
 * This module contains the core algorithm for generating weekly schedules
 * based on master schedule templates, curriculum progress, and weekly evaluations.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Main function to generate next week's schedule
 *
 * @param {Object} masterSchedule - The master schedule template
 * @param {Array} teachingMethods - All available teaching methods
 * @param {Object} progressTracker - Current curriculum progress
 * @param {Object} weeklyEvaluation - Previous week's evaluation (optional for first week)
 * @param {number} targetWeekNumber - Week number to generate
 * @param {string} targetWeekStartDate - ISO date string for week start
 * @returns {Object} WeeklyScheduleInstance
 */
export function generateNextWeekSchedule(
  masterSchedule,
  teachingMethods,
  progressTracker,
  weeklyEvaluation = null,
  targetWeekNumber,
  targetWeekStartDate
) {
  // 1. Initialize new weekly schedule
  const cycleWeek = determineCycleWeek(masterSchedule, targetWeekNumber);

  const newSchedule = {
    id: uuidv4(),
    weekNumber: targetWeekNumber,
    weekStartDate: targetWeekStartDate,
    cycleWeek: cycleWeek,
    scheduledLessons: [],
    exceptions: weeklyEvaluation?.nextWeekExceptions || [],
    status: 'draft'
  };

  // 2. Get the template for this cycle week
  const templateWeek = cycleWeek === 'A'
    ? masterSchedule.weeks.weekA
    : (masterSchedule.weeks.weekB || masterSchedule.weeks.weekA);

  // 3. Identify available slots (exclude exceptions and breaks)
  const availableSlots = getAvailableSlots(templateWeek, newSchedule.exceptions);

  // 4. Group available slots by subject
  const slotsBySubject = groupSlotsBySubject(availableSlots);

  // 5. For each subject, fill slots with lessons
  for (const [subject, slots] of Object.entries(slotsBySubject)) {
    // 5a. Get backlog lessons for this subject (PRIORITY)
    const backlogLessons = weeklyEvaluation
      ? getBacklogLessonsForSubject(
          weeklyEvaluation.completionCheck.missedLessonIds,
          subject,
          teachingMethods
        )
      : [];

    // 5b. Get next lessons from curriculum for this subject
    const nextLessons = getNextLessonsForSubject(
      progressTracker,
      teachingMethods,
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
          id: uuidv4(),
          day: slot.day,
          slotId: slot.id,
          lessonId: lesson.lessonId,
          methodId: lesson.methodId,
          subject: subject,
          lessonTitle: lesson.title,
          lessonNumber: lesson.lessonNumber,
          blockName: lesson.blockName,
          isBacklog: index < backlogLessons.length,
          completed: false
        });
      }
    });
  }

  return newSchedule;
}

/**
 * Determine if it's week A or B based on cycle type and week number
 *
 * @param {Object} masterSchedule
 * @param {number} weekNumber
 * @returns {string} 'A' or 'B'
 */
function determineCycleWeek(masterSchedule, weekNumber) {
  if (masterSchedule.cycleType === 'weekly') {
    return 'A';
  }
  // For biweekly: odd weeks = A, even weeks = B
  return weekNumber % 2 === 1 ? 'A' : 'B';
}

/**
 * Get available slots excluding exceptions and breaks
 *
 * @param {Object} templateWeek - Week schedule template
 * @param {Array} exceptions - Schedule exceptions
 * @returns {Array} Available time slots with day information
 */
function getAvailableSlots(templateWeek, exceptions) {
  const allSlots = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  days.forEach(day => {
    const daySchedule = templateWeek[day];
    if (!daySchedule || !daySchedule.slots) return;

    daySchedule.slots.forEach(slot => {
      // Skip breaks
      if (slot.isBreak) return;

      // Check if this slot is blocked by an exception
      const isBlocked = exceptions.some(exception =>
        exception.day === day &&
        exception.affectedSlotIds.includes(slot.id)
      );

      if (!isBlocked) {
        allSlots.push({
          ...slot,
          day
        });
      }
    });
  });

  return allSlots;
}

/**
 * Group slots by subject
 *
 * @param {Array} slots
 * @returns {Object} Slots grouped by subject name
 */
function groupSlotsBySubject(slots) {
  return slots.reduce((acc, slot) => {
    if (!acc[slot.subject]) {
      acc[slot.subject] = [];
    }
    acc[slot.subject].push(slot);
    return acc;
  }, {});
}

/**
 * Get backlog lessons for a specific subject
 *
 * @param {Array} missedLessonIds
 * @param {string} subject
 * @param {Array} teachingMethods
 * @returns {Array} Backlog lessons with full details
 */
function getBacklogLessonsForSubject(missedLessonIds, subject, teachingMethods) {
  const backlogLessons = [];

  missedLessonIds.forEach(lessonId => {
    const lesson = findLessonById(lessonId, teachingMethods);
    if (lesson && lesson.subject === subject) {
      backlogLessons.push(lesson);
    }
  });

  // Sort by sequence order to maintain proper lesson order
  return backlogLessons.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
}

/**
 * Get next lessons from curriculum for a specific subject
 *
 * @param {Object} progressTracker
 * @param {Array} teachingMethods
 * @param {string} subject
 * @param {number} count - Number of lessons needed
 * @returns {Array} Next lessons in sequence
 */
function getNextLessonsForSubject(progressTracker, teachingMethods, subject, count) {
  if (count <= 0) return [];

  // Find the method progress for this subject
  const methodProgress = progressTracker.methodProgress.find(
    mp => mp.subject === subject
  );

  if (!methodProgress) return [];

  // Find the teaching method
  const method = teachingMethods.find(m => m.id === methodProgress.methodId);
  if (!method) return [];

  // Get all lessons from this method
  const allLessons = getAllLessonsFromMethod(method);

  // Find next lessons based on current sequence position
  const nextSequenceStart = methodProgress.currentSequencePosition + 1;

  const nextLessons = allLessons
    .filter(lesson => lesson.sequenceOrder >= nextSequenceStart)
    .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
    .slice(0, count);

  return nextLessons;
}

/**
 * Find a lesson by ID across all teaching methods
 *
 * @param {string} lessonId
 * @param {Array} teachingMethods
 * @returns {Object|null} Lesson object with enriched data
 */
function findLessonById(lessonId, teachingMethods) {
  for (const method of teachingMethods) {
    for (const group of method.groups) {
      for (const block of group.blocks) {
        const lesson = block.lessons.find(l => l.lessonId === lessonId);
        if (lesson) {
          return {
            ...lesson,
            methodId: method.id,
            methodName: method.name,
            subject: method.subject,
            blockName: block.name
          };
        }
      }
    }
  }
  return null;
}

/**
 * Get all lessons from a teaching method in sequence order
 *
 * @param {Object} method
 * @returns {Array} All lessons with enriched data
 */
function getAllLessonsFromMethod(method) {
  const allLessons = [];

  method.groups.forEach(group => {
    group.blocks.forEach(block => {
      block.lessons.forEach(lesson => {
        allLessons.push({
          ...lesson,
          methodId: method.id,
          methodName: method.name,
          subject: method.subject,
          blockName: block.name
        });
      });
    });
  });

  return allLessons.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
}

/**
 * Process weekly evaluation and update progress tracker
 *
 * @param {Object} progressTracker
 * @param {Object} weeklyEvaluation
 * @param {Array} teachingMethods
 * @returns {Object} Updated progress tracker
 */
export function updateProgressFromEvaluation(progressTracker, weeklyEvaluation, teachingMethods) {
  const updatedTracker = JSON.parse(JSON.stringify(progressTracker));

  // Get all completed lesson IDs (from checklist + extra progress)
  const allCompletedIds = [
    ...weeklyEvaluation.completionCheck.completedLessonIds,
    ...weeklyEvaluation.extraProgress.additionalCompletedLessonIds
  ];

  // Update progress for each completed lesson
  allCompletedIds.forEach(lessonId => {
    const lesson = findLessonById(lessonId, teachingMethods);
    if (!lesson) return;

    // Find or create method progress
    let methodProgress = updatedTracker.methodProgress.find(
      mp => mp.methodId === lesson.methodId
    );

    if (!methodProgress) {
      methodProgress = {
        methodId: lesson.methodId,
        subject: lesson.subject,
        completedLessons: [],
        currentSequencePosition: 0
      };
      updatedTracker.methodProgress.push(methodProgress);
    }

    // Add to completed lessons if not already there
    const alreadyCompleted = methodProgress.completedLessons.some(
      cl => cl.lessonId === lessonId
    );

    if (!alreadyCompleted) {
      methodProgress.completedLessons.push({
        lessonId: lessonId,
        completedDate: weeklyEvaluation.evaluationDate,
        weekNumber: weeklyEvaluation.weekNumber,
        notes: ''
      });

      // Update sequence position if this lesson is further along
      if (lesson.sequenceOrder > methodProgress.currentSequencePosition) {
        methodProgress.currentSequencePosition = lesson.sequenceOrder;
      }
    }
  });

  return updatedTracker;
}

/**
 * Generate Weektaak (weekly task list) from schedule
 *
 * @param {Object} weeklySchedule
 * @returns {Object} Weektaak grouped by subject
 */
export function generateWeektaak(weeklySchedule) {
  const weektaak = {};

  weeklySchedule.scheduledLessons.forEach(scheduledLesson => {
    if (!weektaak[scheduledLesson.subject]) {
      weektaak[scheduledLesson.subject] = [];
    }

    // Find if this lesson already exists in the weektaak
    const existingTask = weektaak[scheduledLesson.subject].find(
      task => task.lessonId === scheduledLesson.lessonId
    );

    if (!existingTask) {
      weektaak[scheduledLesson.subject].push({
        lessonId: scheduledLesson.lessonId,
        lessonTitle: scheduledLesson.lessonTitle,
        blockName: scheduledLesson.blockName,
        lessonNumber: scheduledLesson.lessonNumber,
        isBacklog: scheduledLesson.isBacklog,
        days: [scheduledLesson.day]
      });
    } else {
      // Add day if lesson is scheduled multiple times
      if (!existingTask.days.includes(scheduledLesson.day)) {
        existingTask.days.push(scheduledLesson.day);
      }
    }
  });

  return weektaak;
}

/**
 * Validate that a lesson can be moved to a specific slot
 *
 * @param {Object} lesson
 * @param {Object} slot
 * @returns {boolean} True if move is valid
 */
export function validateLessonMove(lesson, slot) {
  // Check if subjects match
  if (lesson.subject !== slot.subject) {
    return false;
  }

  // Check if slot is not a break
  if (slot.isBreak) {
    return false;
  }

  // Additional validation rules can be added here
  // e.g., duration constraints, dependencies, etc.

  return true;
}

/**
 * Initialize progress tracker for new year
 *
 * @param {string} schoolYear
 * @param {string} group
 * @param {Array} teachingMethods
 * @returns {Object} New progress tracker
 */
export function initializeProgressTracker(schoolYear, group, teachingMethods) {
  return {
    schoolYear,
    group,
    methodProgress: teachingMethods.map(method => ({
      methodId: method.id,
      subject: method.subject,
      completedLessons: [],
      currentSequencePosition: 0
    }))
  };
}

/**
 * Get schedule statistics
 *
 * @param {Object} weeklySchedule
 * @returns {Object} Statistics about the schedule
 */
export function getScheduleStats(weeklySchedule) {
  const stats = {
    totalLessons: weeklySchedule.scheduledLessons.length,
    backlogLessons: weeklySchedule.scheduledLessons.filter(l => l.isBacklog).length,
    newLessons: weeklySchedule.scheduledLessons.filter(l => !l.isBacklog).length,
    completedLessons: weeklySchedule.scheduledLessons.filter(l => l.completed).length,
    bySubject: {}
  };

  weeklySchedule.scheduledLessons.forEach(lesson => {
    if (!stats.bySubject[lesson.subject]) {
      stats.bySubject[lesson.subject] = {
        total: 0,
        backlog: 0,
        new: 0,
        completed: 0
      };
    }

    stats.bySubject[lesson.subject].total++;
    if (lesson.isBacklog) stats.bySubject[lesson.subject].backlog++;
    if (!lesson.isBacklog) stats.bySubject[lesson.subject].new++;
    if (lesson.completed) stats.bySubject[lesson.subject].completed++;
  });

  return stats;
}

// Named exports for direct imports
export {
  generateNextWeekSchedule,
  updateProgressFromEvaluation,
  generateWeektaak,
  validateLessonMove,
  initializeProgressTracker,
  getScheduleStats,
  findLessonById,
  getAllLessonsFromMethod
};

// Default export for convenience
export default {
  generateNextWeekSchedule,
  updateProgressFromEvaluation,
  generateWeektaak,
  validateLessonMove,
  initializeProgressTracker,
  getScheduleStats,
  findLessonById,
  getAllLessonsFromMethod
};
