// Shared helpers for the no-design test pages. Token lives in localStorage.
const TOKEN_KEY = "tafheem_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}
function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t);
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// fetch wrapper that attaches the bearer token and parses JSON.
async function api(path, options = {}) {
  const headers = Object.assign(
    { "Content-Type": "application/json" },
    options.headers || {}
  );
  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(path, { ...options, headers });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, ok: res.ok, body };
}

// Escape user-controlled text before putting it inside innerHTML.
// display_name and tags are NOT server-sanitized (only reflection bodies are),
// so they must be output-encoded to prevent stored XSS.
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function show(el, value) {
  const node = typeof el === "string" ? document.getElementById(el) : el;
  node.textContent =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

// --- lightweight EN/AR toggle (RTL) --------------------------------------
const LANG_KEY = "tafheem_lang";
function getLang() {
  return localStorage.getItem(LANG_KEY) || "en";
}
function toggleLang() {
  localStorage.setItem(LANG_KEY, getLang() === "ar" ? "en" : "ar");
  applyLang();
}
// Apply current language: set page direction and swap any element that carries
// data-en / data-ar text.
function applyLang() {
  const l = getLang();
  document.documentElement.lang = l;
  document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-en]").forEach((el) => {
    const t = el.getAttribute("data-" + l);
    if (t !== null) el.textContent = t;
  });
  const tg = document.getElementById("langToggle");
  if (tg) tg.textContent = l === "ar" ? "English" : "العربية";
}
window.addEventListener("DOMContentLoaded", applyLang);

function nav() {
  const links = [
    ["register.html", "register", "تسجيل"],
    ["login.html", "login", "دخول"],
    ["reader.html", "reader", "القارئ"],
    ["write.html", "write", "كتابة"],
    ["feed.html", "feed", "المجتمع"],
    ["dashboard.html", "dashboard", "لوحتي"],
    ["mod.html", "mod", "الإشراف"],
  ];
  const here = (location.pathname.split("/").pop() || "register.html").toLowerCase();

  let html =
    '<header class="app-header">' +
    '<div class="brand">Tafheem <span>· test</span></div>' +
    '<nav class="app-nav">';
  links.forEach(([href, en, ar]) => {
    const active = href === here ? ' class="active"' : "";
    html +=
      '<a href="' + href + '"' + active +
      ' data-en="' + en + '" data-ar="' + ar + '">' + en + "</a>";
  });
  html +=
    "</nav>" +
    '<button id="langToggle" type="button" class="lang-btn" onclick="toggleLang()">العربية</button>' +
    "</header>";
  document.write(html);
}

// Full country list for the registration dropdown.
const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina",
  "Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados",
  "Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana",
  "Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada",
  "Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo",
  "Costa Rica","Croatia","Cuba","Cyprus","Czechia","Denmark","Djibouti","Dominica",
  "Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia",
  "Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana",
  "Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary",
  "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica",
  "Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon",
  "Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi",
  "Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico",
  "Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar",
  "Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria",
  "North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama",
  "Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania",
  "Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines",
  "Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles",
  "Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa",
  "South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland",
  "Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga",
  "Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine",
  "United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu",
  "Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

// Fill a <select> with the country list. `placeholder` is the first prompt option.
function populateCountries(selectId, placeholder) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  if (placeholder) {
    const o = document.createElement("option");
    o.value = "";
    o.textContent = placeholder;
    o.disabled = true;
    o.selected = true;
    sel.appendChild(o);
  }
  COUNTRIES.forEach((c) => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    sel.appendChild(o);
  });
}

// Redirect helper used after login.
function goTo(page) {
  window.location.href = page;
}
