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
  var Vector2 = require( 'DOT/Vector2' );
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

    // reusable vectors for reducing allocations
    this.force = new Vector2();
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
    updateAtomPositions: function( numberOfAtoms, atomCenterOfMassPositions, atomVelocities, atomForces,
                                   insideContainer, timeStep ) {

      var timeStepSqrHalf = timeStep * timeStep * 0.5;

      for ( var i = 0; i < numberOfAtoms; i++ ) {

        var moleculeVelocity = atomVelocities[ i ];
        var moleculeCenterOfMassPosition = atomCenterOfMassPositions[ i ];
        var moleculeForce = atomForces[ i ];

        // calculate new position based on velocity and time
        var yPos = moleculeCenterOfMassPosition.y + ( timeStep * moleculeVelocity.y ) +
                   ( timeStepSqrHalf * moleculeForce.y );
        var xPos = moleculeCenterOfMassPosition.x + ( timeStep * moleculeVelocity.x ) +
                   ( timeStepSqrHalf * moleculeForce.x );

        // update this particle's inside/outside status and, if necessary, clamp its position
        if ( insideContainer[ i ] && !this.isNormalizedPositionInContainer( xPos, yPos ) ) {

          // if this particle just blew out the top, that's fine - just update its status
          if ( moleculeCenterOfMassPosition.y <= this.multipleParticleModel.normalizedTotalContainerHeight &&
               yPos > this.multipleParticleModel.normalizedTotalContainerHeight ) {
            insideContainer[ i ] = false;
          }
          else {

            // This particle must have blown out the side due to an extreme velocity - reposition it inside the
            // container as though it bounced off the side and reverse its velocity.
            if ( xPos > this.multipleParticleModel.normalizedContainerWidth ) {
              xPos = this.multipleParticleModel.normalizedContainerWidth;
              moleculeVelocity.x = -moleculeVelocity.x;
            }
            else if ( xPos < 0 ) {
              xPos = 0;
              moleculeVelocity.x = -moleculeVelocity.x;
            }

            if ( yPos < 0 ) {
              yPos = 0;
              moleculeVelocity.y = -moleculeVelocity.y;
            }
          }
        }

        // set the new position
        moleculeCenterOfMassPosition.setXY( xPos, yPos );
      }
    },

    /**
     * Update the forces acting on the particles from the container walls and gravity.
     * @private
     */
    updateContainerAndGravitationalForces: function( numberOfAtoms, atomCenterOfMassPositions, nextAtomForces, timeStep ) {
      var pressureZoneWallForce = 0;
      for ( var i = 0; i < numberOfAtoms; i++ ) {

        var nextAtomForce = nextAtomForces[ i ];
        var atomCenterOfMassPosition = atomCenterOfMassPositions[ i ];

        // Get the force values caused by the container walls.
        this.calculateWallForce( atomCenterOfMassPosition, nextAtomForce );

        // Accumulate this force value as part of the pressure being exerted on the walls of the container.
        if ( nextAtomForce.y < 0 ) {
          pressureZoneWallForce += -nextAtomForce.y;
        }
        else if ( atomCenterOfMassPosition.y > this.multipleParticleModel.normalizedContainerHeight / 2 ) {
          // If the particle bounced on one of the walls above the midpoint, add in that value to the pressure.
          pressureZoneWallForce += Math.abs( nextAtomForce.x );
        }

        nextAtomForces[ i ].setY( nextAtomForce.y - this.multipleParticleModel.gravitationalAcceleration );

      }
      this.updatePressure( pressureZoneWallForce, timeStep );
    },

    updateInterAtomForces: function( numberOfSafeAtoms, atomCenterOfMassPositions, nextAtomForces ) {
      for ( var i = 0; i < numberOfSafeAtoms; i++ ) {
        var atomCenterOfMassPositionsIX = atomCenterOfMassPositions[ i ].x;
        var atomCenterOfMassPositionsIY = atomCenterOfMassPositions[ i ].y;
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
            // This pair of particles is close enough to one another
            // that we need to calculate their interaction forces.
            if ( distanceSqrd < this.MIN_DISTANCE_SQUARED ) {
              distanceSqrd = this.MIN_DISTANCE_SQUARED;
            }
            var r2inv = 1 / distanceSqrd;
            var r6inv = r2inv * r2inv * r2inv;
            var forceScalar = 48 * r2inv * r6inv * ( r6inv - 0.5 ) * this.epsilon;
            var forceX = dx * forceScalar;
            var forceY = dy * forceScalar;
            nextAtomForces[ i ].addXY( forceX, forceY );
            nextAtomForces[ j ].subtractXY( forceX, forceY );
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
      var insideContainer = moleculeDataSet.insideContainer;
      var timeStepHalf = timeStep / 2;
      var i;
      var moleculeVelocity;

      this.updateAtomPositions(
        numberOfAtoms,
        moleculeCenterOfMassPositions,
        moleculeVelocities,
        moleculeForces,
        insideContainer,
        timeStep
      );

      // Synchronize the atom positions.
      this.positionUpdater.updateAtomPositions( moleculeDataSet );

      this.updateContainerAndGravitationalForces(
        numberOfAtoms,
        moleculeCenterOfMassPositions,
        nextMoleculeForces,
        timeStep
      );

      // If there are any atoms that are currently designated as "unsafe", check them to see if they can be moved into
      // the "safe" category.
      if ( moleculeDataSet.numberOfSafeMolecules < numberOfAtoms ) {
        this.updateMoleculeSafety();
      }

      var numberOfSafeAtoms = moleculeDataSet.numberOfSafeMolecules;

      // Calculate the forces created through interactions with other particles.
      this.updateInterAtomForces( numberOfSafeAtoms, moleculeCenterOfMassPositions, nextMoleculeForces );

      // Calculate the new velocities based on the old ones and the forces that are acting on the particle.
      for ( i = 0; i < numberOfAtoms; i++ ) {
        moleculeVelocity = moleculeVelocities[ i ];
        moleculeVelocity.addXY(
          timeStepHalf * ( moleculeForces[ i ].x + nextMoleculeForces[ i ].x ),
          timeStepHalf * ( moleculeForces[ i ].y + nextMoleculeForces[ i ].y )
        );
        kineticEnergy += ( ( moleculeVelocity.x * moleculeVelocity.x ) +
                           ( moleculeVelocity.y * moleculeVelocity.y ) ) / 2;
      }

      // Update the temperature.
      this.temperature = kineticEnergy / numberOfAtoms;

      // Replace the previous forces with the new ones.
      for ( i = 0; i < numberOfAtoms; i++ ) {
        moleculeForces[ i ].setXY( nextMoleculeForces[ i ].x, nextMoleculeForces[ i ].y );
      }
    }
  } );
} );
