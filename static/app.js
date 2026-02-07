const ALLERGENS = [
  { key: "celery", label: "Celery" },
  { key: "crustaceans", label: "Crustaceans" },
  { key: "eggs", label: "Eggs" },
  { key: "fish", label: "Fish" },
  { key: "gluten", label: "Gluten" },
  { key: "lupin", label: "Lupin" },
  { key: "milk", label: "Milk" },
  { key: "molluscs", label: "Molluscs" },
  { key: "mustard", label: "Mustard" },
  { key: "nuts", label: "Tree nuts" },
  { key: "peanuts", label: "Peanuts" },
  { key: "sesame", label: "Sesame" },
  { key: "soya", label: "Soya" },
  { key: "sulphites", label: "Sulphites" }
];

let dishes = [];
let selected = new Set();

const elChips = document.getElementById("chips");
const elList = document.getElementById("list");
const elCount = document.getElementById("count");
const elClear = document.getElementById("clear");
const elSearch = document.getElementById("search");
const elCategory = document.getElementById("category");
const elExcludeMay = document.getElementById("excludeMay");

function prettyAllergen(key) {
  const found = ALLERGENS.find(a => a.key === key);
  return found ? found.label : key;
}

function uniqCategories(items) {
  const set = new Set(items.map(d => d.category || "Other"));
  return ["All", ...Array.from(set).sort()];
}

function renderCategoryOptions(categories) {
  elCategory.innerHTML = "";
  for (const c of categories) {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    elCategory.appendChild(opt);
  }
}

function renderChips() {
  elChips.innerHTML = "";
  for (const a of ALLERGENS) {
    const btn = document.createElement("button");
    btn.className = "chip" + (selected.has(a.key) ? " active" : "");
    btn.textContent = a.label;
    btn.type = "button";

    btn.onclick = () => {
      if (selected.has(a.key)) selected.delete(a.key);
      else selected.add(a.key);
      renderChips();
      renderList();
    };

    elChips.appendChild(btn);
  }
}

function matchesText(dish) {
  const q = (elSearch.value || "").trim().toLowerCase();
  if (!q) return true;
  return (dish.name || "").toLowerCase().includes(q);
}

function matchesCategory(dish) {
  const c = elCategory.value;
  if (!c || c === "All") return true;
  return (dish.category || "Other") === c;
}

function isSafe(dish) {
  if (selected.size === 0) return true;

  const contains = new Set(dish.contains || []);
  const may = new Set(dish.may_contain || []);
  const excludeMay = elExcludeMay.checked;

  for (const a of selected) {
    if (contains.has(a)) return false;
    if (excludeMay && may.has(a)) return false;
  }
  return true;
}

function badge(text) {
  const span = document.createElement("span");
  span.className = "badge";
  span.textContent = text;
  return span;
}

function renderList() {
  const filtered = dishes
    .filter(matchesCategory)
    .filter(matchesText)
    .filter(isSafe);

  elCount.textContent = `${filtered.length} dish${filtered.length === 1 ? "" : "es"} shown`;
  elList.innerHTML = "";

  for (const d of filtered) {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h3");
    title.textContent = d.name;
    card.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = d.category || "Other";
    card.appendChild(meta);

    const badges = document.createElement("div");
    badges.className = "badges";

    const c = d.contains || [];
    const m = d.may_contain || [];

    if (c.length === 0 && m.length === 0) {
      badges.appendChild(badge("No listed allergens"));
    } else {
      for (const a of c) badges.appendChild(badge(`Contains: ${prettyAllergen(a)}`));
      for (const a of m) badges.appendChild(badge(`May contain: ${prettyAllergen(a)}`));
    }

    card.appendChild(badges);
    elList.appendChild(card);
  }
}

async function init() {
  const res = await fetch("/api/menu");
  const data = await res.json();
  dishes = data.dishes || [];

  renderCategoryOptions(uniqCategories(dishes));
  renderChips();
  renderList();

  elSearch.addEventListener("input", renderList);
  elCategory.addEventListener("change", renderList);
  elExcludeMay.addEventListener("change", renderList);

  elClear.onclick = () => {
    selected.clear();
    elSearch.value = "";
    elExcludeMay.checked = false;
    elCategory.value = "All";
    renderChips();
    renderList();
  };
}

init();

