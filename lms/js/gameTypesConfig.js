/**
 * Fixed Game Type Configuration (frontend mirror of backend/config/gameTypes.js)
 *
 * total_time_seconds is the ONLY source of truth for time_limit sent to
 * the API. Teachers cannot edit question count / time / marks — they are
 * locked to the selected game type.
 */

export const GAME_TYPES = {

  Rapid_fire: {
    label: 'Rapid Fire',
    total_questions: 20,
    total_time_seconds: 400,       // 6 min 40 sec
    per_question_time_seconds: null,
    correct_marks: 1,
    wrong_marks: 0,
    marks_type: 'fixed',
    marks_display: '+1 per correct answer, 0 for wrong'
  },

  Bonus_Points: {
    label: 'Bonus Points',
    total_questions: 20,
    total_time_seconds: 600,       // 10 min
    per_question_time_seconds: null,
    correct_marks: 2,
    wrong_marks: 0,
    marks_type: 'fixed',
    marks_display: '+2 per correct answer, 0 for wrong'
  },

  Negative_Marking: {
    label: 'Negative Marking',
    total_questions: 20,
    total_time_seconds: 600,       // 10 min
    per_question_time_seconds: null,
    correct_marks: 2,
    wrong_marks: 1,
    marks_type: 'fixed',
    marks_display: '+2 per correct answer, -1 for wrong'
  },

  No_negative_marking: {
    label: 'No Negative Marking',
    total_questions: 20,
    total_time_seconds: 900,       // 15 min
    per_question_time_seconds: null,
    correct_marks: 1,
    wrong_marks: 0,
    marks_type: 'fixed',
    marks_display: '+1 per correct answer, 0 for wrong'
  },

  Kbc: {
    label: 'KBC',
    total_questions: 20,
    total_time_seconds: 1200,      // 20 min
    per_question_time_seconds: 60, // 60 sec per question
    correct_marks: null,
    wrong_marks: 0,
    marks_type: 'ladder',
    ladder: [
      { from: 1, to: 7, marks: 5 },
      { from: 8, to: 14, marks: 10 },
      { from: 15, to: 20, marks: 20 }
    ],
    marks_display: 'Q1-7: +5, Q8-14: +10, Q15-20: +20 (0 for wrong)'
  }

};

/**
 * Fixed, non-editable descriptions for every game type. Teachers no longer
 * type their own description — it is auto-filled based on the Game Type
 * they pick, and stays consistent across every game created on the platform.
 */
export const GAME_DESCRIPTIONS = {
  Rapid_fire: '⚡ Rapid Fire: Answer as many questions as possible within the given time limit. Speed is the key—each correct answer earns marks (+1 per correct answer, 0 for wrong). Try to answer quickly before the timer runs out.',

  Kbc: '👑 KBC (Kaun Banega Crorepati Style): Experience the famous KBC-style quiz game. Questions become more challenging as you progress. Each question has four options, and you must choose the correct answer before the timer ends. Your score increases with every correct answer (Q1-7: +5, Q8-14: +10, Q15-20: +20, 0 for wrong), just like the KBC format where difficulty and rewards increase as the game progresses.',

  Bonus_Points: '⭐ Bonus Points: Earn extra rewards by answering questions correctly. Every correct answer gives normal marks along with bonus points (+2 per correct answer, 0 for wrong), allowing you to achieve a higher score than in a regular quiz.',

  Negative_Marking: '❌ Negative Marking: Think carefully before answering. Correct answers earn marks, but every wrong answer deducts marks from your score (+2 per correct answer, -1 for wrong). Skip a question if you are unsure to avoid losing points.',

  No_negative_marking: '✅ No Negative Marking: Attempt every question without worrying about losing marks. Correct answers earn marks, while incorrect answers do not reduce your score (+1 per correct answer, 0 for wrong). Since there is no penalty for wrong answers, it\'s beneficial to answer every question.'
};

/**
 * Get the fixed description text for a given game type key.
 */
