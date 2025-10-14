import { supabase } from './supabaseClient.js';

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
    console.log('Supabase returned data:', data, typeof data, 'isArray:', Array.isArray(data));

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
 * Delete a question by UUID
 * @param {string} uuid - The question UUID
 * @returns {Promise<boolean>}
 */
export async function deleteQuestion(uuid) {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('uuid', uuid);

  if (error) throw error;
  return true;
}

/**
 * Upvote a question (atomic operation via RPC)
 * @param {string} uuid - The question UUID
 * @returns {Promise<Question>} - The updated question object
 */
export async function upvote(uuid) {
  const { data, error } = await supabase.rpc('increment_vote', { q_uuid: uuid });
  if (error) throw error;
  return data; // function returns the updated row
}
