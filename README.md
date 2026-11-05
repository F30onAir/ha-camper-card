# Camper Card

Dashboard card for Home Assistant: a caravan, motorhome or camper van in side view with tanks, battery, solar and lights, plus levelling with chock heights. German and English. Works without internet. No integration needed, the card reads existing entities.

> Status: in development, not released. Vehicle outlines are self-drawn generic approximations, not manufacturer drawings.

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

Sign convention: `pitch > 0` means nose or front up, `roll > 0` means right side up (in driving direction). Use `invert_pitch`, `invert_roll`, `swap_axes` and the zero-point button in the editor to match your sensor.

## Development

No npm packages are needed. With Node.js 20 or newer:

```bash
npm run build   # writes dist/camper-card.js
npm test        # levelling maths, charge sources, config, editor mapping, build output
```

`test/harness.html` shows the built card with simulated Home Assistant data. Serve the project folder with any static web server and open that page.
