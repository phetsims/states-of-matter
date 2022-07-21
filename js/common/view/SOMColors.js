// Copyright 2016-2022, University of Colorado Boulder

/**
 * An object that contains the colors used for various major components of the States of Matter simulation.  This
 * is used to support different color schemes, such as a default that looks good on a laptop or tablet, and a
 * "projector mode" that looks good when projected on a large screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import { Color, ProfileColorProperty } from '../../../../scenery/js/imports.js';
import statesOfMatter from '../../statesOfMatter.js';

// constants
const GRAY = new Color( 230, 230, 230 );

const SOMColors = {
  backgroundProperty: new ProfileColorProperty( statesOfMatter, 'background', {
    default: 'black',
    projector: 'white'
  } ),
  controlPanelBackgroundProperty: new ProfileColorProperty( statesOfMatter, 'controlPanelBackground', {
    default: 'black',
    projector: 'white'
  } ),
  controlPanelStrokeProperty: new ProfileColorProperty( statesOfMatter, 'controlPanelStroke', {
    default: 'white',
    projector: 'black'
  } ),
  controlPanelTextProperty: new ProfileColorProperty( statesOfMatter, 'controlPanelText', {
    default: GRAY,
    projector: 'black'
  } ),
  navigationBarIconBackgroundProperty: new ProfileColorProperty( statesOfMatter, 'navigationBarIconBackground', {
    default: 'black',
    projector: 'white'
  } ),
  ljGraphAxesAndGridColorProperty: new ProfileColorProperty( statesOfMatter, 'ljGraphAxesAndGridColor', {
    default: GRAY,
    projector: 'black'
  } ),
  particleStrokeProperty: new ProfileColorProperty( statesOfMatter, 'particleStroke', {
    default: 'white',
    projector: 'black'
  } ),
  removePairGroupProperty: new ProfileColorProperty( statesOfMatter, 'removePairGroup', {
    default: new Color( '#d00' )
  } )
};

statesOfMatter.register( 'SOMColors', SOMColors );

export default SOMColors;