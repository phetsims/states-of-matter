// Copyright 2016-2021, University of Colorado Boulder

/**
 * An object that contains the colors used for various major components of the States of Matter simulation.  This
 * is used to support different color schemes, such as a default that looks good on a laptop or tablet, and a
 * "projector mode" that looks good when projected on a large screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Color from '../../../../scenery/js/util/Color.js';
import ProfileColorProperty from '../../../../scenery/js/util/ProfileColorProperty.js';
import statesOfMatter from '../../statesOfMatter.js';

// constants
const GRAY = new Color( 230, 230, 230 );

const SOMColorProfile = {
  backgroundProperty: new ProfileColorProperty( 'background', {
    default: 'black',
    projector: 'white'
  } ),
  controlPanelBackgroundProperty: new ProfileColorProperty( 'controlPanelBackground', {
    default: 'black',
    projector: 'white'
  } ),
  controlPanelStrokeProperty: new ProfileColorProperty( 'controlPanelStroke', {
    default: 'white',
    projector: 'black'
  } ),
  controlPanelTextProperty: new ProfileColorProperty( 'controlPanelText', {
    default: GRAY,
    projector: 'black'
  } ),
  navigationBarIconBackgroundProperty: new ProfileColorProperty( 'navigationBarIconBackground', {
    default: 'black',
    projector: 'white'
  } ),
  ljGraphAxesAndGridColorProperty: new ProfileColorProperty( 'ljGraphAxesAndGridColor', {
    default: GRAY,
    projector: 'black'
  } ),
  particleStrokeProperty: new ProfileColorProperty( 'particleStroke', {
    default: 'white',
    projector: 'black'
  } ),
  removePairGroupProperty: new ProfileColorProperty( 'removePairGroup', {
    default: new Color( '#d00' ),
    projector: new Color( '#00d' ) // TODO: this was missing https://github.com/phetsims/scenery-phet/issues/515
  } )
};

statesOfMatter.register( 'SOMColorProfile', SOMColorProfile );

export default SOMColorProfile;