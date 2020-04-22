// Copyright 2016-2020, University of Colorado Boulder

/**
 * An object that contains the colors used for various major components of the States of Matter simulation.  This
 * is used to support different color schemes, such as a default that looks good on a laptop or tablet, and a
 * "projector mode" that looks good when projected on a large screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import ColorProfile from '../../../../scenery-phet/js/ColorProfile.js';
import Color from '../../../../scenery/js/util/Color.js';
import statesOfMatter from '../../statesOfMatter.js';

// constants
const GRAY = new Color( 230, 230, 230 );

const SOMColorProfile = new ColorProfile( [ 'default', 'projector' ], {
  background: {
    default: 'black',
    projector: 'white'
  },
  controlPanelBackground: {
    default: 'black',
    projector: 'white'
  },
  controlPanelStroke: {
    default: 'white',
    projector: 'black'
  },
  controlPanelText: {
    default: GRAY,
    projector: 'black'
  },
  navigationBarIconBackground: {
    default: 'black',
    projector: 'white'
  },
  ljGraphAxesAndGridColor: {
    default: GRAY,
    projector: 'black'
  },
  particleStroke: {
    default: 'white',
    projector: 'black'
  },
  removePairGroup: {
    default: new Color( '#d00' )
  }
} );

statesOfMatter.register( 'SOMColorProfile', SOMColorProfile );

export default SOMColorProfile;