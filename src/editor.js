/* Camper Card: Karten-Editor. Nutzt das Formular von Home Assistant (ha-form), damit niemand YAML braucht. */
import { STRINGS, langOf } from './i18n.js';
import { V, GROUPS, DIMS, TYPE_NAME } from './vehicles.js';
import { toDegrees, correctTilt } from './leveling.js';
import { normalizeConfig, NAME_KEYS, ENTITY_KEYS, MAX_SWITCHES } from './config.js';

const ENT_FIELDS = ['battery', 'battery_power', 'solar', 'charger', 'charger_power', 'fresh', 'grey', 'gas', 'gas_availability', 'gas2', 'gas2_availability',
  'temp_inside', 'humidity_inside', 'temp_outside', 'temp_fridge', 'temp_freezer', 'pump', 'light_inside', 'light_outside', 'pitch', 'roll'];
const LV_FIELDS = ['track', 'base', 'max_wedge', 'steps', 'tolerance', 'invert_pitch', 'invert_roll', 'swap_axes', 'offset_pitch', 'offset_roll'];
const TOP_FIELDS = ['name', 'vehicle', 'outline', 'offline', 'language', 'charger_min_power', 'charger_toggle', 'battery_capacity', 'battery_voltage',
  'frost_temp', 'humidity_max'];
/* Eigene Kachelnamen stehen im Formular als name_<Feld>, in der Konfiguration unter names. pump_name aus 0.1 wird zu names.pump. */
const NAME_FIELDS = NAME_KEYS.map((k) => 'name_' + k);
const NUMERIC = { entity: { domain: ['sensor', 'input_number', 'number'] } };
const ONOFF = { entity: { domain: ['switch', 'light', 'input_boolean'] } };
const empty = (v) => v === undefined || v === null || v === '';
/* Frei belegbare Schalter stehen im Formular als sw1, sw1_name, sw1_icon usw., in der Konfiguration unter switches. */
const SLOTS = Array.from({ length: MAX_SWITCHES }, (_, i) => i + 1);

/** Formulardaten sind flach, die gespeicherte Konfiguration ist gegliedert (entities, leveling, names, switches). */
export function flattenConfig(cfg) {
  const d = {};
  for (const k of TOP_FIELDS) if (!empty(cfg[k])) d[k] = cfg[k];
  for (const k of ENT_FIELDS) if (cfg.entities && !empty(cfg.entities[k])) d[k] = cfg.entities[k];
  for (const k of LV_FIELDS) if (cfg.leveling && !empty(cfg.leveling[k])) d[k] = Array.isArray(cfg.leveling[k]) ? cfg.leveling[k].join(', ') : cfg.leveling[k];
  for (const k of NAME_KEYS) if (cfg.names && !empty(cfg.names[k])) d['name_' + k] = cfg.names[k];
  if (empty(d.name_pump) && !empty(cfg.pump_name)) d.name_pump = cfg.pump_name;
  d.frost_warning = cfg.frost_warning !== false;
  (Array.isArray(cfg.switches) ? cfg.switches : []).slice(0, MAX_SWITCHES).forEach((s, i) => {
    const o = typeof s === 'string' ? { entity: s } : s || {};
    if (empty(o.entity)) return;
    d[`sw${i + 1}`] = o.entity;
    if (!empty(o.name)) d[`sw${i + 1}_name`] = o.name;
    if (!empty(o.icon)) d[`sw${i + 1}_icon`] = o.icon;
  });
  return d;
}
export function unflattenConfig(data, prev) {
  const out = { type: (prev && prev.type) || 'custom:camper-card' };
  for (const k of TOP_FIELDS) if (!empty(data[k]) && data[k] !== false) out[k] = data[k];
  const ent = {}; for (const k of ENT_FIELDS) if (!empty(data[k])) ent[k] = data[k];
  const lv = {}; for (const k of LV_FIELDS) if (!empty(data[k]) && data[k] !== false) lv[k] = data[k];
  // Fahrzeugtyp gewechselt: passenden Umriss setzen.
  if (out.vehicle && (!out.outline || !V[out.outline] || V[out.outline].type !== out.vehicle)) out.outline = GROUPS[out.vehicle][0];
  out.entities = ent;
  if (Object.keys(lv).length) out.leveling = lv;
  const names = {}; for (const k of NAME_KEYS) if (typeof data['name_' + k] === 'string' && data['name_' + k].trim()) names[k] = data['name_' + k].trim();
  if (Object.keys(names).length) out.names = names;
  if (data.frost_warning === false) out.frost_warning = false;
  const sw = [];
  for (const i of SLOTS) {
    if (empty(data[`sw${i}`])) continue;
    const o = { entity: data[`sw${i}`] }, n = data[`sw${i}_name`], ico = data[`sw${i}_icon`];
    if (typeof n === 'string' && n.trim()) o.name = n.trim();
    if (!empty(ico)) o.icon = ico;
    sw.push(o);
  }
  if (sw.length) out.switches = sw;
  return out;
}

