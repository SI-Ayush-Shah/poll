import { useEffect, useState, useCallback } from 'react';
import { fetchQuestions, addQuestion, deleteQuestion, upvote } from '../lib/questions.js';
import { supabase } from '../lib/supabaseClient.js';

/**
 * React hook for managing questions with optional realtime updates
 * @param {boolean} realtime - Enable realtime subscriptions (default: true)
 * @returns {Object} Hook state and methods
 */
export function useQuestions(realtime = true) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const data = await fetchQuestions();
      setItems(data);
    } catch (e) {
      setErr(e.message || 'Error loading questions');
      console.error('Error fetching questions:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!realtime) return;

    const channel = supabase
      .channel('questions-live')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'questions'
      }, () => {
        refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [realtime, refresh]);

  return {
    items,
    loading,
    err,
    async create(name, question) {
      try {
        const newQuestion = await addQuestion(name, question);
        setItems(prev => [newQuestion, ...prev]);
        return newQuestion;
      } catch (e) {
        setErr(e.message || 'Error creating question');
        throw e;
      }
    },
    async remove(uuid) {
      try {
        await deleteQuestion(uuid);
        setItems(prev => prev.filter(x => x.uuid !== uuid));
        return true;
      } catch (e) {
        setErr(e.message || 'Error deleting question');
        throw e;
      }
    },
    async vote(uuid) {
      try {
        const updated = await upvote(uuid);
        setItems(prev =>
          prev.map(x => x.uuid === uuid ? updated : x)
              .sort((a, b) => b.vote_count - a.vote_count || new Date(b.created_at) - new Date(a.created_at))
        );
        return updated;
      } catch (e) {
        setErr(e.message || 'Error voting on question');
        throw e;
      }
    },
    refresh,
  };
}
