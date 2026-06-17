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

function show(el, value) {
  const node = typeof el === "string" ? document.getElementById(el) : el;
  node.textContent =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function nav() {
  document.write(
    '<p>[ <a href="register.html">register</a> | ' +
      '<a href="login.html">login</a> | ' +
      '<a href="reader.html">reader</a> | ' +
      '<a href="write.html">write</a> | ' +
      '<a href="feed.html">feed</a> | ' +
      '<a href="dashboard.html">dashboard</a> | ' +
      '<a href="mod.html">mod</a> ]</p>'
  );
}
