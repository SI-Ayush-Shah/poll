// App.tsx
import { useState, useMemo } from "react";
import QuestionList from "./components/QuestionList";
import AddQuestion from "./components/AddQuestion";
import { useQuestions } from "./hooks/useQuestions";

function App() {
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState('success'); // 'success' or 'error'
  const [pollEnded, setPollEnded] = useState(true); // Set to true to disable all functionality
  const { items: questions, loading, err, create, vote } = useQuestions(true);

  const addQuestion = async (newQuestion) => {
    if (pollEnded) {
      setNotificationType('error');
      setNotification("Poll has ended. You cannot add new questions.");
      setTimeout(() => setNotification(null), 3500);
      return;
    }

    await create(newQuestion.name, newQuestion.title);
    setShowAddQuestion(false);
    setNotificationType('success');
    setNotification("Question submitted! Your question has been posted successfully.");
    setTimeout(() => setNotification(null), 3500);
  };

  const voteOnQuestion = async (questionId) => {
    if (pollEnded) {
      setNotificationType('error');
      setNotification("Poll has ended. You cannot vote on questions.");
      setTimeout(() => setNotification(null), 3500);
      return;
    }

    try {
      await vote(questionId);
    } catch (e) {
      console.error(e);
      if (e.message === 'You have already voted on this question') {
        setNotificationType('error');
        setNotification("You've already voted on this question!");
        setTimeout(() => setNotification(null), 3500);
      } else {
        setNotificationType('error');
        setNotification("Error voting on question. Please try again.");
        setTimeout(() => setNotification(null), 3500);
      }
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
          <div>
            <h1 className="text-gray-900 text-xl font-semibold">Leadership Q&A</h1>
            {pollEnded && (
              <p className="text-red-600 text-sm font-medium mt-1">Poll has ended</p>
            )}
          </div>
          <button
            className={`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
              pollEnded
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-black/80'
            }`}
            onClick={() => !pollEnded && setShowAddQuestion(true)}
            disabled={pollEnded}
          >
            Ask question
          </button>
        </div>
      </header>

      <main className="px-4 py-8 mx-auto max-w-3xl">
        {pollEnded && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <div className="text-4xl mb-2">🚫</div>
            <h2 className="text-lg font-semibold text-red-900 mb-2">Poll has ended</h2>
            <p className="text-sm text-red-700">
              This poll is now closed. You can no longer add questions or vote.
            </p>
          </div>
        )}

        {notification && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in">
            <div className={`flex items-start gap-3 rounded-md border px-4 py-3 shadow-sm ${
              notificationType === 'success'
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}>
              <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-white text-xs ${
                notificationType === 'success' ? 'bg-green-600' : 'bg-red-600'
              }`}>
                {notificationType === 'success' ? '✓' : '⚠'}
              </span>
              <div>
                <div className={`text-sm font-medium ${
                  notificationType === 'success' ? 'text-green-900' : 'text-red-900'
                }`}>
                  {notificationType === 'success' ? 'Success' : 'Error'}
                </div>
                <div className={`text-xs ${
                  notificationType === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {notification}
                </div>
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
            onAskQuestion={() => setShowAddQuestion(true)}
            pollEnded={pollEnded}
          />
        )}
      </main>
    </div>
  );
}

export default App;
