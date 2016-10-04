// Copyright 2014-2015, University of Colorado Boulder

/**
 * Implementation of the Verlet algorithm for simulating molecular interaction based on the Lennard-Jones potential.
 * This is the diatomic (i.e. two atoms per molecule) version.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var AbstractVerletAlgorithm = require( 'STATES_OF_MATTER/common/model/engine/AbstractVerletAlgorithm' );
  var DiatomicAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/DiatomicAtomPositionUpdater' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  /**
   * @param {MultipleParticleModel} multipleParticleModel - Model of a set of particles
   * @constructor
   */
  function DiatomicVerletAlgorithm( multipleParticleModel ) {

    this.positionUpdater = DiatomicAtomPositionUpdater;
    AbstractVerletAlgorithm.call( this, multipleParticleModel );
  }

  statesOfMatter.register( 'DiatomicVerletAlgorithm', DiatomicVerletAlgorithm );

  return inherit( AbstractVerletAlgorithm, DiatomicVerletAlgorithm, {

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
     * Update the center of mass positions and rotational angles for the molecules based upon their current velocities
     * and rotation rates and the forces acting upon them, and handle any interactions with the wall, such as bouncing.
     * @param moleculeDataSet
     * @param timeStep
     * @private
     */
    updateMoleculePositions: function( moleculeDataSet, timeStep ) {

      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
      var moleculeForces = moleculeDataSet.getMoleculeForces();
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      var moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
      var moleculeTorques = moleculeDataSet.getMoleculeTorques();
      var massInverse = 1 / moleculeDataSet.getMoleculeMass();
      var inertiaInverse = 1 / moleculeDataSet.getMoleculeRotationalInertia();
      var timeStepSqrHalf = timeStep * timeStep * 0.5;
      var middleHeight = this.multipleParticleModel.normalizedContainerHeight / 2;
      var accumulatedPressure = 0;

      // Since the normalized particle diameter is 1.0, and this is a diatomic particle joined at the center, use a
      // 'compromise' value of 1.5 as the offset from the edges where these molecules should bounce.
      var minX = 1.5;
      var minY = 1; // this one needs to be 1.0 so that the initial solid block doesn't have to fall down to the edge
      var maxX = this.multipleParticleModel.normalizedContainerWidth - 1.5;
      var maxY = this.multipleParticleModel.normalizedContainerHeight - 1.5;

      for ( var i = 0; i < numberOfMolecules; i++ ) {

        var moleculeVelocity = moleculeVelocities[ i ];
        var moleculeVelocityX = moleculeVelocity.x; // optimization
        var moleculeVelocityY = moleculeVelocity.y; // optimization
        var moleculeCenterOfMassPosition = moleculeCenterOfMassPositions[ i ];

        // calculate new position based on time and velocity
        var xPos = moleculeCenterOfMassPosition.x +
                   ( timeStep * moleculeVelocityX ) +
                   ( timeStepSqrHalf * moleculeForces[ i ].x * massInverse);
        var yPos = moleculeCenterOfMassPosition.y +
                   ( timeStep * moleculeVelocityY ) +
                   ( timeStepSqrHalf * moleculeForces[ i ].y * massInverse);

        // handle any bouncing off of the walls of the container
        if ( this.isNormalizedPositionInContainer( xPos, yPos ) ) {

          // handle bounce off the walls
          if ( xPos <= minX && moleculeVelocityX < 0 ) {
            xPos = minX;
            moleculeVelocity.x = -moleculeVelocityX;
            if ( xPos > middleHeight ) {
              accumulatedPressure += -moleculeVelocityX;
            }
          }
          else if ( xPos >= maxX && moleculeVelocityX > 0 ) {
            xPos = maxX;
            moleculeVelocity.x = -moleculeVelocityX;
            if ( xPos > middleHeight ) {
              accumulatedPressure += moleculeVelocityX;
            }
          }

          // handle bounce off the bottom and top
          if ( yPos <= minY && moleculeVelocityY <= 0 ) {
            yPos = minY;
            moleculeVelocity.y = -moleculeVelocityY;
          }
          else if ( yPos >= maxY && !this.multipleParticleModel.getContainerExploded() ) {

            // This particle bounced off the top, so use the lid's velocity in calculation of the new velocity
            yPos = maxY;
            if ( moleculeVelocityY > 0 ) {
              // TODO: The lid velocity seems to be in different units or something from the atom velocities, so
              // TODO: I have a derating factor in here.  I'll either need to explain it or figure out the source
              // TODO: of the apparent discrepancy.
              moleculeVelocity.y = -moleculeVelocityY + this.multipleParticleModel.normalizedLidVelocityY * 0.02;
            }
            accumulatedPressure += moleculeVelocityY;
          }
        }

        // set new position and rate of rotation
        moleculeCenterOfMassPositions[ i ].setXY( xPos, yPos );
        moleculeRotationAngles[ i ] += ( timeStep * moleculeRotationRates[ i ]) +
                                       ( timeStepSqrHalf * moleculeTorques[ i ] * inertiaInverse);
      }

      // Now that the molecule position information has been updated, update the positions of the individual atoms.
      this.positionUpdater.updateAtomPositions( moleculeDataSet );

      // update the pressure
      this.updatePressure( accumulatedPressure * 40, timeStep ); // TODO: Move multiplier to base case when all subclasses are working with new approach
    },

    /**
     * Update the forces acting on each molecule due to the other molecules in the data set.
     * @param moleculeDataSet
     * @private
     */
    updateInterMoleculeForces: function( moleculeDataSet ){

      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var nextMoleculeForces = moleculeDataSet.getNextMoleculeForces();
      var atomPositions = moleculeDataSet.getAtomPositions();
      var nextMoleculeTorques = moleculeDataSet.getNextMoleculeTorques();
      var numberOfSafeMolecules = moleculeDataSet.numberOfSafeMolecules;

      for ( var i = 0; i < numberOfSafeMolecules; i++ ) {
        var moleculeCenterOfMassIX = moleculeCenterOfMassPositions[ i ].x;
        var moleculeCenterOfMassIY = moleculeCenterOfMassPositions[ i ].y;
        for ( var j = i + 1; j < numberOfSafeMolecules; j++ ) {
          var moleculeCenterOfMassJX = moleculeCenterOfMassPositions[ j ].x;
          var moleculeCenterOfMassJY = moleculeCenterOfMassPositions[ j ].y;
          for ( var ii = 0; ii < 2; ii++ ) {
            var atom1PosX = atomPositions[ 2 * i + ii ].x;
            var atom1PosY = atomPositions[ 2 * i + ii ].y;
            for ( var jj = 0; jj < 2; jj++ ) {
              var atom2PosX = atomPositions[ 2 * j + jj ].x;
              var atom2PosY = atomPositions[ 2 * j + jj ].y;

              // Calculate the distance between the potentially interacting atoms.
              var dx = atom1PosX - atom2PosX;
              var dy = atom1PosY - atom2PosY;
              var distanceSquared = dx * dx + dy * dy;
              if ( distanceSquared < this.PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD ) {
                if ( distanceSquared < this.MIN_DISTANCE_SQUARED ) {
                  distanceSquared = this.MIN_DISTANCE_SQUARED;
                }
                // Calculate the Lennard-Jones interaction forces.
                var r2inv = 1 / distanceSquared;
                var r6inv = r2inv * r2inv * r2inv;
                var forceScalar = 48 * r2inv * r6inv * (r6inv - 0.5);
                var fx = dx * forceScalar;
                var fy = dy * forceScalar;
                nextMoleculeForces[ i ].addXY( fx, fy );
                nextMoleculeForces[ j ].subtractXY( fx, fy );
                nextMoleculeTorques[ i ] += ( atom1PosX - moleculeCenterOfMassIX ) * fy -
                                            ( atom1PosY - moleculeCenterOfMassIY ) * fx;
                nextMoleculeTorques[ j ] -= ( atom2PosX - moleculeCenterOfMassJX ) * fy -
                                            ( atom2PosY - moleculeCenterOfMassJY ) * fx;
                this.potentialEnergy += 4 * r6inv * ( r6inv - 1 ) + 0.016316891136;
              }
            }
          }
        }
      }
    },

    /**
     * Update the linear and rotational velocities for the molecules, calculate the total energy, and record the
     * temperature value for the system.
     * @param moleculeDataSet
     * @param timeStep
     * @private
     */
    updateVelocitiesAndTemperature: function( moleculeDataSet, timeStep ){

      // Obtain references to the model data and parameters so that we can perform fast manipulations.
      var moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
      var moleculeForces = moleculeDataSet.getMoleculeForces();
      var nextMoleculeForces = moleculeDataSet.getNextMoleculeForces();
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
      var moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
      var moleculeTorques = moleculeDataSet.getMoleculeTorques();
      var nextMoleculeTorques = moleculeDataSet.getNextMoleculeTorques();

      // Initialize other values that will be needed for the calculation.
      var massInverse = 1 / moleculeDataSet.getMoleculeMass();
      var inertiaInverse = 1 / moleculeDataSet.getMoleculeRotationalInertia();
      var timeStepHalf = timeStep / 2;

      var centersOfMassKineticEnergy = 0;
      var rotationalKineticEnergy = 0;
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        var xVel = moleculeVelocities[ i ].x +
                   timeStepHalf * ( moleculeForces[ i ].x + nextMoleculeForces[ i ].x ) * massInverse;
        var yVel = moleculeVelocities[ i ].y +
                   timeStepHalf * ( moleculeForces[ i ].y + nextMoleculeForces[ i ].y ) * massInverse;
        moleculeVelocities[ i ].setXY( xVel, yVel );
        moleculeRotationRates[ i ] += timeStepHalf * ( moleculeTorques[ i ] + nextMoleculeTorques[ i ] ) *
                                      inertiaInverse;
        centersOfMassKineticEnergy += 0.5 * moleculeDataSet.moleculeMass *
                                      ( Math.pow( moleculeVelocities[ i ].x, 2 ) +
                                        Math.pow( moleculeVelocities[ i ].y, 2 ) );
        rotationalKineticEnergy += 0.5 * moleculeDataSet.moleculeRotationalInertia *
                                   Math.pow( moleculeRotationRates[ i ], 2 );

        // Move the newly calculated forces and torques into the current spots.
        moleculeForces[ i ].setXY( nextMoleculeForces[ i ].x, nextMoleculeForces[ i ].y );
        moleculeTorques[ i ] = nextMoleculeTorques[ i ];
      }

      // Record the calculated temperature.
      this.temperature = ( centersOfMassKineticEnergy + rotationalKineticEnergy ) / numberOfMolecules / 1.5;
    },

    /**
     * Update the motion of the particles and the forces that are acting upon them.  This is the heart of this class,
     * and it is here that the actual Verlet algorithm is contained.
     * @public
     */
    updateForcesAndMotion: function( timeStep ) {

      var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
      var nextMoleculeForces = moleculeDataSet.getNextMoleculeForces();
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();
      var nextMoleculeTorques = moleculeDataSet.getNextMoleculeTorques();

      // Update center of mass positions and angles for the molecules.
      this.updateMoleculePositions( moleculeDataSet, timeStep );

      // If there are any molecules that are currently designated as "unsafe", check them to see if they can be moved
      // into the "safe" category.
      if ( moleculeDataSet.numberOfSafeMolecules < numberOfMolecules ) {
        this.updateMoleculeSafety();
      }

      // Set initial values for the forces that are acting on each atom, will be further updated below.
      var accelerationDueToGravity = -this.multipleParticleModel.gravitationalAcceleration;
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        nextMoleculeForces[ i ].setXY( 0, accelerationDueToGravity );
        nextMoleculeTorques[ i ] = 0;
      }

      // Update the forces due to molecules interacting with one another.
      this.updateInterMoleculeForces( moleculeDataSet, timeStep );

      // Update velocity and angles
      this.updateVelocitiesAndTemperature( moleculeDataSet, timeStep );
    }
  } );
} );
