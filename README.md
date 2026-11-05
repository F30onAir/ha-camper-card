# Camper Card

Dashboard card for Home Assistant: a caravan, motorhome or camper van in side view with tanks, battery, solar and lights, plus levelling with chock heights. German and English. Works without internet. No integration needed, the card reads entities you already have.

*Deutsch:* Dashboard-Karte für Home Assistant: Wohnwagen, Wohnmobil oder Camper Van in der Seitenansicht mit Tanks, Batterie, Solar und Licht, dazu Ausrichten mit Keilhöhen. Deutsch und Englisch, funktioniert ohne Internet, braucht keine Integration.

> **Status: early test version (0.1.0).** Feedback is very welcome, please open an [issue](https://github.com/F30onAir/ha-camper-card/issues). Vehicle outlines are self-drawn generic approximations, not manufacturer drawings.

<p align="center"><img src="https://raw.githubusercontent.com/F30onAir/ha-camper-card/main/docs/images/overview-dark.png" alt="Camper Card in dark theme: caravan in side view with lit windows, solar panel, battery, fresh water tank and gas bottle, tiles for battery, solar, water, gas and temperatures below" width="640"></p>

## Features

- Side view with 8 generic outlines: caravan (rounded, angular, twin axle), motorhome (semi-integrated, alcove, integrated), camper van (high roof, pop-up roof)
- Fresh water, grey water (motorhome and van), gas, battery, solar, charger, temperatures
- Windows light up with the inside light, outside light, water pump or taps as a switch
- Charge source: solar, charger, both or unknown, derived from your sensors
- Levelling: spirit level from two tilt sensors, chock height per wheel, for caravans also the jockey wheel
- Sensors that are assigned but offline show "offline", unassigned parts are hidden
- Visual editor, light and dark theme, phone and tablet

## Screenshots

Levelling: what to do first, spirit level and chock plan (light theme).

<p align="center"><img src="https://raw.githubusercontent.com/F30onAir/ha-camper-card/main/docs/images/leveling-light.png" alt="Levelling view: status not level, chock 3.5 cm under the right wheel, lower the nose 10.5 cm with the jockey wheel, spirit level and chock plan from above" width="640"></p>

The 8 generic outlines, each with tanks, battery and solar.

<p align="center"><img src="https://raw.githubusercontent.com/F30onAir/ha-camper-card/main/docs/images/outlines.png" alt="Eight vehicle outlines: caravan rounded, angular and twin axle, motorhome semi-integrated, alcove and integrated, camper van with high roof and pop-up roof" width="860"></p>

The images are rendered from the real card with sample data (`docs/shots.html`).

## Installation (HACS)

The card is not in the HACS store yet. Add it as a custom repository:

1. HACS → ⋮ (top right) → **Custom repositories**
2. Repository: `https://github.com/F30onAir/ha-camper-card`, type: **Dashboard**
3. Open **Camper Card** in HACS and download it
4. Reload the browser (in the companion app: reset the frontend cache in the app settings)
5. Edit a dashboard → **Add card** → **Camper Card**, then pick your entities in the editor

*Deutsch:* HACS → ⋮ → **Benutzerdefinierte Repositories** → `https://github.com/F30onAir/ha-camper-card`, Typ **Dashboard** → **Camper Card** herunterladen → Browser neu laden → Dashboard bearbeiten → **Karte hinzufügen** → **Camper Card**.

## Example

```yaml
type: custom:camper-card
name: Wohnwagen
vehicle: caravan          # caravan | motorhome | van
outline: caravan_round    # caravan_round, caravan_box, caravan_tandem, mh_semi, mh_alcove, mh_integrated, van_high, van_popup
offline: grey             # grey | hide (assigned but offline)
entities:
  battery: sensor.battery_soc
  battery_power: sensor.battery_power      # W, positive = charging
  solar: sensor.solar_power
  charger: switch.charger                  # optional, shows the charger as a source
  charger_power: sensor.charger_plug_power
  fresh: sensor.fresh_water_percent
  grey: sensor.grey_water_percent          # motorhome and van only
  gas: sensor.gas_percent
  gas_availability: sensor.gas_raw_sensor  # shows "offline" instead of 0 % when this one is unavailable
  temp_inside: sensor.inside_temperature
  temp_fridge: sensor.fridge_temperature
  pump: switch.water_pump
  light_inside: light.inside
  light_outside: light.awning
  pitch: sensor.tilt_length                # degrees (also %, rad, mrad)
  roll: sensor.tilt_side
leveling:
  track: 215        # cm, wheel centre to wheel centre
  base: 430         # cm, caravan: axle to jockey wheel, motorhome/van: wheelbase
  max_wedge: 12     # cm, warn above
  steps: 3, 6, 9    # optional chock steps
  tolerance: 0.2    # degrees counted as level
```

Tank and battery sensors are expected in percent. Sign convention for tilt: `pitch > 0` means nose or front up, `roll > 0` means right side up (in driving direction). Use `invert_pitch`, `invert_roll`, `swap_axes` and the zero-point button in the editor to match your sensor.

## Support

If you like the card, you can support development with a voluntary coffee:

<a href="https://buymeacoffee.com/f30onair"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="50"></a>

## Development

No npm packages are needed. With Node.js 20 or newer:

```bash
npm run build   # writes dist/camper-card.js
npm test        # levelling maths, charge sources, config, editor mapping, build output
```

`test/harness.html` shows the built card with simulated Home Assistant data. Serve the project folder with any static web server and open that page.
