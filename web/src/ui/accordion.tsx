import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon, type IconName } from "./icons";

export type AccItem = {
  kind: string;
  icon: IconName;
  title: string;
  sub: string;
  img: string;
  alt: string;
};

/** Image accordion. Opens on click, tap or keyboard focus. No hover-only behaviour. */
export function ScamAccordion({ items }: { items: AccItem[] }) {
  const [open, setOpen] = useState(0);
  return (
    <ul className="acc">
      {items.map((t, i) => {
        const on = i === open;
        return (
          <li key={t.kind} className={on ? "acc__item is-open" : "acc__item"}>
            <img
              className="acc__img"
              src={`/img/${t.img}-480.webp`}
              srcSet={`/img/${t.img}-480.webp 480w, /img/${t.img}-720.webp 720w`}
              sizes="(min-width: 900px) 420px, 92vw"
              width={480}
              height={637}
              alt={t.alt}
              loading="lazy"
              decoding="async"
            />
            <span className="acc__shade" aria-hidden="true" />
            <button
              type="button"
              className="acc__btn"
              aria-expanded={on}
              aria-controls={`acc-${t.kind}`}
              onClick={() => setOpen(i)}
              onFocus={() => setOpen(i)}
            >
              <span className="acc__num" aria-hidden="true">0{i + 1}</span>
              <span className="acc__label">{t.title}</span>
            </button>
            <div id={`acc-${t.kind}`} className="acc__body">
              <span className="icon-tile acc__icon" aria-hidden="true">
                <Icon name={t.icon} size={26} />
              </span>
              <p className="acc__sub">{t.sub}</p>
              <Link to="/call/$kind" params={{ kind: t.kind }} className="acc__go">
                Open the guide
                <Icon name="chevron-right" size={20} />
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