/* In Node (Tests) gibt es kein HTMLElement. Die reinen Funktionen oben sollen trotzdem testbar sein. */
const EditorBase = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;
export class CamperCardEditor extends EditorBase {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = { type: 'custom:camper-card' };
    this._built = false;
  }
  set hass(h) { this._hass = h; if (this._form) this._form.hass = h; this._updateZero(); }
  get hass() { return this._hass; }
  setConfig(config) { this._config = JSON.parse(JSON.stringify(config || {})); this._update(); }
  connectedCallback() { this._build(); }
  get _L() { const lang = langOf(this._hass, this._config); return (k) => STRINGS[lang][k] ?? STRINGS.en[k] ?? k; }
  get _lang() { return langOf(this._hass, this._config); }

  /** ha-form wird von Home Assistant erst bei Bedarf geladen. Notfalls über ein eingebautes Karten-Editor-Element nachladen. */
  async _ensureForm() {
    if (customElements.get('ha-form')) return true;
    try {
      const helpers = window.loadCardHelpers ? await window.loadCardHelpers() : null;
      if (helpers) {
        const c = await helpers.createCardElement({ type: 'entities', entities: [] });
        if (c && c.constructor && c.constructor.getConfigElement) await c.constructor.getConfigElement();
      }
      await Promise.race([customElements.whenDefined('ha-form'), new Promise((r) => setTimeout(r, 3000))]);
    } catch (e) { /* Fallback unten */ }
    return !!customElements.get('ha-form');
  }
  async _build() {
    if (this._built) return;
    this._built = true;
    this.shadowRoot.innerHTML = `<style>
      :host{display:block}
      .zero{margin-top:16px;padding:12px;border:1px solid var(--divider-color);border-radius:12px}
      .zero h3{margin:0 0 6px;font-size:14px;font-weight:500}
      .zero p{margin:4px 0;font-size:13px;color:var(--secondary-text-color)}
      .zero .now{color:var(--primary-text-color);font-variant-numeric:tabular-nums}
      .zero .btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
      .zero button{font:inherit;font-size:13px;padding:8px 12px;border-radius:8px;border:1px solid var(--divider-color);background:var(--secondary-background-color,transparent);color:var(--primary-text-color);cursor:pointer}
      .zero button.main{background:var(--primary-color);border-color:var(--primary-color);color:var(--text-primary-color,#fff)}
      .zero button:disabled{opacity:.5;cursor:default}
      .warn{padding:12px;border-radius:8px;background:var(--warning-color,#ffa600);color:#000;font-size:13px}
    </style><div id="form"></div><div class="zero" id="zero"></div>`;
    this.shadowRoot.getElementById('zero').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.a === 'zero') this._setZero(); else if (b.dataset.a === 'reset') this._resetZero();
    });
    this._updateZero();
    const ok = await this._ensureForm();
    const host = this.shadowRoot.getElementById('form');
    if (!ok) { host.innerHTML = `<div class="warn">${this._L('ed_no_form')}</div>`; return; }
    this._form = document.createElement('ha-form');
    this._form.computeLabel = (s) => this._label(s);
    this._form.computeHelper = (s) => this._helper(s);
    this._form.addEventListener('value-changed', (e) => {
      e.stopPropagation();
      const next = unflattenConfig(e.detail.value, this._config);
      this._config = next;
      this._fire(next);
      this._update();
    });
    host.appendChild(this._form);
    this._update();
  }
  _fire(config) { this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true })); }
  _label(s) {
    const L = this._L;
    if (s.name === 'base') {
      const c = this._norm();
      return L(c.vehicle === 'caravan' ? (V[c.outline].axles === 2 ? 'ed_base_tandem' : 'ed_base_caravan') : 'ed_base_wheels');
    }
    if (s.name.startsWith('name_')) { const k = s.name.slice(5); return k === 'gas2' ? `${L('gas')} 2` : L(ENTITY_KEYS[k]); }
    const m = /^sw(\d)(?:_(name|icon))?$/.exec(s.name);
    if (m) return `${L('ed_sw')} ${m[1]}${m[2] ? `: ${L('ed_sw_' + m[2])}` : ''}`;
    return s.title || L('ed_' + s.name);
  }
  _helper(s) {
    const L = this._L, c = this._norm();
    if (s.name === 'track') return `${L('ed_default_is')} ${DIMS[c.outline][0]} cm`;
    if (s.name === 'base') return `${L('ed_default_is')} ${DIMS[c.outline][1]} cm`;
    if (s.name === 'gas_availability' || s.name === 'gas2_availability') return L('ed_gas_help');
    if (s.name === NAME_FIELDS[0]) return L('ed_names_help');
    if (s.name === 'charger_toggle') return L('ed_charger_help');
    if (s.name === 'battery_capacity') return L('ed_capacity_help');
    if (s.name === 'frost_warning') return L('ed_frost_help');
    if (s.name === 'sw1') return L('ed_sw_help');
    return undefined;
  }
  _norm() { try { return normalizeConfig(this._config); } catch (e) { return normalizeConfig({}); } }
  _schema() {
    const L = this._L, lang = this._lang, c = this._norm();
    const sel = (opts) => ({ select: { mode: 'dropdown', options: opts } });
    const num = (min, max, step, unit) => ({ number: { min, max, step, mode: 'box', unit_of_measurement: unit } });
    const g = (name, schema, expanded = false) => ({ type: 'expandable', name, title: L('ed_' + name), flatten: true, expanded, schema });
    return [
      g('g_vehicle', [
        { name: 'name', selector: { text: {} } },
        { name: 'vehicle', selector: sel(Object.keys(GROUPS).map((k) => ({ value: k, label: TYPE_NAME[k][lang] }))) },
        { name: 'outline', selector: sel(GROUPS[c.vehicle].map((k) => ({ value: k, label: V[k].name[lang] }))) },
        { name: 'offline', selector: sel([{ value: 'grey', label: L('ed_offline_grey') }, { value: 'hide', label: L('ed_offline_hide') }]) },
        { name: 'language', selector: sel([{ value: 'auto', label: L('ed_lang_auto') }, { value: 'de', label: 'Deutsch' }, { value: 'en', label: 'English' }]) },
      ], true),
      g('g_energy', [
        { name: 'battery', selector: NUMERIC }, { name: 'battery_power', selector: NUMERIC }, { name: 'solar', selector: NUMERIC },
        { name: 'charger', selector: { entity: { domain: ['switch', 'input_boolean'] } } }, { name: 'charger_power', selector: NUMERIC },
        { name: 'charger_min_power', selector: num(0, 500, 1, 'W') }, { name: 'charger_toggle', selector: { boolean: {} } },
        { name: 'battery_capacity', selector: num(0, 2000, 1, 'Ah') }, { name: 'battery_voltage', selector: num(6, 60, 0.1, 'V') },
      ]),
      g('g_water', [
        { name: 'fresh', selector: NUMERIC },
        ...(c.vehicle === 'caravan' ? [] : [{ name: 'grey', selector: NUMERIC }]),
        { name: 'gas', selector: NUMERIC }, { name: 'gas_availability', selector: { entity: {} } },
        { name: 'gas2', selector: NUMERIC }, { name: 'gas2_availability', selector: { entity: {} } },
      ]),
      g('g_climate', [
        { name: 'temp_inside', selector: NUMERIC }, { name: 'humidity_inside', selector: NUMERIC }, { name: 'temp_outside', selector: NUMERIC },
        { name: 'temp_fridge', selector: NUMERIC }, { name: 'temp_freezer', selector: NUMERIC },
        { name: 'humidity_max', selector: num(40, 100, 1, '%') },
        { name: 'frost_warning', selector: { boolean: {} } }, { name: 'frost_temp', selector: num(-10, 10, 0.5, '°C') },
      ]),
      g('g_switches', [
        { name: 'pump', selector: ONOFF },
        { name: 'light_inside', selector: ONOFF }, { name: 'light_outside', selector: ONOFF },
      ]),
      // Immer ein freier Platz mehr als belegt, höchstens MAX_SWITCHES.
      g('g_extra', SLOTS.slice(0, Math.min(MAX_SWITCHES, c.switches.length + 1)).flatMap((i) => [
        { name: `sw${i}`, selector: { entity: { domain: ['switch', 'light', 'input_boolean', 'fan'] } } },
        { name: `sw${i}_name`, selector: { text: {} } }, { name: `sw${i}_icon`, selector: { icon: {} } },
      ])),
      g('g_level', [
        { name: 'pitch', selector: NUMERIC }, { name: 'roll', selector: NUMERIC },
        { name: 'track', selector: num(50, 400, 1, 'cm') }, { name: 'base', selector: num(50, 1200, 1, 'cm') },
        { name: 'max_wedge', selector: num(0, 60, 0.5, 'cm') }, { name: 'steps', selector: { text: {} } },
        { name: 'tolerance', selector: num(0, 2, 0.1, '°') },
        { name: 'invert_pitch', selector: { boolean: {} } }, { name: 'invert_roll', selector: { boolean: {} } }, { name: 'swap_axes', selector: { boolean: {} } },
      ]),
      g('g_names', NAME_FIELDS.filter((f) => !(f === 'name_grey' && c.vehicle === 'caravan')).map((f) => ({ name: f, selector: { text: {} } }))),
    ];
  }
  _update() {
    if (this._form) {
      this._form.hass = this._hass;
      const data = flattenConfig(this._config);
      if (!data.vehicle) data.vehicle = this._norm().vehicle;
      if (!data.outline) data.outline = this._norm().outline;
      if (!data.offline) data.offline = 'grey';
      if (!data.language) data.language = 'auto';
      this._form.data = data;
      this._form.schema = this._schema();
    }
    this._updateZero();
  }
  /** Aktuelle Neigung ohne Nullpunkt (in Grad), oder null, wenn ein Sensor fehlt oder offline ist. */
  _rawTilt() {
    const h = this._hass, e = (this._config && this._config.entities) || {};
    if (!h || !e.pitch || !e.roll) return null;
    const rd = (id) => { const s = h.states[id]; if (!s) return null; const n = parseFloat(s.state); return Number.isFinite(n) ? toDegrees(n, s.attributes && s.attributes.unit_of_measurement) : null; };
    const p = rd(e.pitch), r = rd(e.roll);
    if (p === null || r === null) return null;
    const lv = this._norm().leveling;
    return correctTilt({ pitch: p, roll: r }, { ...lv, offset_pitch: 0, offset_roll: 0 });
  }
  _updateZero() {
    const box = this.shadowRoot && this.shadowRoot.getElementById('zero');
    if (!box) return;
    const L = this._L, raw = this._rawTilt(), lv = this._norm().leveling;
    const f = (v) => new Intl.NumberFormat(this._lang === 'de' ? 'de-DE' : 'en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(v);
    const now = raw ? `<p>${L('ed_zero_now')}: <span class="now">${L('ed_pitch')} ${f(raw.pitch)}°, ${L('ed_roll')} ${f(raw.roll)}°</span></p>` : `<p>${L('ed_zero_none')}</p>`;
    const set = (lv.offset_pitch || lv.offset_roll) ? `<p>${L('ed_zero_set')}: <span class="now">${f(lv.offset_pitch)}°, ${f(lv.offset_roll)}°</span></p>` : '';
    box.innerHTML = `<h3>${L('ed_zero_title')}</h3>${now}${set}<p>${L('ed_zero_hint')}</p>
      <div class="btns"><button class="main" data-a="zero" ${raw ? '' : 'disabled'}>${L('ed_zero')}</button>${set ? `<button data-a="reset">${L('ed_zero_reset')}</button>` : ''}</div>`;
  }
  _setZero() {
    const raw = this._rawTilt(); if (!raw) return;
    const next = JSON.parse(JSON.stringify(this._config));
    next.leveling = { ...(next.leveling || {}), offset_pitch: +raw.pitch.toFixed(3), offset_roll: +raw.roll.toFixed(3) };
    this._config = next; this._fire(next); this._update();
  }
  _resetZero() {
    const next = JSON.parse(JSON.stringify(this._config));
    if (next.leveling) { delete next.leveling.offset_pitch; delete next.leveling.offset_roll; if (!Object.keys(next.leveling).length) delete next.leveling; }
    this._config = next; this._fire(next); this._update();
  }
}
