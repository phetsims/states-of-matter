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

  /**
   * @param {MultipleParticleModel} multipleParticleModel of the simulation
   * @constructor
   */
  function MonatomicVerletAlgorithm( multipleParticleModel ) {
    AbstractVerletAlgorithm.call( this, multipleParticleModel );
    this.positionUpdater = MonatomicAtomPositionUpdater;
    this.epsilon = 1; // controls the strength of particle interaction
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

    // @private
    updateInterAtomForces: function( numberOfAtoms, numberOfSafeAtoms, atomCenterOfMassPositions, nextAtomForces ) {

      for ( var i = 0; i < numberOfAtoms; i++ ) {

        // update the forces for the 'safe' atoms
        if ( i < numberOfSafeAtoms ) {
          var atomCenterOfMassPositionsIX = atomCenterOfMassPositions[ i ].x;
          var atomCenterOfMassPositionsIY = atomCenterOfMassPositions[ i ].y;
          var nextAtomForcesI = nextAtomForces[ i ];

          for ( var j = i + 1; j < numberOfSafeAtoms; j++ ) {

            var dx = atomCenterOfMassPositionsIX - atomCenterOfMassPositions[ j ].x;
            var dy = atomCenterOfMassPositionsIY - atomCenterOfMassPositions[ j ].y;
            var distanceSqrd = ( dx * dx ) + ( dy * dy );

            if ( distanceSqrd === 0 ) {
              // Handle the special case where the particles are right on top of each other by assigning an arbitrary
              // spacing. In general, this only happens when injecting new particles.
              dx = 1;
              dy = 1;
              distanceSqrd = 2;
            }

            if ( distanceSqrd < this.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD ) {
              // This pair of particles is close enough to one another that we need to calculate their interaction
              // forces.
              if ( distanceSqrd < this.MIN_DISTANCE_SQUARED ) {
                distanceSqrd = this.MIN_DISTANCE_SQUARED;
              }
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
      }
    },

    /**
     * Update the motion of the particles and the forces that are acting upon them.  This is the heart of this class,
     * and it is here that the actual Verlet algorithm is contained.
     * @public
     */
    updateForcesAndMotion: function( timeStep ) {

      var kineticEnergy = 0;

      // Obtain references to the model data and parameters so that we can perform fast manipulations.
      var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
      var numberOfAtoms = moleculeDataSet.numberOfAtoms;
      var atomPositions = moleculeDataSet.moleculeCenterOfMassPositions;
      var atomVelocities = moleculeDataSet.moleculeVelocities;
      var atomForces = moleculeDataSet.moleculeForces;
      var nextAtomForces = moleculeDataSet.nextMoleculeForces;

      // values used in the calculation
      var timeStepHalf = timeStep / 2;
      var atomVelocity;
      var i;

      // Update the atom positions based on velocities, current forces, and interactions with the wall.
      this.updateMoleculePositions( moleculeDataSet, timeStep );

      // Set initial values for the forces that are acting on each atom, will be further updated below.
      var accelerationDueToGravity = -this.multipleParticleModel.gravitationalAcceleration;
      for ( i = 0; i < numberOfAtoms; i++ ) {
        nextAtomForces[ i ].setXY( 0, accelerationDueToGravity );
      }

      // If there are any atoms that are currently designated as "unsafe", check them to see if they can be moved into
      // the "safe" category.
      if ( moleculeDataSet.numberOfSafeMolecules < numberOfAtoms ) {
        this.updateMoleculeSafety();
      }
      var numberOfSafeAtoms = moleculeDataSet.numberOfSafeMolecules;

      // Calculate the forces created through interactions with other particles.
      this.updateInterAtomForces( numberOfAtoms, numberOfSafeAtoms, atomPositions, nextAtomForces );

      // Calculate the new velocities based on the old ones and the forces that are acting on the particle.
      for ( i = 0; i < numberOfAtoms; i++ ) {
        atomVelocity = atomVelocities[ i ];
        var moleculeForce = atomForces[ i ];
        atomVelocity.addXY(
          timeStepHalf * ( moleculeForce.x + nextAtomForces[ i ].x ),
          timeStepHalf * ( moleculeForce.y + nextAtomForces[ i ].y )
        );
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
