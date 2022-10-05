# leaflet-hotline-react

Ported leaflet-hotline lib to be used with react-leaflet v4 and react.

![Demo image of hotline path on map](demo.png 'Demo Image')

## Usage

Use the `Hotline` component within your `MapContainer`.

```tsx
<Hotline
  positions={[
    [47.627253, 12.434933, 1600],
    [47.628233, 12.434574, 1605],
    [47.629729, 12.433587, 1610],
    [47.631779, 12.436349, 1615],
  ]}
  weight={3}
  min={1600}
  max={1620}
  palette={{
    0.0: 'red',
    0.5: 'yellow',
    1.0: 'green',
  }}
/>
```

You can find a running example in `example/src/main.tsx`.

## Props

| props     | mandatory | default                                     | description                                                             |
| --------- | --------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| positions | yes       |                                             | The positions to draw the line for. An array of [lat, lon, alt]         |
| weight    | no        | 5                                           | The width of the drawn line.                                            |
| min       | no        | 0                                           | The minimal number for which the color palette shall be calculated for. |
| max       | no        | 1                                           | The maximal number for which the color palette shall be calculated for. |
| palette   | no        | { 0.0: 'green', 0.5: 'yellow', 1.0: 'red' } | The color palette to distribute of the given value range.               |
