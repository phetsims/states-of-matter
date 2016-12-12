// Copyright 2014-2015, University of Colorado Boulder

/**
 * Implementation of the Verlet algorithm for simulating molecular interaction based on the Lennard-Jones potential -
 * monatomic (i.e. one atom per molecule) version.
 *
 * @author John Blanco
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var AbstractVerletAlgorithm = require( 'STATES_OF_MATTER/common/model/engine/AbstractVerletAlgorithm' );
  var MonatomicAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/MonatomicAtomPositionUpdater' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {MultipleParticleModel} multipleParticleModel of the simulation
   * @constructor
   */
  function MonatomicVerletAlgorithm( multipleParticleModel ) {
    AbstractVerletAlgorithm.call( this, multipleParticleModel );

    // @private
    this.positionUpdater = MonatomicAtomPositionUpdater;
    this.epsilon = 1; // controls the strength of particle interaction
    this.velocityVector = new Vector2(); // reusable vector to save allocations
  }

  statesOfMatter.register( 'MonatomicVerletAlgorithm', MonatomicVerletAlgorithm );

  return inherit( AbstractVerletAlgorithm, MonatomicVerletAlgorithm, {

    /**
     * @param {number} scaledEpsilon
     * @public
     */
    setScaledEpsilon: function( scaledEpsilon ) {
      this.epsilon = scaledEpsilon;
    },

    /**
     * @returns {number}
     * @public
     */
    getScaledEpsilon: function() {
      return this.epsilon;
    },

    /**
     * @param {MoleculeForcesAndMotionDataSet} moleculeDataSet
     * @override
     * @protected
     */
    initializeForces: function( moleculeDataSet ){
      var accelerationDueToGravity = this.multipleParticleModel.gravitationalAcceleration;
      var nextAtomForces = moleculeDataSet.nextMoleculeForces;
      for ( var i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
        nextAtomForces[ i ].setXY( 0, accelerationDueToGravity );
      }
    },

    /**
     * @param {MoleculeForcesAndMotionDataSet} moleculeDataSet
     * @private
     */
    updateInteractionForces: function( moleculeDataSet ) {

      var numberOfAtoms = moleculeDataSet.numberOfMolecules;
      var atomCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
      var nextAtomForces = moleculeDataSet.nextMoleculeForces;

      for ( var i = 0; i < numberOfAtoms; i++ ) {

        var atomCenterOfMassPositionsIX = atomCenterOfMassPositions[ i ].x;
        var atomCenterOfMassPositionsIY = atomCenterOfMassPositions[ i ].y;
        var nextAtomForcesI = nextAtomForces[ i ];

        for ( var j = i + 1; j < numberOfAtoms; j++ ) {

          var dx = atomCenterOfMassPositionsIX - atomCenterOfMassPositions[ j ].x;
          var dy = atomCenterOfMassPositionsIY - atomCenterOfMassPositions[ j ].y;
          var distanceSqrd = Math.max( dx * dx + dy * dy, this.MIN_DISTANCE_SQUARED );

          if ( distanceSqrd === 0 ) {
            // Handle the special case where the particles are right on top of each other by assigning an arbitrary
            // spacing. In general, this only happens when injecting new particles.
            dx = 1;
            dy = 1;
            distanceSqrd = 2;
          }

          if ( distanceSqrd < this.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD ) {
            // This pair of particles is close enough to one another that we need to calculate their interaction forces.
            var r2inv = 1 / distanceSqrd;
            var r6inv = r2inv * r2inv * r2inv;
            var forceScalar = 48 * r2inv * r6inv * ( r6inv - 0.5 ) * this.epsilon;
            var forceX = dx * forceScalar;
            var forceY = dy * forceScalar;
            nextAtomForcesI.addXY( forceX, forceY );
            nextAtomForces[ j ].subtractXY( forceX, forceY );
          }
        }
      }
    },

    /**
     * @param {MoleculeForcesAndMotionDataSet} moleculeDataSet
     * @param {number} timeStep
     * @protected
     */
    updateVelocitiesAndRotationRates: function( moleculeDataSet, timeStep ){

      var atomVelocity;
      var numberOfAtoms = moleculeDataSet.numberOfAtoms;
      var atomVelocities = moleculeDataSet.moleculeVelocities;
      var atomForces = moleculeDataSet.moleculeForces;
      var nextAtomForces = moleculeDataSet.nextMoleculeForces;
      var timeStepHalf = timeStep / 2;
      var kineticEnergy = 0;
      var velocityVector = this.velocityVector;

      for ( var i = 0; i < numberOfAtoms; i++ ) {
        atomVelocity = atomVelocities[ i ];
        var moleculeForce = atomForces[ i ];
        velocityVector = velocityVector.setXY(
          atomVelocity.x + timeStepHalf * ( moleculeForce.x + nextAtomForces[ i ].x ),
          atomVelocity.y + timeStepHalf * ( moleculeForce.y + nextAtomForces[ i ].y )
        );
        if ( velocityVector.magnitude() > 10 ){
          velocityVector.setMagnitude( 10 );
        }

        atomVelocity.set( velocityVector );
        kineticEnergy += ( ( atomVelocity.x * atomVelocity.x ) +
                           ( atomVelocity.y * atomVelocity.y ) ) / 2;

        // update to the new force value for the next model step
        moleculeForce.setXY( nextAtomForces[ i ].x, nextAtomForces[ i ].y );
      }

      // Update the temperature.
      this.temperature = kineticEnergy / numberOfAtoms;
    }
  } );
} );
