import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { generateWeektaak } from '../logic/scheduleEngine'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { useState } from 'react'

const DAY_NAMES = {
  monday: 'Ma',
  tuesday: 'Di',
  wednesday: 'Wo',
  thursday: 'Do',
  friday: 'Vr'
}

function WeektaakView({ weeklySchedule, settings, onBack }) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const weektaak = generateWeektaak(weeklySchedule)

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)

    try {
      const element = document.getElementById('weektaak-printable')
      if (!element) return

      // Use html2canvas to capture the element
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      })

      // Create PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = pdfWidth - 20 // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 10

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }

      // Save PDF
      pdf.save(`Weektaak_Week${weeklySchedule.weekNumber}_${settings.groupName}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Er is een fout opgetreden bij het genereren van de PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
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

      {/* Printable weektaak */}
      <div
        id="weektaak-printable"
        className="bg-white p-8 rounded-lg shadow-lg"
        style={{ minHeight: '297mm' }}
      >
        {/* Header */}
        <div className="border-b-4 border-primary-600 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-primary-700">Weektaak</h1>
              <p className="text-lg text-gray-700 mt-2">
                {settings.groupName} • {settings.schoolName}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">
                Week {weeklySchedule.weekNumber}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {format(new Date(weeklySchedule.weekStartDate), 'dd MMMM yyyy', { locale: nl })}
              </div>
            </div>
          </div>
        </div>

        {/* Student info section */}
        <div className="mb-6 pb-4 border-b-2 border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Naam:</label>
              <div className="border-b-2 border-dotted border-gray-400 mt-1 pb-1"></div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Datum:</label>
              <div className="border-b-2 border-dotted border-gray-400 mt-1 pb-1"></div>
            </div>
          </div>
        </div>

        {/* Tasks by subject */}
        <div className="space-y-6">
          {Object.entries(weektaak).map(([subject, tasks]) => (
            <div key={subject} className="break-inside-avoid">
              <div className="bg-primary-100 border-l-4 border-primary-600 px-4 py-3 mb-3">
                <h2 className="text-xl font-bold text-primary-900">{subject}</h2>
              </div>

              <div className="space-y-3 ml-2">
                {tasks.map((task, index) => (
                  <div key={task.lessonId} className="flex items-start gap-3 group">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Checkbox */}
                      <div className="w-6 h-6 border-2 border-gray-400 rounded flex-shrink-0"></div>
                      <span className="text-gray-600 font-medium">{index + 1}.</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {task.lessonTitle}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {task.blockName}
                          </p>
                          {task.days && task.days.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {task.days.map(day => DAY_NAMES[day]).join(', ')}
                            </p>
                          )}
                        </div>
                        {task.isBacklog && (
                          <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded font-medium flex-shrink-0 ml-2">
                            Inhalen
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-200">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-sm text-gray-600 font-medium">Handtekening ouder/verzorger:</label>
              <div className="border-b-2 border-dotted border-gray-400 mt-4 pb-1"></div>
            </div>
            <div>
              <label className="text-sm text-gray-600 font-medium">Handtekening leerkracht:</label>
              <div className="border-b-2 border-dotted border-gray-400 mt-4 pb-1"></div>
            </div>
          </div>
        </div>

        {/* Notes section */}
        <div className="mt-6">
          <label className="text-sm text-gray-600 font-medium">Opmerkingen:</label>
          <div className="mt-2 space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="border-b border-dotted border-gray-400 pb-1"></div>
            ))}
          </div>
        </div>

        {/* Print footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Gegenereerd met Smart Weekly Planner • {format(new Date(), 'dd-MM-yyyy HH:mm', { locale: nl })}</p>
        </div>
      </div>

      {/* Summary stats (not printed) */}
      <div className="card mt-6 no-print">
        <h3 className="font-semibold text-lg mb-4">Samenvatting</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">
              {Object.keys(weektaak).length}
            </div>
            <div className="text-sm text-blue-600">Vakken</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">
              {Object.values(weektaak).flat().length}
            </div>
            <div className="text-sm text-green-600">Totaal taken</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-700">
              {Object.values(weektaak).flat().filter(t => t.isBacklog).length}
            </div>
            <div className="text-sm text-orange-600">In te halen</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">
              {Object.values(weektaak).flat().filter(t => !t.isBacklog).length}
            </div>
            <div className="text-sm text-purple-600">Nieuwe lessen</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeektaakView
