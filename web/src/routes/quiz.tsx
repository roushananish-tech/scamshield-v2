import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { gradeAnswer, pickRound, scoreQuiz } from "../engine/quiz.js";
import { quizShare, safeBaseUrl, waLink } from "../engine/share.js";
import { Page, MAIN_HEADING_ID } from "../ui/chrome";
import { Icon } from "../ui/icons";
import { NewTab } from "../ui/parts";

export const Route = createFileRoute("/quiz")({
  head: () => ({ meta: [{ title: "Spot the scam | ScamShield" }] }),
  component: QuizPage,
});

type Answer = "scam" | "legit";
type Card = { id: string; truth: Answer; channel: string; text: string; teach: string };
type Grade = {
  correct: boolean;
  truth: string;
  teach: string;
  engine: { verdict: string; label: string; score: number; agrees: boolean; reasons: { label: string; why: string }[] };
};

type View =
  | { kind: "intro" }
  | { kind: "card"; round: Card[]; index: number; answer: Answer | null; grade: Grade | null; results: boolean[] }
  | { kind: "score"; results: boolean[] };

function newSeed(): number {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0];
}

function QuizPage() {
  const [view, setView] = useState<View>({ kind: "intro" });
  const [baseUrl, setBaseUrl] = useState("");
  const [focusTo, setFocusTo] = useState<"main" | "reveal" | null>(null);
  const mainRef = useRef<HTMLHeadingElement>(null);
  const revealRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setBaseUrl(safeBaseUrl(window.location.origin + "/"));
  }, []);

  useEffect(() => {
    if (focusTo === "main") mainRef.current?.focus();
    if (focusTo === "reveal") revealRef.current?.focus();
    if (focusTo) setFocusTo(null);
  }, [focusTo]);

  const start = () => {
    setView({ kind: "card", round: pickRound(newSeed()) as Card[], index: 0, answer: null, grade: null, results: [] });
    setFocusTo("main");
  };

  const answer = (a: Answer) => {
    if (view.kind !== "card" || view.answer) return;
    const grade = gradeAnswer(view.round[view.index], a) as Grade;
    setView({ ...view, answer: a, grade, results: [...view.results, grade.correct] });
    setFocusTo("reveal");
  };

  const next = () => {
    if (view.kind !== "card") return;
    if (view.index + 1 >= view.round.length) setView({ kind: "score", results: view.results });
    else setView({ ...view, index: view.index + 1, answer: null, grade: null });
    setFocusTo("main");
  };

  if (view.kind === "intro") {
    return (
      <Page back={{ to: "/", label: "Start" }}>
        <h1 id={MAIN_HEADING_ID} ref={mainRef} tabIndex={-1}>
          Spot the scam
        </h1>
        <p className="lead">You will see 6 messages. Some are scams, some are genuine. Decide for each one.</p>
        <p className="muted gap-top">Your answers stay on this device. No scores are saved.</p>
        <noscript>
          <p className="noscript">Turn on JavaScript to use this. The call and lost-money steps work without it.</p>
        </noscript>
        <div className="actions">
          <button type="button" className="btn btn--primary" onClick={start}>
            Start
          </button>
        </div>
      </Page>
    );
  }

  if (view.kind === "score") {
    const s = scoreQuiz(view.results);
    return (
      <Page back={{ to: "/", label: "Start" }}>
        <h1 id={MAIN_HEADING_ID} ref={mainRef} tabIndex={-1}>
          You spotted {s.score} of {s.total}
        </h1>
        <p className="lead">{s.tier.message}</p>
        <div className="actions">
          <a
            className="btn btn--primary"
            href={waLink(quizShare(s.score, s.total, baseUrl))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="share" />
            Share my score on WhatsApp
            <NewTab />
          </a>
          <button type="button" className="btn btn--secondary" onClick={start}>
            Play again
          </button>
        </div>
        <p className="gap-top-lg">
          <Link to="/rules" className="inline-tap">
            Learn the four rules
          </Link>
        </p>
      </Page>
    );
  }

  const card = view.round[view.index];
  const g = view.grade;
  return (
    <Page back={{ to: "/", label: "Start" }}>
      <h1 id={MAIN_HEADING_ID} ref={mainRef} tabIndex={-1}>
        Message {view.index + 1} of {view.round.length}
      </h1>

      <div className="bubble-wrap">
        <p className="muted">{card.channel}</p>
        <p className="bubble">{card.text}</p>
      </div>

      <p className="gap-top-lg">
        <strong>Is this a scam?</strong>
      </p>
      <div className="actions">
        {(["scam", "legit"] as const).map((a) => (
          <button
            key={a}
            type="button"
            className="btn btn--secondary"
            disabled={view.answer !== null}
            onClick={() => answer(a)}
          >
            {a === "scam" ? "It's a scam" : "It's genuine"}
            {view.answer === a ? <span className="answer-tag">Your answer</span> : null}
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {g ? (
          <div className={g.correct ? "reveal reveal--correct" : "reveal"}>
            <h2 className="reveal__head" ref={revealRef} tabIndex={-1}>
              <Icon name={g.correct ? "check" : "info"} />
              {g.correct ? "Correct." : "Not quite."}
            </h2>
            <p className="gap-top">{g.truth === "scam" ? "This one is a scam." : "This one is genuine."}</p>
            <p>{g.teach}</p>
            <h3 className="gap-top">What ScamShield&apos;s checker found</h3>
            <p>{g.engine.label}</p>
            {g.engine.reasons.length > 0 ? (
              <ul className="reasons">
                {g.engine.reasons.map((r) => (
                  <li key={r.label}>
                    <strong>{r.label}</strong>
                    <p>{r.why}</p>
                  </li>
                ))}
              </ul>
            ) : null}
            {!g.engine.agrees ? (
              <p>Our checker got this one wrong. That is why the four rules matter more than any app.</p>
            ) : null}
            <div className="actions">
              <button type="button" className="btn btn--primary" onClick={next}>
                {view.index + 1 >= view.round.length ? "See my score" : "Next message"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Page>
  );
}
