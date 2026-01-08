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
  const [showNewWeekModal, setShowNewWeekModal] = useState(false)

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

  // Generate next week
  const handleGenerateNextWeek = () => {
    if (!currentWeekSchedule) return

    const nextWeekNumber = currentWeekSchedule.weekNumber + 1
    const nextWeekStartDate = addWeeks(
      new Date(currentWeekSchedule.weekStartDate),
      1
    )

    const nextWeek = generateNextWeekSchedule(
      masterSchedule,
      teachingMethods,
      progressTracker,
      null, // No evaluation yet - just generate template
      nextWeekNumber,
      format(nextWeekStartDate, 'yyyy-MM-dd')
    )

    nextWeek.status = 'draft'
    onAddWeeklySchedule(nextWeek)
  }

  // Get progress statistics
  const getProgressStats = () => {
    const stats = {}
    progressTracker.methodProgress.forEach(mp => {
      stats[mp.subject] = {
        completed: mp.completedLessons.length,
        position: mp.currentSequencePosition
      }
    })
    return stats
  }

  const progressStats = getProgressStats()

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <h2 className="text-3xl font-bold mb-2">
          Welkom terug, {settings.teacherName}!
        </h2>
        <p className="text-primary-100">
          {settings.groupName} • {settings.schoolName}
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={onEditMasterSchedule}
          className="card hover:shadow-lg transition-shadow text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Stamrooster</h3>
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-sm text-gray-600">
            Bewerk je vaste roosterpatroon
          </p>
        </button>

        <button
          onClick={currentWeekSchedule ? () => onViewWeeklySchedule(currentWeekId) : handleGenerateFirstWeek}
          className="card hover:shadow-lg transition-shadow text-left bg-primary-50 border-2 border-primary-200"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg text-primary-700">
              {currentWeekSchedule ? 'Huidige week' : 'Start planning'}
            </h3>
            <span className="text-2xl">📝</span>
          </div>
          <p className="text-sm text-primary-600">
            {currentWeekSchedule
              ? `Week ${currentWeekSchedule.weekNumber} • ${format(new Date(currentWeekSchedule.weekStartDate), 'dd MMM yyyy', { locale: nl })}`
              : 'Genereer je eerste weekplanning'
            }
          </p>
        </button>

        <button
          onClick={() => setShowNewWeekModal(true)}
          disabled={!currentWeekSchedule}
          className="card hover:shadow-lg transition-shadow text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Nieuwe week</h3>
            <span className="text-2xl">➕</span>
          </div>
          <p className="text-sm text-gray-600">
            Genereer volgende weekplanning
          </p>
        </button>
      </div>

      {/* Current week overview */}
      {currentWeekSchedule && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Week {currentWeekSchedule.weekNumber} overzicht</h2>
            <div className="flex gap-2">
              <button
                onClick={() => onViewWeeklySchedule(currentWeekId)}
                className="btn btn-primary"
              >
                Bekijk rooster
              </button>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium mb-1">Totaal lessen</div>
              <div className="text-3xl font-bold text-blue-700">
                {getScheduleStats(currentWeekSchedule).totalLessons}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-orange-600 font-medium mb-1">Backlog</div>
              <div className="text-3xl font-bold text-orange-700">
                {getScheduleStats(currentWeekSchedule).backlogLessons}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium mb-1">Nieuwe lessen</div>
              <div className="text-3xl font-bold text-green-700">
                {getScheduleStats(currentWeekSchedule).newLessons}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium mb-1">Status</div>
              <div className="text-sm font-bold text-purple-700 uppercase mt-2">
                {currentWeekSchedule.status === 'draft' && 'Concept'}
                {currentWeekSchedule.status === 'active' && 'Actief'}
                {currentWeekSchedule.status === 'completed' && 'Voltooid'}
                {currentWeekSchedule.status === 'evaluated' && 'Geëvalueerd'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress overview */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Voortgang per vak</h2>
        <div className="space-y-3">
          {Object.entries(progressStats).map(([subject, stats]) => (
            <div key={subject} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{subject}</h3>
                <span className="text-sm text-gray-600">
                  Positie: Les {stats.position}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((stats.completed / 20) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {stats.completed} lessen voltooid
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All weeks overview */}
      {weeklySchedules.length > 0 && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Alle weken</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Week</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Startdatum</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Cyclus</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Lessen</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {weeklySchedules
                  .sort((a, b) => b.weekNumber - a.weekNumber)
                  .map(week => {
                    const stats = getScheduleStats(week)
                    return (
                      <tr key={week.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">Week {week.weekNumber}</td>
                        <td className="px-4 py-3 text-sm">
                          {format(new Date(week.weekStartDate), 'dd MMM yyyy', { locale: nl })}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {week.cycleWeek && <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded">
                            Week {week.cycleWeek}
                          </span>}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {stats.totalLessons} ({stats.backlogLessons} backlog)
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            week.status === 'evaluated' ? 'bg-green-100 text-green-800' :
                            week.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            week.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {week.status === 'draft' && 'Concept'}
                            {week.status === 'active' && 'Actief'}
                            {week.status === 'completed' && 'Voltooid'}
                            {week.status === 'evaluated' && 'Geëvalueerd'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => onViewWeeklySchedule(week.id)}
                            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                          >
                            Bekijk →
                          </button>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New week modal */}
      {showNewWeekModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Nieuwe week genereren</h3>
            <p className="text-gray-600 mb-6">
              Wil je de volgende week genereren zonder evaluatie van de huidige week?
              Dit is nuttig voor het vooruit plannen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewWeekModal(false)}
                className="btn btn-secondary flex-1"
              >
                Annuleren
              </button>
              <button
                onClick={() => {
                  handleGenerateNextWeek()
                  setShowNewWeekModal(false)
                }}
                className="btn btn-primary flex-1"
              >
                Genereren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
