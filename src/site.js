// Image accordion: opens on click, tap or Enter/Space. No network, no storage.
// Focus alone does not open a panel, so tabbing never shifts the layout.
const items = document.querySelectorAll('.acc__item');

function openItem(target) {
  for (const item of items) {
    const on = item === target;
    item.classList.toggle('is-open', on);
    item.querySelector('.acc__btn').setAttribute('aria-expanded', String(on));
  }
}

for (const item of items) {
  item.querySelector('.acc__btn').addEventListener('click', () => openItem(item));
}
