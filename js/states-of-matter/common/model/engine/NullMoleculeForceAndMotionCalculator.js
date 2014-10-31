// Copyright 2002-2011, University of Colorado
/**
 * This class is the "null" version of the molecule forces and motion
 * calculator.  It essentially does nothing, and is used as a default in the
 * model to avoid having null checks sprinkled throughout the code.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );


  return inherit( Object, NullMoleculeForceAndMotionCalculator, {
    updateForcesAndMotion: function() {
    },
    getPressure: function() {
      return 0;
    },
    getTemperature: function() {
      return 0;
    },
    setScaledEpsilon: function( scaledEpsilon ) {
      this.scaledEpsilon = scaledEpsilon;
    },
    getScaledEpsilon: function() {
      return scaledEpsilon;
    }
  } );
} );

