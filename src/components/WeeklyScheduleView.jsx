import { useState } from 'react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const DAY_NAMES = {
  monday: 'Maandag',
  tuesday: 'Dinsdag',
  wednesday: 'Woensdag',
  thursday: 'Donderdag',
  friday: 'Vrijdag'
}

// Sortable lesson card component
function SortableLessonCard({ lesson, onToggleComplete, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`lesson-card ${lesson.isBacklog ? 'lesson-card-backlog' : ''} ${lesson.completed ? 'lesson-card-completed' : ''}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={lesson.completed}
          onChange={() => onToggleComplete(lesson.id)}
          className="mt-1"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-sm">{lesson.lessonTitle}</h4>
              <p className="text-xs text-gray-600 mt-1">{lesson.blockName}</p>
            </div>
            {lesson.isBacklog && (
              <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded font-medium">
                Backlog
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(lesson.id)
          }}
          className="text-red-500 hover:text-red-700 text-lg"
        >
          ×
        </button>
      </div>
    </div>
  )
}

function WeeklyScheduleView({
  weeklySchedule,
  masterSchedule,
  teachingMethods,
  onUpdate,
  onBack,
  onViewWeektaak
}) {
  const [schedule, setSchedule] = useState(weeklySchedule)
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Group lessons by day and time slot
  const getLessonsByDay = (day) => {
    return schedule.scheduledLessons
      .filter(lesson => lesson.day === day)
      .sort((a, b) => {
        // Sort by slot time
        const slotA = getMasterSlot(a.slotId)
        const slotB = getMasterSlot(b.slotId)
        if (!slotA || !slotB) return 0
        return slotA.startTime.localeCompare(slotB.startTime)
      })
  }

  const getMasterSlot = (slotId) => {
    const week = schedule.cycleWeek === 'A' ? 'weekA' : 'weekB'
    for (const day of DAYS) {
      const slot = masterSchedule.weeks[week][day]?.slots.find(s => s.id === slotId)
      if (slot) return slot
    }
    return null
  }

  const handleToggleComplete = (lessonId) => {
    const updatedSchedule = {
      ...schedule,
      scheduledLessons: schedule.scheduledLessons.map(lesson =>
        lesson.id === lessonId
          ? { ...lesson, completed: !lesson.completed }
          : lesson
      )
    }
    setSchedule(updatedSchedule)
  }

  const handleRemoveLesson = (lessonId) => {
    if (confirm('Weet je zeker dat je deze les wilt verwijderen uit het rooster?')) {
      const updatedSchedule = {
        ...schedule,
        scheduledLessons: schedule.scheduledLessons.filter(lesson => lesson.id !== lessonId)
      }
      setSchedule(updatedSchedule)
    }
  }

  const handleSave = () => {
    onUpdate(schedule)
    alert('Rooster opgeslagen!')
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    // Find the day containing these lessons
    const activeLesson = schedule.scheduledLessons.find(l => l.id === active.id)
    const overLesson = schedule.scheduledLessons.find(l => l.id === over.id)

    if (!activeLesson || !overLesson) return

    // Only allow reordering within the same day
    if (activeLesson.day !== overLesson.day) return

    const dayLessons = getLessonsByDay(activeLesson.day)
    const oldIndex = dayLessons.findIndex(l => l.id === active.id)
    const newIndex = dayLessons.findIndex(l => l.id === over.id)

    const reorderedDayLessons = arrayMove(dayLessons, oldIndex, newIndex)

    // Update the full schedule
    const otherLessons = schedule.scheduledLessons.filter(l => l.day !== activeLesson.day)
    const updatedSchedule = {
      ...schedule,
      scheduledLessons: [...otherLessons, ...reorderedDayLessons]
    }

    setSchedule(updatedSchedule)
  }

  const activeLesson = activeId
    ? schedule.scheduledLessons.find(l => l.id === activeId)
    : null

  return (
    <div className="max-w-7xl mx-auto">
      <div className="card">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              Week {schedule.weekNumber} - Weekplanning
            </h2>
            <p className="text-gray-600 mt-1">
              {format(new Date(schedule.weekStartDate), 'dd MMMM yyyy', { locale: nl })}
              {schedule.cycleWeek && <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm">
                Week {schedule.cycleWeek}
              </span>}
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={onBack} className="btn btn-secondary">
              ← Terug
            </button>
            <button onClick={onViewWeektaak} className="btn btn-primary">
              📋 Weektaak
            </button>
            <button onClick={handleSave} className="btn btn-success">
              💾 Opslaan
            </button>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Sleep lessen om de volgorde aan te passen binnen één dag.
            Vink lessen af als ze voltooid zijn.
          </p>
        </div>

        {/* Weekly grid */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {DAYS.map(day => {
              const dayLessons = getLessonsByDay(day)
              return (
                <div key={day} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-bold text-lg mb-3 text-center sticky top-0 bg-gray-50 pb-2">
                    {DAY_NAMES[day]}
                  </h3>

                  <SortableContext
                    items={dayLessons.map(l => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 min-h-[200px]">
                      {dayLessons.map((lesson) => {
                        const slot = getMasterSlot(lesson.slotId)
                        return (
                          <div key={lesson.id}>
                            {slot && (
                              <div className="text-xs text-gray-500 mb-1">
                                {slot.startTime} - {slot.endTime}
                              </div>
                            )}
                            <SortableLessonCard
                              lesson={lesson}
                              onToggleComplete={handleToggleComplete}
                              onRemove={handleRemoveLesson}
                            />
                          </div>
                        )
                      })}
                      {dayLessons.length === 0 && (
                        <p className="text-sm text-gray-400 italic text-center py-8">
                          Geen lessen ingepland
                        </p>
                      )}
                    </div>
                  </SortableContext>
                </div>
              )
            })}
          </div>

          <DragOverlay>
            {activeLesson ? (
              <div className="lesson-card opacity-90 cursor-grabbing">
                <h4 className="font-semibold text-sm">{activeLesson.lessonTitle}</h4>
                <p className="text-xs text-gray-600 mt-1">{activeLesson.blockName}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Statistics */}
        <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {schedule.scheduledLessons.length}
            </div>
            <div className="text-sm text-gray-600">Totaal lessen</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {schedule.scheduledLessons.filter(l => l.isBacklog).length}
            </div>
            <div className="text-sm text-gray-600">Backlog lessen</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {schedule.scheduledLessons.filter(l => l.completed).length}
            </div>
            <div className="text-sm text-gray-600">Voltooid</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {schedule.scheduledLessons.length - schedule.scheduledLessons.filter(l => l.completed).length}
            </div>
            <div className="text-sm text-gray-600">Te doen</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeeklyScheduleView
