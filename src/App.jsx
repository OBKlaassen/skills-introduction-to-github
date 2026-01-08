import { useState, useEffect } from 'react'
import { format, addWeeks, startOfWeek } from 'date-fns'
import { nl } from 'date-fns/locale'

// Import components
import Onboarding from './components/Onboarding'
import Dashboard from './components/Dashboard'
import MasterScheduleEditor from './components/MasterScheduleEditor'
import WeeklyScheduleView from './components/WeeklyScheduleView'
import EvaluationWizard from './components/EvaluationWizard'
import WeektaakView from './components/WeektaakView'
import MethodiekBeheer from './components/MethodiekBeheer'

// Import data and logic
import mockCurriculumData from './data/mockCurriculum.json'
import { initializeProgressTracker } from './logic/scheduleEngine'
import { generateDemoData } from './utils/demoData'

function App() {
  // Application state
  const [currentView, setCurrentView] = useState('onboarding') // onboarding, dashboard, masterSchedule, weeklySchedule, evaluation, weektaak, methodiekBeheer
  const [settings, setSettings] = useState(null)
  const [masterSchedule, setMasterSchedule] = useState(null)
  const [teachingMethods, setTeachingMethods] = useState([])
  const [progressTracker, setProgressTracker] = useState(null)
  const [weeklySchedules, setWeeklySchedules] = useState([])
  const [currentWeekId, setCurrentWeekId] = useState(null)
  const [evaluationMode, setEvaluationMode] = useState(false)

  // Load teaching methods on mount
  useEffect(() => {
    setTeachingMethods(mockCurriculumData.teachingMethods)
  }, [])

  // Load saved data from localStorage or demo data
  useEffect(() => {
    // Only run after teaching methods are loaded
    if (teachingMethods.length === 0) return

    const savedData = localStorage.getItem('smartPlannerData')
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        setSettings(data.settings)
        setMasterSchedule(data.masterSchedule)
        setProgressTracker(data.progressTracker)
        setWeeklySchedules(data.weeklySchedules || [])
        setCurrentWeekId(data.currentWeekId)

        // Load custom teaching methods if they exist
        if (data.teachingMethods && data.teachingMethods.length > 0) {
          setTeachingMethods(data.teachingMethods)
        }

        // If we have data, skip onboarding
        if (data.settings && data.masterSchedule) {
          setCurrentView('dashboard')
        }
      } catch (error) {
        console.error('Error loading saved data:', error)
      }
    } else {
      // No saved data - load demo scenario
      console.log('Loading demo data...')
      const demoData = generateDemoData()
      setSettings(demoData.settings)
      setMasterSchedule(demoData.masterSchedule)
      setProgressTracker(demoData.progressTracker)
      setWeeklySchedules(demoData.weeklySchedules)
      setCurrentWeekId(demoData.currentWeekId)
      setCurrentView('dashboard')
    }
  }, [teachingMethods])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (settings && masterSchedule && progressTracker) {
      const dataToSave = {
        settings,
        masterSchedule,
        progressTracker,
        weeklySchedules,
        currentWeekId
      }
      localStorage.setItem('smartPlannerData', JSON.stringify(dataToSave))
    }
  }, [settings, masterSchedule, progressTracker, weeklySchedules, currentWeekId])

  // Handle onboarding completion
  const handleOnboardingComplete = (onboardingData) => {
    setSettings(onboardingData.settings)
    setMasterSchedule(onboardingData.masterSchedule)

    // Initialize progress tracker
    const tracker = initializeProgressTracker(
      onboardingData.settings.schoolYear,
      onboardingData.settings.groupName,
      teachingMethods
    )
    setProgressTracker(tracker)

    setCurrentView('dashboard')
  }

  // Handle master schedule updates
  const handleMasterScheduleUpdate = (updatedSchedule) => {
    setMasterSchedule(updatedSchedule)
    setCurrentView('dashboard')
  }

  // Handle teaching methods updates
  const handleTeachingMethodsUpdate = (updatedMethods) => {
    setTeachingMethods(updatedMethods)
    // Save to localStorage
    const dataToSave = {
      settings,
      masterSchedule,
      progressTracker,
      weeklySchedules,
      currentWeekId,
      teachingMethods: updatedMethods
    }
    localStorage.setItem('smartPlannerData', JSON.stringify(dataToSave))
  }

  // Handle weekly schedule updates
  const handleWeeklyScheduleUpdate = (updatedSchedule) => {
    setWeeklySchedules(prev => {
      const index = prev.findIndex(s => s.id === updatedSchedule.id)
      if (index >= 0) {
        const newSchedules = [...prev]
        newSchedules[index] = updatedSchedule
        return newSchedules
      }
      return [...prev, updatedSchedule]
    })
  }

  // Add new weekly schedule
  const handleAddWeeklySchedule = (newSchedule) => {
    setWeeklySchedules(prev => [...prev, newSchedule])
    setCurrentWeekId(newSchedule.id)
  }

  // Get current weekly schedule
  const getCurrentWeeklySchedule = () => {
    if (!currentWeekId) return null
    return weeklySchedules.find(s => s.id === currentWeekId)
  }

  // Reset all data (for testing)
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      localStorage.removeItem('smartPlannerData')
      setSettings(null)
      setMasterSchedule(null)
      setProgressTracker(null)
      setWeeklySchedules([])
      setCurrentWeekId(null)
      setCurrentView('onboarding')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary-600">
                Smart Weekly Planner
              </h1>
              {settings && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{settings.groupName}</span>
                  <span className="mx-2">•</span>
                  <span>{settings.teacherName}</span>
                  <span className="mx-2">•</span>
                  <span>{settings.schoolYear}</span>
                </div>
              )}
            </div>

            {currentView !== 'onboarding' && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="btn btn-secondary text-sm"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleReset}
                  className="btn btn-danger text-sm"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'onboarding' && (
          <Onboarding
            teachingMethods={teachingMethods}
            onComplete={handleOnboardingComplete}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            settings={settings}
            masterSchedule={masterSchedule}
            weeklySchedules={weeklySchedules}
            currentWeekId={currentWeekId}
            progressTracker={progressTracker}
            onNavigate={(view) => {
              if (view === 'weektaak') {
                setCurrentView('weektaak')
              } else if (view === 'methodiekBeheer') {
                setCurrentView('methodiekBeheer')
              } else {
                setCurrentView(view)
              }
            }}
            onEditMasterSchedule={() => setCurrentView('masterSchedule')}
            onViewWeeklySchedule={(weekId) => {
              setCurrentWeekId(weekId)
              setCurrentView('weeklySchedule')
            }}
            onStartEvaluation={(weekId) => {
              setCurrentWeekId(weekId)
              setCurrentView('evaluation')
            }}
            onAddWeeklySchedule={handleAddWeeklySchedule}
            teachingMethods={teachingMethods}
          />
        )}

        {currentView === 'masterSchedule' && (
          <MasterScheduleEditor
            masterSchedule={masterSchedule}
            onSave={handleMasterScheduleUpdate}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'weeklySchedule' && (
          <WeeklyScheduleView
            weeklySchedule={getCurrentWeeklySchedule()}
            masterSchedule={masterSchedule}
            teachingMethods={teachingMethods}
            onUpdate={handleWeeklyScheduleUpdate}
            onBack={() => setCurrentView('dashboard')}
            onViewWeektaak={() => setCurrentView('weektaak')}
          />
        )}

        {currentView === 'evaluation' && (
          <EvaluationWizard
            weeklySchedule={getCurrentWeeklySchedule()}
            teachingMethods={teachingMethods}
            progressTracker={progressTracker}
            masterSchedule={masterSchedule}
            onComplete={(evaluation, newWeekSchedule, updatedProgress) => {
              // Update progress tracker
              setProgressTracker(updatedProgress)

              // Mark current week as evaluated
              const currentSchedule = getCurrentWeeklySchedule()
              handleWeeklyScheduleUpdate({
                ...currentSchedule,
                status: 'evaluated'
              })

              // Add new week schedule
              handleAddWeeklySchedule(newWeekSchedule)

              // Navigate to new week
              setCurrentWeekId(newWeekSchedule.id)
              setCurrentView('weeklySchedule')
            }}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'weektaak' && (
          <WeektaakView
            weeklySchedule={getCurrentWeeklySchedule()}
            settings={settings}
            masterSchedule={masterSchedule}
            onBack={() => setCurrentView('weeklySchedule')}
          />
        )}

        {currentView === 'methodiekBeheer' && (
          <MethodiekBeheer
            teachingMethods={teachingMethods}
            onUpdateMethods={handleTeachingMethodsUpdate}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Smart Weekly Planner voor Nederlands Basisonderwijs
            <span className="mx-2">•</span>
            Versie 1.0
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
