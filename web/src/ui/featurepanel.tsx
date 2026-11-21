import { useState } from "react";

export type Feature = { title: string; text: string; img: string; alt: string };

/** Numbered feature list with a media panel that follows the selected item. */
export function FeaturePanel({ items }: { items: Feature[] }) {
  const [sel, setSel] = useState(0);
  return (
    <div className="fp">
      <ol className="fp__list">
        {items.map((f, i) => {
          const on = i === sel;
          return (
            <li key={f.title}>
              <button
                type="button"
                className={on ? "fp__item is-on" : "fp__item"}
                aria-pressed={on}
                onClick={() => setSel(i)}
                onFocus={() => setSel(i)}
              >
                <span className="fp__num" aria-hidden="true">{i + 1}</span>
                <span className="fp__txt">
                  <span className="fp__title">{f.title}</span>
                  <span className="fp__text">{f.text}</span>
                </span>
              </button>
              <img
                className="fp__inline"
                src={`/img/${f.img}-480.webp`}
                width={480}
                height={480}
                alt={f.alt}
                loading="lazy"
                decoding="async"
              />
            </li>
          );
        })}
      </ol>
      <div className="fp__panel" aria-live="polite">
        {items.map((f, i) => (
          <img
            key={f.img}
            className={i === sel ? "fp__img is-on" : "fp__img"}
            src={`/img/${f.img}-720.webp`}
            width={720}
            height={720}
            alt={i === sel ? f.alt : ""}
            aria-hidden={i === sel ? undefined : true}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </div>
  );
}
