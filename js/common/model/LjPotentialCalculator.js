// Copyright 2014-2020, University of Colorado Boulder

import statesOfMatter from '../../statesOfMatter.js';
import SOMConstants from '../SOMConstants.js';

/**
 * This class calculates the Lennard-Jones potential based on values provided for the molecule size (sigma) and the
 * interaction strength (epsilon).  Note that this is a "real" calculation as opposed to a normalized calculation, which
 * has been used elsewhere in the States of Matter simulation.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
class LjPotentialCalculator {

  /**
   * @param {number} sigma
   * @param {number} epsilon
   */
  constructor( sigma, epsilon ) {

    assert && assert( sigma > 0, 'sigma must be greater than 0' );

    this.sigma = sigma;  // Molecular diameter in picometers.
    this.epsilon = epsilon; // Interaction strength, epsilon/k-boltzmann is in Kelvin.
    this.epsilonForCalcs = this.epsilon * SOMConstants.K_BOLTZMANN;  // Epsilon multiplied by k-boltzmann.
  }

  /**
   * @returns {number}
   * @public
   */
  getSigma() {
    return this.sigma;
  }

  /**
   * @param {number} sigma
   * @public
   */
  setSigma( sigma ) {
    this.sigma = sigma;
  }

  /**
   * @returns {number}
   * @public
   */
  getEpsilon() {
    return this.epsilon;
  }

  /**
   * @param {number} epsilon
   * @public
   */
  setEpsilon( epsilon ) {
    this.epsilon = epsilon;
    this.epsilonForCalcs = this.epsilon * SOMConstants.K_BOLTZMANN;
  }

  /**
   * Calculate the Lennard-Jones potential for the specified distance.
   * @param {number} distance - Distance between interacting molecules in picometers.
   * @returns {number} Strength of the potential in newton-meters (N*m).
   * @public
   */
  getLjPotential( distance ) {
    const distanceRatio = this.sigma / distance;
    return ( 4 * this.epsilonForCalcs * ( Math.pow( distanceRatio, 12 ) - Math.pow( distanceRatio, 6 ) ) );
  }

  /**
   * Calculate only the repulsive component of the Lennard-Jones force for the specified distance.
   * @param {number} distance - Distance between interacting molecules in picometers.
   * @returns {number} Force in newtons.
   * @public
   */
  getRepulsiveLjForce( distance ) {
    return ( 48 * this.epsilonForCalcs * Math.pow( this.sigma, 12 ) / Math.pow( distance, 13 ) );
  }

  /**
   * Calculate only the attractive component of the Lennard-Jones force for the specified distance.
   * @param {number} distance - Distance between interacting molecules in picometers.
   * @returns {number} - Force in newtons.
   * @public
   */
  getAttractiveLjForce( distance ) {
    return ( 24 * this.epsilonForCalcs * Math.pow( this.sigma, 6 ) / Math.pow( distance, 7 ) );
  }

  /**
   * Calculate the distance at which the force is 0 because the attractive and repulsive forces are balanced.  Note
   * that this is where the potential energy is at a minimum.
   * @returns {number} - Distance where force is 0 (or very close) in picometers.
   * @public
   */
  getMinimumForceDistance() {

    // this is the solution for the min potential
    return this.sigma * Math.pow( 2, 1 / 6 );
  }
}

statesOfMatter.register( 'LjPotentialCalculator', LjPotentialCalculator );
export default LjPotentialCalculator;