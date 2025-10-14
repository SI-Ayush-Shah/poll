import { supabase } from './supabaseClient.js';

// LocalStorage key for storing voted questions
const VOTED_QUESTIONS_KEY = 'voted_questions';

/**
 * Get the list of question IDs that the current user has voted on
 * @returns {string[]} Array of question UUIDs that have been voted on
 */
export function getVotedQuestions() {
  try {
    const stored = localStorage.getItem(VOTED_QUESTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading voted questions from localStorage:', error);
    return [];
  }
}

/**
 * Check if the current user has voted on a specific question
 * @param {string} uuid - The question UUID
 * @returns {boolean} True if the user has voted on this question
 */
export function hasVoted(uuid) {
  const votedQuestions = getVotedQuestions();
  return votedQuestions.includes(uuid);
}

/**
 * Mark a question as voted by the current user
 * @param {string} uuid - The question UUID
 */
export function markQuestionAsVoted(uuid) {
  try {
    const votedQuestions = getVotedQuestions();
    if (!votedQuestions.includes(uuid)) {
      votedQuestions.push(uuid);
      localStorage.setItem(VOTED_QUESTIONS_KEY, JSON.stringify(votedQuestions));
    }
  } catch (error) {
    console.error('Error saving voted question to localStorage:', error);
  }
}

// Note: In JavaScript, we use JSDoc for type hints
/**
 * @typedef {Object} Question
 * @property {string} uuid
 * @property {string} name
 * @property {string} question
 * @property {number} vote_count
 * @property {string} created_at
 */

/**
 * Fetch all questions ordered by vote count and creation date
 * @returns {Promise<Question[]>}
 */
export async function fetchQuestions() {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('vote_count', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Debug logging

    // Ensure we always return an array
    if (data === null || data === undefined) {
      console.warn('Supabase returned null/undefined, returning empty array');
      return [];
    }

    if (Array.isArray(data)) {
      return data;
    }

    if (typeof data === 'number') {
      console.error('Supabase returned a number instead of array:', data);
      return [];
    }

    if (typeof data === 'object') {
      console.error('Supabase returned object instead of array:', data);
      return [];
    }

    console.error('Supabase returned unexpected type:', typeof data, data);
    return [];
  } catch (error) {
    console.error('Error in fetchQuestions:', error);
    throw error;
  }
}

/**
 * Add a new question
 * @param {string} name - The name of the person asking
 * @param {string} question - The question text
 * @returns {Promise<Question>}
 */
export async function addQuestion(name, question) {
  const { data, error } = await supabase
    .from('questions')
    .insert({ name, question })
    .select()
    .single();

  if (error) throw error;
  return data;
}


/**
 * Upvote a question
 * @param {string} uuid - The question UUID
 * @returns {Promise<Question>} - The updated question object
 * @throws {Error} If the user has already voted on this question
 */
export async function upvote(uuid) {
  // Check if user has already voted
  if (hasVoted(uuid)) {
    throw new Error('You have already voted on this question');
  }

  // Fetch current question
  const { data: currentQuestion, error: fetchError } = await supabase
    .from('questions')
    .select('*')
    .eq('uuid', uuid)
    .single();

  if (fetchError) throw fetchError;

  // Update vote count
  const { data, error: updateError } = await supabase
    .from('questions')
    .update({ vote_count: (currentQuestion.vote_count || 0) + 1 })
    .eq('uuid', uuid)
    .select()
    .single();

  if (updateError) throw updateError;

  // Mark question as voted in localStorage
  markQuestionAsVoted(uuid);

  return data;
}
