/* Alarmanlage: Auswertung einer alarm_control_panel-Entität, zum Beispiel von Alarmo. Ohne DOM, damit sie getestet werden kann. */

/** Modi in der Reihenfolge der Tasten: Name in Home Assistant, Bit in supported_features, Name für alarmo.arm. */
export const AL_MODES = [['away', 2, 'away'], ['night', 4, 'night'], ['home', 1, 'home'], ['vacation', 32, 'vacation'], ['custom_bypass', 16, 'custom']];

/** Aktivierte Modi laut supported_features. Alarmo meldet nur die Modi, die in Alarmo eingeschaltet sind. */
export const alarmModes = (f) => AL_MODES.filter(([, bit]) => (Number(f) | 0) & bit).map(([m]) => m);

/** Art des Zustands: disarmed, armed, arming, pending, disarming, triggered oder other. */
export function alarmKind(s) {
  if (['disarmed', 'arming', 'pending', 'disarming', 'triggered'].includes(s)) return s;
  return /^armed_/.test(s) ? 'armed' : 'other';
}

/** Braucht der nächste Schritt einen Code? Im Zustand unscharf geht es ums Scharfschalten, sonst ums Unscharfschalten.
    Alarmo setzt code_format nur, wenn für den nächsten Schritt ein Code nötig ist. */
export function alarmNeedsCode(state, a) {
  if (!a || !a.code_format) return false;
  return !(state === 'disarmed' && a.code_arm_required === false);
}

/** Sensoren aus open_sensors (Alarmo) als Liste [entity_id, 'open' | 'unavailable']. */
export const openSensors = (a) => (a && a.open_sensors && typeof a.open_sensors === 'object' ? Object.entries(a.open_sensors) : []);

/** Alarmo erkennt man an seinen eigenen Attributen. */
export const isAlarmo = (a) => !!a && ('open_sensors' in a || 'arm_mode' in a);

/** Restzeit der Verzögerung in ganzen Sekunden aus delay (Sekunden) und last_changed, sonst null.
    Nie mehr als delay, falls die Uhr des Browsers nachgeht. */
export function alarmRemaining(delay, lastChanged, now) {
  const d = Number(delay), t0 = Date.parse(lastChanged);
  if (!(d > 0) || !Number.isFinite(t0)) return null;
  return Math.max(0, Math.min(d, Math.ceil(d - (now - t0) / 1000)));
}

/** Modus für „Trotzdem scharf schalten“: zuletzt auf der Karte gewählt, sonst der einzige, sonst „Abwesend“, sonst der erste. */
export function forceMode(last, modes) {
  if (modes.includes(last)) return last;
  if (modes.length !== 1 && modes.includes('away')) return 'away';
  return modes[0] || null;
}

/** Dienstaufruf für eine Aktion ('arm', 'disarm', 'force') als [domain, service, data]. Der Code wird nur durchgereicht. */
export function alarmCall(entity, action, mode, code) {
  const c = code ? { code } : {};
  if (action === 'disarm') return ['alarm_control_panel', 'alarm_disarm', { entity_id: entity, ...c }];
  if (action === 'force') {
    const m = AL_MODES.find((x) => x[0] === mode);
    return ['alarmo', 'arm', { entity_id: entity, mode: m ? m[2] : 'away', force: true, ...c }];
  }
  return ['alarm_control_panel', `alarm_arm_${mode}`, { entity_id: entity, ...c }];
}
