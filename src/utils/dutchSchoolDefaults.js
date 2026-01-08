import { v4 as uuidv4 } from 'uuid';

/**
 * Nederlandse basisschool defaults
 * Gebaseerd op standaard continurooster praktijk
 */

// Uitgebreide vakkenlijst voor Nederlands basisonderwijs
export const DUTCH_SCHOOL_SUBJECTS = [
  'Rekenen',
  'Taal',
  'Spelling',
  'Technisch lezen',
  'Begrijpend lezen',
  'Stillezen',
  'Schrijven',
  'Woordenschat',
  'Begrijpend luisteren',
  'Engels',
  'Gym',
  'Beeldende vorming',
  'Muziek',
  'Drama',
  'Wereldoriëntatie',
  'Natuur & Techniek',
  'Geschiedenis',
  'Aardrijkskunde',
  'Verkeer',
  'Kanjertraining',
  'Sociale vaardigheden',
  'Godsdienst/Levensbeschouwing',
  'Computational thinking',
  'Mediawijsheid',
  'Weekopening',
  'Weeksluiting',
  'Kringgesprek',
  'Pauze',
  'Eten'
];

// Dag namen en kleuren
export const DAY_INFO = {
  monday: {
    name: 'Maandag',
    short: 'Ma',
    color: 'red',
    colorClass: 'day-monday-header'
  },
  tuesday: {
    name: 'Dinsdag',
    short: 'Di',
    color: 'blue',
    colorClass: 'day-tuesday-header'
  },
  wednesday: {
    name: 'Woensdag',
    short: 'Wo',
    color: 'yellow',
    colorClass: 'day-wednesday-header'
  },
  thursday: {
    name: 'Donderdag',
    short: 'Do',
    color: 'green',
    colorClass: 'day-thursday-header'
  },
  friday: {
    name: 'Vrijdag',
    short: 'Vr',
    color: 'orange',
    colorClass: 'day-friday-header'
  }
};

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

/**
 * Genereert een standaard Nederlands continurooster (08:30 - 14:15)
 * Met standaard pauzes
 */
export function generateDefaultContinurooster() {
  const defaultDaySchedule = {
    slots: [
      // Ochtend blok 1
      {
        id: uuidv4(),
        startTime: '08:30',
        endTime: '09:00',
        subject: 'Weekopening',
        isBreak: false
      },
      {
        id: uuidv4(),
        startTime: '09:00',
        endTime: '10:00',
        subject: 'Rekenen',
        isBreak: false
      },
      // Ochtendpauze
      {
        id: uuidv4(),
        startTime: '10:00',
        endTime: '10:15',
        subject: 'Pauze',
        isBreak: true
      },
      // Ochtend blok 2
      {
        id: uuidv4(),
        startTime: '10:15',
        endTime: '11:00',
        subject: 'Taal',
        isBreak: false
      },
      {
        id: uuidv4(),
        startTime: '11:00',
        endTime: '11:30',
        subject: 'Spelling',
        isBreak: false
      },
      {
        id: uuidv4(),
        startTime: '11:30',
        endTime: '12:00',
        subject: 'Technisch lezen',
        isBreak: false
      },
      // Middagpauze
      {
        id: uuidv4(),
        startTime: '12:00',
        endTime: '12:15',
        subject: 'Eten',
        isBreak: true
      },
      {
        id: uuidv4(),
        startTime: '12:15',
        endTime: '12:30',
        subject: 'Pauze',
        isBreak: true
      },
      // Middag blok
      {
        id: uuidv4(),
        startTime: '12:30',
        endTime: '13:15',
        subject: 'Begrijpend lezen',
        isBreak: false
      },
      {
        id: uuidv4(),
        startTime: '13:15',
        endTime: '14:00',
        subject: 'Wereldoriëntatie',
        isBreak: false
      },
      {
        id: uuidv4(),
        startTime: '14:00',
        endTime: '14:15',
        subject: 'Weeksluiting',
        isBreak: false
      }
    ]
  };

  // Specifieke aanpassingen per dag
  const schedule = {
    monday: JSON.parse(JSON.stringify(defaultDaySchedule)),
    tuesday: JSON.parse(JSON.stringify(defaultDaySchedule)),
    wednesday: JSON.parse(JSON.stringify(defaultDaySchedule)),
    thursday: JSON.parse(JSON.stringify(defaultDaySchedule)),
    friday: JSON.parse(JSON.stringify(defaultDaySchedule))
  };

  // Woensdag gym (vaak standaard)
  schedule.wednesday.slots[7] = {
    id: uuidv4(),
    startTime: '12:30',
    endTime: '13:30',
    subject: 'Gym',
    isBreak: false
  };

  // Vrijdag creatieve vakken
  schedule.friday.slots[7] = {
    id: uuidv4(),
    startTime: '12:30',
    endTime: '13:15',
    subject: 'Beeldende vorming',
    isBreak: false
  };
  schedule.friday.slots[8] = {
    id: uuidv4(),
    startTime: '13:15',
    endTime: '14:00',
    subject: 'Muziek',
    isBreak: false
  };

  return schedule;
}

/**
 * Default master schedule met Nederlandse continurooster
 */
export function createDefaultMasterSchedule(schoolYear) {
  return {
    id: uuidv4(),
    schoolYear: schoolYear,
    cycleType: 'weekly',
    teachers: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: ''
    },
    weeks: {
      weekA: generateDefaultContinurooster()
    }
  };
}

/**
 * Helper functie om dag kleur te krijgen
 */
export function getDayColorClass(day) {
  return DAY_INFO[day]?.colorClass || 'bg-gray-500';
}

/**
 * Helper functie om dag naam te krijgen
 */
export function getDayName(day, short = false) {
  return short ? DAY_INFO[day]?.short : DAY_INFO[day]?.name;
}
