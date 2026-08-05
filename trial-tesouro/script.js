const API_URL = "https://www.tesourodireto.com.br/json/br/com/b3/tesourodireto/service/api/treasurybondsinfo.json";
const REFRESH_MINUTES = 15;

const el = {
  status: document.getElementById("rates-status"),
  body: document.getElementById("rates-body"),
  lastUpdated: document.getElementById("last-updated"),
  refreshBtn: document.getElementById("refresh-btn"),
};

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
}

function formatRate(v) {
  return typeof v === "number" ? `${v.toFixed(2)}%` : "—";
}

function formatPrice(v) {
  return typeof v === "number"
    ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "—";
}

function renderRows(bonds) {
  if (!bonds.length) {
    el.body.innerHTML = `<tr><td colspan="5">Nenhum título encontrado.</td></tr>`;
    return;
  }
  el.body.innerHTML = bonds
    .map(
      (b) => `
      <tr>
        <td>${b.name ?? "—"}</td>
        <td>${b.maturity ? formatDate(b.maturity) : "—"}</td>
        <td class="rate-buy">${formatRate(b.buyRate)}</td>
        <td class="rate-sell">${formatRate(b.sellRate)}</td>
        <td>${formatPrice(b.unitPrice)}</td>
      </tr>`
    )
    .join("");
}

// Field names below follow the publicly known shape of the Tesouro Direto
// bonds feed. This has not been verified against a live response in this
// environment (network access is restricted here) — check the browser
// console on first real load and adjust the mapping below if it logs a
// "unexpected shape" warning.
function parseBonds(raw) {
  const list = raw?.response?.TrsrBdTradgList;
  if (!Array.isArray(list)) {
    console.warn("Unexpected API shape, raw response:", raw);
    return null;
  }
  return list.map((item) => {
    const bd = item.TrsrBd ?? {};
    return {
      name: bd.nm,
      maturity: bd.MtrtyDt,
      buyRate: bd.anulInvstmtRate,
      sellRate: bd.anulRedRate,
      unitPrice: bd.untrRedVal,
    };
  });
}

async function loadRates() {
  el.status.textContent = "";
  el.refreshBtn.disabled = true;
  el.lastUpdated.textContent = "Atualizando...";

  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
    const bonds = parseBonds(raw);

    if (!bonds) {
      throw new Error(
        "Formato inesperado da API. Veja o console do navegador para detalhes."
      );
    }

    renderRows(bonds);
    el.lastUpdated.textContent = `Atualizado em ${new Date().toLocaleString("pt-BR")}`;
  } catch (err) {
    console.error("Failed to load Tesouro Direto rates:", err);
    el.status.textContent =
      "Não foi possível carregar as taxas agora (a API pode bloquear pedidos de outros domínios). Veja o console para detalhes.";
    el.lastUpdated.textContent = "Falha na atualização";
    el.body.innerHTML = `<tr><td colspan="5">Dados indisponíveis.</td></tr>`;
  } finally {
    el.refreshBtn.disabled = false;
  }
}

el.refreshBtn.addEventListener("click", loadRates);
loadRates();
setInterval(loadRates, REFRESH_MINUTES * 60 * 1000);
