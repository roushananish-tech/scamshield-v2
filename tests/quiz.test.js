import test from 'node:test';
import assert from 'node:assert/strict';
import { QUIZ_CARDS, ROUND_SIZE, pickRound, gradeAnswer, scoreQuiz } from '../src/engine/quiz.js';

test('every card is graded correctly by the real engine (scams flagged, genuine messages not)', () => {
  for (const c of QUIZ_CARDS) {
    const g = gradeAnswer(c, c.truth);
    assert.equal(g.correct, true, c.id);
    assert.equal(g.engine.agrees, true, `${c.id}: engine said ${g.engine.verdict} (${g.engine.score})`);
    if (c.truth === 'scam') assert.ok(g.engine.reasons.length >= 1, `${c.id} should show reasons`);
  }
});

test('wrong answers are graded wrong and still carry the teaching line', () => {
  const c = QUIZ_CARDS[0];
  const g = gradeAnswer(c, 'legit');
  assert.equal(g.correct, false);
  assert.ok(g.teach.length > 10);
});

test('a round has 4 scams and 2 genuine messages, no duplicates, and is reproducible by seed', () => {
  const r = pickRound(42);
  assert.equal(r.length, ROUND_SIZE);
  assert.equal(r.filter((c) => c.truth === 'scam').length, 4);
  assert.equal(r.filter((c) => c.truth === 'legit').length, 2);
  assert.equal(new Set(r.map((c) => c.id)).size, ROUND_SIZE);
  assert.deepEqual(pickRound(42).map((c) => c.id), r.map((c) => c.id));
  assert.notDeepEqual(pickRound(1).map((c) => c.id), pickRound(2).map((c) => c.id));
});

test('quiz cards contain no real brands or personal numbers', () => {
  const blob = QUIZ_CARDS.map((c) => c.text).join(' ');
  assert.equal(/\b(sbi|hdfc|icici|axis|paytm|phonepe|gpay|amazon|flipkart)\b/i.test(blob), false);
  assert.equal(/(\+?91[\s-]?)?[6-9]\d{9}/.test(blob), false);
});

test('scoreQuiz tiers', () => {
  assert.equal(scoreQuiz([true, true, true]).tier.id, 'perfect');
  assert.equal(scoreQuiz([true, true, true, false]).tier.id, 'good');
  assert.equal(scoreQuiz([false, false, true]).tier.id, 'learn');
  assert.deepEqual(scoreQuiz([]), { score: 0, total: 0, tier: { id: 'none', message: '' } });
});
