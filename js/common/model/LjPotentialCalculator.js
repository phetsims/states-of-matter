// Copyright 2014-2016, University of Colorado Boulder

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
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  /**
   * @param {number} sigma
   * @param {number} epsilon
   * @constructor
   */
  function LjPotentialCalculator( sigma, epsilon ) {

    assert && assert( sigma > 0, 'sigma must be greater than 0' );

    this.sigma = sigma;  // Molecular diameter in picometers.
    this.epsilon = epsilon; // Interaction strength, epsilon/k-boltzmann is in Kelvin.
    this.epsilonForCalcs = this.epsilon * StatesOfMatterConstants.K_BOLTZMANN;  // Epsilon multiplied by k-boltzmann.
  }

  statesOfMatter.register( 'LjPotentialCalculator', LjPotentialCalculator );

  return inherit( Object, LjPotentialCalculator, {

    /**
     * @returns {number}
     * @public
     */
    getSigma: function() {
      return this.sigma;
    },

    /**
     * @param {number} sigma
     * @public
     */
    setSigma: function( sigma ) {
      this.sigma = sigma;
    },

    /**
     * @returns {number}
     * @public
     */
    getEpsilon: function() {
      return this.epsilon;
    },

    /**
     * @param {number} epsilon
     * @public
     */
    setEpsilon: function( epsilon ) {
      this.epsilon = epsilon;
      this.epsilonForCalcs = this.epsilon * StatesOfMatterConstants.K_BOLTZMANN;
    },

    /**
     * Calculate the Lennard-Jones potential for the specified distance.
     * @param {number} distance - Distance between interacting molecules in picometers.
     * @returns {number} Strength of the potential in newton-meters (N*m).
     * @public
     */
    calculateLjPotential: function( distance ) {
      var distanceRatio = this.sigma / distance;
      return (4 * this.epsilonForCalcs * ( Math.pow( distanceRatio, 12 ) - Math.pow( distanceRatio, 6 )));
    },

    /**
     * Calculate only the repulsive component of the Lennard-Jones force for the specified distance.
     * @param {number} distance - Distance between interacting molecules in picometers.
     * @return {number} Force in newtons.
     * @public
     */
    calculateRepulsiveLjForce: function( distance ) {
      return (48 * this.epsilonForCalcs * Math.pow( this.sigma, 12 ) / Math.pow( distance, 13 ));
    },

    /**
     * Calculate only the attractive component of the Lennard-Jones force for the specified distance.
     * @param {number} distance - Distance between interacting molecules in picometers.
     * @return {number} - Force in newtons.
     * @public
     */
    calculateAttractiveLjForce: function( distance ) {
      return ( 24 * this.epsilonForCalcs * Math.pow( this.sigma, 6 ) / Math.pow( distance, 7 ) );
    },

    /**
     * Calculate the distance at which the force is 0 because the attractive and repulsive forces are balanced.  Note
     * that this is where the potential energy is at a minimum.
     * @return {number} - Distance where force is 0 (or very close) in picometers.
     * @public
     */
    calculateMinimumForceDistance: function() {
      // this is the solution for the min potential
      return this.sigma * Math.pow( 2, 1 / 6 );
    },

    /**
     * Calculate the potential energy of a particle at the given distance. This calculation is performed by calculating
     * the potential at the given point and subtracting the potential at the minimum point.
     * @param {number} distance
     * @returns {number}
     * @public
     */
    calculatePotentialEnergy: function( distance ) {
      return this.calculateLjPotential( distance ) - this.calculateLjPotential( this.calculateMinimumForceDistance() );
    }
  } );
} );

