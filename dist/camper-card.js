/*! Camper Card 0.1.1 | Home Assistant dashboard card | outlines are generic approximations, no manufacturer drawings */
(() => {
'use strict';

// ---- i18n.js ----
/* Texte der Camper Card auf Deutsch und Englisch. */

const STRINGS = {
  de: {
    overview: 'Übersicht', level: 'Ausrichten', battery: 'Batterie', power: 'Leistung', solar: 'Solar', fresh: 'Frischwasser', grey: 'Grauwasser', gas: 'Gas',
    tempIn: 'Innen', tempFridge: 'Kühlschrank', pump: 'Wasserpumpe', lightIn: 'Licht innen', lightOut: 'Licht außen', charger: 'Ladegerät',
    offline: 'offline', on: 'an', off: 'aus', charging: 'lädt', discharging: 'entlädt', idle: 'Ruhe', tankLow: 'Tank fast leer',
    shortFresh: 'Frisch', shortGrey: 'Grau', approx: 'Allgemeiner Umriss, Annäherung', exag: 'Neigung überhöht', side: 'seitlich', long: 'längs',
    levelOk: 'Steht waagerecht', notLevel: 'Noch nicht waagerecht', pillOk: 'Waagerecht', pillNo: 'Nicht waagerecht',
    tiltOff: 'Neigungssensor offline', tiltOffSub: 'Ohne aktuelle Werte zeigt die Karte keine Keile an.',
    noseHigh: 'Bug hoch', noseLow: 'Bug tief', frontHigh: 'vorn hoch', frontLow: 'vorn tief', rightHigh: 'rechts hoch', leftHigh: 'links hoch', flat: 'waagerecht',
    bubble: 'Wasserwaage', plan: 'Keilplan', front: 'vorn', left: 'links', right: 'rechts',
    wedgeL1: 'Keil unter das linke Rad', wedgeR1: 'Keil unter das rechte Rad', wedgeL2: 'Keile unter beide linken Räder', wedgeR2: 'Keile unter beide rechten Räder',
    noseUp: 'Bug mit dem Bugrad anheben', noseDown: 'Bug mit dem Bugrad absenken', orderHint: 'Erst den Keil legen, der Wert rechnet sich dann neu.',
    fl: 'Vorn links', fr: 'Vorn rechts', rl: 'Hinten links', rr: 'Hinten rechts', stays: 'bleibt am Boden', stepNo: 'Stufe',
    jacks: 'Stützen erst zum Schluss absenken.', dir: 'Links und rechts gelten in Fahrtrichtung.', over: 'Mehr als dein höchster Keil', overHint: 'Anderen Stellplatz suchen.',
    dTrack: 'Spurbreite', dBase: 'Achse bis Bugrad', dBaseT: 'Achsmitte bis Bugrad', dWheel: 'Radstand', defaults: 'Standardwerte, bitte nachmessen',
    partial: 'Nur eine Neigungsachse zugewiesen.', empty: 'Noch keine Entität zugewiesen. Das geht im Karten-Editor.',
    tl: 'Längs', ts: 'Seitlich',
    viaSolar: 'über Solar', viaCharger: 'über Ladegerät', viaBoth: 'über Solar und Ladegerät', srcUnknown: 'Quelle unbekannt', chCharging: 'lädt', chOnIdle: 'an, lädt nicht',
    sideView: 'Seitenansicht',
    // Editor
    ed_name: 'Name', ed_vehicle: 'Fahrzeugtyp', ed_outline: 'Umriss', ed_offline: 'Zugewiesen, aber offline', ed_language: 'Sprache',
    ed_offline_grey: 'Grau mit „offline“ anzeigen', ed_offline_hide: 'Ausblenden', ed_lang_auto: 'Wie Home Assistant',
    ed_battery: 'Batterie: Ladestand', ed_battery_power: 'Batterie: Leistung (BMS)', ed_solar: 'Solarleistung', ed_charger: 'Ladegerät: Schalter',
    ed_charger_power: 'Ladegerät: Leistung (Zwischenstecker)', ed_charger_min_power: 'Ladegerät lädt ab (W)', ed_charger_toggle: 'Ladegerät in der Karte schaltbar',
    ed_fresh: 'Frischwasser', ed_grey: 'Grauwasser', ed_gas: 'Gas', ed_gas_availability: 'Gas: Verfügbarkeit prüfen über',
    ed_temp_inside: 'Temperatur innen', ed_temp_fridge: 'Temperatur Kühlschrank', ed_pump: 'Wasserpumpe oder Wasserhähne', ed_pump_name: 'Name für den Wasserschalter',
    ed_light_inside: 'Licht innen', ed_light_outside: 'Licht außen', ed_pitch: 'Neigung längs', ed_roll: 'Neigung seitlich',
    ed_track: 'Spurbreite (cm)', ed_base_caravan: 'Abstand Achse bis Bugrad (cm)', ed_base_tandem: 'Achsmitte bis Bugrad (cm)', ed_base_wheels: 'Radstand (cm)',
    ed_max_wedge: 'Höchster Keil (cm)', ed_steps: 'Keilstufen (cm), zum Beispiel 3, 6, 9', ed_tolerance: 'Toleranz (Grad)',
    ed_invert_pitch: 'Längsneigung umkehren', ed_invert_roll: 'Seitliche Neigung umkehren', ed_swap_axes: 'Achsen tauschen',
    ed_g_vehicle: 'Fahrzeug', ed_g_energy: 'Energie', ed_g_water: 'Wasser und Gas', ed_g_climate: 'Klima', ed_g_switches: 'Schalter und Licht', ed_g_level: 'Ausrichten',
    ed_default_is: 'Standard für diesen Umriss:', ed_gas_help: 'Ein Sensor, der offline geht, wenn die Gasmessung ausfällt. Dann zeigt die Karte „offline“ statt 0 %.',
    ed_charger_help: 'Standardmäßig nur Anzeige, damit die Karte deinen Automationen nicht in die Quere kommt.',
    ed_zero_title: 'Nullpunkt', ed_zero: 'Aktuelle Neigung als Nullpunkt übernehmen', ed_zero_reset: 'Nullpunkt zurücksetzen',
    ed_zero_hint: 'Nur nutzen, wenn das Fahrzeug nachweislich waagerecht steht, zum Beispiel mit einer Wasserwaage geprüft.',
    ed_zero_now: 'Aktuell gemessen', ed_zero_set: 'Gespeicherter Nullpunkt', ed_zero_none: 'Kein Neigungssensor zugewiesen oder offline.',
    ed_no_form: 'Der Editor von Home Assistant konnte nicht geladen werden. Die Karte lässt sich weiter per YAML einstellen.',
  },
  en: {
    overview: 'Overview', level: 'Levelling', battery: 'Battery', power: 'Power', solar: 'Solar', fresh: 'Fresh water', grey: 'Grey water', gas: 'Gas',
    tempIn: 'Inside', tempFridge: 'Fridge', pump: 'Water pump', lightIn: 'Inside light', lightOut: 'Outside light', charger: 'Charger',
    offline: 'offline', on: 'on', off: 'off', charging: 'charging', discharging: 'discharging', idle: 'idle', tankLow: 'Tank almost empty',
    shortFresh: 'Fresh', shortGrey: 'Grey', approx: 'Generic outline, approximation', exag: 'tilt exaggerated', side: 'side', long: 'length',
    levelOk: 'Vehicle is level', notLevel: 'Not level yet', pillOk: 'Level', pillNo: 'Not level',
    tiltOff: 'Tilt sensor offline', tiltOffSub: 'Without current values the card shows no chocks.',
    noseHigh: 'nose high', noseLow: 'nose low', frontHigh: 'front high', frontLow: 'front low', rightHigh: 'right high', leftHigh: 'left high', flat: 'level',
    bubble: 'Spirit level', plan: 'Chock plan', front: 'front', left: 'left', right: 'right',
    wedgeL1: 'Chock under the left wheel', wedgeR1: 'Chock under the right wheel', wedgeL2: 'Chocks under both left wheels', wedgeR2: 'Chocks under both right wheels',
    noseUp: 'Raise the nose with the jockey wheel', noseDown: 'Lower the nose with the jockey wheel', orderHint: 'Place the chock first, the value then updates.',
    fl: 'Front left', fr: 'Front right', rl: 'Rear left', rr: 'Rear right', stays: 'stays on the ground', stepNo: 'Step',
    jacks: 'Lower the steadies last.', dir: 'Left and right are in driving direction.', over: 'More than your highest chock', overHint: 'Look for another pitch.',
    dTrack: 'Track width', dBase: 'Axle to jockey wheel', dBaseT: 'Axle centre to jockey wheel', dWheel: 'Wheelbase', defaults: 'default values, please measure',
    partial: 'Only one tilt axis assigned.', empty: 'No entity assigned yet. You can do that in the card editor.',
    tl: 'Length', ts: 'Side',
    viaSolar: 'from solar', viaCharger: 'from charger', viaBoth: 'from solar and charger', srcUnknown: 'source unknown', chCharging: 'charging', chOnIdle: 'on, not charging',
    sideView: 'Side view',
    ed_name: 'Name', ed_vehicle: 'Vehicle type', ed_outline: 'Outline', ed_offline: 'Assigned but offline', ed_language: 'Language',
    ed_offline_grey: 'Show grey with “offline”', ed_offline_hide: 'Hide', ed_lang_auto: 'Like Home Assistant',
    ed_battery: 'Battery: state of charge', ed_battery_power: 'Battery: power (BMS)', ed_solar: 'Solar power', ed_charger: 'Charger: switch',
    ed_charger_power: 'Charger: power (smart plug)', ed_charger_min_power: 'Charger counts as charging from (W)', ed_charger_toggle: 'Charger can be switched in the card',
    ed_fresh: 'Fresh water', ed_grey: 'Grey water', ed_gas: 'Gas', ed_gas_availability: 'Gas: check availability via',
    ed_temp_inside: 'Inside temperature', ed_temp_fridge: 'Fridge temperature', ed_pump: 'Water pump or taps', ed_pump_name: 'Name of the water switch',
    ed_light_inside: 'Inside light', ed_light_outside: 'Outside light', ed_pitch: 'Tilt, length', ed_roll: 'Tilt, side',
    ed_track: 'Track width (cm)', ed_base_caravan: 'Axle to jockey wheel (cm)', ed_base_tandem: 'Axle centre to jockey wheel (cm)', ed_base_wheels: 'Wheelbase (cm)',
    ed_max_wedge: 'Highest chock (cm)', ed_steps: 'Chock steps (cm), for example 3, 6, 9', ed_tolerance: 'Tolerance (degrees)',
    ed_invert_pitch: 'Invert length tilt', ed_invert_roll: 'Invert side tilt', ed_swap_axes: 'Swap axes',
    ed_g_vehicle: 'Vehicle', ed_g_energy: 'Energy', ed_g_water: 'Water and gas', ed_g_climate: 'Climate', ed_g_switches: 'Switches and lights', ed_g_level: 'Levelling',
    ed_default_is: 'Default for this outline:', ed_gas_help: 'A sensor that goes offline when the gas reading fails. The card then shows “offline” instead of 0 %.',
    ed_charger_help: 'Display only by default, so the card does not interfere with your automations.',
    ed_zero_title: 'Zero point', ed_zero: 'Use current tilt as zero point', ed_zero_reset: 'Reset zero point',
    ed_zero_hint: 'Only use this when the vehicle is verifiably level, for example checked with a spirit level.',
    ed_zero_now: 'Currently measured', ed_zero_set: 'Saved zero point', ed_zero_none: 'No tilt sensor assigned or offline.',
    ed_no_form: 'The Home Assistant editor could not be loaded. The card can still be configured in YAML.',
  },
};

/** Sprache der Karte: Einstellung der Karte, sonst Home Assistant. Alles außer Deutsch wird Englisch. */
function langOf(hass, cfg) {
  const l = cfg && cfg.language && cfg.language !== 'auto' ? cfg.language
    : (hass && hass.locale && hass.locale.language) || (hass && hass.language) || 'en';
  return String(l).toLowerCase().startsWith('de') ? 'de' : 'en';
}

// ---- vehicles.js ----
/* Fahrzeug-Umrisse der Camper Card. Selbst gezeichnete allgemeine Formen, keine Herstellerzeichnungen. */
/* ---------- Umrisse: selbst gezeichnet, allgemeine Formen, Bug zeigt nach rechts (Türseite sichtbar) ---------- */
/* Maßstab etwa 90 Einheiten pro Meter, Boden bei y = 286. Keine Herstellerzeichnung und kein Foto als Vorlage. */
const CAR_COMMON={type:'caravan',bottom:250,wheel:{xs:[340],r:28},pivot:340,ext:[58,770],
  door:{x:170,y:84,w:56,h:160,r:10,win:{x:178,y:98,w:40,h:50,r:7}},
  tow:{from:584,hitch:752,jockey:700,y:246,beam:'M580 242 L754 244 L754 251 L580 253 Z',cover:'M584 248 L584 226 C584 216 594 212 606 212 L648 214 C668 216 684 230 690 248 Z'},
  steadies:[76,548],hatches:[{x:96,y:178,w:40,h:30,r:5}],filler:{x:524,y:198},
  cut:[{x:236,y:176,w:292,h:70,r:10},{x:536,y:176,w:46,h:70,r:8}],wheelhouse:[{x:300,y:204,w:80,h:36}],
  bat:{x:242,y:198,w:56,h:38},fresh:{x:388,y:192,w:132,h:46},gas:{x:545,y:184,w:28,h:56},
  inlet:{x:148,y:204},cable:'M148 211 C146 246 112 270 66 286',cflow:'M148 211 L148 247 L268 247 L268 236',
  lamp:{x:238,y:88},tail:{x:58,y:192,w:5,h:34}};
/* Fahrerhaus eines großen Transporters: kurzer Vorbau (etwa 0,8 m vor dem Vorderrad), steile Frontscheibe */
const FRONT='L632 242 L664 244 C670 244 674 239 674 232 L674 214 C674 206 672 201 668 198 L656 192 C644 188 634 184 626 180';
const CAB={win:'M528 110 L566 110 L608 166 L528 166 Z',seam:'M522 96 L522 242 M622 184 L616 216',
  mirror:'M616 146 L630 144 L634 168 L624 170 L621 178 L616 178 L618 170 Z',headPath:'M654 198 L672 202 L672 212 L650 209 Z',
  bumper:'M630 228 L674 228 L674 236 C674 242 670 246 662 246 L630 246 Z',ind:{x:640,y:206}};
const MH_COMMON={type:'motorhome',bottom:242,wheel:{xs:[240,600],r:31},pivot:420,ext:[40,676],flare:600,
  windows:[{x:62,y:88,w:70,h:50,r:7},{x:160,y:86,w:80,h:52,r:7},{x:344,y:84,w:96,h:56,r:7}],
  door:{x:452,y:74,w:54,h:164,r:8,win:{x:460,y:88,w:38,h:46,r:6}},
  skirt:'M0 210 L522 210 L522 270 L0 270 Z',accent:'M40 208 L522 208',
  hatches:[{x:50,y:152,w:92,h:80,r:6,lock:true}],
  cut:[{x:150,y:166,w:48,h:72,r:8},{x:286,y:166,w:156,h:72,r:10}],
  bat:{x:294,y:194,w:56,h:38},fresh:{x:358,y:186,w:78,h:46},grey:{x:300,y:244,w:120,h:22,under:true},gas:{x:159,y:176,w:28,h:56},
  inlet:{x:214,y:180},cable:'M214 187 C214 228 206 262 196 286',cflow:'M221 180 L322 180 L322 194',
  lamp:{x:516,y:78},tail:{x:40,y:160,w:5,h:46},skylights:[{x:100,w:40},{x:372,w:44}],solar:{x:170,w:180,y:30}};
const VAN_COMMON={type:'van',bottom:242,wheel:{xs:[237,600],r:31},pivot:418,ext:[112,676],flare:600,
  cab:CAB,rocker:'M112 236 L640 236 L640 262 L112 262 Z',
  rearBumper:'M112 226 L138 226 L138 246 L124 246 C117 246 112 241 112 234 Z',
  cut:[{x:126,y:164,w:56,h:76,r:8},{x:282,y:164,w:130,h:76,r:10}],
  bat:{x:288,y:196,w:54,h:38},fresh:{x:348,y:188,w:58,h:46},grey:{x:290,y:248,w:110,h:20,under:true},gas:{x:140,y:178,w:28,h:56},
  inlet:{x:212,y:180},cable:'M212 187 C212 228 204 262 194 286',cflow:'M219 180 L315 180 L315 196',
  tail:{x:112,y:194,w:5,h:30}};
const V={
 caravan_round:{...CAR_COMMON,name:{de:'Abgerundet',en:'Rounded'},vb:[30,-4,792],roofY:56,
  body:'M74 250 L566 250 C578 250 586 244 588 232 L592 196 C596 150 576 96 528 70 C500 58 470 56 440 56 L120 56 C84 56 62 70 60 104 L58 232 C58 244 64 250 74 250 Z',
  skirt:'M0 214 L470 214 C520 214 558 204 600 178 L600 270 L0 270 Z',accent:'M58 212 L468 212 C518 212 556 202 598 176',rail:'M92 70 L500 70',
  windows:[{x:80,y:110,w:68,h:50,r:8},{x:284,y:108,w:118,h:56,r:9},{x:426,y:106,w:80,h:56,r:9}],
  seams:'M498 61 C546 73 578 110 585 160 L588 212',
  skylights:[{x:430,w:44},{x:106,w:30}],solar:{x:160,w:180,y:56},flow:'M268 56 L268 198',marker:{x:587,y:202}},
 caravan_box:{...CAR_COMMON,name:{de:'Kantig',en:'Angular'},vb:[30,-2,792],roofY:58,
  body:'M70 250 L578 250 Q588 250 589 240 L592 84 Q592 58 566 58 L82 58 Q58 58 58 82 L58 240 Q58 250 70 250 Z',
  skirt:'M0 214 L600 214 L600 270 L0 270 Z',accent:'M58 212 L592 212',rail:'M84 72 L566 72',
  windows:[{x:80,y:110,w:68,h:50,r:4},{x:284,y:108,w:118,h:54,r:4},{x:426,y:106,w:112,h:56,r:4}],
  door:{x:170,y:84,w:56,h:160,r:5,win:{x:178,y:98,w:40,h:50,r:4}},
  frontWin:'M572 92 L588 92 L589 156 L572 156 Z',
  skylights:[{x:452,w:44},{x:106,w:30}],solar:{x:160,w:180,y:58},flow:'M268 58 L268 198',marker:{x:586,y:202}},
 caravan_tandem:{...CAR_COMMON,axles:2,name:{de:'Tandemachse',en:'Twin axle'},vb:[14,-4,808],roofY:56,pivot:396,ext:[40,788],
  body:'M56 250 L622 250 C634 250 642 244 644 232 L648 196 C652 150 632 96 584 70 C556 58 526 56 496 56 L102 56 C66 56 44 70 42 104 L40 232 C40 244 46 250 56 250 Z',
  skirt:'M0 214 L526 214 C576 214 614 204 656 178 L656 270 L0 270 Z',accent:'M40 212 L524 212 C574 212 612 202 654 176',rail:'M74 70 L556 70',
  windows:[{x:62,y:110,w:68,h:50,r:8},{x:282,y:108,w:136,h:56,r:9},{x:446,y:106,w:104,h:56,r:9}],
  door:{x:152,y:84,w:56,h:160,r:10,win:{x:160,y:98,w:40,h:50,r:7}},
  seams:'M554 61 C602 73 634 110 641 160 L644 212',
  wheel:{xs:[360,432],r:27},
  tow:{from:640,hitch:768,jockey:720,y:246,beam:'M636 242 L770 244 L770 251 L636 253 Z',cover:'M640 248 L640 226 C640 216 650 212 662 212 L704 214 C724 216 740 230 746 248 Z'},
  steadies:[58,604],hatches:[{x:76,y:178,w:40,h:30,r:5}],filler:{x:578,y:198},
  cut:[{x:220,y:176,w:362,h:70,r:10},{x:592,y:176,w:46,h:70,r:8}],wheelhouse:[{x:322,y:204,w:148,h:36}],
  bat:{x:228,y:198,w:56,h:38},fresh:{x:478,y:192,w:98,h:46},gas:{x:601,y:184,w:28,h:56},
  skylights:[{x:470,w:44},{x:88,w:30}],solar:{x:150,w:190,y:56},flow:'M254 56 L254 198',
  inlet:{x:134,y:204},cable:'M134 211 C132 246 98 270 52 286',cflow:'M134 211 L134 247 L254 247 L254 236',
  lamp:{x:220,y:88},tail:{x:40,y:192,w:5,h:34},marker:{x:643,y:202}},
 mh_semi:{...MH_COMMON,name:{de:'Teilintegriert',en:'Semi-integrated'},vb:[20,-26,694],roofY:30,
  body:'M56 242 '+FRONT+' L566 100 C560 93 552 90 542 90 C516 89 500 56 468 38 C456 32 446 30 432 30 L72 30 C52 30 40 42 40 62 L40 226 C40 236 46 242 56 242 Z',
  rail:'M60 44 L440 44',cab:CAB,flow:'M322 30 L322 194'},
 mh_alcove:{...MH_COMMON,name:{de:'Alkoven',en:'Alcove'},vb:[20,-34,694],roofY:22,
  body:'M56 242 '+FRONT+' L570 104 L622 102 C640 102 650 92 650 76 L646 44 C644 28 628 22 606 22 L72 22 C52 22 40 34 40 54 L40 226 C40 236 46 242 56 242 Z',
  rail:'M60 36 L600 36',windows:[...MH_COMMON.windows,{x:556,y:40,w:58,h:30,r:8}],
  cab:{...CAB,win:'M528 114 L570 114 L608 166 L528 166 Z',seam:'M522 104 L522 242 M622 184 L616 216'},
  solar:{x:170,w:180,y:22},flow:'M322 22 L322 194'},
 mh_integrated:{...MH_COMMON,name:{de:'Integriert',en:'Integrated'},vb:[20,-26,712],roofY:30,ext:[40,692],flare:null,
  body:'M56 242 L668 244 C682 244 690 236 690 224 L692 192 C692 168 684 140 666 112 L622 50 C612 38 598 30 580 30 L72 30 C52 30 40 42 40 62 L40 226 C40 236 46 242 56 242 Z',
  skirt:'M0 210 L700 210 L700 270 L0 270 Z',accent:'M40 208 L692 208',rail:'M60 44 L560 44',
  cab:{win:'M528 88 L600 88 C616 108 632 132 642 160 L528 164 Z',wind:'M614 52 C634 74 664 116 676 156 L654 160 C642 120 620 86 598 60 Z',seam:'M522 84 L522 206',
   mirror:'M672 92 L682 90 L686 116 L676 118 Z',head:{x:676,y:194,w:14,h:12},bumper:'M640 224 L690 224 L690 236 C690 244 684 248 676 248 L640 248 Z'},
  flow:'M322 30 L322 194'},
 van_high:{...VAN_COMMON,name:{de:'Hochdach',en:'High roof'},vb:[92,-6,694],roofY:52,
  body:'M126 242 '+FRONT+' L566 100 C559 91 550 86 542 80 C532 64 520 56 502 54 L126 52 C116 52 112 58 112 68 L112 228 C112 236 118 242 126 242 Z',
  windows:[{x:126,y:96,w:72,h:48,r:6}],door:{x:418,y:92,w:104,h:150,r:4,win:{x:428,y:100,w:84,h:50,r:6},slide:true},
  rail:'M240 148 L418 148',seams:'M118 70 L118 226',
  skylights:[{x:150,w:36},{x:396,w:40}],solar:{x:200,w:180,y:52},flow:'M315 52 L315 196',lamp:{x:470,y:86}},
 van_popup:{...VAN_COMMON,name:{de:'Aufstelldach',en:'Pop-up roof'},vb:[92,-14,694],roofY:88,
  body:'M126 242 '+FRONT+' L566 100 C560 93 552 90 542 90 L126 88 C116 88 112 94 112 104 L112 228 C112 236 118 242 126 242 Z',
  windows:[{x:126,y:104,w:72,h:44,r:6}],door:{x:418,y:100,w:104,h:142,r:4,win:{x:428,y:108,w:84,h:44,r:6},slide:true},
  rail:'M240 152 L418 152',seams:'M118 104 L118 226',
  /* Aufstelldach: hinten angeschlagen, vorn hochgestellt */
  popup:{hx:150,hy:88,fx:540,fy:30,fabric:'M150 88 L540 90 L540 30 Z',shell:'M140 86 L548 24',win:{x:440,y:50,w:70,h:22}},
  skylights:[],solar:{x:230,w:170,y:68,rot:-8.6},flow:'M315 63 L315 196',lamp:{x:470,y:94}}
};
const GROUPS={caravan:['caravan_round','caravan_box','caravan_tandem'],motorhome:['mh_semi','mh_alcove','mh_integrated'],van:['van_high','van_popup']};
const TYPE_NAME={caravan:{de:'Wohnwagen',en:'Caravan'},motorhome:{de:'Wohnmobil',en:'Motorhome'},van:{de:'Camper Van',en:'Camper van'}};
const DIMS={caravan_round:[215,430],caravan_box:[215,430],caravan_tandem:[215,480],mh_semi:[180,400],mh_alcove:[180,400],mh_integrated:[185,420],van_high:[180,404],van_popup:[180,404]};

// ---- leveling.js ----
/* Keilrechnung der Camper Card. Reine Mathematik, ohne Home Assistant und ohne DOM, damit sie getestet werden kann. */

const DEG = Math.PI / 180;

/**
 * Berechnet, wie viele Zentimeter Keil unter welche Räder müssen.
 * Vorzeichen: pitch > 0 heißt Bug oder Front hoch, roll > 0 heißt rechte Seite hoch (in Fahrtrichtung).
 * Wohnwagen (kind 'caravan'): Keil unter die tiefe Seite, Bugrad hoch oder runter.
 * Wohnmobil und Van (kind 'wheels'): jedes Rad relativ zum höchsten Rad.
 * Werte innerhalb der Toleranz (Grad) gelten als waagerecht.
 */
function calcLeveling({ kind, pitch = 0, roll = 0, track, base, tol = 0 }) {
  const p = Math.abs(pitch) <= tol ? 0 : pitch;
  const r = Math.abs(roll) <= tol ? 0 : roll;
  const tp = Math.tan(p * DEG), tr = Math.tan(r * DEG);
  if (kind === 'caravan') {
    return {
      kind, level: p === 0 && r === 0,
      side: r === 0 ? null : (r > 0 ? 'left' : 'right'), wedge: track * Math.abs(tr),
      nose: p === 0 ? null : (p > 0 ? 'lower' : 'raise'), noseCm: base * Math.abs(tp),
    };
  }
  const pos = { fl: [base / 2, -track / 2], fr: [base / 2, track / 2], rl: [-base / 2, -track / 2], rr: [-base / 2, track / 2] };
  const z = {};
  for (const k in pos) z[k] = pos[k][0] * tp + pos[k][1] * tr;
  const top = Math.max(...Object.values(z));
  const wheels = {};
  for (const k in z) wheels[k] = top - z[k];
  return { kind, level: p === 0 && r === 0, wheels };
}

/** Rundet auf halbe Zentimeter, so wie die Karte Keile anzeigt. */
const round5 = (v) => Math.round(v * 2) / 2;

/** Nächstgelegene Keilstufe. Gibt null zurück, wenn keine Stufen eingetragen sind. */
function nearestStep(v, steps) {
  if (!steps || !steps.length) return null;
  let bi = 0;
  steps.forEach((s, i) => { if (Math.abs(s - v) < Math.abs(steps[bi] - v)) bi = i; });
  return { index: bi + 1, value: steps[bi] };
}

/** Rechnet Neigungswerte in Grad um. Unterstützt °, %, rad und mrad. */
function toDegrees(value, unit) {
  const u = String(unit || '°').trim().toLowerCase();
  if (u === '%') return Math.atan(value / 100) / DEG;
  if (u === 'rad') return value / DEG;
  if (u === 'mrad') return value / 1000 / DEG;
  return value;
}

/**
 * Wendet Achsentausch, Vorzeichen und Nullpunkt auf die Rohwerte der Sensoren an (alles in Grad).
 * Reihenfolge: erst tauschen, dann umkehren, dann Nullpunkt abziehen.
 */
function correctTilt(raw, lv) {
  let a = raw.pitch, b = raw.roll;
  if (lv.swap_axes) [a, b] = [b, a];
  return {
    pitch: a * (lv.invert_pitch ? -1 : 1) - (lv.offset_pitch || 0),
    roll: b * (lv.invert_roll ? -1 : 1) - (lv.offset_roll || 0),
  };
}

// ---- sources.js ----
/* Ladequellen der Camper Card. Das BMS misst nur die Summe an der Batterie, die Quelle ergibt sich aus den Quell-Sensoren. */

/**
 * st: Zustand je Sensor ('none' nicht zugewiesen, 'off' offline, 'ok') für power, solar, charger, chargerPower.
 * v: Werte (power und solar in W, charger true/false, chargerPower in W).
 * chargerMin: ab dieser Leistung des Zwischensteckers gilt das Ladegerät als ladend.
 */
function chargeSources(st, v, chargerMin) {
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
function sourceKey(src) {
  if (!src.batCharging) return '';
  if (src.solarActive && src.chargerActive) return 'both';
  if (src.solarActive) return 'solar';
  if (src.chargerActive) return 'charger';
  return src.unknown ? 'unknown' : '';
}

// ---- config.js ----
/* Konfiguration der Camper Card: Standardwerte und Prüfung. Ohne DOM, damit sie getestet werden kann. */

/** Konfigurationsname der Entität und interner Schlüssel. gas_availability wird gesondert behandelt. */
const ENTITY_KEYS = {
  battery: 'battery', battery_power: 'power', solar: 'solar', charger: 'charger', charger_power: 'chargerPower',
  fresh: 'fresh', grey: 'grey', gas: 'gas', temp_inside: 'tempIn', temp_fridge: 'tempFridge',
  pump: 'pump', light_inside: 'lightIn', light_outside: 'lightOut', pitch: 'pitch', roll: 'roll',
};
const CFG_OF = Object.fromEntries(Object.entries(ENTITY_KEYS).map(([c, k]) => [k, c]));
const BOOL_KEYS = new Set(['charger', 'pump', 'lightIn', 'lightOut']);
const VEHICLES = ['caravan', 'motorhome', 'van'];

const cfgNum = (x, d) => { const n = typeof x === 'string' && x.trim() === '' ? NaN : Number(x); return Number.isFinite(n) ? n : d; };
const cfgClamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Keilstufen aus Text („3, 6, 9“), Zahl oder Liste. Ergebnis: aufsteigende positive Zahlen. */
function parseSteps(s) {
  let arr = [];
  if (Array.isArray(s)) arr = s;
  else if (typeof s === 'number') arr = [s];
  else if (typeof s === 'string') arr = s.split(/[;,\s]+/);
  return arr.map(Number).filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
}

/** Prüft die Rohkonfiguration und ergänzt Standardwerte. Wirft bei unbrauchbarer Eingabe. */
function normalizeConfig(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Camper Card: Konfiguration fehlt / configuration missing');
  let vehicle = VEHICLES.includes(raw.vehicle) ? raw.vehicle : (raw.outline && V[raw.outline] ? V[raw.outline].type : 'caravan');
  let outline = raw.outline && V[raw.outline] && V[raw.outline].type === vehicle ? raw.outline : GROUPS[vehicle][0];
  const entities = {};
  const ent = raw.entities && typeof raw.entities === 'object' ? raw.entities : {};
  for (const key of [...Object.keys(ENTITY_KEYS), 'gas_availability']) {
    if (typeof ent[key] === 'string' && ent[key].includes('.')) entities[key] = ent[key].trim();
  }
  const lv = raw.leveling && typeof raw.leveling === 'object' ? raw.leveling : {};
  const dims = DIMS[outline];
  const track = cfgNum(lv.track, null), base = cfgNum(lv.base, null);
  return {
    type: raw.type,
    name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : null,
    vehicle, outline,
    offline: raw.offline === 'hide' ? 'hide' : 'grey',
    language: raw.language === 'de' || raw.language === 'en' ? raw.language : 'auto',
    pump_name: typeof raw.pump_name === 'string' && raw.pump_name.trim() ? raw.pump_name.trim() : null,
    charger_min_power: Math.max(0, cfgNum(raw.charger_min_power, 10)),
    charger_toggle: raw.charger_toggle === true,
    entities,
    leveling: {
      track: track !== null && track > 0 ? track : dims[0],
      base: base !== null && base > 0 ? base : dims[1],
      defaults: !(track > 0) || !(base > 0),
      max_wedge: Math.max(0, cfgNum(lv.max_wedge, 12)),
      steps: parseSteps(lv.steps),
      tolerance: cfgClamp(cfgNum(lv.tolerance, 0.2), 0, 5),
      invert_pitch: lv.invert_pitch === true,
      invert_roll: lv.invert_roll === true,
      swap_axes: lv.swap_axes === true,
      offset_pitch: cfgNum(lv.offset_pitch, 0),
      offset_roll: cfgNum(lv.offset_roll, 0),
    },
  };
}

// ---- card.js ----
/* Camper Card: die Karte selbst. Zeichnet die Seitenansicht und die Ansicht zum Ausrichten. */





const VERSION = "0.1.1";
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

class CamperCard extends HTMLElement {
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
const CARD_VERSION = VERSION;

// ---- editor.js ----
/* Camper Card: Karten-Editor. Nutzt das Formular von Home Assistant (ha-form), damit niemand YAML braucht. */




const ENT_FIELDS = ['battery', 'battery_power', 'solar', 'charger', 'charger_power', 'fresh', 'grey', 'gas', 'gas_availability',
  'temp_inside', 'temp_fridge', 'pump', 'light_inside', 'light_outside', 'pitch', 'roll'];
const LV_FIELDS = ['track', 'base', 'max_wedge', 'steps', 'tolerance', 'invert_pitch', 'invert_roll', 'swap_axes', 'offset_pitch', 'offset_roll'];
const TOP_FIELDS = ['name', 'vehicle', 'outline', 'offline', 'language', 'pump_name', 'charger_min_power', 'charger_toggle'];
const NUMERIC = { entity: { domain: ['sensor', 'input_number', 'number'] } };
const ONOFF = { entity: { domain: ['switch', 'light', 'input_boolean'] } };
const empty = (v) => v === undefined || v === null || v === '';

/** Formulardaten sind flach, die gespeicherte Konfiguration ist gegliedert (entities, leveling). */
function flattenConfig(cfg) {
  const d = {};
  for (const k of TOP_FIELDS) if (!empty(cfg[k])) d[k] = cfg[k];
  for (const k of ENT_FIELDS) if (cfg.entities && !empty(cfg.entities[k])) d[k] = cfg.entities[k];
  for (const k of LV_FIELDS) if (cfg.leveling && !empty(cfg.leveling[k])) d[k] = Array.isArray(cfg.leveling[k]) ? cfg.leveling[k].join(', ') : cfg.leveling[k];
  return d;
}
function unflattenConfig(data, prev) {
  const out = { type: (prev && prev.type) || 'custom:camper-card' };
  for (const k of TOP_FIELDS) if (!empty(data[k]) && data[k] !== false) out[k] = data[k];
  const ent = {}; for (const k of ENT_FIELDS) if (!empty(data[k])) ent[k] = data[k];
  const lv = {}; for (const k of LV_FIELDS) if (!empty(data[k]) && data[k] !== false) lv[k] = data[k];
  // Fahrzeugtyp gewechselt: passenden Umriss setzen.
  if (out.vehicle && (!out.outline || !V[out.outline] || V[out.outline].type !== out.vehicle)) out.outline = GROUPS[out.vehicle][0];
  out.entities = ent;
  if (Object.keys(lv).length) out.leveling = lv;
  return out;
}

/* In Node (Tests) gibt es kein HTMLElement. Die reinen Funktionen oben sollen trotzdem testbar sein. */
const EditorBase = typeof HTMLElement === 'undefined' ? class {} : HTMLElement;
class CamperCardEditor extends EditorBase {
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
    return s.title || L('ed_' + s.name);
  }
  _helper(s) {
    const L = this._L, c = this._norm();
    if (s.name === 'track') return `${L('ed_default_is')} ${DIMS[c.outline][0]} cm`;
    if (s.name === 'base') return `${L('ed_default_is')} ${DIMS[c.outline][1]} cm`;
    if (s.name === 'gas_availability') return L('ed_gas_help');
    if (s.name === 'charger_toggle') return L('ed_charger_help');
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
      ]),
      g('g_water', [
        { name: 'fresh', selector: NUMERIC },
        ...(c.vehicle === 'caravan' ? [] : [{ name: 'grey', selector: NUMERIC }]),
        { name: 'gas', selector: NUMERIC }, { name: 'gas_availability', selector: { entity: {} } },
      ]),
      g('g_climate', [{ name: 'temp_inside', selector: NUMERIC }, { name: 'temp_fridge', selector: NUMERIC }]),
      g('g_switches', [
        { name: 'pump', selector: ONOFF }, { name: 'pump_name', selector: { text: {} } },
        { name: 'light_inside', selector: ONOFF }, { name: 'light_outside', selector: ONOFF },
      ]),
      g('g_level', [
        { name: 'pitch', selector: NUMERIC }, { name: 'roll', selector: NUMERIC },
        { name: 'track', selector: num(50, 400, 1, 'cm') }, { name: 'base', selector: num(50, 1200, 1, 'cm') },
        { name: 'max_wedge', selector: num(0, 60, 0.5, 'cm') }, { name: 'steps', selector: { text: {} } },
        { name: 'tolerance', selector: num(0, 2, 0.1, '°') },
        { name: 'invert_pitch', selector: { boolean: {} } }, { name: 'invert_roll', selector: { boolean: {} } }, { name: 'swap_axes', selector: { boolean: {} } },
      ]),
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

// ---- register.js ----
/* Camper Card: Elemente anmelden und in der Kartenauswahl von Home Assistant eintragen. */


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
})();
