/* eslint-disable */
import simLauncher from '../../joist/js/simLauncher.js';
const mipmaps = [
  {
    "width": 118,
    "height": 156,
    "url": "data:image/png;base64,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"
  },
  {
    "width": 59,
    "height": 78,
    "url": "data:image/png;base64,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"
  },
  {
    "width": 30,
    "height": 39,
    "url": "data:image/png;base64,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"
  },
  {
    "width": 15,
    "height": 20,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAUCAYAAABSx2cSAAAAAklEQVR4AewaftIAAAKfSURBVK3Bz2scZRjA8e/zvO/MZDbbbjYqWCSH/joIXnpphRZiUdzNURDFggfxIK7Bo4hgi62GkrQHbdKTB6H/gEdriVZP2njwUITCpiJElFLJbLrZ7OzsvI8rpFDL9qSfD/+F4xH2Nlr67JXVN7KNzs/5+hrjKGPU5uY5/v7pp0XkPcUiHkEZx4KbmUxfPxDp4VPnFl6qN1uMo4whZvFM6hv7U9F9afxmMDxjOB5Sb7R08bMLH9Qi90rViVScPNVovnDr+/WtX/L2DR7keMDeRktXlhdfnYz8x/VY0wkVJrx4p3qs+eLJH1bbnY28vcZ9jl1TjZZcWl56OY388pOpm1YRUifEKjiVWhCdbT4/e+367d7dfvtH/qGM1OfeZeH8RwdV3cUDVfd4olBxMOmFSQ8VJ1S8HpIkWbEw9OxSRiwMPWnlk6qXGS9CYRCrEClEKkQK05GgIrMLny69PdVsCSNam5sHs0phcnK7hN93AmZg/FsJPBarG5qcwixixEsI8tbpD0/kJk8UZgyCMAigYjgRSjMGAYIZtVjYCRzESICBNwuS9/vD7dLolZCo4QRKAycwNCMPEAkIgmEG5hhREbUvFpdu3ivC3awwOoWRFUZWGFkR6BRGNggUAXplYGsQfjUkMOJLUXNW9rK8uGYav1ZaoB+ERAUVCGbslPBHXtIbhuJOt3dFhJwRN2jfYOLQ0fK37775ad/x556pRn7/ICBbpbFdGlsFeBHuDEKx0d35/MtzZy6JaLe/voZjJDl8LAxDyG9dX/22euRodzqJ6nucVBJBYuHen/3i5u2/Ni98ff7sCsJmdvVyYETYVW/OY1bGGHuAKbAK4EAKg65AJiLdzauXS3YJD5lqviOYOcw8hqAEExmClp2vlvnf/A0IaiY+wA0D7wAAAABJRU5ErkJggg=="
  },
  {
    "width": 8,
    "height": 10,
    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAKCAYAAACJxx+AAAAAAklEQVR4AewaftIAAAETSURBVE3Bv0sCYRwH4M/7fd9EJc/IkGrPaKipoV84BGH3PzRGw9Fs1GoRVEOF0dDk0NYuQUNDQZFLkxAaCSINwnF6Knf63tsFJ/g8HCPSr9ayWW81nOoHhggBbdtgs4JyO7njJYwgBM4vzzZXNb6xoIWzmr6PIQ5f4cteTEZEIRnmM+NjLKXrW/Lh6uQFPopnDApxnp+O8FQixDAVonBU0MFN2V6Dj/aODucsiRXTVVAAFICYYBM9j+3CJzrtFpqJSaYJgusp9D0gJhi60sM/ur/O1+q9wdN3V6qy7aHSkXhuur8/ZvsOPu5US4NKzSrOr6edKEen25fvn41mtnhx+uZUS4ohEM8YBE8JEKT1eCsR+AMEFmfJhYFvZwAAAABJRU5ErkJggg=="
  }
];
mipmaps.forEach( mipmap => {
  mipmap.img = new Image();
  const unlock = simLauncher.createLock( mipmap.img );
  mipmap.img.onload = unlock;
  mipmap.img.src = mipmap.url; // trigger the loading of the image for its level
  mipmap.canvas = document.createElement( 'canvas' );
  mipmap.canvas.width = mipmap.width;
  mipmap.canvas.height = mipmap.height;
  const context = mipmap.canvas.getContext( '2d' );
  mipmap.updateCanvas = () => {
    if ( mipmap.img.complete && ( typeof mipmap.img.naturalWidth === 'undefined' || mipmap.img.naturalWidth > 0 ) ) {
      context.drawImage( mipmap.img, 0, 0 );
      delete mipmap.updateCanvas;
    }
  };
} );
export default mipmaps;