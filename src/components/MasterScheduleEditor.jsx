import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  DUTCH_SCHOOL_SUBJECTS,
  DAYS,
  getDayName,
  getDayColorClass
} from '../utils/dutchSchoolDefaults'

function MasterScheduleEditor({ masterSchedule, onSave, onCancel }) {
  const [schedule, setSchedule] = useState(JSON.parse(JSON.stringify(masterSchedule)))
  const [currentWeek, setCurrentWeek] = useState('weekA')
  const [newSubject, setNewSubject] = useState('')

  // Initialize teachers if not exists
  const [teachers, setTeachers] = useState(masterSchedule.teachers || {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: ''
  })

  // Extract all unique subjects from current schedule
  const getAllSubjects = () => {
    const subjects = new Set()
    Object.keys(schedule.weeks).forEach(week => {
      DAYS.forEach(day => {
        schedule.weeks[week][day]?.slots.forEach(slot => {
          subjects.add(slot.subject)
        })
      })
    })
    return Array.from(subjects)
  }

  const [subjects, setSubjects] = useState(getAllSubjects())

  const handleAddSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()])
      setNewSubject('')
    }
  }

  const handleAddTimeSlot = (day) => {
    const newSlot = {
      id: uuidv4(),
      startTime: '09:00',
      endTime: '09:45',
      subject: subjects[0] || 'Rekenen',
      isBreak: false
    }

    setSchedule(prev => ({
      ...prev,
      weeks: {
        ...prev.weeks,
        [currentWeek]: {
          ...prev.weeks[currentWeek],
          [day]: {
            slots: [...(prev.weeks[currentWeek][day]?.slots || []), newSlot]
          }
        }
      }
    }))
  }

  const handleUpdateTimeSlot = (day, slotId, field, value) => {
    setSchedule(prev => ({
      ...prev,
      weeks: {
        ...prev.weeks,
        [currentWeek]: {
          ...prev.weeks[currentWeek],
          [day]: {
            slots: prev.weeks[currentWeek][day].slots.map(slot =>
              slot.id === slotId ? { ...slot, [field]: value } : slot
            )
          }
        }
      }
    }))
  }

  const handleRemoveTimeSlot = (day, slotId) => {
    setSchedule(prev => ({
      ...prev,
      weeks: {
        ...prev.weeks,
        [currentWeek]: {
          ...prev.weeks[currentWeek],
          [day]: {
            slots: prev.weeks[currentWeek][day].slots.filter(slot => slot.id !== slotId)
          }
        }
      }
    }))
  }

  const handleCopyWeekAToWeekB = () => {
    setSchedule(prev => ({
      ...prev,
      weeks: {
        ...prev.weeks,
        weekB: JSON.parse(JSON.stringify(prev.weeks.weekA))
      }
    }))
  }

  const handleSave = () => {
    const updatedSchedule = {
      ...schedule,
      teachers: teachers
    }
    onSave(updatedSchedule)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Stamrooster bewerken</h2>
          <div className="flex gap-2">
            <button onClick={onCancel} className="btn btn-secondary">
              Annuleren
            </button>
            <button onClick={handleSave} className="btn btn-success">
              Opslaan
            </button>
          </div>
        </div>

        {/* Week selector for biweekly */}
        {schedule.cycleType === 'biweekly' && (
          <div className="mb-6 flex gap-2">
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
                📋 Kopieer Week A naar Week B
              </button>
            )}
          </div>
        )}

        {/* Subject management */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <label className="label">Vakken beheren</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              className="input flex-1"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
              placeholder="Voeg een vak toe..."
            />
            <button onClick={handleAddSubject} className="btn btn-primary">
              Toevoegen
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {subjects.map(subject => (
              <span
                key={subject}
                className="px-3 py-1 bg-primary-100 text-primary-800 rounded-lg text-sm"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>

        {/* Teacher per dag */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <label className="label mb-3">Leerkracht per dag (duo-baan)</label>
          <p className="text-sm text-gray-600 mb-4">
            Bij een duo-baan kun je hier aangeven welke leerkracht op welke dag werkt.
          </p>
          <div className="grid grid-cols-5 gap-3">
            {DAYS.map(day => (
              <div key={day}>
                <label className="label text-xs">{getDayName(day, true)}</label>
                <input
                  type="text"
                  className="input text-sm py-1 px-2"
                  value={teachers[day]}
                  onChange={(e) => setTeachers({ ...teachers, [day]: e.target.value })}
                  placeholder="bijv. Juf Anna"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Schedule grid */}
        <div className="space-y-6">
          {DAYS.map(day => (
            <div key={day} className={`border-2 rounded-lg p-4 day-${day}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`${getDayColorClass(day)} px-3 py-1 rounded-lg font-semibold`}>
                    {getDayName(day, true)}
                  </span>
                  <h3 className="font-semibold text-lg">{getDayName(day)}</h3>
                </div>
                <button
                  onClick={() => handleAddTimeSlot(day)}
                  className="btn btn-primary text-sm"
                >
                  + Lesuur toevoegen
                </button>
              </div>

              <div className="space-y-2">
                {schedule.weeks[currentWeek][day]?.slots.map((slot, index) => (
                  <div key={slot.id} className="flex items-center gap-2 bg-gray-50 p-3 rounded">
                    <span className="text-sm font-medium w-8">{index + 1}.</span>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => handleUpdateTimeSlot(day, slot.id, 'startTime', e.target.value)}
                      className="input text-sm py-1 px-2"
                    />
                    <span className="text-gray-500">tot</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => handleUpdateTimeSlot(day, slot.id, 'endTime', e.target.value)}
                      className="input text-sm py-1 px-2"
                    />
                    <select
                      value={slot.subject}
                      onChange={(e) => handleUpdateTimeSlot(day, slot.id, 'subject', e.target.value)}
                      className="schedule-select text-sm py-1 px-2 flex-1"
                    >
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                    <label className="flex items-center text-sm whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={slot.isBreak}
                        onChange={(e) => handleUpdateTimeSlot(day, slot.id, 'isBreak', e.target.checked)}
                        className="mr-2"
                      />
                      Pauze
                    </label>
                    <button
                      onClick={() => handleRemoveTimeSlot(day, slot.id)}
                      className="text-red-600 hover:text-red-800 px-2 text-xl"
                      title="Verwijder"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {(!schedule.weeks[currentWeek][day]?.slots || schedule.weeks[currentWeek][day].slots.length === 0) && (
                  <p className="text-sm text-gray-500 italic py-2">Geen lesuren toegevoegd</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
          <button onClick={onCancel} className="btn btn-secondary">
            Annuleren
          </button>
          <button onClick={handleSave} className="btn btn-success">
            ✓ Opslaan
          </button>
        </div>
      </div>
    </div>
  )
}

export default MasterScheduleEditor
