import { useState, useRef, useEffect, useCallback } from "react";
import QuestionList from "./components/QuestionList";
import AddQuestion from "./components/AddQuestion";
import { useQuestions } from "./hooks/useQuestions";

const TOAST_MS = 3500;

function Toast({ toast }) {
  if (!toast) return null;
  const ok = toast.type === "success";
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg shadow-slate-900/5 animate-toast-in ${
          ok ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
        }`}
      >
        <span
          className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
            ok ? "bg-emerald-600" : "bg-rose-600"
          }`}
          aria-hidden
        >
          {ok ? "✓" : "!"}
        </span>
        <div>
          <div className={`text-sm font-semibold ${ok ? "text-emerald-900" : "text-rose-900"}`}>
            {ok ? "Success" : "Something went wrong"}
          </div>
          <div className={`text-sm ${ok ? "text-emerald-700" : "text-rose-700"}`}>
            {toast.message}
          </div>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-40 bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600" />
      <div className="mx-auto -mt-12 max-w-3xl space-y-3 px-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex animate-pulse gap-4 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="h-14 w-12 rounded-xl bg-slate-200" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="h-3 w-1/3 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [toast, setToast] = useState(null);
  const [pollEnded] = useState(false); // Set to true to disable all functionality
  const { items: questions, loading, err, create, vote, refresh } = useQuestions(true);
  const timer = useRef(null);
  // Only the very first load shows the full-page skeleton; realtime refreshes stay silent
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!loading) setHasLoaded(true);
  }, [loading]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const notify = useCallback((type, message) => {
    clearTimeout(timer.current);
    setToast({ type, message });
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const addQuestion = async (newQuestion) => {
    if (pollEnded) {
      notify("error", "Poll has ended. You cannot add new questions.");
      return;
    }
    await create(newQuestion.name, newQuestion.title);
    setShowAddQuestion(false);
    notify("success", "Your question has been posted.");
  };

  const voteOnQuestion = async (questionId) => {
    if (pollEnded) {
      notify("error", "Poll has ended. You cannot vote on questions.");
      return;
    }
    try {
      await vote(questionId);
    } catch (e) {
      console.error(e);
      notify(
        "error",
        e.message === "You have already voted on this question"
          ? "You've already voted on this question."
          : "Error voting on question. Please try again."
      );
    }
  };

  if (loading && !hasLoaded) return <Skeleton />;

  if (err && !hasLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            !
          </div>
          <h1 className="mb-1 text-base font-semibold text-slate-900">Couldn't load questions</h1>
          <p className="mb-4 break-words text-sm text-slate-600">{String(err)}</p>
          <button
            onClick={refresh}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-900">
      <header className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="relative mx-auto flex max-w-3xl flex-col gap-5 px-4 pb-16 pt-8 sm:flex-row sm:items-end sm:justify-between sm:pb-20 sm:pt-10">
          <div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                pollEnded
                  ? "bg-rose-500/20 text-rose-50 ring-rose-300/40"
                  : "bg-white/15 text-white ring-white/25"
              }`}
            >
              <span className="relative flex h-2 w-2">
                {!pollEnded && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    pollEnded ? "bg-rose-300" : "bg-emerald-300"
                  }`}
                />
              </span>
              {pollEnded ? "Poll closed" : "Live · voting open"}
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Leadership Q&amp;A
            </h1>
            <p className="mt-1 text-sm text-indigo-100">
              Ask a question, upvote the ones you want answered.
            </p>
          </div>
          <button
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
              pollEnded
                ? "cursor-not-allowed bg-white/30 text-white/70"
                : "bg-white text-indigo-700 hover:bg-indigo-50 active:scale-[.98]"
            }`}
            onClick={() => !pollEnded && setShowAddQuestion(true)}
            disabled={pollEnded}
          >
            <span aria-hidden className="text-lg leading-none">＋</span>
            Ask a question
          </button>
        </div>
      </header>

      <main className="relative mx-auto -mt-10 max-w-3xl px-4">
        {pollEnded && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-white p-5 text-center shadow-sm animate-rise">
            <h2 className="mb-1 text-base font-semibold text-rose-900">This poll has ended</h2>
            <p className="text-sm text-rose-700">
              Questions and voting are closed. Thanks for taking part!
            </p>
          </div>
        )}

        <Toast toast={toast} />

        <QuestionList
          questions={questions}
          onVote={voteOnQuestion}
          onAskQuestion={() => setShowAddQuestion(true)}
          pollEnded={pollEnded}
        />
      </main>

      {/* Mobile floating action button */}
      {!pollEnded && !showAddQuestion && (
        <button
          onClick={() => setShowAddQuestion(true)}
          className="fixed bottom-5 right-5 z-40 inline-flex h-14 items-center gap-2 rounded-full bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 sm:hidden"
        >
          <span aria-hidden className="text-lg leading-none">＋</span>
          Ask
        </button>
      )}

      {showAddQuestion && (
        <AddQuestion
          onAddQuestion={addQuestion}
          onCancel={() => setShowAddQuestion(false)}
        />
      )}
    </div>
  );
}

export default App;
