import { v4 as uuidv4 } from 'uuid';
import { format, startOfWeek, addWeeks } from 'date-fns';
import { createDefaultMasterSchedule } from './dutchSchoolDefaults';
import mockCurriculumData from '../data/mockCurriculum.json';

/**
 * Genereer een compleet werkend demo scenario
 * Zodat bezoekers meteen kunnen zien hoe de app werkt
 */
export function generateDemoData() {
  // Demo settings
  const settings = {
    schoolName: 'De Springplank',
    teacherName: 'Juf Anna',
    groupName: 'Groep 4',
    schoolYear: '2024-2025'
  };

  // Demo master schedule met teachers
  const masterSchedule = createDefaultMasterSchedule(settings.schoolYear);
  masterSchedule.teachers = {
    monday: 'Juf Anna',
    tuesday: 'Juf Anna',
    wednesday: 'Meester Tom',
    thursday: 'Meester Tom',
    friday: 'Juf Anna'
  };

  // Demo progress tracker
  const progressTracker = {
    schoolYear: settings.schoolYear,
    group: settings.groupName,
    methodProgress: mockCurriculumData.teachingMethods.map(method => ({
      methodId: method.id,
      subject: method.subject,
      completedLessons: [],
      currentSequencePosition: 0
    }))
  };

  // Generate eerste week met realistische lessen
  const weekStartDate = startOfWeek(new Date(), { weekStartsOn: 1 });

  const firstWeek = {
    id: uuidv4(),
    weekNumber: 1,
    weekStartDate: format(weekStartDate, 'yyyy-MM-dd'),
    cycleWeek: 'A',
    scheduledLessons: generateDemoWeekLessons(masterSchedule),
    exceptions: [],
    status: 'active'
  };

  return {
    settings,
    masterSchedule,
    progressTracker,
    weeklySchedules: [firstWeek],
    currentWeekId: firstWeek.id
  };
}

/**
 * Genereer realistische lessen voor de demo week
 */
function generateDemoWeekLessons(masterSchedule) {
  const lessons = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  // Get teaching methods
  const rekenMethod = mockCurriculumData.teachingMethods.find(m => m.subject === 'Rekenen');
  const spellingMethod = mockCurriculumData.teachingMethods.find(m => m.subject === 'Spelling');
  const lezenMethod = mockCurriculumData.teachingMethods.find(m => m.subject === 'Technisch lezen');
  const bgLezenMethod = mockCurriculumData.teachingMethods.find(m => m.subject === 'Begrijpend lezen');

  days.forEach((day, dayIndex) => {
    const daySchedule = masterSchedule.weeks.weekA[day];

    daySchedule.slots.forEach(slot => {
      if (slot.isBreak) return; // Skip pauzes

      let lesson = null;

      // Match lessons to subjects
      if (slot.subject === 'Rekenen' && rekenMethod) {
        const lessonData = rekenMethod.groups[0].blocks[0].lessons[dayIndex % 3];
        lesson = {
          id: uuidv4(),
          day: day,
          slotId: slot.id,
          lessonId: lessonData.lessonId,
          methodId: rekenMethod.id,
          subject: 'Rekenen',
          lessonTitle: lessonData.title,
          lessonNumber: lessonData.lessonNumber,
          blockName: rekenMethod.groups[0].blocks[0].name,
          isBacklog: false,
          completed: false
        };
      }
      else if (slot.subject === 'Spelling' && spellingMethod) {
        const lessonData = spellingMethod.groups[0].blocks[0].lessons[dayIndex % 3];
        lesson = {
          id: uuidv4(),
          day: day,
          slotId: slot.id,
          lessonId: lessonData.lessonId,
          methodId: spellingMethod.id,
          subject: 'Spelling',
          lessonTitle: lessonData.title,
          lessonNumber: lessonData.lessonNumber,
          blockName: spellingMethod.groups[0].blocks[0].name,
          isBacklog: false,
          completed: false
        };
      }
      else if (slot.subject === 'Technisch lezen' && lezenMethod) {
        const lessonData = lezenMethod.groups[0].blocks[0].lessons[0];
        lesson = {
          id: uuidv4(),
          day: day,
          slotId: slot.id,
          lessonId: lessonData.lessonId,
          methodId: lezenMethod.id,
          subject: 'Technisch lezen',
          lessonTitle: lessonData.title,
          lessonNumber: lessonData.lessonNumber,
          blockName: lezenMethod.groups[0].blocks[0].name,
          isBacklog: false,
          completed: false
        };
      }
      else if (slot.subject === 'Begrijpend lezen' && bgLezenMethod) {
        const lessonData = bgLezenMethod.groups[0].blocks[0].lessons[0];
        lesson = {
          id: uuidv4(),
          day: day,
          slotId: slot.id,
          lessonId: lessonData.lessonId,
          methodId: bgLezenMethod.id,
          subject: 'Begrijpend lezen',
          lessonTitle: lessonData.title,
          lessonNumber: lessonData.lessonNumber,
          blockName: bgLezenMethod.groups[0].blocks[0].name,
          isBacklog: false,
          completed: false
        };
      }
      else {
        // Generic lesson voor andere vakken
        lesson = {
          id: uuidv4(),
          day: day,
          slotId: slot.id,
          lessonId: uuidv4(),
          methodId: 'generic',
          subject: slot.subject,
          lessonTitle: `${slot.subject} - Week 1`,
          lessonNumber: 1,
          blockName: 'Algemeen',
          isBacklog: false,
          completed: false
        };
      }

      if (lesson) {
        lessons.push(lesson);
      }
    });
  });

  return lessons;
}
