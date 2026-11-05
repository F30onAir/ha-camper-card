/* Ladequellen der Camper Card. Das BMS misst nur die Summe an der Batterie, die Quelle ergibt sich aus den Quell-Sensoren. */

/**
 * st: Zustand je Sensor ('none' nicht zugewiesen, 'off' offline, 'ok') für power, solar, charger, chargerPower.
 * v: Werte (power und solar in W, charger true/false, chargerPower in W).
 * chargerMin: ab dieser Leistung des Zwischensteckers gilt das Ladegerät als ladend.
 */
export function chargeSources(st, v, chargerMin) {
  const pw = st.power === 'ok' ? v.power : null;
  const batCharging = pw !== null && pw > 5;
  const solarActive = st.solar === 'ok' && v.solar > 5;
  let chargerActive = false;
  if (st.chargerPower === 'ok') chargerActive = v.chargerPower >= (+chargerMin || 0) && (st.charger !== 'ok' || !!v.charger);
  else if (st.charger === 'ok') chargerActive = !!v.charger;
  const charger = (st.charger === 'none' && st.chargerPower === 'none') ? 'none'
    : (st.charger === 'ok' || st.chargerPower === 'ok') ? 'ok' : 'off';
  const anySource = st.solar !== 'none' || charger !== 'none';
  return {
    pw, batCharging, solarActive, chargerActive, charger, anySource,
    unknown: batCharging && anySource && !solarActive && !chargerActive,
  };
}

/** Kurzform für Anzeige und Tests: 'both', 'solar', 'charger', 'unknown' oder ''. */
export function sourceKey(src) {
  if (!src.batCharging) return '';
  if (src.solarActive && src.chargerActive) return 'both';
  if (src.solarActive) return 'solar';
  if (src.chargerActive) return 'charger';
  return src.unknown ? 'unknown' : '';
}
