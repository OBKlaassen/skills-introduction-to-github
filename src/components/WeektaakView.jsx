import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useState } from 'react'
import { DAYS, getDayName, getDayColorClass } from '../utils/dutchSchoolDefaults'

function WeektaakView({ weeklySchedule, settings, masterSchedule, onBack }) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // Groepeer lessen per dag
  const getLessonsByDay = (day) => {
    return weeklySchedule.scheduledLessons
      .filter(lesson => lesson.day === day)
      .sort((a, b) => {
        const slotA = getMasterSlot(a.slotId)
        const slotB = getMasterSlot(b.slotId)
        if (!slotA || !slotB) return 0
        return slotA.startTime.localeCompare(slotB.startTime)
      })
  }

  const getMasterSlot = (slotId) => {
    const week = weeklySchedule.cycleWeek === 'A' ? 'weekA' : (weeklySchedule.cycleWeek === 'B' ? 'weekB' : 'weekA')
    for (const day of DAYS) {
      const slot = masterSchedule.weeks[week][day]?.slots.find(s => s.id === slotId)
      if (slot) return slot
    }
    return null
  }

  // Get teacher for day
  const getTeacherForDay = (day) => {
    return masterSchedule.teachers?.[day] || settings.teacherName
  }

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)

    try {
      const element = document.getElementById('weektaak-printable')
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('l', 'mm', 'a4') // Landscape voor kolommen

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = pdfWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 10

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }

      pdf.save(`Weektaak_Week${weeklySchedule.weekNumber}_${settings.groupName}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Er is een fout opgetreden bij het genereren van de PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Controls */}
      <div className="card mb-6 no-print">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Weektaak</h2>
            <p className="text-gray-600 mt-1">
              Week {weeklySchedule.weekNumber} - {format(new Date(weeklySchedule.weekStartDate), 'dd MMMM yyyy', { locale: nl })}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={onBack} className="btn btn-secondary">
              ← Terug
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="btn btn-primary disabled:opacity-50"
            >
              {isGeneratingPDF ? '⏳ Genereren...' : '📄 Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Printable weektaak - Nederlandse stijl met kolommen per dag */}
      <div
        id="weektaak-printable"
        className="bg-white p-6 rounded-lg shadow-lg print-break-inside-avoid"
        style={{ minWidth: '1000px' }}
      >
        {/* Header */}
        <div className="border-b-4 border-blue-600 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Weektaak {settings.groupName}</h1>
              <p className="text-lg text-gray-600 mt-1">
                {settings.schoolName}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                Week {weeklySchedule.weekNumber}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {format(new Date(weeklySchedule.weekStartDate), 'dd MMM', { locale: nl })} - {format(new Date(new Date(weeklySchedule.weekStartDate).getTime() + 4 * 24 * 60 * 60 * 1000), 'dd MMM yyyy', { locale: nl })}
              </div>
            </div>
          </div>
        </div>

        {/* Naam leerling */}
        <div className="mb-4 pb-3 border-b-2 border-gray-200">
          <label className="text-sm text-gray-600 font-medium">Naam leerling:</label>
          <div className="border-b-2 border-dotted border-gray-400 mt-1 pb-1"></div>
        </div>

        {/* Grid met kolommen per dag */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {DAYS.map(day => {
            const dayLessons = getLessonsByDay(day)
            const teacher = getTeacherForDay(day)

            return (
              <div key={day} className={`border-2 rounded-lg overflow-hidden day-${day}`}>
                {/* Dag header */}
                <div className={`${getDayColorClass(day)} px-3 py-2 text-center`}>
                  <div className="font-bold text-lg">{getDayName(day)}</div>
                  {teacher && (
                    <div className="text-xs mt-1 opacity-90">{teacher}</div>
                  )}
                </div>

                {/* Taken voor deze dag */}
                <div className="p-3 space-y-2">
                  {dayLessons.length > 0 ? (
                    dayLessons.map((lesson) => {
                      const slot = getMasterSlot(lesson.slotId)
                      return (
                        <div key={lesson.id} className="border-b border-gray-200 pb-2 last:border-b-0">
                          <div className="flex items-start gap-2">
                            <div className="weektaak-checkbox mt-0.5 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-gray-700">
                                {lesson.subject}
                              </div>
                              <div className="text-xs text-gray-600 break-words">
                                {lesson.lessonTitle}
                              </div>
                              {slot && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {slot.startTime}-{slot.endTime}
                                </div>
                              )}
                              {lesson.isBacklog && (
                                <div className="text-xs text-orange-600 font-medium mt-0.5">
                                  Inhalen
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-xs text-gray-400 italic text-center py-4">
                      Geen taken
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Huiswerk/extra sectie */}
        <div className="border-t-2 border-gray-200 pt-4 mb-4">
          <h3 className="font-semibold text-lg mb-2">Huiswerk / Extra opmerkingen</h3>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="border-b border-dotted border-gray-400 pb-1"></div>
            ))}
          </div>
        </div>

        {/* Handtekeningen */}
        <div className="grid grid-cols-2 gap-8 border-t-2 border-gray-200 pt-4">
          <div>
            <label className="text-sm text-gray-600 font-medium">Handtekening ouder/verzorger:</label>
            <div className="border-b-2 border-dotted border-gray-400 mt-4 pb-1"></div>
          </div>
          <div>
            <label className="text-sm text-gray-600 font-medium">Handtekening leerkracht:</label>
            <div className="border-b-2 border-dotted border-gray-400 mt-4 pb-1"></div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Gegenereerd met Smart Weekly Planner • {format(new Date(), 'dd-MM-yyyy HH:mm', { locale: nl })}</p>
        </div>
      </div>

      {/* Summary stats (niet geprint) */}
      <div className="card mt-6 no-print">
        <h3 className="font-semibold text-lg mb-4">Samenvatting</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {DAYS.map(day => (
            <div key={day} className={`text-center p-3 rounded-lg day-${day}-light`}>
              <div className="text-2xl font-bold text-gray-700">
                {getLessonsByDay(day).length}
              </div>
              <div className="text-sm text-gray-600">{getDayName(day, true)}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-700">
              {weeklySchedule.scheduledLessons.filter(l => l.isBacklog).length}
            </div>
            <div className="text-sm text-orange-600">In te halen</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">
              {weeklySchedule.scheduledLessons.filter(l => !l.isBacklog).length}
            </div>
            <div className="text-sm text-blue-600">Nieuwe lessen</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeektaakView
