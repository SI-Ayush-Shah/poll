import { useMemo, useState } from "react";
import { hasVoted } from "../lib/questions.js";
// utils/timeAgo.ts
export const formatTimeAgo = (iso) => {
  const created = new Date(iso);
  const diff = (Date.now() - created.getTime());
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  const minutes = Math.round(diff / 60000);
  if (Math.abs(minutes) < 1) return "just now";
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");

  const days = Math.round(hours / 24);
  return rtf.format(-days, "day");
};

export const formatAbsolute = (iso) =>
  new Date(iso).toLocaleString();

export function QuestionCard({
  q,
  onVote,
}) {
  return (
    <div
      className="group flex items-start justify-between gap-4 px-4 py-4 transition-colors hover:bg-gray-50"
      data-id={q.uuid}
    >
      <div className="flex-1">
        <h3 className="mb-1 text-sm font-medium leading-6 text-gray-900">
          {q.question}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="font-medium">{q.name}</span>
          <span>•</span>
          <time title={formatAbsolute(q.created_at)}>
            {formatTimeAgo(q.created_at)}
          </time>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 active:scale-[.98] transition"
          onClick={() => onVote(q.uuid)}
          aria-label={`Upvote. Current count ${q.vote_count}`}
        >
          <span aria-hidden>👍</span>
          <span className="tabular-nums">{q.vote_count}</span>
        </button>

      </div>
    </div>
  );
}

const sorters = {
  newest: (a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  oldest: (a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  votes: (a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0),
};

const QuestionList = ({ questions, onVote, onAskQuestion }) => {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("votes");


  // Ensure questions is always an array
  const safeQuestions = useMemo(() => {
    // Debug logging

    if (!questions) {
      return [];
    }

    if (Array.isArray(questions)) {
      return questions;
    }

    if (typeof questions === 'number') {
      return [];
    }

    if (typeof questions === 'object' && questions.length !== undefined) {
      return Array.from(questions);
    }

    console.error('Questions prop is unexpected type:', typeof questions, questions);
    return [];
  }, [questions]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();

    // Use the safe questions array
    let list = [...safeQuestions];

    if (term) {
      list = list.filter(
        (x) =>
          x &&
          typeof x === 'object' &&
          (x.question?.toLowerCase().includes(term) ||
           x.name?.toLowerCase().includes(term))
      );
    }
    return list.sort(sorters[sort]);
  }, [safeQuestions, q, sort]);

  if (safeQuestions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
        <div className="mb-3 text-3xl">❓</div>
        <h2 className="mb-2 text-base font-semibold text-gray-900">No questions yet</h2>
        <p className="mx-auto mb-6 max-w-md text-sm text-gray-600">
          Be the first to ask a question. Your question will show up here and people can vote on it.
        </p>
        <button
          className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black/80"
          onClick={onAskQuestion}
        >
          Ask the first question
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Header + toolbar */}
      <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">All questions</h2>
          <p className="text-xs text-gray-600">
            {safeQuestions.length} question{safeQuestions.length !== 1 ? "s" : ""} asked
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search question or name…"
              className="w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
            {q && (
              <button
                className="absolute right-1.5 top-1.5 h-7 w-7 rounded text-gray-500 hover:bg-gray-100"
                onClick={() => setQ("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value )}
            className="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            aria-label="Sort questions"
            title="Sort"
          >
            <option value="votes">Top (votes)</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>

          <button
            className="hidden sm:inline-flex items-center rounded-md bg-gray-900 text-white px-3.5 py-2 text-sm font-medium hover:bg-black/80"
            onClick={onAskQuestion}
          >
            Ask question
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-200">
        {filtered.map((item) => (
          <QuestionCard
            key={item.uuid}
            q={item}
            onVote={onVote}
          />
        ))}

        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-600">
            No results for <span className="font-medium">“{q}”</span>. Try another search.
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionList;
