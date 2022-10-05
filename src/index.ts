import { createPathComponent } from '@react-leaflet/core';
import { Polyline, PolylineOptions } from 'leaflet';
import L from './leaflet-hotline';

export interface Options extends PolylineOptions {
  positions: number[][];
  /**
   * The width of the drawn line.
   * @default 5
   */
  weight?: number;
  /**
   * The minimal number for which the color palette shall be calculated for.
   * @default 0
   */
  min?: number;
  /**
   * The maximal number for which the color palette shall be calculated for.
   * @default 1
   */
  max?: number;
  /**
   * The color palette to distribute of the given value range.
   * @default { 0.0: 'green', 0.5: 'yellow', 1.0: 'red' }
   */
  palette?: {
    0.0: string;
    0.5: string;
    1.0: string;
  };
}

/**
 * A component for drawing colored gradients along polylines.
 * This is useful for visualising values along a course, for example: elevation, velocity, or heart rate.
 * Ported from "leaflet.hotline" and wrapped as a react component for usage in react-leaflet.
 * @see https://github.com/iosphere/Leaflet.hotline
 * @see https://react-leaflet.js.org/
 */
export const Hotline = createPathComponent<Polyline, Options>(
  function createPolyline({ positions, ...options }, ctx) {
    const instance = L.hotline(positions, options);
    return { instance, context: { ...ctx, overlayContainer: instance } };
  },
  function updatePolyline(layer, props, prevProps) {
    // Handle line weight change
    if (props.weight !== prevProps.weight) {
      layer.options.weight = props.weight;
      layer.redraw();
    }
    // TODO: Implement other change handlers if needed
  },
);