export function getGameDescription(gameType) {
  return GAME_DESCRIPTIONS[gameType] || 'Select a Game Type above to see its fixed description.';
}

/**
 * Convert seconds -> "6m 40s" / "10m" style display string
 */
export function formatSeconds(totalSeconds) {
  if (!totalSeconds && totalSeconds !== 0) return '-';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (seconds === 0) return `${minutes} min`;
  return `${minutes} min ${seconds} sec`;
}

/**
 * Convert seconds -> "MM:SS" clock display
 */
export function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Shared intro/header block used by both the Questions prompt and the
 * Answer Key prompt, so ChatGPT gets identical context for each.
 */
function buildCommonHeader({ config, courseName, gameTitle, unitName }) {
  const kbcNote = config === GAME_TYPES.Kbc
    ? `\nThis is a KBC (Kaun Banega Crorepati) style game. Order the questions by increasing difficulty:
- Questions 1 to 7: Easy difficulty
- Questions 8 to 14: Medium difficulty
- Questions 15 to 20: Hard difficulty
The question_id must reflect this increasing difficulty order (1 = easiest, 20 = hardest).`
    : '';

  return `Associated Course: ${courseName || '[Enter Course Name]'}
Game Title: ${gameTitle || '[Enter Game Title]'}
Unit Section Name: ${unitName || '[Enter Unit/Section Name]'}
Game Type: ${config.label}

Requirements:
- Create exactly ${config.total_questions} multiple choice questions (MCQs) strictly based on the topic "${gameTitle || '[Game Title]'}" from the course "${courseName || '[Course Name]'}".
- Each question must have exactly 4 options.
- Only one option should be correct.
- CRITICAL: The correct answers must be distributed randomly across options A, B, C, and D. Do NOT make "A" the correct option for all or most questions. Ensure a balanced, randomized distribution of correct answers across the entire set of questions (e.g. approximately 25% of questions should have "A" as correct, 25% "B", 25% "C", 25% "D").
- Do not repeat questions. Keep language simple and exam-appropriate.
- question_id must be a sequential number from 1 to ${config.total_questions}.${kbcNote}`;
}

/**
 * Build the ChatGPT prompt used to generate ONLY the Questions JSON.
 * This is what the teacher copies and pastes into the "Questions" box.
 */
export function buildQuestionsPrompt({ gameType, courseName, gameTitle, unitName }) {
  const config = GAME_TYPES[gameType];
  if (!config) return '';

  return `You are an expert question paper setter. Generate the QUESTIONS for an educational quiz game with the following details:

${buildCommonHeader({ config, courseName, gameTitle, unitName })}

Return ONLY the questions as a single valid JSON array (no extra text, no markdown, no explanation - only the JSON), in exactly this format:

[
  {
    "question_id": 1,
    "question": "Question text 1?",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"]
  },
  {
    "question_id": 2,
    "question": "Question text 2?",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"]
  }
]`;
}

/**
 * Build the ChatGPT prompt used to generate ONLY the Answer Key JSON.
 * This is what the teacher copies and pastes into the "Answer Key" box.
 * It intentionally re-states the same question set context so the
 * question_id values line up with the Questions prompt above.
 */
export function buildAnswerKeyPrompt({ gameType, courseName, gameTitle, unitName }) {
  const config = GAME_TYPES[gameType];
  if (!config) return '';

  return `You are an expert question paper setter. Generate the ANSWER KEY for the same educational quiz game described below (use the identical set of questions you would generate for this topic, only their correct answers are needed here):

${buildCommonHeader({ config, courseName, gameTitle, unitName })}

Return ONLY the answer key as a single valid JSON array (no extra text, no markdown, no explanation - only the JSON), in exactly this format, with question_id matching the Questions JSON:

[
  {
    "question_id": 1,
    "correct_answer": "C"
  },
  {
    "question_id": 2,
    "correct_answer": "A"
  },
  {
    "question_id": 3,
    "correct_answer": "D"
  },
  {
    "question_id": 4,
    "correct_answer": "B"
  }
]`;
}
