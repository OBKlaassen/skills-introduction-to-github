import { useState } from 'react'
import { format, addWeeks } from 'date-fns'
import { nl } from 'date-fns/locale'
import { v4 as uuidv4 } from 'uuid'
import {
  generateNextWeekSchedule,
  updateProgressFromEvaluation,
  getAllLessonsFromMethod,
  findLessonById
} from '../logic/scheduleEngine'

function EvaluationWizard({
  weeklySchedule,
  teachingMethods,
  progressTracker,
  masterSchedule,
  onComplete,
  onCancel
}) {
  const [step, setStep] = useState(1)

  // Step 1: Completion check
  const [completedLessonIds, setCompletedLessonIds] = useState(
    weeklySchedule.scheduledLessons.filter(l => l.completed).map(l => l.lessonId)
  )

  // Step 2: Extra progress
  const [extraLessonIds, setExtraLessonIds] = useState([])

  // Step 3: Next week exceptions
  const [exceptions, setExceptions] = useState([])
  const [newException, setNewException] = useState({
    day: 'monday',
    startTime: '09:00',
    endTime: '12:00',
    reason: ''
  })

  const DAY_NAMES = {
    monday: 'Maandag',
    tuesday: 'Dinsdag',
    wednesday: 'Woensdag',
    thursday: 'Donderdag',
    friday: 'Vrijdag'
  }

  // Get missed lessons (scheduled but not completed)
  const getMissedLessons = () => {
    return weeklySchedule.scheduledLessons.filter(
      lesson => !completedLessonIds.includes(lesson.lessonId)
    )
  }

  // Get next available lessons for extra progress
  const getNextAvailableLessons = (subject) => {
    const methodProgress = progressTracker.methodProgress.find(
      mp => mp.subject === subject
    )
    if (!methodProgress) return []

    const method = teachingMethods.find(m => m.id === methodProgress.methodId)
    if (!method) return []

    const allLessons = getAllLessonsFromMethod(method)

    // Find all completed + currently selected extra lessons
    const allCompletedIds = new Set([
      ...methodProgress.completedLessons.map(l => l.lessonId),
      ...completedLessonIds,
      ...extraLessonIds
    ])

    // Get next lessons that haven't been completed yet
    return allLessons
      .filter(lesson => !allCompletedIds.has(lesson.lessonId))
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
      .slice(0, 10) // Show max 10 next lessons
  }

  // Get all unique subjects from current schedule
  const getSubjects = () => {
    const subjects = new Set(weeklySchedule.scheduledLessons.map(l => l.subject))
    return Array.from(subjects)
  }

  // Toggle lesson completion
  const toggleLessonCompletion = (lessonId) => {
    if (completedLessonIds.includes(lessonId)) {
      setCompletedLessonIds(completedLessonIds.filter(id => id !== lessonId))
    } else {
      setCompletedLessonIds([...completedLessonIds, lessonId])
    }
  }

  // Toggle extra lesson
  const toggleExtraLesson = (lessonId) => {
    if (extraLessonIds.includes(lessonId)) {
      setExtraLessonIds(extraLessonIds.filter(id => id !== lessonId))
    } else {
      setExtraLessonIds([...extraLessonIds, lessonId])
    }
  }

  // Add exception
  const handleAddException = () => {
    if (!newException.reason.trim()) {
      alert('Voer een reden in voor de uitzondering')
      return
    }

    // Find affected slot IDs
    const week = weeklySchedule.cycleWeek === 'A' ? 'weekA' : 'weekB'
    const daySlots = masterSchedule.weeks[week][newException.day]?.slots || []

    const affectedSlotIds = daySlots
      .filter(slot => {
        return slot.startTime >= newException.startTime &&
               slot.endTime <= newException.endTime
      })
      .map(slot => slot.id)

    const exception = {
      id: uuidv4(),
      day: newException.day,
      startTime: newException.startTime,
      endTime: newException.endTime,
      reason: newException.reason,
      affectedSlotIds
    }

    setExceptions([...exceptions, exception])
    setNewException({
      day: 'monday',
      startTime: '09:00',
      endTime: '12:00',
      reason: ''
    })
  }

  // Remove exception
  const handleRemoveException = (exceptionId) => {
    setExceptions(exceptions.filter(e => e.id !== exceptionId))
  }

  // Complete evaluation and generate next week
  const handleComplete = () => {
    // Create evaluation object
    const evaluation = {
      weeklyScheduleId: weeklySchedule.id,
      weekNumber: weeklySchedule.weekNumber,
      evaluationDate: new Date().toISOString(),
      completionCheck: {
        completedLessonIds,
        missedLessonIds: getMissedLessons().map(l => l.lessonId)
      },
      extraProgress: {
        additionalCompletedLessonIds: extraLessonIds
      },
      nextWeekExceptions: exceptions
    }

    // Update progress tracker
    const updatedProgress = updateProgressFromEvaluation(
      progressTracker,
      evaluation,
      teachingMethods
    )

    // Generate next week schedule
    const nextWeekNumber = weeklySchedule.weekNumber + 1
    const nextWeekStartDate = addWeeks(
      new Date(weeklySchedule.weekStartDate),
      1
    )

    const nextWeekSchedule = generateNextWeekSchedule(
      masterSchedule,
      teachingMethods,
      updatedProgress,
      evaluation,
      nextWeekNumber,
      format(nextWeekStartDate, 'yyyy-MM-dd')
    )

    nextWeekSchedule.status = 'draft'

    // Call completion handler
    onComplete(evaluation, nextWeekSchedule, updatedProgress)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            Week {weeklySchedule.weekNumber} evalueren
          </h2>
          <p className="text-gray-600 mt-1">
            {format(new Date(weeklySchedule.weekStartDate), 'dd MMMM yyyy', { locale: nl })}
          </p>
        </div>

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
              Voltooiing
            </span>
            <span className={step >= 2 ? 'text-primary-600 font-medium' : 'text-gray-600'}>
              Extra voortgang
            </span>
            <span className={step >= 3 ? 'text-primary-600 font-medium' : 'text-gray-600'}>
              Uitzonderingen
            </span>
          </div>
        </div>

        {/* Step 1: Completion Check */}
        {step === 1 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Stap 1: Welke lessen zijn voltooid?
            </h3>
            <p className="text-gray-600 mb-6">
              Vink alle lessen aan die je deze week hebt gegeven.
              Niet-aangevinkte lessen gaan naar de backlog.
            </p>

            <div className="space-y-3">
              {weeklySchedule.scheduledLessons.map(lesson => (
                <label
                  key={lesson.id}
                  className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={completedLessonIds.includes(lesson.lessonId)}
                    onChange={() => toggleLessonCompletion(lesson.lessonId)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{lesson.lessonTitle}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {lesson.subject} • {lesson.blockName}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {DAY_NAMES[lesson.day]}
                    </div>
                  </div>
                  {lesson.isBacklog && (
                    <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                      Was backlog
                    </span>
                  )}
                </label>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-900">
                  ✓ Voltooid: {completedLessonIds.length} lessen
                </span>
                <span className="font-medium text-orange-900">
                  → Backlog: {getMissedLessons().length} lessen
                </span>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={onCancel} className="btn btn-secondary">
                Annuleren
              </button>
              <button onClick={() => setStep(2)} className="btn btn-primary">
                Volgende →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Extra Progress */}
        {step === 2 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Stap 2: Extra lessen gegeven?
            </h3>
            <p className="text-gray-600 mb-6">
              Heb je extra lessen gegeven die niet in het rooster stonden?
              Selecteer ze hieronder.
            </p>

            {getSubjects().map(subject => {
              const nextLessons = getNextAvailableLessons(subject)
              if (nextLessons.length === 0) return null

              return (
                <div key={subject} className="mb-6">
                  <h4 className="font-semibold text-lg mb-3 text-primary-700">
                    {subject}
                  </h4>
                  <div className="space-y-2">
                    {nextLessons.map(lesson => (
                      <label
                        key={lesson.lessonId}
                        className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={extraLessonIds.includes(lesson.lessonId)}
                          onChange={() => toggleExtraLesson(lesson.lessonId)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{lesson.title}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {lesson.blockName} • Les {lesson.lessonNumber}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}

            {extraLessonIds.length === 0 && (
              <p className="text-center text-gray-500 italic py-8">
                Geen extra lessen geselecteerd
              </p>
            )}

            {extraLessonIds.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900">
                  ✓ {extraLessonIds.length} extra {extraLessonIds.length === 1 ? 'les' : 'lessen'} toegevoegd
                </span>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="btn btn-secondary">
                ← Vorige
              </button>
              <button onClick={() => setStep(3)} className="btn btn-primary">
                Volgende →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Next Week Exceptions */}
        {step === 3 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Stap 3: Uitzonderingen volgende week?
            </h3>
            <p className="text-gray-600 mb-6">
              Zijn er speciale activiteiten volgende week die roosteruren blokkeren?
              (Bijv. schoolreis, toetsweek, excursie)
            </p>

            {/* Add exception form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="label">Dag</label>
                  <select
                    value={newException.day}
                    onChange={(e) => setNewException({ ...newException, day: e.target.value })}
                    className="input"
                  >
                    {Object.entries(DAY_NAMES).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Reden</label>
                  <input
                    type="text"
                    value={newException.reason}
                    onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
                    className="input"
                    placeholder="Bijv: Schoolreis"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="label">Van</label>
                  <input
                    type="time"
                    value={newException.startTime}
                    onChange={(e) => setNewException({ ...newException, startTime: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Tot</label>
                  <input
                    type="time"
                    value={newException.endTime}
                    onChange={(e) => setNewException({ ...newException, endTime: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              <button
                onClick={handleAddException}
                className="btn btn-primary w-full"
              >
                + Uitzondering toevoegen
              </button>
            </div>

            {/* Exceptions list */}
            {exceptions.length > 0 && (
              <div className="space-y-2 mb-4">
                {exceptions.map(exception => (
                  <div
                    key={exception.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{exception.reason}</div>
                      <div className="text-sm text-gray-600">
                        {DAY_NAMES[exception.day]} • {exception.startTime} - {exception.endTime}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveException(exception.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {exceptions.length === 0 && (
              <p className="text-center text-gray-500 italic py-6">
                Geen uitzonderingen toegevoegd
              </p>
            )}

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(2)} className="btn btn-secondary">
                ← Vorige
              </button>
              <button onClick={handleComplete} className="btn btn-success">
                ✓ Evaluatie voltooien en volgende week genereren
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EvaluationWizard
