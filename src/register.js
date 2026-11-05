/* Camper Card: Elemente anmelden und in der Kartenauswahl von Home Assistant eintragen. */
import { CamperCard, CARD_VERSION } from './card.js';
import { CamperCardEditor } from './editor.js';

if (!customElements.get('camper-card')) customElements.define('camper-card', CamperCard);
if (!customElements.get('camper-card-editor')) customElements.define('camper-card-editor', CamperCardEditor);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === 'camper-card')) {
  window.customCards.push({
    type: 'camper-card',
    name: 'Camper Card',
    description: 'Wohnwagen, Wohnmobil oder Camper Van mit Tanks, Batterie, Solar und Ausrichten. Caravan, motorhome or camper van with tanks, battery, solar and levelling.',
    preview: true,
  });
}
console.info(`%c CAMPER-CARD %c ${CARD_VERSION} `, 'color:#fff;background:#2a8ade;font-weight:600;border-radius:3px 0 0 3px', 'color:#2a8ade;background:#e6eff6;border-radius:0 3px 3px 0');
