import { useEffect, useId, useRef, useState } from "react";

const MAX_NAME = 100;
const MAX_Q = 500;

const AddQuestion = ({ onAddQuestion, onCancel }) => {
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const dialogRef = useRef(null);
  const nameRef = useRef(null);
  const labelId = useId();
  const descId = useId();

  // Lock background scroll while modal is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = original);
  }, []);

  // Autofocus first input
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const validate = () => {
    const e = {};
    if (!question.trim()) e.question = "Please write a question.";
    if (question.trim().length < 10) e.question = "Question should be at least 10 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onCancel?.();
  };

  const handleKey = (e) => {
    if (e.key === "Escape") onCancel?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onAddQuestion({
        name: name.trim(),
        title: question.trim(),
      });
      setName("");
      setQuestion("");
    } catch (error) {
      console.error("Error adding question:", error);
      setErrors({ form: "Could not submit. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdrop}
      onKeyDown={handleKey}
      aria-labelledby={labelId}
      aria-describedby={descId}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-in fade-in" />

      {/* Card */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl animate-in zoom-in-95 slide-in-from-top-2"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <h2 id={labelId} className="text-base font-semibold text-gray-900">
            Ask a question
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4">
          {errors.form && (
            <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>
          )}

          <p id={descId} className="mb-4 text-sm text-gray-500">
            Keep it clear and concise.
          </p>

          {/* Name */}
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="question-name" className="text-xs font-medium text-gray-700">
                Your name <span className="text-gray-400">(optional)</span>
              </label>
              <span className="text-[11px] text-gray-400">
                {name.length}/{MAX_NAME}
              </span>
            </div>
            <input
              ref={nameRef}
              id="question-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Jane Doe (or leave blank for Anonymous)"
              maxLength={MAX_NAME}
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 ${
                errors.name ? "border-red-300" : "border-gray-300"
              }`}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-xs text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* Question */}
          <div className="mb-5">
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="question-text" className="text-xs font-medium text-gray-700">
                Your question
              </label>
              <span className="text-[11px] text-gray-400">
                {question.length}/{MAX_Q}
              </span>
            </div>
            <div className="relative">
              <textarea
                id="question-text"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  if (errors.question) setErrors((prev) => ({ ...prev, question: undefined }));
                }}
                placeholder="What would you like to ask?"
                maxLength={MAX_Q}
                rows={5}
                className={`w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 ${
                  errors.question ? "border-red-300" : "border-gray-300"
                }`}
                aria-invalid={!!errors.question}
                aria-describedby={errors.question ? "question-error" : undefined}
              />
              {/* Soft hint */}
              <div className="pointer-events-none absolute bottom-2 right-2 text-[11px] text-gray-400">
                Press ⌘/Ctrl + Enter
              </div>
            </div>
            {errors.question && (
              <p id="question-error" className="mt-1 text-xs text-red-600">
                {errors.question}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "enter") {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-b-transparent" />
                  Submitting…
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuestion;
