// Copyright 2002-2011, University of Colorado
/**
 * This interface is used to control an object that simulates the interaction
 * of a set of molecules.  Through this interface the simulation can be
 * stepped, reset, etc.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );


  return inherit( Object, MoleculeForceAndMotionCalculator, {
    /**
     * Do the next set of calculations of force and motion.
     */
    updateForcesAndMotion: function() {},
    /**
     * Get the system pressure in model units.
     *
     * @return - Internal system pressure.
     */
    getPressure: function() {},
    /**
     * Get the system temperature in model units.
     *
     * @return - Internal system temperature.
     */
    getTemperature: function() {},
    /**
     * Set the scaled value for Epsilon, which is the parameter that
     * defines the strength of particle interaction.
     *
     * @param scaledEpsilon - A value for the interaction strength.  A
     *                      value of zero signifies no interaction, 1 is the default amount, 2 is
     *                      twice the default amount, and so on.
     */
    setScaledEpsilon: function( scaledEpsilon ) {},
    /**
     * Get the scaled value of the epsilon parameter, a.k.a. the interaction
     * strength.
     */
    getScaledEpsilon: function() {}
  } );
} );

