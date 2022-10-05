import L from 'leaflet';

/**
 * This is just a ported version of the unmaintained https://github.com/iosphere/Leaflet.hotline repo.
 * It was ported to Typescript without spending too much time on getting the typings right.
 * Just the necessary part (the interface options) are typed.
 */

export class Hotline {
  _canvas: any;
  _ctx: any;
  _width: any;
  _height: any;
  _weight: any;
  _outlineWidth: any;
  _outlineColor: any;
  _min: any;
  _max: any;
  _data: any;
  _palette: any;

  constructor(canvas: any) {
    if (!(this instanceof Hotline)) {
      return new Hotline(canvas);
    }

    var defaultPalette = {
      0.0: 'green',
      0.5: 'yellow',
      1.0: 'red',
    };

    this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

    this._ctx = canvas.getContext('2d');
    this._width = canvas.width;
    this._height = canvas.height;

    this._weight = 5;
    this._outlineWidth = 1;
    this._outlineColor = 'black';

    this._min = 0;
    this._max = 1;

    this._data = [];

    this.palette(defaultPalette);
  }

  public width(width: any) {
    this._width = width;
  }
  public height(height: any) {
    this._height = height;
  }
  public weight(weight: any) {
    this._weight = weight;
  }
  public outlineWidth(outlineWidth: any) {
    this._outlineWidth = outlineWidth;
  }
  public outlineColor(outlineColor: any) {
    this._outlineColor = outlineColor;
  }
  public min(min: any) {
    this._min = min;
  }
  public max(max: any) {
    this._max = max;
  }
  public data(data: any) {
    this._data = data;
    return this;
  }

  add(path: any) {
    this._data.push(path);
  }

  palette(palette: any) {
    var canvas = document.createElement('canvas'),
      ctx: any = canvas.getContext('2d'),
      gradient = ctx.createLinearGradient(0, 0, 0, 256);

    canvas.width = 1;
    canvas.height = 256;

    for (var i in palette) {
      gradient.addColorStop(i, palette[i]);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);

    this._palette = ctx.getImageData(0, 0, 1, 256).data;
  }

  getRGBForValue(value: any) {
    var valueRelative = Math.min(Math.max((value - this._min) / (this._max - this._min), 0), 0.999);
    var paletteIndex = Math.floor(valueRelative * 256) * 4;

    return [this._palette[paletteIndex], this._palette[paletteIndex + 1], this._palette[paletteIndex + 2]];
  }

  drawOutline(ctx: any) {
    var i, j, dataLength, path, pathLength, pointStart, pointEnd;

    if (this._outlineWidth) {
      for (i = 0, dataLength = this.data.length; i < dataLength; i++) {
        path = this._data[i];
        ctx.lineWidth = this._weight + 2 * this._outlineWidth;

        for (j = 1, pathLength = path.length; j < pathLength; j++) {
          pointStart = path[j - 1];
          pointEnd = path[j];

          ctx.strokeStyle = this.outlineColor;
          ctx.beginPath();
          ctx.moveTo(pointStart.x, pointStart.y);
          ctx.lineTo(pointEnd.x, pointEnd.y);
          ctx.stroke();
        }
      }
    }
  }

  drawHotline(ctx: any) {
    var i, j, dataLength, path, pathLength, pointStart, pointEnd, gradient, gradientStartRGB, gradientEndRGB;

    ctx.lineWidth = this.weight;

    for (i = 0, dataLength = this.data.length; i < dataLength; i++) {
      path = this._data[i];

      for (j = 1, pathLength = path.length; j < pathLength; j++) {
        pointStart = path[j - 1];
        pointEnd = path[j];

        // Create a gradient for each segment, pick start end end colors from palette gradient
        gradient = ctx.createLinearGradient(pointStart.x, pointStart.y, pointEnd.x, pointEnd.y);
        gradientStartRGB = this.getRGBForValue(pointStart.z);
        gradientEndRGB = this.getRGBForValue(pointEnd.z);
        gradient.addColorStop(0, 'rgb(' + gradientStartRGB.join(',') + ')');
        gradient.addColorStop(1, 'rgb(' + gradientEndRGB.join(',') + ')');

        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(pointStart.x, pointStart.y);
        ctx.lineTo(pointEnd.x, pointEnd.y);
        ctx.stroke();
      }
    }
  }

  draw() {
    var ctx = this._ctx;

    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';

    this.drawOutline(ctx);
    this.drawHotline(ctx);

    return this;
  }
}

