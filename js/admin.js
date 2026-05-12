// admin.js — FlatLabs admin panel logic
// ES module, no dependencies, vanilla JS

const TOKEN_KEY = "fl_admin_token";
const LIMIT = 50;

// ── State ──────────────────────────────────────────────────────────────────

const state = {
  token: null,
  offset: 0,
  total: 0,
  tier: "",           // "" | "FREE" | "PRO"
  expandedRowId: null,
};

// ── DOM refs ───────────────────────────────────────────────────────────────

const loginState     = document.getElementById("login-state");
const dashState      = document.getElementById("dashboard-state");
const passwordInput  = document.getElementById("password-input");
const loginBtn       = document.getElementById("login-btn");
const loginError     = document.getElementById("login-error");
const signoutBtn     = document.getElementById("signout-btn");
const dashError      = document.getElementById("dash-error");
const tierFilter     = document.getElementById("tier-filter");
const exportBtn      = document.getElementById("export-csv-btn");
const tbody          = document.getElementById("downloads-tbody");
const prevBtn        = document.getElementById("prev-btn");
const nextBtn        = document.getElementById("next-btn");
const paginationInfo = document.getElementById("pagination-info");
const statTotal      = document.getElementById("stat-total");
const statFree       = document.getElementById("stat-free");
const statPro        = document.getElementById("stat-pro");
const adminEnv       = document.getElementById("admin-env");

// ── Init ───────────────────────────────────────────────────────────────────

async function init() {
  // Show env hint in header
  if (window.location.hostname.includes("netlify.app")) {
    adminEnv.textContent = "· test";
  }

  const stored = localStorage.getItem(TOKEN_KEY);
  if (stored) {
    // Validate the stored token with a live request
    const valid = await validateToken(stored);
    if (valid) {
      state.token = stored;
      showDashboard();
      return;
    }
    localStorage.removeItem(TOKEN_KEY);
  }
  showLogin();
}

// ── Auth ───────────────────────────────────────────────────────────────────

async function validateToken(token) {
  try {
    const res = await fetch("/api/admin-downloads?limit=1", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.status !== 401;
  } catch {
    return false;
  }
}

loginBtn.addEventListener("click", async () => {
  const password = passwordInput.value.trim();
  if (!password) return;

  loginBtn.disabled = true;
  loginBtn.textContent = "Signing in...";
  loginError.textContent = "";

  try {
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();

    if (!res.ok || !data.ok) {
      loginError.textContent = data.error || "Invalid password.";
      return;
    }

    state.token = data.token;
    localStorage.setItem(TOKEN_KEY, data.token);
    passwordInput.value = "";
    showDashboard();
  } catch (err) {
    loginError.textContent = "Network error. Try again.";
    console.error("Login error:", err);
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Sign in";
  }
});

// Allow Enter key in password field
passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loginBtn.click();
});

signoutBtn.addEventListener("click", () => {
  localStorage.removeItem(TOKEN_KEY);
  state.token = null;
  showLogin();
});

// ── View switching ─────────────────────────────────────────────────────────

function showLogin() {
  loginState.style.display = "flex";
  dashState.style.display = "none";
}

function showDashboard() {
  loginState.style.display = "none";
  dashState.style.display = "block";
  state.offset = 0;
  fetchStats();
  fetchDownloads();
}

// ── Data fetching ──────────────────────────────────────────────────────────

async function fetchDownloads() {
  setDashError("");
  tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Loading...</td></tr>`;

  const params = new URLSearchParams({
    limit: LIMIT,
    offset: state.offset,
    ...(state.tier && { tier: state.tier }),
  });

  try {
    const res = await fetch(`/api/admin-downloads?${params}`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });

    if (res.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      showLogin();
      return;
    }

    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Unknown error");

    state.total = data.total;
    renderTable(data.downloads);
    renderPagination();
  } catch (err) {
    setDashError(`Failed to load downloads: ${err.message}`);
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Error loading data.</td></tr>`;
    console.error("fetchDownloads error:", err);
  }
}

