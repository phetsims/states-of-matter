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
    getPressure: function() {
      return this.pressure;
    },

    /**
     * @returns {number}
     * @public
     */
    getTemperature: function() {
      return this.temperature;
    },

    /**
     * @returns {number}
     * @public
     */
    getScaledEpsilon: function() {
      return this.epsilon;
    },

    /**
     * Update the position of the atoms based upon their current velocities and the forces acting on them.
     * @private
     */
    updateAtomPositions: function( numberOfAtoms, atomCenterOfMassPositions, atomVelocities, atomForces, timeStep ) {

      var timeStepSqrHalf = timeStep * timeStep * 0.5;
      var accumulatedPressure = 0;

      // Figure out the min and max positions assuming single particles and a normalized radius of 1.
      var minX = 1;
      var minY = 1;
      var maxX = this.multipleParticleModel.normalizedContainerWidth - 1;
      var maxY = this.multipleParticleModel.normalizedContainerHeight - 1;
      var middleHeight = this.multipleParticleModel.normalizedContainerHeight / 2;

      for ( var i = 0; i < numberOfAtoms; i++ ) {

        var atomVelocity = atomVelocities[ i ];
        var atomVelocityX = atomVelocity.x; // optimization
        var atomVelocityY = atomVelocity.y; // optimization
        var atomCenterOfMassPosition = atomCenterOfMassPositions[ i ];
        var atomForce = atomForces[ i ];

        // calculate new position based on velocity and time
        var xPos = atomCenterOfMassPosition.x + ( timeStep * atomVelocityX ) +
                   ( timeStepSqrHalf * atomForce.x );
        var yPos = atomCenterOfMassPosition.y + ( timeStep * atomVelocityY ) +
                   ( timeStepSqrHalf * atomForce.y );

        // handle any bouncing off of the walls of the container
        if ( this.isNormalizedPositionInContainer( xPos, yPos ) ) {

          // handle bounce off the walls
          if ( xPos <= minX && atomVelocityX < 0 ) {
            xPos = minX;
            atomVelocity.x = -atomVelocityX;
            if ( xPos > middleHeight ) {
              accumulatedPressure += -atomVelocityX;
            }
          }
          else if ( xPos >= maxX && atomVelocityX > 0 ) {
            xPos = maxX;
            atomVelocity.x = -atomVelocityX;
            if ( xPos > middleHeight ) {
              accumulatedPressure += atomVelocityX;
            }
          }

          // handle bounce off the bottom and top
          if ( yPos <= minY && atomVelocityY <= 0 ) {
            yPos = minY;
            atomVelocity.y = -atomVelocityY;
          }
          else if ( yPos >= maxY && !this.multipleParticleModel.getContainerExploded() ) {
            // This particle bounced off the top, so use the lid's velocity in calculation of the new velocity
            // TODO: Do what it says in the comment just above.
            yPos = maxY;
            if ( atomVelocityY > 0 ) {
              // TODO: The lid velocity seems to be in different units or something from the atom velocities, so
              // TODO: I have a derating factor in here.  I'll either need to explain it or figure out the source
              // TODO: of the apparent descrepency.
              atomVelocity.y = -atomVelocityY + this.multipleParticleModel.normalizedLidVelocityY * 0.02;
            }
            accumulatedPressure += atomVelocityY;
          }
        }

        // set the new position
        atomCenterOfMassPosition.setXY( xPos, yPos );
      }

      // update the pressure
      this.updatePressure( accumulatedPressure * 40, timeStep ); // TODO: Move multiplier to base case when all subclasses are working with new approach
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
      var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
      var moleculeVelocities = moleculeDataSet.moleculeVelocities;
      var moleculeForces = moleculeDataSet.moleculeForces;
      var nextMoleculeForces = moleculeDataSet.nextMoleculeForces;
      var timeStepHalf = timeStep / 2;
      var i;
      var moleculeVelocity;

      this.updateAtomPositions(
        numberOfAtoms,
        moleculeCenterOfMassPositions,
        moleculeVelocities,
        moleculeForces,
        timeStep
      );

      // Synchronize the atom positions.
      this.positionUpdater.updateAtomPositions( moleculeDataSet );

      // Initialize the forces acting on the atoms.
      var accelerationDueToGravity = -this.multipleParticleModel.gravitationalAcceleration;
      for ( i = 0; i < numberOfAtoms; i++ ) {
        nextMoleculeForces[ i ].setXY( 0, accelerationDueToGravity );
      }

      // If there are any atoms that are currently designated as "unsafe", check them to see if they can be moved into
      // the "safe" category.
      if ( moleculeDataSet.numberOfSafeMolecules < numberOfAtoms ) {
        this.updateMoleculeSafety();
      }
      var numberOfSafeAtoms = moleculeDataSet.numberOfSafeMolecules;

      // Calculate the forces created through interactions with other particles.
      this.updateInterAtomForces( numberOfAtoms, numberOfSafeAtoms, moleculeCenterOfMassPositions, nextMoleculeForces );

      // Calculate the new velocities based on the old ones and the forces that are acting on the particle.
      for ( i = 0; i < numberOfAtoms; i++ ) {
        moleculeVelocity = moleculeVelocities[ i ];
        var moleculeForce = moleculeForces[ i ];
        moleculeVelocity.addXY(
          timeStepHalf * ( moleculeForce.x + nextMoleculeForces[ i ].x ),
          timeStepHalf * ( moleculeForce.y + nextMoleculeForces[ i ].y )
        );
        kineticEnergy += ( ( moleculeVelocity.x * moleculeVelocity.x ) +
                           ( moleculeVelocity.y * moleculeVelocity.y ) ) / 2;

        // update to the new force value for the next model step
        moleculeForce.setXY( nextMoleculeForces[ i ].x, nextMoleculeForces[ i ].y );
      }

      // Update the temperature.
      this.temperature = kineticEnergy / numberOfAtoms;
    }
  } );
} );
