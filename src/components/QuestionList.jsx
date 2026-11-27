import { useMemo, useState } from "react";
import { hasVoted } from "../lib/questions.js";

export const formatTimeAgo = (iso) => {
  const created = new Date(iso);
  const diff = Date.now() - created.getTime();
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  const minutes = Math.round(diff / 60000);
  if (Math.abs(minutes) < 1) return "just now";
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");

  const days = Math.round(hours / 24);
  return rtf.format(-days, "day");
};

export const formatAbsolute = (iso) => new Date(iso).toLocaleString();

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

function avatarFor(name = "Anonymous") {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const initials =
    name === "Anonymous"
      ? "?"
      : name
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase())
          .join("");
  return { initials: initials || "?", color: AVATAR_COLORS[hash % AVATAR_COLORS.length] };
}

function ChevronUp({ className = "" }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 ${className}`} aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 5.5a.75.75 0 0 1 .53.22l5 5a.75.75 0 1 1-1.06 1.06L10 7.31l-4.47 4.47a.75.75 0 0 1-1.06-1.06l5-5A.75.75 0 0 1 10 5.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function QuestionCard({ q, onVote, pollEnded, rank }) {
  const isVoted = hasVoted(q.uuid);
  const { initials, color } = avatarFor(q.name || "Anonymous");
  const disabled = pollEnded || isVoted;

  return (
    <article
      className="group flex items-start gap-4 px-4 py-4 transition-colors hover:bg-slate-50/70 sm:px-5 animate-rise"
      data-id={q.uuid}
    >
      {/* Vote */}
      <button
        className={`flex w-12 shrink-0 flex-col items-center rounded-xl border py-1.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
          isVoted
            ? "cursor-default border-indigo-200 bg-indigo-600 text-white"
            : pollEnded
            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95"
        }`}
        onClick={() => !disabled && onVote(q.uuid)}
        disabled={disabled}
        aria-label={
          pollEnded
            ? `Poll has ended. Current count ${q.vote_count}`
            : isVoted
            ? `You have already voted. Current count ${q.vote_count}`
            : `Upvote. Current count ${q.vote_count}`
        }
      >
        <ChevronUp />
        <span className="text-sm font-semibold tabular-nums leading-5">{q.vote_count ?? 0}</span>
      </button>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <h3 className="whitespace-pre-wrap break-words text-[15px] font-medium leading-6 text-slate-900">
          {q.question}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          <span
            className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${color}`}
            aria-hidden
          >
            {initials}
          </span>
          <span className="font-medium text-slate-700">{q.name}</span>
          <span aria-hidden>·</span>
          <time dateTime={q.created_at} title={formatAbsolute(q.created_at)}>
            {formatTimeAgo(q.created_at)}
          </time>
          {rank === 0 && (q.vote_count ?? 0) > 0 && (
            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
              Most voted
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

const sorters = {
  newest: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  oldest: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  votes: (a, b) =>
    (b.vote_count ?? 0) - (a.vote_count ?? 0) ||
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
};

const SORT_TABS = [
  { id: "votes", label: "Top" },
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
];

const QuestionList = ({ questions, onVote, onAskQuestion, pollEnded }) => {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("votes");

  const safeQuestions = useMemo(
    () => (Array.isArray(questions) ? questions.filter((x) => x && typeof x === "object") : []),
    [questions]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = [...safeQuestions];
    if (term) {
      list = list.filter(
        (x) =>
          x.question?.toLowerCase().includes(term) || x.name?.toLowerCase().includes(term)
      );
    }
    return list.sort(sorters[sort]);
  }, [safeQuestions, q, sort]);

  if (safeQuestions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-xl text-indigo-600">
          ?
        </div>
        <h2 className="mb-1 text-base font-semibold text-slate-900">No questions yet</h2>
        <p className="mx-auto mb-6 max-w-sm text-sm text-slate-600">
          Be the first to ask. Your question will show up here and everyone can vote on it.
        </p>
        {!pollEnded && (
          <button
            className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            onClick={onAskQuestion}
          >
            Ask the first question
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">All questions</h2>
          <p className="text-xs text-slate-500">
            {safeQuestions.length} question{safeQuestions.length !== 1 ? "s" : ""} asked
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.45 4.39l3.58 3.58a.75.75 0 1 1-1.06 1.06l-3.58-3.58A7 7 0 0 1 2 9Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search questions"
              aria-label="Search questions"
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-8 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-56"
            />
            {q && (
              <button
                className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-500 hover:bg-slate-100"
                onClick={() => setQ("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div
            role="tablist"
            aria-label="Sort questions"
            className="inline-flex rounded-lg bg-slate-100 p-0.5"
          >
            {SORT_TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={sort === t.id}
                onClick={() => setSort(t.id)}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                  sort === t.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {filtered.map((item, i) => (
          <QuestionCard
            key={item.uuid}
            q={item}
            onVote={onVote}
            pollEnded={pollEnded}
            rank={sort === "votes" && !q.trim() ? i : -1}
          />
        ))}

        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-slate-600">
            No results for <span className="font-medium">“{q}”</span>. Try another search.
          </div>
        )}
      </div>
    </section>
  );
};

export default QuestionList;
