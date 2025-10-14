const QuestionList = ({ questions, onVote, onDelete, onAskQuestion }) => {
  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const createdAt = new Date(dateString)
    const diffInMinutes = Math.floor((now - createdAt) / (1000 * 60))

    if (diffInMinutes < 1) return 'less than a minute ago'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm">
        <div className="text-6xl mb-6">❓</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">No questions yet</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          Be the first to ask a question for leadership. Your question will appear here for everyone to see and vote on.
        </p>
        <button
          className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          onClick={onAskQuestion}
        >
          Ask the First Question
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-8 pb-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Questions</h2>
        <p className="text-gray-600">{questions.length} question{questions.length !== 1 ? 's' : ''} asked</p>
      </div>

      <div className="p-8 pt-6">
        {questions.map(question => (
          <div key={question.uuid} className="flex items-start justify-between py-6 border-b border-gray-100 last:border-b-0">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2 leading-relaxed">{question.question}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{question.name}</span>
                <span>•</span>
                <span>{formatTimeAgo(question.created_at)}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-6">
              <button
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-medium transition-colors duration-200"
                onClick={() => onVote(question.uuid)}
              >
                👍 {question.vote_count}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuestionList
