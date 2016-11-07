// Copyright 2015-2016, University of Colorado Boulder

/**
 * An object that contains the colors used for various major components of the States of Matter simulation.  This
 * is used to support different color schemes, such as a default that looks good on a laptop or tablet, and a
 * "projector mode" that looks good when projected on a large screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var ColorProfile = require( 'SCENERY_PHET/ColorProfile' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // constants
  var GRAY = new Color( 230, 230, 230 );

  var StatesOfMatterColorProfile = new ColorProfile( {
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
    //TODO this is poorly named
    ljGraphColorsMode: {
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

  statesOfMatter.register( 'StatesOfMatterColorProfile', StatesOfMatterColorProfile );

  return StatesOfMatterColorProfile;
} );

