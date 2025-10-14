// App.tsx
import { useState, useMemo } from "react";
import QuestionList from "./components/QuestionList";
import AddQuestion from "./components/AddQuestion";
import { useQuestions } from "./hooks/useQuestions";

function App() {
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [notification, setNotification] = useState(null);
  const { items: questions, loading, err, create, remove, vote } = useQuestions(true);

  const addQuestion = async (newQuestion) => {
    await create(newQuestion.name, newQuestion.title);
    setShowAddQuestion(false);
    setNotification("Question submitted! Your question has been posted successfully.");
    setTimeout(() => setNotification(null), 3500);
  };

  const voteOnQuestion = async (questionId) => {
    try {
      await vote(questionId);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteQuestion = async (questionId) => {
    try {
      await remove(questionId);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-base">Loading questions…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 text-red-800 border border-red-200 px-4 py-2 rounded-md text-sm">
          Error: {String(err)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-4 py-6 flex items-center justify-between">
          <h1 className="text-gray-900 text-xl font-semibold">Leadership Q&A</h1>
          <button
            className="inline-flex items-center rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-black/80"
            onClick={() => setShowAddQuestion(true)}
          >
            Ask question
          </button>
        </div>
      </header>

      <main className="px-4 py-8 mx-auto max-w-3xl">
        {notification && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in">
            <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white text-xs">✓</span>
              <div>
                <div className="text-sm font-medium text-gray-900">Question submitted</div>
                <div className="text-xs text-gray-600">Your question has been posted successfully.</div>
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
  );
}

export default App;
