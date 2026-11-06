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

## Sensors and switches

The card is only the display. It has no integration of its own and talks to no device directly. It reads entities that already exist in Home Assistant, no matter how they get there: Zigbee, Bluetooth, ESPHome, MQTT, Victron, Shelly and so on. Everything is optional. Start with one or two sensors, parts without an entity are hidden.

| Field | Entity | Value | Typical source |
|---|---|---|---|
| `battery` | sensor | % | state of charge from a BMS or battery monitor |
| `battery_power` | sensor | W, positive = charging | BMS or shunt |
| `solar` | sensor | W | solar charge controller |
| `charger` | switch | on/off | smart plug or relay in front of the mains charger |
| `charger_power` | sensor | W | power metering of that plug |
| `fresh`, `grey` (motorhome, van) | sensor | % | tank level sensor (ultrasonic, pressure, probes) |
| `gas` | sensor | % | gas bottle level sensor |
| `gas_availability` | any | – | raw sensor behind a gas template, shows "offline" instead of 0 % |
| `temp_inside`, `temp_fridge` | sensor | °C or °F | any temperature sensor |
| `pump` | switch or light | on/off | water pump or taps, tap the card to switch |
| `light_inside`, `light_outside` | switch or light | on/off | lights, tap the card to switch |
| `pitch`, `roll` | sensor | ° (also %, rad, mrad) | tilt sensor, lengthwise and sideways |

Number fields also take `input_number` and `number`, switch fields also `input_boolean`. With helpers you can try the card before any hardware is installed.

**Charge source.** A BMS only measures the total at the battery. The card counts the battery as charging above 5 W and then looks at the sources: solar above 5 W means solar. The charger counts when its switch is on and its plug draws at least `charger_min_power` (default 10 W). If only one of the two is assigned, that one decides. The card shows solar, charger, both, or "unknown" if no source explains the charging.

**Tested in a real caravan:** LiFePO4 battery with Bluetooth BMS via [BMS BLE](https://github.com/patman15/BMS_BLE-HA) (HACS), gas bottle via the built-in Mopeka integration, fresh water via a Zigbee ultrasonic tank sensor, taps via a Zigbee switch. Not tested yet: a real tilt sensor (levelling was checked with simulated values).

<details>
<summary>Tank or gas sensor reports mm or litres instead of %</summary>

Create a template sensor (Settings → Devices & services → Helpers → Template → Sensor), unit `%`, and assign it in the card. Example for a gas sensor in mm, set `full` to the reading of a full bottle:

```jinja
{% set mm = states('sensor.gas_tank_level') | float(0) %}
{% set full = 300 %}
{{ [mm / full * 100, 100] | min | round(0) }}
```

Then set `gas_availability` to `sensor.gas_tank_level`, so the card shows "offline" instead of 0 % when the bottle sensor is out of range.

</details>

<details>
<summary>Tilt sensor with ESPHome (example, not tested yet)</summary>

An ESP32 with an MPU6050 board, mounted flat with the x axis in driving direction:

```yaml
i2c:
  sda: GPIO21
  scl: GPIO22

sensor:
  - platform: mpu6050
    address: 0x68
    update_interval: 500ms
    accel_x: { id: ax, internal: true }
    accel_y: { id: ay, internal: true }
    accel_z: { id: az, internal: true }
  - platform: template
    name: Tilt length
    unit_of_measurement: "°"
    accuracy_decimals: 1
    update_interval: 1s
    lambda: |-
      return atan2(id(ax).state, sqrt(id(ay).state * id(ay).state + id(az).state * id(az).state)) * 180 / M_PI;
    filters:
      - sliding_window_moving_average: { window_size: 10, send_every: 1 }
  - platform: template
    name: Tilt side
    unit_of_measurement: "°"
    accuracy_decimals: 1
    update_interval: 1s
    lambda: |-
      return atan2(id(ay).state, sqrt(id(ax).state * id(ax).state + id(az).state * id(az).state)) * 180 / M_PI;
    filters:
      - sliding_window_moving_average: { window_size: 10, send_every: 1 }
```

If a direction is reversed or the axes are swapped, fix it in the card editor (invert, swap axes), then press the zero-point button while the vehicle stands level.

</details>

*Deutsch:* Die Karte ist nur die Anzeige und bringt keine eigene Integration mit. Sie liest Entitäten, die schon in Home Assistant sind, egal ob über Zigbee, Bluetooth, ESPHome, MQTT oder Victron. Tanks, Gas und Batterie in %, Leistungen in W, Neigung in Grad. Alles ist optional, fehlende Teile werden ausgeblendet. Getestet im Wohnwagen mit Bluetooth-BMS (BMS BLE), Mopeka-Gassensor, Zigbee-Tanksensor und Zigbee-Schalter.

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
