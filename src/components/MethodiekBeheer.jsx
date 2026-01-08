import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

function MethodiekBeheer({ teachingMethods, onUpdateMethods, onBack }) {
  const [methods, setMethods] = useState(teachingMethods || [])
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [showAddMethod, setShowAddMethod] = useState(false)
  const [showAddLesson, setShowAddLesson] = useState(false)

  // Form state for new method
  const [newMethod, setNewMethod] = useState({
    name: '',
    subject: '',
    publisher: '',
    grade: ''
  })

  // Form state for new lesson
  const [newLesson, setNewLesson] = useState({
    title: '',
    lessonNumber: '',
    description: '',
    duration: 45
  })

  const handleAddMethod = () => {
    const method = {
      id: uuidv4(),
      name: newMethod.name,
      subject: newMethod.subject,
      publisher: newMethod.publisher || 'Eigen invoer',
      targetGrade: newMethod.grade,
      groups: [
        {
          grade: newMethod.grade,
          blocks: []
        }
      ]
    }

    const updatedMethods = [...methods, method]
    setMethods(updatedMethods)
    onUpdateMethods(updatedMethods)

    // Reset form
    setNewMethod({ name: '', subject: '', publisher: '', grade: '' })
    setShowAddMethod(false)
  }

  const handleAddLesson = () => {
    if (!selectedMethod) return

    const lesson = {
      lessonId: uuidv4(),
      lessonNumber: parseInt(newLesson.lessonNumber),
      title: newLesson.title,
      description: newLesson.description,
      estimatedDuration: newLesson.duration,
      sequenceOrder: 0 // Will be set properly based on block
    }

    // Add to first block or create default block if none exists
    const updatedMethods = methods.map(m => {
      if (m.id === selectedMethod.id) {
        const updatedMethod = { ...m }

        // Ensure blocks exist
        if (!updatedMethod.groups[0].blocks || updatedMethod.groups[0].blocks.length === 0) {
          updatedMethod.groups[0].blocks = [{
            blockId: uuidv4(),
            name: 'Blok 1',
            lessons: []
          }]
        }

        // Add lesson to first block
        const firstBlock = updatedMethod.groups[0].blocks[0]
        lesson.sequenceOrder = firstBlock.lessons.length
        firstBlock.lessons.push(lesson)

        return updatedMethod
      }
      return m
    })

    setMethods(updatedMethods)
    onUpdateMethods(updatedMethods)
    setSelectedMethod(updatedMethods.find(m => m.id === selectedMethod.id))

    // Reset form
    setNewLesson({ title: '', lessonNumber: '', description: '', duration: 45 })
    setShowAddLesson(false)
  }

  const handleDeleteMethod = (methodId) => {
    if (!confirm('Weet je zeker dat je deze methode wilt verwijderen?')) return

    const updatedMethods = methods.filter(m => m.id !== methodId)
    setMethods(updatedMethods)
    onUpdateMethods(updatedMethods)

    if (selectedMethod?.id === methodId) {
      setSelectedMethod(null)
    }
  }

  const handleDeleteLesson = (methodId, lessonId) => {
    if (!confirm('Weet je zeker dat je deze les wilt verwijderen?')) return

    const updatedMethods = methods.map(m => {
      if (m.id === methodId) {
        const updatedMethod = { ...m }
        updatedMethod.groups[0].blocks.forEach(block => {
          block.lessons = block.lessons.filter(l => l.lessonId !== lessonId)
          // Renumber sequenceOrder
          block.lessons.forEach((l, index) => {
            l.sequenceOrder = index
          })
        })
        return updatedMethod
      }
      return m
    })

    setMethods(updatedMethods)
    onUpdateMethods(updatedMethods)
    setSelectedMethod(updatedMethods.find(m => m.id === methodId))
  }

  const getAllLessonsForMethod = (method) => {
    const lessons = []
    method.groups.forEach(group => {
      group.blocks.forEach(block => {
        block.lessons.forEach(lesson => {
          lessons.push({ ...lesson, blockName: block.name })
        })
      })
    })
    return lessons.sort((a, b) => a.sequenceOrder - b.sequenceOrder)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Methodiek Beheer</h2>
            <p className="text-gray-600 mt-1">
              Beheer je eigen lesmethoden en lessen
            </p>
          </div>
          <button onClick={onBack} className="btn btn-secondary">
            ← Terug naar dashboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Methods list */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Lesmethoden</h3>
              <button
                onClick={() => setShowAddMethod(true)}
                className="btn btn-primary text-sm"
              >
                + Nieuwe methode
              </button>
            </div>

            <div className="space-y-2">
              {methods.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-8">
                  Nog geen methoden toegevoegd
                </p>
              ) : (
                methods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      selectedMethod?.id === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-600">{method.subject}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getAllLessonsForMethod(method).length} lessen
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column - Method details and lessons */}
        <div className="lg:col-span-2">
          {selectedMethod ? (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">{selectedMethod.name}</h3>
                  <p className="text-gray-600">{selectedMethod.subject} • {selectedMethod.publisher}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddLesson(true)}
                    className="btn btn-primary"
                  >
                    + Les toevoegen
                  </button>
                  <button
                    onClick={() => handleDeleteMethod(selectedMethod.id)}
                    className="btn btn-danger"
                  >
                    Verwijder methode
                  </button>
                </div>
              </div>

              {/* Lessons list */}
              <div>
                <h4 className="font-semibold mb-3">Lessen ({getAllLessonsForMethod(selectedMethod).length})</h4>
                <div className="space-y-2">
                  {getAllLessonsForMethod(selectedMethod).map(lesson => (
                    <div
                      key={lesson.lessonId}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Les {lesson.lessonNumber}</span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">{lesson.blockName}</span>
                          </div>
                          <div className="font-semibold text-gray-800">{lesson.title}</div>
                          {lesson.description && (
                            <div className="text-sm text-gray-600 mt-1">{lesson.description}</div>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            Volgorde: {lesson.sequenceOrder} • Duur: {lesson.estimatedDuration} min
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteLesson(selectedMethod.id, lesson.lessonId)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium ml-4"
                        >
                          Verwijder
                        </button>
                      </div>
                    </div>
                  ))}

                  {getAllLessonsForMethod(selectedMethod).length === 0 && (
                    <p className="text-sm text-gray-500 italic text-center py-8">
                      Nog geen lessen toegevoegd aan deze methode
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-600">
                Selecteer een methode om de lessen te bekijken en te bewerken
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Method Modal */}
      {showAddMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Nieuwe lesmethode toevoegen</h3>

            <div className="space-y-4">
              <div>
                <label className="label">Naam methode *</label>
                <input
                  type="text"
                  value={newMethod.name}
                  onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                  placeholder="bijv. Wereld in Getallen"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Vak *</label>
                <input
                  type="text"
                  value={newMethod.subject}
                  onChange={(e) => setNewMethod({ ...newMethod, subject: e.target.value })}
                  placeholder="bijv. Rekenen"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Uitgever</label>
                <input
                  type="text"
                  value={newMethod.publisher}
                  onChange={(e) => setNewMethod({ ...newMethod, publisher: e.target.value })}
                  placeholder="bijv. Noordhoff"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Groep *</label>
                <input
                  type="text"
                  value={newMethod.grade}
                  onChange={(e) => setNewMethod({ ...newMethod, grade: e.target.value })}
                  placeholder="bijv. Groep 4"
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddMethod(false)
                  setNewMethod({ name: '', subject: '', publisher: '', grade: '' })
                }}
                className="btn btn-secondary flex-1"
              >
                Annuleren
              </button>
              <button
                onClick={handleAddMethod}
                disabled={!newMethod.name || !newMethod.subject || !newMethod.grade}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                Toevoegen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {showAddLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Nieuwe les toevoegen</h3>

            <div className="space-y-4">
              <div>
                <label className="label">Lesnummer *</label>
                <input
                  type="number"
                  value={newLesson.lessonNumber}
                  onChange={(e) => setNewLesson({ ...newLesson, lessonNumber: e.target.value })}
                  placeholder="bijv. 1"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Titel *</label>
                <input
                  type="text"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  placeholder="bijv. Optellen tot 100"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Beschrijving</label>
                <textarea
                  value={newLesson.description}
                  onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                  placeholder="Wat wordt er in deze les behandeld?"
                  className="input"
                  rows="3"
                />
              </div>

              <div>
                <label className="label">Duur (minuten)</label>
                <input
                  type="number"
                  value={newLesson.duration}
                  onChange={(e) => setNewLesson({ ...newLesson, duration: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddLesson(false)
                  setNewLesson({ title: '', lessonNumber: '', description: '', duration: 45 })
                }}
                className="btn btn-secondary flex-1"
              >
                Annuleren
              </button>
              <button
                onClick={handleAddLesson}
                disabled={!newLesson.title || !newLesson.lessonNumber}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                Toevoegen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MethodiekBeheer
