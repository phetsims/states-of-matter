// Copyright 2002-2015, University of Colorado Boulder

/**
 * This class calculates the Lennard-Jones potential based on values provided
 * for the molecule size (sigma) and the interaction strength (epsilon).  Note
 * that this is a "real" calculation as opposed to a normalized calculation,
 * which has been used elsewhere in the States of Matter simulation.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  /**
   * @param {number} sigma
   * @param {number} epsilon
   * @constructor
   */
  function LjPotentialCalculator( sigma, epsilon ) {

    if ( sigma === 0 ) {
      console.log( "Illegal value for the sigma parameter: " + sigma );
    }

    this.sigma = sigma;  // Molecular diameter in picometers.
    this.epsilon = epsilon; // Interaction strength, epsilon/k-boltzmann is in Kelvin.
    this.epsilonForCalcs = this.epsilon * StatesOfMatterConstants.K_BOLTZMANN;  // Epsilon multiplied by k-boltzmann.
  }

  return inherit( Object, LjPotentialCalculator, {

    /**
     * @public
     * @returns {Number|*}
     */
    getSigma: function() {
      return this.sigma;
    },

    /**
     * @public
     * @param {Number} sigma
     */
    setSigma: function( sigma ) {
      this.sigma = sigma;
    },

    /**
     * @public
     * @returns {Number|*}
     */
    getEpsilon: function() {
      return this.epsilon;
    },

    /**
     * @public
     * @param {Number} epsilon
     */
    setEpsilon: function( epsilon ) {
      this.epsilon = epsilon;
      this.epsilonForCalcs = this.epsilon * StatesOfMatterConstants.K_BOLTZMANN;
    },

    /**
     * Calculate the Lennard-Jones potential for the specified distance.
     * @public
     * @param distance - Distance between interacting molecules in picometers.
     * @returns {Number} Strength of the potential in newton-meters (N*m).
     */
    calculateLjPotential: function( distance ) {
      var distanceRatio = this.sigma / distance;
      return (4 * this.epsilonForCalcs * ( Math.pow( distanceRatio, 12 ) - Math.pow( distanceRatio, 6 )));
    },

    /**
     * Calculate only the repulsive component of the Lennard-Jones force for
     * the specified distance.
     * @public
     * @param distance - Distance between interacting molecules in picometers.
     * @return {Number} Force in newtons.
     */
    calculateRepulsiveLjForce: function( distance ) {
      return (48 * this.epsilonForCalcs * Math.pow( this.sigma, 12 ) / Math.pow( distance, 13 ));
    },

    /**
     * Calculate only the attractive component of the Lennard-Jones force for
     * the specified distance.
     * @public
     * @param distance - Distance between interacting molecules in picometers.
     * @return {Number} - Force in newtons.
     */
    calculateAttractiveLjForce: function( distance ) {
      return (24 * this.epsilonForCalcs * Math.pow( this.sigma, 6 ) / Math.pow( distance, 7 ));
    },

    /**
     * Calculate the distance at which the force is 0 because the attractive
     * and repulsive forces are balanced.  Note that this is where the
     * potential energy is at a minimum.
     * @public
     * @return {Number} - Distance where force is 0 (or very close) in picometers.
     */
    calculateMinimumForceDistance: function() {
      // for 0.
      return this.sigma * 1.122462;
    },

    /**
     * Calculate the potential energy of a particle at the given distance.
     * This calculation is performed by calculating the potential at the
     * given point and subtracting the potential at the minimum point.
     * @public
     * @param distance
     * @returns {number}
     */
    calculatePotentialEnergy: function( distance ) {
      return this.calculateLjPotential( distance ) - this.calculateLjPotential( this.calculateMinimumForceDistance() );
    }
  } );
} );

