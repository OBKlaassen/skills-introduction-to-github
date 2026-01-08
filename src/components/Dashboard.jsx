import { useState } from 'react'
import { format, addWeeks, startOfWeek } from 'date-fns'
import { nl } from 'date-fns/locale'
import { v4 as uuidv4 } from 'uuid'
import { generateNextWeekSchedule, getScheduleStats } from '../logic/scheduleEngine'

function Dashboard({
  settings,
  masterSchedule,
  weeklySchedules,
  currentWeekId,
  progressTracker,
  onNavigate,
  onEditMasterSchedule,
  onViewWeeklySchedule,
  onStartEvaluation,
  onAddWeeklySchedule,
  teachingMethods
}) {
  // Get current week schedule
  const currentWeekSchedule = weeklySchedules.find(s => s.id === currentWeekId)

  // Generate first week if none exist
  const handleGenerateFirstWeek = () => {
    const weekStartDate = startOfWeek(new Date(), { weekStartsOn: 1 })

    const firstWeek = generateNextWeekSchedule(
      masterSchedule,
      teachingMethods,
      progressTracker,
      null, // No evaluation for first week
      1,
      format(weekStartDate, 'yyyy-MM-dd')
    )

    firstWeek.status = 'active'
    onAddWeeklySchedule(firstWeek)
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <h2 className="text-3xl font-bold mb-2">
          {settings.schoolName}
        </h2>
        <p className="text-blue-100 text-lg">
          {settings.groupName} • {settings.teacherName}
        </p>
      </div>

      {/* Main navigation - 4 sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stamrooster */}
        <button
          onClick={onEditMasterSchedule}
          className="card hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-blue-300 p-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-2xl text-gray-800">Stamrooster</h3>
            <span className="text-5xl">📅</span>
          </div>
          <p className="text-gray-600 mb-3">
            Bewerk je vaste roosterpatroon en leerkrachten per dag
          </p>
          <div className="text-sm text-blue-600 font-medium">
            → Naar stamrooster
          </div>
        </button>

        {/* Weekplanning */}
        <button
          onClick={currentWeekSchedule ? () => onViewWeeklySchedule(currentWeekId) : handleGenerateFirstWeek}
          className="card hover:shadow-xl transition-all text-left border-2 border-blue-300 bg-blue-50 p-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-2xl text-blue-900">Weekplanning</h3>
            <span className="text-5xl">📝</span>
          </div>
          <p className="text-blue-700 mb-3">
            {currentWeekSchedule
              ? `Werk aan Week ${currentWeekSchedule.weekNumber}`
              : 'Start je eerste weekplanning'
            }
          </p>
          <div className="text-sm text-blue-600 font-medium">
            → {currentWeekSchedule ? 'Naar weekplanning' : 'Genereer eerste week'}
          </div>
        </button>

        {/* Weektaak */}
        <button
          onClick={() => currentWeekSchedule ? onNavigate('weektaak') : null}
          disabled={!currentWeekSchedule}
          className="card hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed p-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-2xl text-gray-800">Weektaak</h3>
            <span className="text-5xl">📄</span>
          </div>
          <p className="text-gray-600 mb-3">
            Bekijk en print de weektaak voor leerlingen
          </p>
          <div className="text-sm text-green-600 font-medium">
            {currentWeekSchedule ? '→ Naar weektaak' : '⚠ Eerst weekplanning maken'}
          </div>
        </button>

        {/* Methodiek Beheer */}
        <button
          onClick={() => onNavigate('methodiekBeheer')}
          className="card hover:shadow-xl transition-all text-left border-2 border-transparent hover:border-purple-300 p-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-2xl text-gray-800">Methodiek Beheer</h3>
            <span className="text-5xl">📚</span>
          </div>
          <p className="text-gray-600 mb-3">
            Beheer je lesmethoden en lessen
          </p>
          <div className="text-sm text-purple-600 font-medium">
            → Naar beheer
          </div>
        </button>
      </div>

      {/* Quick status overview (compact) */}
      {currentWeekSchedule && (
        <div className="card bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-700 mb-1">Huidige week</h3>
              <p className="text-sm text-gray-600">
                Week {currentWeekSchedule.weekNumber} • {format(new Date(currentWeekSchedule.weekStartDate), 'dd MMM', { locale: nl })} • {getScheduleStats(currentWeekSchedule).totalLessons} lessen
              </p>
            </div>
            {currentWeekSchedule.status !== 'evaluated' && (
              <button
                onClick={() => onStartEvaluation(currentWeekId)}
                className="btn btn-success"
              >
                Evalueer week
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