var Renderer = L.Canvas.extend({
  _initContainer: function() {
    (L.Canvas.prototype as any)._initContainer.call(this);
    this._hotline = new Hotline(this._container);
  },

  _update: function() {
    (L.Canvas.prototype as any)._update.call(this);
    this._hotline.width(this._container.width);
    this._hotline.height(this._container.height);
  },

  _updatePoly: function(layer: any) {
    if (!this._drawing) {
      return;
    }

    var parts = layer._parts;

    if (!parts.length) {
      return;
    }

    this._updateOptions(layer);

    this._hotline.data(parts).draw();
  },

  _updateOptions: function(layer: any) {
    if (layer.options.min != null) {
      this._hotline.min(layer.options.min);
    }
    if (layer.options.max != null) {
      this._hotline.max(layer.options.max);
    }
    if (layer.options.weight != null) {
      this._hotline.weight(layer.options.weight);
    }
    if (layer.options.outlineWidth != null) {
      this._hotline.outlineWidth(layer.options.outlineWidth);
    }
    if (layer.options.outlineColor != null) {
      this._hotline.outlineColor(layer.options.outlineColor);
    }
    if (layer.options.palette) {
      this._hotline.palette(layer.options.palette);
    }
  },
});

var renderer = function(options?: any) {
  return L.Browser.canvas ? new Renderer() : null;
};

var Util = {
  /**
   * This is just a copy of the original Leaflet version that support a third z coordinate.
   * @see {@link http://leafletjs.com/reference.html#lineutil-clipsegment|Leaflet}
   */
  clipSegment: function(this: any, a: any, b: any, bounds: any, useLastCode: any, round: any) {
    var codeA = useLastCode ? this._lastCode : (L.LineUtil as any)._getBitCode(a, bounds),
      codeB = (L.LineUtil as any)._getBitCode(b, bounds),
      codeOut,
      p,
      newCode;

    // save 2nd code to avoid calculating it on the next segment
    this._lastCode = codeB;

    while (true) {
      // if a,b is inside the clip window (trivial accept)
      if (!(codeA | codeB)) {
        return [a, b];
        // if a,b is outside the clip window (trivial reject)
      } else if (codeA & codeB) {
        return false;
        // other cases
      } else {
        codeOut = codeA || codeB;
        p = (L.LineUtil as any)._getEdgeIntersection(a, b, codeOut, bounds, round);
        newCode = (L.LineUtil as any)._getBitCode(p, bounds);

        if (codeOut === codeA) {
          p.z = a.z;
          a = p;
          codeA = newCode;
        } else {
          p.z = b.z;
          b = p;
          codeB = newCode;
        }
      }
    }
  },
};

(L as any).Hotline = L.Polyline.extend({
  statics: {
    Renderer: Renderer,
    renderer: renderer,
  },

  options: {
    renderer: renderer(),
    min: 0,
    max: 1,
    palette: {
      0.0: 'green',
      0.5: 'yellow',
      1.0: 'red',
    },
    weight: 5,
    outlineColor: 'black',
    outlineWidth: 1,
  },

  getRGBForValue: function(value: any) {
    return this._renderer._hotline.getRGBForValue(value);
  },

  /**
   * Just like the Leaflet version, but with support for a z coordinate.
   */
  _projectLatlngs: function(latlngs: any, result: any, projectedBounds: any) {
    var flat = latlngs[0] instanceof L.LatLng,
      len = latlngs.length,
      i,
      ring;

    if (flat) {
      ring = [];
      for (i = 0; i < len; i++) {
        ring[i] = this._map.latLngToLayerPoint(latlngs[i]);
        // Add the altitude of the latLng as the z coordinate to the point
        ring[i].z = latlngs[i].alt;
        projectedBounds.extend(ring[i]);
      }
      result.push(ring);
    } else {
      for (i = 0; i < len; i++) {
        this._projectLatlngs(latlngs[i], result, projectedBounds);
      }
    }
  },

  /**
   * Just like the Leaflet version, but uses `Util.clipSegment()`.
   */
  _clipPoints: function() {
    if (this.options.noClip) {
      this._parts = this._rings;
      return;
    }

    this._parts = [];

    var parts = this._parts,
      bounds = this._renderer._bounds,
      i,
      j,
      k,
      len,
      len2,
      segment: any,
      points;

    for (i = 0, k = 0, len = this._rings.length; i < len; i++) {
      points = this._rings[i];

      for (j = 0, len2 = points.length; j < len2 - 1; j++) {
        segment = Util.clipSegment(points[j], points[j + 1], bounds, j, true);

        if (!segment) {
          continue;
        }

        parts[k] = parts[k] || [];
        parts[k].push(segment[0]);

        // if segment goes out of screen, or it's the last one, it's the end of the line part
        if (segment[1] !== points[j + 1] || j === len2 - 2) {
          parts[k].push(segment[1]);
          k++;
        }
      }
    }
  },

  _clickTolerance: function() {
    return this.options.weight / 2 + this.options.outlineWidth + (L.Browser.touch ? 10 : 0);
  },
});

(L as any).hotline = function(latlngs: any, options: any) {
  return new (L as any).Hotline(latlngs, options);
};

type NewLType = typeof L & {
  hotline: (positions: number[][], options: any) => any;
};

export default L as NewLType;
