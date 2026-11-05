/* Camper Card: die Karte selbst. Zeichnet die Seitenansicht und die Ansicht zum Ausrichten. */
import { STRINGS, langOf } from './i18n.js';
import { V, TYPE_NAME } from './vehicles.js';
import { DEG, calcLeveling, round5, nearestStep, toDegrees, correctTilt } from './leveling.js';
import { chargeSources } from './sources.js';
import { normalizeConfig, ENTITY_KEYS, CFG_OF, BOOL_KEYS } from './config.js';

const VERSION = '__VERSION__';
const EX = 2.5, MAXA = 7, BUB = 20;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* Kontext des laufenden Zeichnens. Wird nur während _render() gesetzt, damit die Zeichenfunktionen kurz bleiben. */
let C = null;
const t = (k) => (STRINGS[C.lang] && STRINGS[C.lang][k]) ?? STRINGS.en[k] ?? k;
const nf = (v, d = 0) => new Intl.NumberFormat(C.locale, { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
const sgn = (v, d = 1) => { const r = +v.toFixed(d); return (r > 0 ? '+' : r < 0 ? '−' : '') + nf(Math.abs(r), d); };
const cm = (v) => { const r = round5(v); return nf(r, Number.isInteger(r) ? 0 : 1) + ' cm'; };
const st = (k) => { let r = C.raw[k] || 'none'; if (r === 'off' && C.cfg.offline === 'hide') r = 'none'; if (k === 'grey' && C.cfg.vehicle === 'caravan') r = 'none'; return r; };
const val = (k) => C.v[k];
const unitOf = (k, d) => C.unit[k] || d;
const pct = (k) => clamp(val(k), 0, 100);
const visA = () => clamp(-C.anim.p * EX, -MAXA, MAXA);
const miniP = () => clamp(-C.anim.p * EX, -14, 14);
const miniR = () => clamp(-C.anim.r * EX, -14, 14);
const isOff = (s) => !s || s.state === 'unavailable' || s.state === 'unknown';

/** Liest die zugewiesenen Entitäten: Zustand je Schlüssel ('none', 'off', 'ok'), Werte und Einheiten. */
function readStates(hass, cfg) {
  const out = { st: {}, v: {}, unit: {} };
  for (const [ck, k] of Object.entries(ENTITY_KEYS)) {
    const id = cfg.entities[ck];
    if (!id) { out.st[k] = 'none'; continue; }
    const s = hass.states[id];
    if (isOff(s)) { out.st[k] = 'off'; continue; }
    if (BOOL_KEYS.has(k)) { out.st[k] = 'ok'; out.v[k] = s.state === 'on'; continue; }
    const n = parseFloat(s.state);
    if (!Number.isFinite(n)) { out.st[k] = 'off'; continue; }
    out.st[k] = 'ok'; out.v[k] = n; out.unit[k] = s.attributes && s.attributes.unit_of_measurement;
  }
  const ga = cfg.entities.gas_availability;
  if (ga && out.st.gas === 'ok' && isOff(hass.states[ga])) out.st.gas = 'off';
  return out;
}

/* ---------- Symbole (Linien-Icons, damit die Karte ohne Internet und ohne Icon-Paket auskommt) ---------- */
const IC = {
  battery: '<rect x="3" y="7" width="16" height="10" rx="2"/><path d="M21.5 10.5v3"/><path d="M6.5 10.5v3M10 10.5v3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  drop: '<path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"/>',
  grey: '<path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"/><path d="M9 14c1-1 2-1 3 0s2 1 3 0"/>',
  gas: '<path d="M9.5 3h5M10.5 3v3M13.5 3v3"/><rect x="6.5" y="6" width="11" height="15" rx="3.5"/>',
  temp: '<path d="M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0z"/>',
  fridge: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 10h12M9 6v2M9 13v3"/>',
  pump: '<path d="M4 9h9a4 4 0 0 1 4 4v1"/><path d="M9 9V5M6 5h6"/><path d="M17 17s1.6 1.8 1.6 3a1.6 1.6 0 0 1-3.2 0c0-1.2 1.6-3 1.6-3z"/>',
  bulb: '<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2v.2h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  lamp: '<path d="M5 21h14M12 21V10"/><path d="M8 10h8l-1.5-6h-5z"/>',
  plug: '<path d="M9 3v5M15 3v5"/><path d="M6.5 8h11v3a5.5 5.5 0 0 1-11 0z"/><path d="M12 16.5V21"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', warn: '<path d="M12 4 2.8 20h18.4z"/><path d="M12 10v4.5M12 17.4v.1"/>',
};
const ic = (n, s = 20) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;

/* ---------- Seitenansicht ---------- */
const rr = (x, y, w, h, r, a = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r || 0}" ${a}/>`;
function windowEl(w, on, i) {
  const r = w.r || 6;
  const glow = on ? rr(w.x - 3, w.y - 3, w.w + 6, w.h + 6, r + 3, 'fill="var(--c-light)" opacity=".42" filter="url(#fGlow)"') : '';
  const glass = on ? `${rr(w.x, w.y, w.w, w.h, r, 'fill="url(#gWarm)"')}${rr(w.x, w.y, w.w, w.h, r, 'fill="url(#gTint)" opacity=".2"')}
      ${rr(w.x + 3, w.y + 3, w.w - 6, Math.max(4, w.h * 0.16), Math.max(2, r - 3), 'fill="#8a4f14" opacity=".2"')}`
    : rr(w.x, w.y, w.w, w.h, r, 'fill="url(#gGlass)"');
  const refl = `<path d="M${w.x + w.w * 0.12} ${w.y + w.h} L${w.x + w.w * 0.38} ${w.y} L${w.x + w.w * 0.5} ${w.y} L${w.x + w.w * 0.24} ${w.y + w.h} Z" fill="#fff" opacity=".1"/>`;
  return `${glow}<clipPath id="cw${i}">${rr(w.x, w.y, w.w, w.h, r)}</clipPath>${glass}<g clip-path="url(#cw${i})">${refl}</g>${rr(w.x, w.y, w.w, w.h, r, 'fill="none" stroke="var(--frame)" stroke-width="3"')}`;
}
function doorEl(D, on, i) {
  return `${rr(D.x, D.y, D.w, D.h, D.r, `fill="${D.slide ? 'none' : 'url(#gBody)'}" stroke="var(--body-line)" stroke-width="1.3"`)}
    ${windowEl(D.win, on, i)}
    ${D.slide ? rr(D.x + 8, D.y + D.h * 0.52, 16, 4, 2, 'fill="var(--frame)" opacity=".8"') : rr(D.x + D.w - 11, D.y + D.h * 0.52, 4, 16, 2, 'fill="var(--frame)" opacity=".8"')}
    ${D.slide ? '' : rr(D.x + 5, D.y + D.h + 6, D.w - 10, 5, 2, 'fill="var(--plastic)"')}`;
}
function hatchEl(h) {
  return rr(h.x, h.y, h.w, h.h, h.r, 'fill="none" stroke="var(--body-line)" stroke-width="1.1"')
    + (h.lock ? rr(h.x + h.w - 14, h.y + h.h / 2 - 3, 8, 6, 2, 'fill="var(--frame)" opacity=".7"') : rr(h.x + h.w / 2 - 4, h.y + 4, 8, 4, 2, 'fill="var(--frame)" opacity=".6"'));
}
function skylightEl(k, y) {
  return `<path d="M${k.x} ${y + 1} Q${k.x + 2} ${y - 7} ${k.x + 9} ${y - 7} L${k.x + k.w - 9} ${y - 7} Q${k.x + k.w - 2} ${y - 7} ${k.x + k.w} ${y + 1} Z" fill="var(--cut-a)" stroke="var(--body-line)" stroke-width="1.2"/>
  <path d="M${k.x + 8} ${y - 4} L${k.x + k.w * 0.45} ${y - 4}" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".7"/>`;
}
function wheelEl(x, cy, r) {
  const rim = r * 0.6; let sp = '';
  for (let k = 0; k < 5; k++) { const a = k * 72 * DEG - Math.PI / 2; sp += `<line x1="${x}" y1="${cy}" x2="${(x + Math.cos(a) * rim * 0.84).toFixed(1)}" y2="${(cy + Math.sin(a) * rim * 0.84).toFixed(1)}"/>`; }
  return `<circle cx="${x}" cy="${cy}" r="${r}" fill="url(#gTire)"/>
    <circle cx="${x}" cy="${cy}" r="${r - 3.5}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="1"/>
    <circle cx="${x}" cy="${cy}" r="${rim}" fill="url(#gRim)" stroke="var(--frame)" stroke-width="1"/>
    <g stroke="var(--rim-2)" stroke-width="${(r * 0.12).toFixed(1)}" stroke-linecap="round">${sp}</g>
    <circle cx="${x}" cy="${cy}" r="${(r * 0.17).toFixed(1)}" fill="var(--metal)" stroke="var(--frame)" stroke-width=".8"/>`;
}
function towEl(d) {
  const T = d.tow, y = T.y, j = T.jockey, h = T.hitch;
  return `<path d="${T.beam}" fill="var(--metal)"/>
    ${rr(j - 4, y - 6, 8, 270 - y + 6, 2, 'fill="var(--metal)"')}${rr(j - 7, y - 4, 14, 10, 2, 'fill="var(--plastic)"')}${rr(j - 6, 266, 12, 9, 2, 'fill="var(--plastic)"')}
    <circle cx="${j}" cy="275" r="11" fill="url(#gTire)"/><circle cx="${j}" cy="275" r="4.5" fill="var(--rim)"/>
    <path d="M${h - 12} ${y - 6} L${h + 8} ${y - 6} Q${h + 18} ${y - 6} ${h + 18} ${y + 2} L${h + 18} ${y + 5} Q${h + 18} ${y + 9} ${h + 14} ${y + 9} L${h - 12} ${y + 9} Z" fill="var(--plastic)"/>
    <path d="M${h - 8} ${y - 6} L${h - 26} ${y - 15}" stroke="var(--plastic)" stroke-width="4" stroke-linecap="round"/>
    <path d="${T.cover}" fill="url(#gBody)" stroke="var(--body-line)" stroke-width="1.2"/>
    ${d.steadies.map((x) => `<path d="M${x} ${d.bottom} L${x + 20} ${d.bottom} L${x + 26} ${d.bottom + 7} L${x + 6} ${d.bottom + 7} Z" fill="var(--plastic)"/>`).join('')}`;
}
function popupEl(P) {
  let pl = ''; const k = (P.fy - P.hy) / (P.fx - P.hx);
  for (let x = P.hx + 34; x < P.fx; x += 36) pl += `<line x1="${x}" y1="${P.hy + 1}" x2="${x}" y2="${(P.hy + (x - P.hx) * k + 3).toFixed(1)}"/>`;
  return `<path d="${P.fabric}" fill="var(--tent)" stroke="var(--tent-line)" stroke-width="1"/>
    <g stroke="var(--tent-line)" stroke-width="1" opacity=".55">${pl}</g>
    ${rr(P.win.x, P.win.y, P.win.w, P.win.h, 4, 'fill="var(--glass-b)" opacity=".7" stroke="var(--tent-line)"')}
    <path d="${P.shell}" stroke="var(--body-line)" stroke-width="10" stroke-linecap="round"/>
    <path d="${P.shell}" stroke="var(--body)" stroke-width="8" stroke-linecap="round"/>`;
}
function cutEl(c, i) {
  return `<clipPath id="cc${i}">${rr(c.x, c.y, c.w, c.h, c.r)}</clipPath>${rr(c.x, c.y, c.w, c.h, c.r, 'fill="url(#gCut)"')}
    <g clip-path="url(#cc${i})">${rr(c.x, c.y, c.w, 14, 0, 'fill="url(#gCutShade)"')}${rr(c.x, c.y + c.h - 6, c.w, 6, 0, 'fill="var(--cut-line)" opacity=".55"')}</g>
    ${rr(c.x, c.y, c.w, c.h, c.r, 'fill="none" stroke="var(--body-hi)" stroke-width="3.5"')}
    ${rr(c.x - 1.5, c.y - 1.5, c.w + 3, c.h + 3, c.r + 1.5, 'fill="none" stroke="var(--body-line)" stroke-width="1"')}`;
}
function tankEl(id, b, color, p, state, shortName, warn) {
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2, a = visA(), r = b.under ? 6 : 9;
  let inner = '';
  if (state === 'ok' && p > 0) {
    const ly = b.y + b.h * (1 - p / 100);
    inner = `<g clip-path="url(#ct${id})"><g class="counter" data-cx="${cx}" data-cy="${cy}" transform="rotate(${-a} ${cx} ${cy})">
      ${rr(b.x - 80, ly, b.w + 160, b.h + 80, 0, `fill="${color}"`)}${rr(b.x - 80, ly, b.w + 160, b.h + 80, 0, 'fill="url(#gLiquid)"')}
      <line x1="${b.x - 80}" y1="${ly + 0.8}" x2="${b.x + b.w + 80}" y2="${ly + 0.8}" stroke="#fff" stroke-opacity=".65" stroke-width="1.6"/></g></g>`;
  }
  if (state === 'off') inner = `<g clip-path="url(#ct${id})">${rr(b.x, b.y, b.w, b.h, 0, 'fill="url(#pHatch)"')}</g>`;
  const fit = b.under ? `<path d="M${b.x + 12} ${b.y - 6} L${b.x + 12} ${b.y + b.h} M${b.x + b.w - 12} ${b.y - 6} L${b.x + b.w - 12} ${b.y + b.h}" stroke="var(--metal)" stroke-width="3"/>`
    : rr(b.x + b.w * 0.7, b.y - 5, 12, 6, 2, 'fill="var(--tank-line)"');
  const line = warn ? 'var(--c-warn)' : 'var(--tank-line)';
  const label = state === 'off' ? `<text class="pct${b.under ? ' not-small' : ''}" x="${cx}" y="${cy}" style="font-weight:500">${t('offline')}</text>`
    : `<text class="pct not-small" x="${cx}" y="${cy}">${b.w >= 76 ? shortName + ' ' : ''}${nf(p)} %</text>${b.under ? '' : `<text class="pct only-small" x="${cx}" y="${cy}">${nf(p)} %</text>`}`;
  return `<clipPath id="ct${id}">${rr(b.x, b.y, b.w, b.h, r)}</clipPath>${b.under ? '' : fit}${rr(b.x, b.y, b.w, b.h, r, 'fill="var(--tank)"')}${inner}
    ${rr(b.x + 5, b.y + 4, Math.max(5, b.w * 0.07), b.h - 8, 2.5, 'fill="#fff" opacity=".28"')}${b.under ? fit : ''}
    ${rr(b.x, b.y, b.w, b.h, r, `fill="none" stroke="${line}" stroke-width="${warn ? 2.2 : 1.3}"`)}${label}`;
}
function gasEl(b, p, state, warn) {
  const x = b.x, y = b.y, w = b.w, h = b.h, top = y + 13, bot = y + h - 5, cx = x + w / 2, cyb = (top + bot) / 2, a = visA();
  const body = `M${x} ${top + 9} Q${x} ${top} ${x + 9} ${top} L${x + w - 9} ${top} Q${x + w} ${top} ${x + w} ${top + 9} L${x + w} ${bot - 3} Q${x + w} ${bot} ${x + w - 3} ${bot} L${x + 3} ${bot} Q${x} ${bot} ${x} ${bot - 3} Z`;
  let inner = '';
  if (state === 'ok' && p > 0) {
    const ly = top + (bot - top) * (1 - p / 100);
    inner = `<g clip-path="url(#ctGas)"><g class="counter" data-cx="${cx}" data-cy="${cyb}" transform="rotate(${-a} ${cx} ${cyb})">${rr(x - 40, ly, w + 80, h + 40, 0, 'fill="var(--c-gas)"')}${rr(x - 40, ly, w + 80, h + 40, 0, 'fill="url(#gLiquid)"')}</g></g>`;
  }
  if (state === 'off') inner = `<g clip-path="url(#ctGas)">${rr(x, top, w, bot - top, 0, 'fill="url(#pHatch)"')}</g>`;
  const line = warn ? 'var(--c-warn)' : 'var(--tank-line)';
  const txt = state === 'ok' ? `<text class="pct not-small" x="${cx}" y="${cyb + 2}">${nf(p)}</text>` : '';
  return `<clipPath id="ctGas"><path d="${body}"/></clipPath>
    <path d="M${x + 5} ${top} L${x + 5} ${y + 5} Q${x + 5} ${y + 2} ${x + 8} ${y + 2} L${x + w - 8} ${y + 2} Q${x + w - 5} ${y + 2} ${x + w - 5} ${y + 5} L${x + w - 5} ${top}" fill="none" stroke="var(--metal)" stroke-width="2.4"/>
    ${rr(cx - 3, y + 5, 6, top - y - 4, 1.5, 'fill="var(--plastic)"')}<path d="${body}" fill="var(--tank)"/>${inner}
    ${rr(x + 4, top + 5, 4, bot - top - 10, 2, 'fill="#fff" opacity=".28"')}<path d="${body}" fill="none" stroke="${line}" stroke-width="${warn ? 2.2 : 1.3}"/>
    ${rr(x + 3, bot, w - 6, 5, 1.5, 'fill="var(--metal)"')}${txt}`;
}
const batColor = (p) => p < 20 ? 'var(--c-bat-low)' : p < 40 ? 'var(--c-bat-mid)' : 'var(--c-bat)';
function batEl(b, p, state, charging) {
  const bx = b.x, by = b.y + 4, bw = b.w, bh = b.h - 4, wx = bx + 5, wy = by + 9, ww = bw - 10, wh = bh - 14, cx = bx + bw / 2, cy = wy + wh / 2;
  const fill = state === 'ok' ? rr(wx, wy, ww * clamp(p, 0, 100) / 100, wh, 3, `fill="${batColor(p)}"`) : rr(wx, wy, ww, wh, 3, 'fill="url(#pHatch)"');
  const bolt = (state === 'ok' && charging) ? `<path class="not-small" d="M${wx + 7} ${cy - 7} l-4.5 8 h3.6 l-1.3 6 l5.4 -8.6 h-3.6 l1.3 -5.4 z" fill="var(--frame)"/>` : '';
  const lbl = state === 'ok' ? `<text class="pct not-small" x="${cx + (charging ? 6 : 0)}" y="${cy}">${nf(p)} %</text><text class="pct only-small" x="${cx}" y="${cy}">${nf(p)}</text>`
    : `<text class="pct not-small" x="${cx}" y="${cy}" style="font-weight:500">${t('offline')}</text><text class="pct only-small" x="${cx}" y="${cy}">–</text>`;
  return `${rr(bx + 7, b.y, 9, 6, 2, 'fill="#d4443a"')}${rr(bx + bw - 16, b.y, 9, 6, 2, 'fill="#2a2f35"')}
    ${rr(bx, by, bw, bh, 5, 'fill="url(#gBat)" stroke="var(--frame)" stroke-width="1"')}${rr(bx + 5, by + 3, bw - 10, 2, 1, 'fill="#fff" opacity=".18"')}
    ${rr(wx, wy, ww, wh, 3, 'fill="var(--tank)"')}${fill}${bolt}${lbl}`;
}
function solarEl(d, state, w) {
  const s = d.solar, x = s.x, y = s.y, wd = s.w, on = state === 'ok' && w > 5, dx = 14, hg = 12;
  let cells = ''; for (let i = 1; i < 6; i++) { const px = x + wd * i / 6; cells += `<line x1="${px}" y1="${y - 2}" x2="${px - dx}" y2="${y - 2 - hg}"/>`; }
  const rot = s.rot ? `transform="rotate(${s.rot} ${x} ${y})"` : '';
  const lbl = state === 'off' ? t('offline') : `${nf(w)} ${unitOf('solar', 'W')}`;
  return `<g ${rot}><path d="M${x + 6} ${y} L${x + 6} ${y - 3} M${x + wd - 8} ${y} L${x + wd - 8} ${y - 3}" stroke="var(--metal)" stroke-width="3"/>
    <path d="M${x} ${y - 2} L${x + wd} ${y - 2} L${x + wd - dx} ${y - 2 - hg} L${x - dx} ${y - 2 - hg} Z" fill="${state === 'off' ? 'var(--cut-line)' : 'url(#gSolar)'}" stroke="var(--rim-2)" stroke-width="1.6" stroke-linejoin="round"/>
    <g stroke="rgba(255,255,255,.28)" stroke-width=".9">${cells}<line x1="${x - dx / 2}" y1="${y - 2 - hg / 2}" x2="${x + wd - dx / 2}" y2="${y - 2 - hg / 2}"/></g>
    ${on ? `<path d="M${x + wd * 0.16} ${y - 2} L${x + wd * 0.3} ${y - 2} L${x + wd * 0.3 - dx} ${y - 2 - hg} L${x + wd * 0.16 - dx} ${y - 2 - hg} Z" fill="#fff" opacity=".2"/>` : ''}
    <text class="scene-val" x="${x + wd / 2 - dx / 2}" y="${y - 2 - hg - 9}">${lbl}</text></g>`;
}
function sources() {
  return chargeSources({ power: st('power'), solar: st('solar'), charger: st('charger'), chargerPower: st('chargerPower') }, C.v, C.cfg.charger_min_power);
}
function srcText(src) {
  if (!src.batCharging) return '';
  if (src.solarActive && src.chargerActive) return t('viaBoth');
  if (src.solarActive) return t('viaSolar');
  if (src.chargerActive) return t('viaCharger');
  return src.unknown ? t('srcUnknown') : '';
}
function inletEl(d, active) {
  const { x, y } = d.inlet;
  return `${active ? `<path d="${d.cable}" fill="none" stroke="var(--tire)" stroke-width="3.5" stroke-linecap="round"/>` : ''}
    <circle cx="${x}" cy="${y}" r="8" fill="var(--body-shade)" stroke="var(--body-line)" stroke-width="1.2"/>
    <circle cx="${x}" cy="${y}" r="4.5" fill="${active ? 'var(--c-grid)' : 'var(--metal)'}"/>`;
}
function vehicleEl(d) {
  const fresh = st('fresh'), grey = st('grey'), gas = st('gas'), bat = st('battery'), sol = st('solar');
  const liOn = st('lightIn') === 'ok' && val('lightIn'), loOn = st('lightOut') === 'ok' && val('lightOut');
  const W = d.wheel, cy = 286 - W.r, src = sources();
  let s = `<ellipse cx="${(d.ext[0] + d.ext[1]) / 2}" cy="287" rx="${(d.ext[1] - d.ext[0]) / 2 + 8}" ry="6" fill="#000" opacity=".25" filter="url(#fSoft)"/>`;
  if (d.tow) s += towEl(d);
  if (d.popup) s += popupEl(d.popup);
  s += `<clipPath id="cBody"><path d="${d.body}"/></clipPath><path d="${d.body}" fill="url(#gBody)"/>
    <g clip-path="url(#cBody)">${rr(0, d.roofY, 900, 44, 0, 'fill="url(#gHi)"')}
      ${d.skirt ? `<path d="${d.skirt}" fill="url(#gSkirt)"/>` : ''}
      ${d.accent ? `<path d="${d.accent}" fill="none" stroke="var(--body-hi)" stroke-width="1.6"/>` : ''}
      ${d.rocker ? `<path d="${d.rocker}" fill="var(--plastic)"/>` : ''}
      ${d.molding ? `<path d="${d.molding}" fill="var(--plastic)" opacity=".85"/>` : ''}
      ${W.xs.map((x) => `<circle cx="${x}" cy="${cy}" r="${W.r + 6}" fill="var(--under)"/>`).join('')}
      ${d.cab && d.cab.seam ? `<path d="${d.cab.seam}" fill="none" stroke="var(--body-line)" stroke-width="1.1"/>` : ''}
    </g><path d="${d.body}" fill="none" stroke="var(--body-line)" stroke-width="1.2" stroke-linejoin="round"/>`;
  if (d.rail) s += `<path d="${d.rail}" fill="none" stroke="var(--body-line)" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>`;
  if (d.seams) s += `<path d="${d.seams}" fill="none" stroke="var(--body-line)" stroke-width="1.1" opacity=".75"/>`;
  (d.hatches || []).forEach((h) => { s += hatchEl(h); });
  if (d.filler) s += `<circle cx="${d.filler.x}" cy="${d.filler.y}" r="6.5" fill="var(--body-shade)" stroke="var(--body-line)"/><circle cx="${d.filler.x}" cy="${d.filler.y}" r="3" fill="var(--c-water)" opacity=".75"/>`;
  if (d.frontWin) s += `<path d="${d.frontWin}" fill="url(#gGlass)" stroke="var(--frame)" stroke-width="2.5" stroke-linejoin="round"/>`;
  let i = 0; d.windows.forEach((w) => { s += windowEl(w, liOn, i++); });
  s += doorEl(d.door, liOn, i++);
  if (d.cab) {
    const K = d.cab;
    s += `<path d="${K.win}" fill="url(#gGlass)" stroke="var(--frame)" stroke-width="2.5" stroke-linejoin="round"/>`;
    if (K.wind) s += `<path d="${K.wind}" fill="url(#gGlass)" stroke="var(--frame)" stroke-width="2" stroke-linejoin="round"/>`;
    if (K.mirror) s += `<path d="${K.mirror}" fill="var(--plastic)"/>`;
    if (K.bumper) s += `<path d="${K.bumper}" fill="var(--plastic)"/>`;
    if (K.head) s += rr(K.head.x, K.head.y, K.head.w, K.head.h, 4, 'fill="#fff7dc" stroke="var(--frame)" stroke-width="1"');
    if (K.headPath) s += `<path d="${K.headPath}" fill="#fff7dc" stroke="var(--frame)" stroke-width="1" stroke-linejoin="round"/>`;
    if (K.ind) s += `<circle cx="${K.ind.x}" cy="${K.ind.y}" r="2.6" fill="#f0a63a"/>`;
  }
  if (d.rearBumper) s += `<path d="${d.rearBumper}" fill="var(--plastic)"/>`;
  (d.skylights || []).forEach((k) => { s += skylightEl(k, d.roofY); });
  const T = d.tail; s += rr(T.x, T.y, T.w, T.h, 2.5, 'fill="#d4443a"') + rr(T.x, T.y + 3, T.w, T.h * 0.3, 2, 'fill="#fff" opacity=".35"');
  if (d.marker) s += `<circle cx="${d.marker.x}" cy="${d.marker.y}" r="3" fill="#f0a63a"/>`;
  if (st('lightOut') !== 'none') {
    const L = d.lamp;
    if (loOn) s += `<path d="M${L.x - 4} ${L.y + 5} L${L.x + 4} ${L.y + 5} L${L.x + 96} 286 L${L.x - 96} 286 Z" fill="url(#gCone)"/><ellipse cx="${L.x}" cy="286" rx="100" ry="6" fill="var(--c-light)" opacity=".45"/>`;
    s += rr(L.x - 8, L.y, 16, 6, 3, `fill="${loOn ? '#ffe2a0' : 'var(--plastic)'}"`);
  }
  (d.cut || []).forEach((c, j) => { s += cutEl(c, j); });
  (d.wheelhouse || []).forEach((w) => { const yb = w.y + w.h; s += `<path d="M${w.x} ${yb} L${w.x} ${yb - 14} Q${w.x} ${w.y} ${w.x + w.w / 2} ${w.y} Q${w.x + w.w} ${w.y} ${w.x + w.w} ${yb - 14} L${w.x + w.w} ${yb} Z" fill="var(--cut-line)" opacity=".5"/>`; });
  if (fresh !== 'none') s += tankEl('Fresh', d.fresh, 'var(--c-water)', fresh === 'ok' ? pct('fresh') : 0, fresh, t('shortFresh'), fresh === 'ok' && val('fresh') <= 10);
  if (d.grey && grey !== 'none') s += tankEl('Grey', d.grey, 'var(--c-grey)', grey === 'ok' ? pct('grey') : 0, grey, t('shortGrey'), grey === 'ok' && val('grey') >= 85);
  if (gas !== 'none') s += gasEl(d.gas, gas === 'ok' ? pct('gas') : 0, gas, gas === 'ok' && val('gas') <= 15);
  if (src.charger !== 'none') s += inletEl(d, src.chargerActive);
  if (bat !== 'none') s += batEl(d.bat, bat === 'ok' ? pct('battery') : 0, bat, src.batCharging);
  if (sol !== 'none') s += solarEl(d, sol, sol === 'ok' ? val('solar') : 0);
  if (bat !== 'none' && src.batCharging) {
    if (src.solarActive) s += `<path class="flow" data-flow="solar" d="${d.flow}"/>`;
    if (src.chargerActive) s += `<path class="flow c" data-flow="charger" d="${d.cflow}"/>`;
  }
  W.xs.forEach((x) => { s += wheelEl(x, cy, W.r); });
  if (d.flare) s += `<path d="M${d.flare - W.r - 8} ${cy + 1} A${W.r + 8} ${W.r + 8} 0 0 1 ${d.flare + W.r + 8} ${cy + 1}" fill="none" stroke="var(--plastic)" stroke-width="6" stroke-linecap="round"/>`;
  return s;
}
function sceneSVG(hasTilt) {
  const d = C.d, a = visA();
  const [x0, y0, x1] = d.vb, vw = x1 - x0, vh = 345 - y0;
  const sc = (c, o) => `style="stop-color:${c}${o !== undefined ? `;stop-opacity:${o}` : ''}"`;
  return `<svg class="scene" data-vb="${vw}" viewBox="${x0} ${y0} ${vw} ${vh}" role="img" aria-label="${esc(t('sideView') + ': ' + d.name[C.lang])}"><defs>
    <linearGradient id="gBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" ${sc('var(--body)')}/><stop offset=".6" ${sc('var(--body)')}/><stop offset="1" ${sc('var(--body-shade)')}/></linearGradient>
    <linearGradient id="gHi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" ${sc('var(--body-hi)', 0.9)}/><stop offset="1" ${sc('var(--body-hi)', 0)}/></linearGradient>
    <linearGradient id="gSkirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" ${sc('var(--skirt)')}/><stop offset="1" ${sc('var(--skirt-2)')}/></linearGradient>
    <linearGradient id="gGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" ${sc('var(--glass-a)')}/><stop offset="1" ${sc('var(--glass-b)')}/></linearGradient>
    <linearGradient id="gWarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6ad"/><stop offset="1" stop-color="#f3a243"/></linearGradient>
    <linearGradient id="gTint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" ${sc('var(--glass-b)')}/><stop offset="1" ${sc('var(--glass-b)', 0.4)}/></linearGradient>
    <linearGradient id="gCut" x1="0" y1="0" x2="0" y2="1"><stop offset="0" ${sc('var(--cut-a)')}/><stop offset="1" ${sc('var(--cut-b)')}/></linearGradient>
    <linearGradient id="gCutShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <linearGradient id="gLiquid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
    <linearGradient id="gBat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c5560"/><stop offset="1" stop-color="#2b3239"/></linearGradient>
    <radialGradient id="gTire" cx=".5" cy=".5" r=".5"><stop offset=".62" ${sc('var(--tire-2)')}/><stop offset="1" ${sc('var(--tire)')}/></radialGradient>
    <radialGradient id="gRim" cx=".42" cy=".38" r=".7"><stop offset="0" ${sc('var(--rim)')}/><stop offset="1" ${sc('var(--rim-2)')}/></radialGradient>
    <linearGradient id="gSolar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b5688"/><stop offset="1" stop-color="#142c49"/></linearGradient>
    <linearGradient id="gCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" ${sc('var(--c-light)', 0.5)}/><stop offset="1" ${sc('var(--c-light)', 0.04)}/></linearGradient>
    <linearGradient id="gGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" ${sc('var(--ground)')}/><stop offset="1" ${sc('var(--ground)', 0)}/></linearGradient>
    <pattern id="pHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="8" style="fill:var(--tank-line)" opacity=".5"/></pattern>
    <filter id="fGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="fSoft" x="-10%" y="-300%" width="120%" height="700%"><feGaussianBlur stdDeviation="4"/></filter>
   </defs>
   ${hasTilt ? `<line x1="${x0}" y1="286" x2="${x1}" y2="286" stroke="var(--secondary-text-color)" stroke-width="1" stroke-dasharray="3 6" opacity=".55"/>` : ''}
   <g class="tilt" data-px="${d.pivot}" transform="rotate(${a} ${d.pivot} 286)">
     ${rr(x0 - 300, 286, vw + 600, 70, 0, 'fill="url(#gGround)"')}
     <line x1="${x0 - 300}" y1="286" x2="${x1 + 300}" y2="286" stroke="var(--ground-line)" stroke-width="2"/>
     ${vehicleEl(d)}
   </g></svg>`;
}
function rearSVG() {
  const k = C.cfg.vehicle;
  const body = k === 'caravan' ? '<rect x="28" y="16" width="64" height="50" rx="11" fill="var(--body)" stroke="var(--body-line)" stroke-width="2"/><rect x="40" y="26" width="40" height="15" rx="4" fill="var(--glass-b)"/>'
    : k === 'motorhome' ? '<rect x="28" y="8" width="64" height="58" rx="9" fill="var(--body)" stroke="var(--body-line)" stroke-width="2"/><rect x="40" y="20" width="40" height="15" rx="4" fill="var(--glass-b)"/>'
      : '<path d="M32 66 L32 26 Q33 12 48 12 L72 12 Q87 12 88 26 L88 66 Z" fill="var(--body)" stroke="var(--body-line)" stroke-width="2"/><rect x="42" y="22" width="36" height="15" rx="4" fill="var(--glass-b)"/>';
  return `<svg viewBox="0 0 120 90" aria-hidden="true"><line x1="0" y1="80" x2="120" y2="80" stroke="var(--secondary-text-color)" stroke-width="1.5" stroke-dasharray="3 5" opacity=".6"/>
    <g data-mini="roll" transform="rotate(${miniR()} 60 80)">${body}<rect x="34" y="64" width="11" height="16" rx="3" fill="var(--tire)"/><rect x="75" y="64" width="11" height="16" rx="3" fill="var(--tire)"/></g></svg>`;
}
function sideMiniSVG() {
  const d = C.d;
  return `<svg viewBox="0 0 800 330" aria-hidden="true"><line x1="0" y1="286" x2="800" y2="286" stroke="var(--secondary-text-color)" stroke-width="8" stroke-dasharray="14 24" opacity=".6"/>
   <g data-mini="pitch" data-px="${d.pivot}" transform="rotate(${miniP()} ${d.pivot} 286)"><path d="${d.body}" fill="var(--body)" stroke="var(--body-line)" stroke-width="10"/>
   ${d.tow ? `<path d="M${d.tow.from} ${d.bottom} L${d.tow.hitch} ${d.bottom}" stroke="var(--metal)" stroke-width="12"/><circle cx="${d.tow.jockey}" cy="270" r="16" fill="var(--tire)"/>` : ''}
   ${d.wheel.xs.map((x) => `<circle cx="${x}" cy="${286 - d.wheel.r}" r="${d.wheel.r + 4}" fill="var(--tire)"/>`).join('')}</g></svg>`;
}

/* ---------- Übersicht ---------- */
const barOf = (p, c) => `<div class="t-b"><i style="width:${clamp(p, 0, 100)}%;background:${c}"></i></div>`;
const miOf = (k) => { const id = C.cfg.entities[CFG_OF[k]]; return id ? ` data-mi="${esc(id)}" role="button" tabindex="0"` : ''; };
function tile(k, icon, color, label, v, unit, bar, sub, subWarn) {
  return `<div class="tile" style="--c:${color}" data-tile="${k}"${miOf(k)}><span class="t-i">${ic(icon, 19)}</span><span class="t-l">${label}</span><span class="t-v">${v}${unit ? `<small>${esc(unit)}</small>` : ''}</span>${sub ? `<span class="t-s${subWarn ? ' warn' : ''}" data-sub="${k}">${sub}</span>` : ''}${bar || ''}</div>`;
}
const offTile = (k, icon, label) => `<div class="tile off" data-tile="${k}"${miOf(k)}><span class="t-i">${ic(icon, 19)}</span><span class="t-l">${label}</span><span class="t-v">${t('offline')}</span></div>`;
const signed = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + nf(Math.abs(v));
function tilesHTML() {
  const out = [];
  const b = st('battery'), p = st('power'), src = sources(), sTxt = srcText(src);
  if (b === 'off' || (b === 'none' && p === 'off')) out.push(offTile('battery', 'battery', t('battery')));
  else if (b === 'ok') {
    const pw = p === 'ok' ? val('power') : null;
    const unit = pw === null ? '%' : `% · ${signed(pw)} ${unitOf('power', 'W')}`;
    out.push(tile('battery', 'battery', batColor(val('battery')), t('battery') + (pw === null ? '' : ` · ${pw > 5 ? t('charging') : pw < -5 ? t('discharging') : t('idle')}`), nf(val('battery')), unit, barOf(val('battery'), batColor(val('battery'))), sTxt, src.unknown));
  } else if (p === 'ok') out.push(tile('power', 'battery', 'var(--c-bat)', t('power'), signed(val('power')), unitOf('power', 'W'), '', sTxt, src.unknown));
  const so = st('solar');
  if (so === 'off') out.push(offTile('solar', 'sun', t('solar')));
  else if (so === 'ok') out.push(tile('solar', 'sun', 'var(--c-sun)', t('solar'), nf(val('solar')), unitOf('solar', 'W')));
  if (src.charger === 'off') out.push(offTile('charger', 'plug', t('charger')));
  else if (src.charger === 'ok') {
    const cpOk = st('chargerPower') === 'ok', swOk = st('charger') === 'ok';
    const v = cpOk ? nf(val('chargerPower')) : (val('charger') ? t('on') : t('off'));
    const sub = src.chargerActive ? t('chCharging') : (swOk && val('charger') ? t('chOnIdle') : (swOk ? t('off') : ''));
    out.push(tile(cpOk ? 'chargerPower' : 'charger', 'plug', 'var(--c-grid)', t('charger'), v, cpOk ? unitOf('chargerPower', 'W') : '', '', sub).replace(`data-tile="${cpOk ? 'chargerPower' : 'charger'}"`, 'data-tile="charger"'));
  }
  const f = st('fresh');
  if (f === 'off') out.push(offTile('fresh', 'drop', t('fresh')));
  else if (f === 'ok') { const c = val('fresh') <= 10 ? 'var(--c-warn)' : 'var(--c-water)'; out.push(tile('fresh', 'drop', c, t('fresh'), nf(val('fresh')), '%', barOf(val('fresh'), c))); }
  const g = st('grey');
  if (g === 'off') out.push(offTile('grey', 'grey', t('grey')));
  else if (g === 'ok') { const c = val('grey') >= 85 ? 'var(--c-warn)' : 'var(--c-grey)'; out.push(tile('grey', 'grey', c, t('grey'), nf(val('grey')), '%', barOf(val('grey'), c))); }
  const ga = st('gas');
  if (ga === 'off') out.push(offTile('gas', 'gas', t('gas')));
  else if (ga === 'ok') { const c = val('gas') <= 15 ? 'var(--c-warn)' : 'var(--c-gas)'; out.push(tile('gas', 'gas', c, t('gas'), nf(val('gas')), '%', barOf(val('gas'), c))); }
  const ti = st('tempIn');
  if (ti === 'off') out.push(offTile('tempIn', 'temp', t('tempIn')));
  else if (ti === 'ok') out.push(tile('tempIn', 'temp', 'var(--c-temp)', t('tempIn'), nf(val('tempIn'), 1), unitOf('tempIn', '°C')));
  const tf = st('tempFridge');
  if (tf === 'off') out.push(offTile('tempFridge', 'fridge', t('tempFridge')));
  else if (tf === 'ok') out.push(tile('tempFridge', 'fridge', 'var(--c-cold)', t('tempFridge'), nf(val('tempFridge'), 1), unitOf('tempFridge', '°C')));
  return out;
}
function actsHTML() {
  const defs = [['pump', 'pump', 'var(--c-pump)'], ['lightIn', 'bulb', 'var(--c-light)'], ['lightOut', 'lamp', 'var(--c-light)'], ['charger', 'plug', 'var(--c-grid)']];
  return defs.map(([k, icon, c]) => {
    const s = st(k);
    if (s === 'none' || (k === 'charger' && !C.cfg.charger_toggle)) return '';
    const on = s === 'ok' && val(k);
    let sub = s === 'off' ? t('offline') : (on ? t('on') : t('off')), cls = '';
    if (k === 'pump' && s === 'ok' && st('fresh') === 'ok' && val('fresh') <= 5) { sub = t('tankLow'); cls = 'warn'; }
    const label = k === 'pump' && C.cfg.pump_name ? esc(C.cfg.pump_name) : t(k);
    return `<button class="act ${on ? 'on' : ''} ${s === 'off' ? 'dis' : ''}" style="--c:${c}" data-a="toggle" data-k="${k}" data-fid="act-${k}" ${s === 'off' ? 'disabled' : ''} aria-pressed="${!!on}"><span class="a-i">${ic(icon, 17)}</span><span class="a-t">${label}<small class="${cls}">${sub}</small></span></button>`;
  }).join('');
}
function overviewHTML(T) {
  const res = T.state === 'ok' ? calcNow(T) : null;
  const top = T.state === 'ok' ? `<div class="hero-top"><div class="ht-l">
      ${T.hasR ? `<div class="ht-v">${rearSVG()}<div><b>${sgn(T.roll)}°</b><small>${t('side')}</small></div></div>` : ''}
      ${T.hasP ? `<div class="ht-v"><div><b>${sgn(T.pitch)}°</b><small>${t('long')}</small></div></div>` : ''}
    </div><button class="pill" style="--pc:${res.level ? 'var(--c-ok)' : 'var(--c-warn)'}" data-a="view" data-v="level" data-fid="pill">${res.level ? t('pillOk') : t('pillNo')}</button></div>`
    : T.state === 'off' ? `<div class="hero-top"><div class="ht-l"></div><span class="pill" style="--pc:var(--secondary-text-color);cursor:default">${t('tiltOff')}</span></div>` : '';
  const tiles = tilesHTML(), acts = actsHTML();
  const note = t('approx') + (T.state === 'ok' ? ` · ${t('exag')}` : '');
  return `<div class="hero">${top}${sceneSVG(T.state === 'ok')}<div class="hero-note">${note}</div></div>
    ${tiles.length ? `<div class="tiles">${tiles.join('')}</div>` : ''}
    ${acts ? `<div class="acts">${acts}</div>` : '<div class="cc-foot"></div>'}
    ${(!tiles.length && !acts && T.state === 'none') ? `<div class="cc-empty">${t('empty')}</div>` : ''}`;
}

/* ---------- Ausrichten ---------- */
function tilt() {
  const lv = C.cfg.leveling;
  let a = 'pitch', b = 'roll';
  if (lv.swap_axes) [a, b] = [b, a];
  const ra = C.raw[a] || 'none', rb = C.raw[b] || 'none';
  let state = 'none';
  if (ra === 'off' || rb === 'off') state = C.cfg.offline === 'hide' ? 'none' : 'off';
  else if (ra === 'ok' || rb === 'ok') state = 'ok';
  const raw = { pitch: C.raw.pitch === 'ok' ? toDegrees(C.v.pitch, C.unit.pitch) : 0, roll: C.raw.roll === 'ok' ? toDegrees(C.v.roll, C.unit.roll) : 0 };
  const cor = correctTilt(raw, lv);
  return { state, pitch: state === 'ok' && ra === 'ok' ? cor.pitch : 0, roll: state === 'ok' && rb === 'ok' ? cor.roll : 0, hasP: ra === 'ok', hasR: rb === 'ok' };
}
function calcNow(T) {
  const lv = C.cfg.leveling;
  return calcLeveling({ kind: C.cfg.vehicle === 'caravan' ? 'caravan' : 'wheels', pitch: T.pitch, roll: T.roll, track: lv.track, base: lv.base, tol: lv.tolerance });
}
function stepHint(v) { const s = nearestStep(v, C.cfg.leveling.steps); return s ? `${t('stepNo')} ${s.index} · ${nf(s.value)} cm` : ''; }
function bubbleSVG(ok) {
  const tolR = 16 + C.cfg.leveling.tolerance * BUB, cx = 120 + clamp(C.anim.r * BUB, -84, 84), cy = 120 + clamp(-C.anim.p * BUB, -84, 84);
  const col = ok ? 'var(--c-ok)' : 'var(--c-bat-mid)';
  return `<svg class="bubble" viewBox="0 0 240 240" role="img" aria-label="${t('bubble')}">
    <defs><radialGradient id="gVial" cx=".5" cy=".42" r=".62"><stop offset="0" style="stop-color:${col};stop-opacity:.09"/><stop offset="1" style="stop-color:${col};stop-opacity:.22"/></radialGradient>
    <radialGradient id="gBub" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".45" style="stop-color:${col}"/><stop offset="1" style="stop-color:${col}"/></radialGradient></defs>
    <circle cx="120" cy="120" r="104" fill="url(#gVial)" stroke="var(--divider-color)" stroke-width="2"/>
    <circle cx="120" cy="120" r="70" fill="none" stroke="var(--secondary-text-color)" stroke-opacity=".25"/>
    <line x1="16" y1="120" x2="224" y2="120" stroke="var(--secondary-text-color)" stroke-opacity=".28"/><line x1="120" y1="16" x2="120" y2="224" stroke="var(--secondary-text-color)" stroke-opacity=".28"/>
    <circle cx="120" cy="120" r="${tolR}" fill="none" stroke="var(--c-ok)" stroke-width="2.4"/>
    <circle class="bub" cx="${cx}" cy="${cy}" r="16" fill="url(#gBub)" stroke="${col}" stroke-opacity=".6"/>
    <text x="120" y="35" text-anchor="middle" font-size="12" fill="var(--secondary-text-color)">${t('front')}</text>
    <text x="30" y="124" text-anchor="middle" font-size="12" fill="var(--secondary-text-color)">${t('left')}</text>
    <text x="210" y="124" text-anchor="middle" font-size="12" fill="var(--secondary-text-color)">${t('right')}</text></svg>`;
}
function planSVG(res) {
  const d = C.d, car = res.kind === 'caravan';
  let s = '';
  const lab = (x, y, v, anchor) => v > 0 ? `<text class="p-val" x="${x}" y="${y}" text-anchor="${anchor}">${cm(v)}</text>` : `<text class="p-zero" x="${x}" y="${y}" text-anchor="${anchor}">0</text>`;
  const wedgeMark = (x, y, side) => side === 'l' ? `<path d="M${x} ${y - 16} L${x} ${y + 16} L${x - 13} ${y + 16} Z" fill="var(--c-warn)" opacity=".9"/>` : `<path d="M${x} ${y - 16} L${x} ${y + 16} L${x + 13} ${y + 16} Z" fill="var(--c-warn)" opacity=".9"/>`;
  const wheelR = (x, y) => `${rr(x, y - 22, 14, 44, 4, 'fill="var(--tire)"')}<path d="M${x + 2} ${y - 14} h10 M${x + 2} ${y - 5} h10 M${x + 2} ${y + 4} h10 M${x + 2} ${y + 13} h10" stroke="#fff" stroke-opacity=".13" stroke-width="2"/>`;
  const glass = 'fill="var(--glass-a)" opacity=".8"';
  if (car) {
    const ys = d.axles === 2 ? [240, 288] : [264];
    s += `<path d="M128 118 L160 42 L192 118" fill="none" stroke="var(--metal)" stroke-width="6" stroke-linejoin="round"/>
      ${rr(154, 58, 12, 22, 4, 'fill="var(--tire)"')}<circle cx="160" cy="38" r="7" fill="var(--plastic)"/>
      <path d="M134 120 L152 84 Q160 76 168 84 L186 120 Z" fill="url(#gPlan)" stroke="var(--body-line)" stroke-width="1.2"/>`;
    ys.forEach((y) => { s += wheelR(86, y) + wheelR(220, y); });
    s += `<path d="M100 156 Q100 122 132 116 L188 116 Q220 122 220 156 L220 372 Q220 394 198 394 L122 394 Q100 394 100 372 Z" fill="url(#gPlan)" stroke="var(--body-line)" stroke-width="1.5"/>
      <path d="M110 142 Q160 124 210 142" fill="none" stroke="var(--glass-a)" stroke-width="6" stroke-linecap="round" opacity=".85"/>
      ${rr(138, 172, 44, 32, 6, glass)}${rr(146, 318, 28, 22, 5, glass)}
      <path d="M104 186 L104 360" stroke="var(--body-line)" stroke-width="2" opacity=".5"/>`;
    const yc = (ys[0] + ys[ys.length - 1]) / 2;
    ys.forEach((y) => { if (res.side === 'left' && round5(res.wedge) > 0) s += wedgeMark(84, y, 'l'); if (res.side === 'right' && round5(res.wedge) > 0) s += wedgeMark(236, y, 'r'); });
    s += lab(66, yc, res.side === 'left' ? res.wedge : 0, 'end') + lab(254, yc, res.side === 'right' ? res.wedge : 0, 'start');
    if (res.nose && round5(res.noseCm) > 0) {
      const up = res.nose === 'raise';
      s += `<path d="${up ? 'M178 84 L178 58 M172 66 L178 56 L184 66' : 'M178 58 L178 84 M172 76 L178 86 L184 76'}" fill="none" stroke="var(--c-warn)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
        <text class="p-val" x="192" y="72" text-anchor="start">${cm(res.noseCm)}</text>`;
    } else s += '<text class="p-zero" x="180" y="74" text-anchor="start">0</text>';
  } else {
    const yF = 104, yR = 318;
    s += wheelR(86, yF) + wheelR(220, yF) + wheelR(86, yR) + wheelR(220, yR);
    s += `<path d="M100 90 L220 90 L220 374 Q220 394 200 394 L120 394 Q100 394 100 374 Z" fill="url(#gPlan)" stroke="var(--body-line)" stroke-width="1.5"/>
      <path d="M108 94 Q110 46 160 42 Q210 46 212 94 Z" fill="url(#gPlan)" stroke="var(--body-line)" stroke-width="1.5"/>
      <path d="M114 98 Q160 84 206 98" fill="none" stroke="var(--glass-a)" stroke-width="8" stroke-linecap="round" opacity=".85"/>
      ${rr(90, 98, 10, 9, 2, 'fill="var(--plastic)"')}${rr(220, 98, 10, 9, 2, 'fill="var(--plastic)"')}
      ${rr(138, 160, 44, 30, 6, glass)}${rr(140, 300, 40, 28, 6, glass)}`;
    [[yF, 'fl', 'fr'], [yR, 'rl', 'rr']].forEach(([y, l, r]) => {
      if (round5(res.wheels[l]) > 0) s += wedgeMark(84, y, 'l');
      if (round5(res.wheels[r]) > 0) s += wedgeMark(236, y, 'r');
      s += lab(66, y, res.wheels[l], 'end') + lab(254, y, res.wheels[r], 'start');
    });
  }
  s += `<text class="p-lbl" x="160" y="20">${t('front')}</text>`;
  return `<svg class="plan" data-vb="320" viewBox="0 0 320 408" role="img" aria-label="${t('plan')}"><defs><linearGradient id="gPlan" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--body-shade)"/><stop offset=".5" style="stop-color:var(--body)"/><stop offset="1" style="stop-color:var(--body-shade)"/></linearGradient></defs>${s}</svg>`;
}
function stepsHTML(res) {
  const li = []; let n = 1;
  const max = C.cfg.leveling.max_wedge;
  const row = (txt, v, sub, isOver) => `<li class="${isOver ? 'over' : ''}"><span class="n">${n++}</span><span class="tx">${txt}${sub ? `<small>${sub}</small>` : ''}</span><span class="val">${cm(v)}</span></li>`;
  const overTxt = () => `${t('over')} (${nf(max)} cm). ${t('overHint')}`;
  if (res.kind === 'caravan') {
    const two = C.d.axles === 2;
    if (res.side && round5(res.wedge) > 0) {
      const o = max > 0 && res.wedge > max;
      const txt = res.side === 'left' ? t(two ? 'wedgeL2' : 'wedgeL1') : t(two ? 'wedgeR2' : 'wedgeR1');
      li.push(row(txt, res.wedge, o ? overTxt() : stepHint(res.wedge), o));
    }
    if (res.nose && round5(res.noseCm) > 0) li.push(row(res.nose === 'raise' ? t('noseUp') : t('noseDown'), res.noseCm, li.length ? t('orderHint') : '', false));
  } else {
    const stay = [];
    ['fl', 'fr', 'rl', 'rr'].forEach((k) => {
      const v = res.wheels[k];
      if (round5(v) <= 0) { stay.push(t(k)); return; }
      const o = max > 0 && v > max;
      li.push(row(t(k), v, o ? overTxt() : stepHint(v), o));
    });
    if (li.length && stay.length) li.push(`<li><span class="n" style="color:var(--c-ok);background:color-mix(in srgb,var(--c-ok) 15%,transparent)">${ic('check', 14)}</span><span class="tx">${stay.join(', ')}</span><span class="val" style="font-size:13px;font-weight:400;color:var(--secondary-text-color)">${t('stays')}</span></li>`);
  }
  return li.length ? `<ol class="steps">${li.join('')}</ol>` : '';
}
function levelHTML(T) {
  if (T.state === 'off') return `<div class="lv"><div class="lv-st" style="--pc:var(--secondary-text-color)">${ic('warn', 22)}<div>${t('tiltOff')}<small>${t('tiltOffSub')}</small></div></div></div>`;
  const res = calcNow(T), ok = res.level, lv = C.cfg.leveling, tol = lv.tolerance, car = C.cfg.vehicle === 'caravan';
  const pTxt = Math.abs(T.pitch) <= tol ? t('flat') : T.pitch > 0 ? t(car ? 'noseHigh' : 'frontHigh') : t(car ? 'noseLow' : 'frontLow');
  const rTxt = Math.abs(T.roll) <= tol ? t('flat') : T.roll > 0 ? t('rightHigh') : t('leftHigh');
  const dims = `${t('dTrack')} ${nf(lv.track)} cm · ${car ? t(C.d.axles === 2 ? 'dBaseT' : 'dBase') : t('dWheel')} ${nf(lv.base)} cm${lv.defaults ? ` (${t('defaults')})` : ''}`;
  const partial = (T.hasP && T.hasR) ? '' : ` ${t('partial')}`;
  return `<div class="lv">
    <div class="lv-st" style="--pc:${ok ? 'var(--c-ok)' : 'var(--c-warn)'}">${ic(ok ? 'check' : 'warn', 22)}<div>${ok ? t('levelOk') : t('notLevel')}</div></div>
    ${stepsHTML(res)}
    <div class="lv-g">
      <div class="box"><h4>${t('bubble')}</h4>${bubbleSVG(ok)}
        <div class="reads">
          <div class="read">${sideMiniSVG()}<div><b>${sgn(T.pitch)}°</b><small>${t('tl')}: ${pTxt}</small></div></div>
          <div class="read">${rearSVG()}<div><b>${sgn(T.roll)}°</b><small>${t('ts')}: ${rTxt}</small></div></div>
        </div></div>
      <div class="box"><h4>${t('plan')}</h4>${planSVG(res)}</div>
    </div>
    <div class="lv-note">${dims}. ${t('dir')}${car && !ok ? ' ' + t('jacks') : ''}${partial}</div>
  </div>`;
}

/* ---------- Aussehen ---------- */
const CSS = `
*,*::before,*::after{box-sizing:border-box}
:host{display:block;
  --c-water:#2a8ade;--c-grey:#7f8263;--c-gas:#db7f12;--c-bat:#2a9a57;--c-bat-mid:#d99a12;--c-bat-low:#d4443a;--c-sun:#d99e00;--c-grid:#6f58d6;--c-light:#ee9f2c;
  --c-pump:#1f88d0;--c-temp:#d9662a;--c-cold:#1b93b8;--c-ok:#23935a;--c-warn:#c9551f;
  --scene-top:#e6eff6;--scene-bottom:#f5f7f8;--ground:#c3cbc2;--ground-line:#8a9389;
  --body:#fdfdfc;--body-shade:#e3e7ea;--body-line:#a5acb3;--body-hi:#ffffff;--skirt:#66707a;--skirt-2:#4c555e;
  --frame:#20262c;--glass-a:#4a5664;--glass-b:#1d242b;--cut-a:#d0d6db;--cut-b:#eceff2;--cut-line:#a7afb7;
  --tank:#f6f7f9;--tank-line:#949da6;--plastic:#343a41;--tire:#15181b;--tire-2:#3b4046;--rim:#eef0f2;--rim-2:#a7afb7;--metal:#8b949d;--under:#2b3137;
  --tent:#c9bca2;--tent-line:#a89a7f;--seg-bg:rgba(127,127,127,.14);--seg-on:var(--card-background-color,#fff)}
:host([dark]){
  --c-water:#4aa5f0;--c-grey:#a5a884;--c-gas:#f09a33;--c-bat:#45bd77;--c-bat-mid:#e8b234;--c-bat-low:#ef6a5e;--c-sun:#f2c230;--c-grid:#a493f5;--c-light:#ffbe5c;
  --c-pump:#4db3ee;--c-temp:#f0895a;--c-cold:#45bedd;--c-ok:#45bd77;--c-warn:#f0895a;
  --scene-top:#1a222b;--scene-bottom:#15191e;--ground:#323c36;--ground-line:#5e6a61;
  --body:#525a63;--body-shade:#3b4249;--body-line:#6d7680;--body-hi:#687280;--skirt:#2b3137;--skirt-2:#1f2328;
  --frame:#0a0c0e;--glass-a:#25303a;--glass-b:#0c1014;--cut-a:#15191d;--cut-b:#20252a;--cut-line:#3d4650;
  --tank:#2b3138;--tank-line:#5c6670;--plastic:#16191c;--tire:#0a0c0e;--tire-2:#2b3035;--rim:#9aa2aa;--rim-2:#5f676f;--metal:#7c858e;--under:#0e1113;
  --tent:#6d6450;--tent-line:#8a7f68;--seg-bg:rgba(255,255,255,.08);--seg-on:rgba(255,255,255,.16)}
ha-card{display:block;overflow:hidden;background:var(--ha-card-background,var(--card-background-color,#fff));color:var(--primary-text-color);
  border-radius:var(--ha-card-border-radius,12px);border-width:var(--ha-card-border-width,1px);border-style:solid;border-color:var(--ha-card-border-color,var(--divider-color,#e0e0e0))}
.cc{container:card/inline-size;font-family:var(--ha-font-family-body,Roboto,"Segoe UI",system-ui,sans-serif)}
button{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
.cc-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px 10px}
.cc-name{font-size:17px;font-weight:500;letter-spacing:-.005em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.seg{display:inline-flex;background:var(--seg-bg);border-radius:10px;padding:2px;gap:2px;flex:none}
.seg button{appearance:none;border:0;background:transparent;border-radius:8px;padding:5px 11px;font-size:12.5px;cursor:pointer;color:var(--secondary-text-color);white-space:nowrap}
.seg button.on{background:var(--seg-on);color:var(--primary-text-color);box-shadow:0 1px 2px rgba(0,0,0,.14);font-weight:500}
.hero{position:relative;margin:0 8px;border-radius:12px;background:linear-gradient(var(--scene-top),var(--scene-bottom));overflow:hidden}
.hero-top{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 10px 0}
.ht-l{display:flex;gap:12px;align-items:center;min-width:0}
.ht-v{display:flex;gap:6px;align-items:center}
.ht-v svg{width:34px;height:26px;flex:none}
.ht-v b{font-weight:500;font-variant-numeric:tabular-nums;font-size:14px;line-height:1.1;display:block}
.ht-v small{display:block;font-size:11px;color:var(--secondary-text-color);line-height:1.15}
.pill{appearance:none;border:0;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:500;cursor:pointer;display:inline-flex;gap:5px;align-items:center;white-space:nowrap;color:var(--pc);background:color-mix(in srgb,var(--pc) 15%,transparent)}
.scene{display:block;width:100%;height:auto}
.scene text{font-family:inherit}
.pct{font-size:calc(var(--k,1)*11.5px);font-weight:600;fill:var(--primary-text-color);text-anchor:middle;dominant-baseline:central;paint-order:stroke;stroke:var(--tank);stroke-width:calc(var(--k,1)*2.6px);stroke-linejoin:round}
.scene-val{font-size:calc(var(--k,1)*12px);font-weight:600;fill:var(--primary-text-color);text-anchor:middle;paint-order:stroke;stroke:var(--scene-top);stroke-width:calc(var(--k,1)*3px);stroke-linejoin:round}
svg[data-small] .not-small{display:none}
svg:not([data-small]) .only-small{display:none}
.flow{fill:none;stroke:var(--c-sun);stroke-width:3;stroke-linecap:round;stroke-dasharray:1 9;animation:flow .9s linear infinite}
.flow.c{stroke:var(--c-grid)}
@keyframes flow{to{stroke-dashoffset:-10}}
.hero-note{position:absolute;left:10px;right:10px;bottom:5px;font-size:10.5px;color:var(--secondary-text-color);pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tiles{display:flex;flex-wrap:wrap;gap:8px;padding:8px 8px 0}
.tile{--c:var(--secondary-text-color);flex:1 1 150px;display:grid;grid-template-columns:34px minmax(0,1fr);column-gap:10px;align-items:center;align-content:start;padding:9px 11px;border:1px solid var(--divider-color);border-radius:12px;min-width:0}
.tile[data-mi]{cursor:pointer}
.tile[data-mi]:hover{background:color-mix(in srgb,var(--secondary-text-color) 7%,transparent)}
.t-i{grid-row:span 2;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;color:var(--c);background:color-mix(in srgb,var(--c) 16%,transparent)}
.t-l{font-size:12px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2}
.t-v{font-size:19px;font-weight:500;line-height:1.2;white-space:nowrap;font-variant-numeric:tabular-nums;overflow:hidden;text-overflow:ellipsis}
.t-v small{font-size:12px;font-weight:400;color:var(--secondary-text-color);margin-left:2px}
.t-s{grid-column:2;font-size:11.5px;color:var(--secondary-text-color);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.25}
.t-s.warn{color:var(--c-warn)}
.t-b{grid-column:1/-1;height:4px;border-radius:2px;background:color-mix(in srgb,var(--secondary-text-color) 18%,transparent);overflow:hidden;margin-top:7px}
.t-b i{display:block;height:100%;border-radius:2px;background:var(--c);transition:width .3s}
.tile.off .t-i{color:var(--secondary-text-color);background:color-mix(in srgb,var(--secondary-text-color) 14%,transparent)}
.tile.off .t-v{font-size:14px;font-weight:400;color:var(--secondary-text-color)}
.acts{display:flex;flex-wrap:wrap;gap:8px;padding:8px}
.act{--c:var(--secondary-text-color);flex:1 1 96px;appearance:none;background:transparent;text-align:left;display:flex;align-items:center;gap:9px;padding:9px 11px;border:1px solid var(--divider-color);border-radius:12px;cursor:pointer;min-width:0;min-height:52px}
@container card (max-width:519px){.act{flex-direction:column;align-items:flex-start;gap:6px;padding:9px}.a-t{font-size:12.5px}}
.act:hover{background:color-mix(in srgb,var(--secondary-text-color) 8%,transparent)}
.act .a-i{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;flex:none;background:color-mix(in srgb,var(--secondary-text-color) 13%,transparent);color:var(--secondary-text-color)}
.act.on{background:color-mix(in srgb,var(--c) 13%,transparent);border-color:color-mix(in srgb,var(--c) 42%,transparent)}
.act.on .a-i{background:var(--c);color:var(--card-background-color,#fff)}
.act.dis{opacity:.6;cursor:default}
.a-t{min-width:0;font-size:13px;line-height:1.2}
.a-t small{display:block;font-size:11.5px;color:var(--secondary-text-color)}
.a-t small.warn{color:var(--c-warn)}
.cc-empty{padding:12px 16px 16px;font-size:13px;color:var(--secondary-text-color);text-align:center}
.cc-foot{height:4px}
.lv{padding:0 8px 8px;display:grid;gap:8px}
.lv-st{--pc:var(--c-warn);display:flex;gap:9px;align-items:center;padding:10px 12px;border-radius:12px;background:color-mix(in srgb,var(--pc) 13%,transparent);font-weight:500;font-size:14px}
.lv-st svg{color:var(--pc);flex:none}
.lv-st small{display:block;font-weight:400;font-size:12px;color:var(--secondary-text-color)}
.lv-g{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}
@container card (min-width:560px){.lv-g{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}}
.box{border:1px solid var(--divider-color);border-radius:12px;padding:10px;min-width:0}
.box h4{margin:0 0 4px;font-size:12px;font-weight:500;color:var(--secondary-text-color)}
.bubble{display:block;width:100%;max-width:190px;margin:0 auto}
@container card (min-width:560px){.bubble{max-width:230px}}
.reads{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.read{display:flex;gap:8px;align-items:center;min-width:0}
.read svg{width:50px;height:36px;flex:none}
.read b{display:block;font-size:16px;font-weight:500;font-variant-numeric:tabular-nums;line-height:1.15}
.read small{display:block;font-size:11px;color:var(--secondary-text-color);line-height:1.2}
.plan{display:block;width:100%;max-width:270px;margin:0 auto}
.plan text{font-family:inherit}
.p-val{font-size:calc(var(--k,1)*14px);font-weight:600;fill:var(--c-warn);dominant-baseline:central}
.p-zero{font-size:calc(var(--k,1)*12px);fill:var(--secondary-text-color);dominant-baseline:central}
.p-lbl{font-size:calc(var(--k,1)*11px);fill:var(--secondary-text-color);text-anchor:middle}
.steps{list-style:none;margin:0;padding:0;display:grid;gap:6px}
.steps li{display:grid;grid-template-columns:24px minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 11px;border:1px solid var(--divider-color);border-radius:12px}
.steps .n{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:600;color:var(--c-warn);background:color-mix(in srgb,var(--c-warn) 15%,transparent)}
.steps .tx{font-size:13.5px;line-height:1.25;min-width:0}
.steps .tx small{display:block;font-size:12px;color:var(--secondary-text-color)}
.steps .val{font-size:17px;font-weight:500;white-space:nowrap;font-variant-numeric:tabular-nums}
.steps li.over{border-color:color-mix(in srgb,var(--c-bat-low) 60%,transparent)}
.steps li.over .val{color:var(--c-bat-low)}
.lv-note{font-size:12px;color:var(--secondary-text-color);padding:2px 4px;line-height:1.35}
@media (prefers-reduced-motion:reduce){.flow{animation:none}.t-b i{transition:none}}
`;

/* ---------- Element ---------- */
const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export class CamperCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `<style>${CSS}</style><ha-card><div class="cc"></div></ha-card>`;
    this._root = this.shadowRoot.querySelector('.cc');
    this._anim = { p: 0, r: 0 }; this._target = { p: 0, r: 0 }; this._ui = { view: 'overview' };
    this._raf = null; this._sig = ''; this._first = true;
    this.shadowRoot.addEventListener('click', (e) => this._onClick(e));
    this.shadowRoot.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('[data-mi]')) { e.preventDefault(); this._onClick(e); }
    });
  }
  static getConfigElement() { return document.createElement('camper-card-editor'); }
  static getStubConfig() { return { vehicle: 'caravan', outline: 'caravan_round', entities: {} }; }
  setConfig(config) { this._config = normalizeConfig(config); this._sig = ''; this._render(); }
  set hass(h) {
    this._hass = h;
    if (!this._config) return;
    const sig = this._signature();
    if (sig !== this._sig) { this._sig = sig; this._render(); }
  }
  get hass() { return this._hass; }
  getCardSize() { return 7; }
  getGridOptions() { return { columns: 12, rows: 'auto', min_columns: 6 }; }
  connectedCallback() {
    if (!this._ro && typeof ResizeObserver === 'function') { this._ro = new ResizeObserver(() => this._fit()); this._ro.observe(this); }
    this._render();
  }
  disconnectedCallback() {
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
  }
  /** Nur neu zeichnen, wenn sich ein zugewiesener Zustand, das Thema oder die Sprache ändert. */
  _signature() {
    const h = this._hass, c = this._config;
    const parts = [h.themes && h.themes.darkMode ? 'd' : 'l', (h.locale && h.locale.language) || h.language || ''];
    for (const id of Object.values(c.entities)) { const s = h.states[id]; parts.push(s ? `${s.state}|${(s.attributes && s.attributes.unit_of_measurement) || ''}` : '-'); }
    return parts.join(';');
  }
  _render() {
    if (!this._config || !this._root) return;
    if (!this._hass) { this._root.innerHTML = ''; return; }
    const cfg = this._config, hass = this._hass, data = readStates(hass, cfg);
    C = { cfg, hass, lang: langOf(hass, cfg), locale: (hass.locale && hass.locale.language) || hass.language || 'en', raw: data.st, v: data.v, unit: data.unit, anim: this._anim, d: V[cfg.outline] };
    try {
      this.toggleAttribute('dark', !!(hass.themes && hass.themes.darkMode));
      const T = tilt();
      if (T.state === 'none') this._ui.view = 'overview';
      this._target = { p: T.pitch, r: T.roll };
      if (this._first) { this._anim.p = T.pitch; this._anim.r = T.roll; this._first = false; }
      const ae = this.shadowRoot.activeElement, fid = ae && ae.dataset ? ae.dataset.fid : null;
      const name = cfg.name || TYPE_NAME[cfg.vehicle][C.lang];
      const v = this._ui.view;
      const seg = T.state !== 'none' ? `<div class="seg" role="tablist"><button role="tab" aria-selected="${v === 'overview'}" class="${v === 'overview' ? 'on' : ''}" data-a="view" data-v="overview" data-fid="v1">${t('overview')}</button><button role="tab" aria-selected="${v === 'level'}" class="${v === 'level' ? 'on' : ''}" data-a="view" data-v="level" data-fid="v2">${t('level')}</button></div>` : '';
      this._root.innerHTML = `<div class="cc-head"><div class="cc-name">${esc(name)}</div>${seg}</div>${v === 'level' ? levelHTML(T) : overviewHTML(T)}`;
      if (fid) { const el = this._root.querySelector(`[data-fid="${fid}"]`); if (el) el.focus(); }
    } finally { C = null; }
    this._fit();
    this._startAnim();
  }
  _onClick(e) {
    const el = e.target.closest && e.target.closest('[data-a],[data-mi]');
    if (!el) return;
    if (el.dataset.a === 'view') { this._ui.view = el.dataset.v; this._render(); return; }
    if (el.dataset.a === 'toggle') {
      const id = this._config.entities[CFG_OF[el.dataset.k]];
      if (id && this._hass) this._hass.callService('homeassistant', 'toggle', { entity_id: id });
      return;
    }
    if (el.dataset.mi) this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: el.dataset.mi }, bubbles: true, composed: true }));
  }
  _fit() {
    this._root.querySelectorAll('svg[data-vb]').forEach((s) => {
      const w = s.clientWidth || s.getBoundingClientRect().width;
      if (!w) return;
      const k = +s.dataset.vb / w;
      s.style.setProperty('--k', k.toFixed(3));
      s.toggleAttribute('data-small', k > 1.7);
    });
  }
  _applyTilt() {
    const a = clamp(-this._anim.p * EX, -MAXA, MAXA);
    const g = this._root.querySelector('.tilt');
    if (g) {
      g.setAttribute('transform', `rotate(${a} ${g.dataset.px} 286)`);
      g.querySelectorAll('.counter').forEach((c) => c.setAttribute('transform', `rotate(${-a} ${c.dataset.cx} ${c.dataset.cy})`));
    }
    this._root.querySelectorAll('[data-mini="roll"]').forEach((m) => m.setAttribute('transform', `rotate(${clamp(-this._anim.r * EX, -14, 14)} 60 80)`));
    this._root.querySelectorAll('[data-mini="pitch"]').forEach((m) => m.setAttribute('transform', `rotate(${clamp(-this._anim.p * EX, -14, 14)} ${m.dataset.px} 286)`));
    const b = this._root.querySelector('.bub');
    if (b) { b.setAttribute('cx', 120 + clamp(this._anim.r * BUB, -84, 84)); b.setAttribute('cy', 120 + clamp(-this._anim.p * BUB, -84, 84)); }
  }
  _startAnim() {
    if (reducedMotion()) { this._anim.p = this._target.p; this._anim.r = this._target.r; this._applyTilt(); return; }
    if (!this._raf) this._raf = requestAnimationFrame(() => this._tick());
  }
  _tick() {
    const T = this._target, A = this._anim;
    A.p += (T.p - A.p) * 0.14; A.r += (T.r - A.r) * 0.14;
    const done = Math.abs(T.p - A.p) < 0.004 && Math.abs(T.r - A.r) < 0.004;
    if (done) { A.p = T.p; A.r = T.r; }
    this._applyTilt();
    this._raf = done ? null : requestAnimationFrame(() => this._tick());
  }
}
export const CARD_VERSION = VERSION;