// Fetch stats: total, free count, pro count (3 small requests)
async function fetchStats() {
  try {
    const [all, free, pro] = await Promise.all([
      fetch("/api/admin-downloads?limit=1", { headers: { Authorization: `Bearer ${state.token}` } }).then(r => r.json()),
      fetch("/api/admin-downloads?limit=1&tier=FREE", { headers: { Authorization: `Bearer ${state.token}` } }).then(r => r.json()),
      fetch("/api/admin-downloads?limit=1&tier=PRO",  { headers: { Authorization: `Bearer ${state.token}` } }).then(r => r.json()),
    ]);
    statTotal.textContent = all.total  ?? "—";
    statFree.textContent  = free.total ?? "—";
    statPro.textContent   = pro.total  ?? "—";
  } catch (err) {
    console.error("fetchStats error:", err);
  }
}

// ── Filters ────────────────────────────────────────────────────────────────

tierFilter.addEventListener("change", () => {
  state.tier = tierFilter.value;
  state.offset = 0;
  fetchDownloads();
});

// ── CSV export ─────────────────────────────────────────────────────────────

exportBtn.addEventListener("click", async () => {
  exportBtn.disabled = true;
  exportBtn.textContent = "Exporting...";

  const params = new URLSearchParams({
    format: "csv",
    ...(state.tier && { tier: state.tier }),
  });

  try {
    const res = await fetch(`/api/admin-downloads?${params}`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });

    if (!res.ok) throw new Error(`Server returned ${res.status}`);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `flatlabs-downloads-${date}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    setDashError(`CSV export failed: ${err.message}`);
    console.error("Export error:", err);
  } finally {
    exportBtn.disabled = false;
    exportBtn.textContent = "Export CSV";
  }
});

// ── Table rendering ────────────────────────────────────────────────────────

function renderTable(rows) {
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No downloads found.</td></tr>`;
    return;
  }

  tbody.innerHTML = "";

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.dataset.id = row.id;

    const garmentLabel = formatGarment(row.garment_config);
    const dateLabel = formatDate(row.created_at);
    const sessionShort = truncate(row.stripe_session_id, 12);
    const ipShort = truncate(row.ip_hash, 12);

    tr.innerHTML = `
      <td>${dateLabel}</td>
      <td>${escapeHtml(row.user_email || "—")}</td>
      <td><span class="tier-badge ${row.tier}">${row.tier}</span></td>
      <td>${escapeHtml(garmentLabel)}</td>
      <td title="${escapeHtml(row.stripe_session_id || "")}">${escapeHtml(sessionShort)}</td>
      <td title="${escapeHtml(row.ip_hash || "")}">${escapeHtml(ipShort)}</td>
    `;

    tr.addEventListener("click", () => toggleExpand(row, tr));
    tbody.appendChild(tr);
  });
}

function toggleExpand(row, tr) {
  // Close previously expanded row
  const existing = tbody.querySelector(".expanded-row");
  if (existing) existing.remove();

  if (state.expandedRowId === row.id) {
    // Clicking same row again closes it
    state.expandedRowId = null;
    return;
  }

  state.expandedRowId = row.id;

  const expandedTr = document.createElement("tr");
  expandedTr.className = "expanded-row";

  const td = document.createElement("td");
  td.colSpan = 6;

  const pre = document.createElement("pre");
  pre.className = "config-pre";
  pre.textContent = JSON.stringify(row.garment_config, null, 2);

  td.appendChild(pre);
  expandedTr.appendChild(td);
  tr.after(expandedTr);
}

// ── Pagination ─────────────────────────────────────────────────────────────

function renderPagination() {
  const from = state.total === 0 ? 0 : state.offset + 1;
  const to   = Math.min(state.offset + LIMIT, state.total);
  paginationInfo.textContent = `Showing ${from}–${to} of ${state.total}`;

  prevBtn.disabled = state.offset === 0;
  nextBtn.disabled = state.offset + LIMIT >= state.total;
}

prevBtn.addEventListener("click", () => {
  if (state.offset === 0) return;
  state.offset = Math.max(0, state.offset - LIMIT);
  state.expandedRowId = null;
  fetchDownloads();
});

nextBtn.addEventListener("click", () => {
  if (state.offset + LIMIT >= state.total) return;
  state.offset += LIMIT;
  state.expandedRowId = null;
  fetchDownloads();
});

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatGarment(config) {
  if (!config) return "—";
  const parts = [config.garment, config.gender].filter(Boolean);
  return parts.join(" · ") || "—";
}

function truncate(str, len) {
  if (!str) return "—";
  return str.length > len ? str.slice(0, len) + "…" : str;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function setDashError(msg) {
  dashError.textContent = msg;
  dashError.style.display = msg ? "block" : "none";
}

// ── Start ──────────────────────────────────────────────────────────────────

init();
