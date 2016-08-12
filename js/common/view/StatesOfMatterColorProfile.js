// Copyright 2015, University of Colorado Boulder

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
  var inherit = require( 'PHET_CORE/inherit' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // constants
  var BLACK = new Color( 0, 0, 0 );
  var GRAY = new Color( 230, 230, 230 );
  var WHITE = new Color( 255, 255, 255 );

  function Profile() {
    ColorProfile.call( this, {
      background: {
        default: BLACK,
        projector: WHITE
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
        projector: BLACK
      },
      ljGraphColorsMode: {
        default: GRAY,
        projector: BLACK
      },
      particleStroke: {
        default: WHITE,
        projector: BLACK
      },
      ljGraphLineColor:{
        default: new Color( 'red' ),
        projector: new Color( 'yellow' )
      },
      removePairGroup: {
        default: new Color( '#d00' )
      }
    } );
  }

  inherit( ColorProfile, Profile );

  var StatesOfMatterColorProfile = new Profile();

  statesOfMatter.register( 'StatesOfMatterColorProfile', StatesOfMatterColorProfile );

  return StatesOfMatterColorProfile;
} );

