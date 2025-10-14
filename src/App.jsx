import { useState } from 'react'
import QuestionList from './components/QuestionList'
import AddQuestion from './components/AddQuestion'
import { useQuestions } from './hooks/useQuestions'

function App() {
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [notification, setNotification] = useState(null)
  const { items: questions, loading, err, create, remove, vote } = useQuestions(true)

  const addQuestion = async (newQuestion) => {
    try {
      await create(newQuestion.name, newQuestion.title)
      setShowAddQuestion(false)
      setNotification('Question submitted! Your question has been posted successfully.')
      setTimeout(() => setNotification(null), 4000)
    } catch (error) {
      console.error('Error adding question:', error)
      throw error
    }
  }

  const voteOnQuestion = async (questionId) => {
    try {
      await vote(questionId)
    } catch (error) {
      console.error('Error voting on question:', error)
    }
  }

  const deleteQuestion = async (questionId) => {
    try {
      await remove(questionId)
    } catch (error) {
      console.error('Error deleting question:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading questions...</div>
      </div>
    )
  }

  if (err) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
        <div className="bg-red-50 text-red-800 px-6 py-4 rounded-lg">Error: {err}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800">
      <header className="bg-gradient-to-br from-purple-600 to-purple-800 p-8 text-center">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl">
            💬
          </div>
          <h1 className="text-white text-3xl font-bold flex-1">Leadership Q&A</h1>
          <button
            className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-6 py-3 rounded-full font-semibold hover:bg-white/30 hover:border-white/50 transition-all duration-300 hover:-translate-y-1"
            onClick={() => setShowAddQuestion(true)}
          >
            Ask Question
          </button>
        </div>
      </header>

      <main className="p-8 max-w-4xl mx-auto">
        {notification && (
          <div className="fixed top-8 right-8 bg-white rounded-xl shadow-lg p-4 z-50 animate-slide-in">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                ✓
              </span>
              <div>
                <div className="font-semibold text-green-800">Question submitted!</div>
                <div className="text-sm text-gray-600">Your question has been posted successfully.</div>
              </div>
            </div>
          </div>
        )}

        {showAddQuestion ? (
          <AddQuestion
            onAddQuestion={addQuestion}
            onCancel={() => setShowAddQuestion(false)}
          />
        ) : (
          <QuestionList
            questions={questions}
            onVote={voteOnQuestion}
            onDelete={deleteQuestion}
            onAskQuestion={() => setShowAddQuestion(true)}
          />
        )}
      </main>
    </div>
  )
}

export default App
