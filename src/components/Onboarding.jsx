import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const DAY_NAMES = {
  monday: 'Maandag',
  tuesday: 'Dinsdag',
  wednesday: 'Woensdag',
  thursday: 'Donderdag',
  friday: 'Vrijdag'
}

const DEFAULT_SUBJECTS = [
  'Rekenen',
  'Spelling',
  'Technisch lezen',
  'Begrijpend lezen',
  'Schrijven',
  'Gym',
  'Pauze',
  'Eten'
]

function Onboarding({ teachingMethods, onComplete }) {
  const [step, setStep] = useState(1)

  // Step 1: Basic settings
  const [settings, setSettings] = useState({
    schoolName: '',
    teacherName: '',
    groupName: 'Groep 4',
    schoolYear: '2025-2026'
  })

  // Step 2: Master schedule setup
  const [cycleType, setCycleType] = useState('weekly')
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS)
  const [newSubject, setNewSubject] = useState('')

  // Step 3: Time slots configuration
  const [currentWeek, setCurrentWeek] = useState('weekA')
  const [schedules, setSchedules] = useState({
    weekA: {
      monday: { slots: [] },
      tuesday: { slots: [] },
      wednesday: { slots: [] },
      thursday: { slots: [] },
      friday: { slots: [] }
    },
    weekB: {
      monday: { slots: [] },
      tuesday: { slots: [] },
      wednesday: { slots: [] },
      thursday: { slots: [] },
      friday: { slots: [] }
    }
  })

  const handleAddSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()])
      setNewSubject('')
    }
  }

  const handleRemoveSubject = (subject) => {
    setSubjects(subjects.filter(s => s !== subject))
  }

  const handleAddTimeSlot = (day) => {
    const newSlot = {
      id: uuidv4(),
      startTime: '09:00',
      endTime: '09:45',
      subject: subjects[0],
      isBreak: false
    }

    setSchedules(prev => ({
      ...prev,
      [currentWeek]: {
        ...prev[currentWeek],
        [day]: {
          slots: [...prev[currentWeek][day].slots, newSlot]
        }
      }
    }))
  }

  const handleUpdateTimeSlot = (day, slotId, field, value) => {
    setSchedules(prev => ({
      ...prev,
      [currentWeek]: {
        ...prev[currentWeek],
        [day]: {
          slots: prev[currentWeek][day].slots.map(slot =>
            slot.id === slotId ? { ...slot, [field]: value } : slot
          )
        }
      }
    }))
  }

  const handleRemoveTimeSlot = (day, slotId) => {
    setSchedules(prev => ({
      ...prev,
      [currentWeek]: {
        ...prev[currentWeek],
        [day]: {
          slots: prev[currentWeek][day].slots.filter(slot => slot.id !== slotId)
        }
      }
    }))
  }

  const handleCopyWeekAToWeekB = () => {
    setSchedules(prev => ({
      ...prev,
      weekB: JSON.parse(JSON.stringify(prev.weekA))
    }))
  }

  const handleComplete = () => {
    const masterSchedule = {
      id: uuidv4(),
      schoolYear: settings.schoolYear,
      cycleType: cycleType,
      weeks: {
        weekA: schedules.weekA,
        ...(cycleType === 'biweekly' ? { weekB: schedules.weekB } : {})
      }
    }

    onComplete({
      settings,
      masterSchedule
    })
  }

  const canProceedStep1 = settings.schoolName && settings.teacherName && settings.groupName
  const canProceedStep2 = subjects.length > 0
  const canProceedStep3 = () => {
    const hasSlots = DAYS.some(day => schedules.weekA[day].slots.length > 0)
    if (cycleType === 'biweekly') {
      const hasSlotsWeekB = DAYS.some(day => schedules.weekB[day].slots.length > 0)
      return hasSlots && hasSlotsWeekB
    }
    return hasSlots
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= stepNum ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div className={`flex-1 h-1 mx-2 ${
                  step > stepNum ? 'bg-primary-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className={step >= 1 ? 'text-primary-600 font-medium' : 'text-gray-600'}>
            Basisgegevens
          </span>
          <span className={step >= 2 ? 'text-primary-600 font-medium' : 'text-gray-600'}>
            Vakken
          </span>
          <span className={step >= 3 ? 'text-primary-600 font-medium' : 'text-gray-600'}>
            Stamrooster
          </span>
        </div>
      </div>

      {/* Step 1: Basic Settings */}
      {step === 1 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Welkom bij Smart Weekly Planner!</h2>
          <p className="text-gray-600 mb-6">
            Laten we beginnen met het instellen van je basisgegevens.
          </p>

          <div className="space-y-4">
            <div>
              <label className="label">Schoolnaam</label>
              <input
                type="text"
                className="input"
                value={settings.schoolName}
                onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                placeholder="Bijv: De Springplank"
              />
            </div>

            <div>
              <label className="label">Naam leerkracht</label>
              <input
                type="text"
                className="input"
                value={settings.teacherName}
                onChange={(e) => setSettings({ ...settings, teacherName: e.target.value })}
                placeholder="Bijv: Juf Anna"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Groep</label>
                <select
                  className="input"
                  value={settings.groupName}
                  onChange={(e) => setSettings({ ...settings, groupName: e.target.value })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={`Groep ${num}`}>Groep {num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Schooljaar</label>
                <input
                  type="text"
                  className="input"
                  value={settings.schoolYear}
                  onChange={(e) => setSettings({ ...settings, schoolYear: e.target.value })}
                  placeholder="2025-2026"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Volgende →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Subjects & Cycle */}
      {step === 2 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Vakken en roostercyclus</h2>

          <div className="mb-6">
            <label className="label">Roostercyclus</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="weekly"
                  checked={cycleType === 'weekly'}
                  onChange={(e) => setCycleType(e.target.value)}
                  className="mr-2"
                />
                <span>Wekelijks (1 week herhalend)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="biweekly"
                  checked={cycleType === 'biweekly'}
                  onChange={(e) => setCycleType(e.target.value)}
                  className="mr-2"
                />
                <span>Tweewekelijks (A/B weken)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="label">Vakken in je rooster</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                className="input flex-1"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                placeholder="Voeg een vak toe..."
              />
              <button
                onClick={handleAddSubject}
                className="btn btn-primary"
              >
                Toevoegen
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {subjects.map(subject => (
                <div
                  key={subject}
                  className="flex items-center gap-2 px-3 py-2 bg-primary-100 text-primary-800 rounded-lg"
                >
                  <span>{subject}</span>
                  <button
                    onClick={() => handleRemoveSubject(subject)}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(1)} className="btn btn-secondary">
              ← Vorige
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Volgende →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Master Schedule */}
      {step === 3 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Stamrooster opzetten</h2>

          {cycleType === 'biweekly' && (
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setCurrentWeek('weekA')}
                className={`btn ${currentWeek === 'weekA' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Week A
              </button>
              <button
                onClick={() => setCurrentWeek('weekB')}
                className={`btn ${currentWeek === 'weekB' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Week B
              </button>
              {currentWeek === 'weekB' && (
                <button
                  onClick={handleCopyWeekAToWeekB}
                  className="btn btn-secondary ml-auto"
                >
                  Kopieer Week A naar Week B
                </button>
              )}
            </div>
          )}

          <div className="space-y-6">
            {DAYS.map(day => (
              <div key={day} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{DAY_NAMES[day]}</h3>
                  <button
                    onClick={() => handleAddTimeSlot(day)}
                    className="btn btn-primary btn-sm text-sm"
                  >
                    + Lesuur toevoegen
                  </button>
                </div>

                <div className="space-y-2">
                  {schedules[currentWeek][day].slots.map((slot, index) => (
                    <div key={slot.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                      <span className="text-sm font-medium w-8">{index + 1}.</span>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleUpdateTimeSlot(day, slot.id, 'startTime', e.target.value)}
                        className="input text-sm py-1"
                      />
                      <span>-</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleUpdateTimeSlot(day, slot.id, 'endTime', e.target.value)}
                        className="input text-sm py-1"
                      />
                      <select
                        value={slot.subject}
                        onChange={(e) => handleUpdateTimeSlot(day, slot.id, 'subject', e.target.value)}
                        className="input text-sm py-1 flex-1"
                      >
                        {subjects.map(subject => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={slot.isBreak}
                          onChange={(e) => handleUpdateTimeSlot(day, slot.id, 'isBreak', e.target.checked)}
                          className="mr-1"
                        />
                        Pauze
                      </label>
                      <button
                        onClick={() => handleRemoveTimeSlot(day, slot.id)}
                        className="text-red-600 hover:text-red-800 px-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {schedules[currentWeek][day].slots.length === 0 && (
                    <p className="text-sm text-gray-500 italic">Geen lesuren toegevoegd</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={() => setStep(2)} className="btn btn-secondary">
              ← Vorige
            </button>
            <button
              onClick={handleComplete}
              disabled={!canProceedStep3()}
              className="btn btn-success disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Voltooien en starten →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Onboarding
