// Copyright 2014-2018, University of Colorado Boulder

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
  var AbstractVerletAlgorithm = require( 'STATES_OF_MATTER/common/model/engine/AbstractVerletAlgorithm' );
  var DiatomicAtomPositionUpdater = require( 'STATES_OF_MATTER/common/model/engine/DiatomicAtomPositionUpdater' );
  var inherit = require( 'PHET_CORE/inherit' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  /**
   * @param {MultipleParticleModel} multipleParticleModel - Model of a set of particles
   * @constructor
   */
  function DiatomicVerletAlgorithm( multipleParticleModel ) {
    this.positionUpdater = DiatomicAtomPositionUpdater; // @private
    AbstractVerletAlgorithm.call( this, multipleParticleModel );
  }

  statesOfMatter.register( 'DiatomicVerletAlgorithm', DiatomicVerletAlgorithm );

  return inherit( AbstractVerletAlgorithm, DiatomicVerletAlgorithm, {

    /**
     * @override
     * @protected
     */
    initializeForces: function( moleculeDataSet ) {
      var accelerationDueToGravity = this.multipleParticleModel.gravitationalAcceleration;
      var nextMoleculeForces = moleculeDataSet.nextMoleculeForces;
      var nextMoleculeTorques = moleculeDataSet.nextMoleculeTorques;
      for ( var i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
        nextMoleculeForces[ i ].setXY( 0, accelerationDueToGravity );
        nextMoleculeTorques[ i ] = 0;
      }
    },

    /**
     * Update the forces acting on each molecule due to the other molecules in the data set.
     * @param moleculeDataSet
     * @private
     */
    updateInteractionForces: function( moleculeDataSet ) {

      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var nextMoleculeForces = moleculeDataSet.getNextMoleculeForces();
      var atomPositions = moleculeDataSet.getAtomPositions();
      var nextMoleculeTorques = moleculeDataSet.getNextMoleculeTorques();
      var numberOfMolecules = moleculeDataSet.numberOfMolecules;

      for ( var i = 0; i < numberOfMolecules; i++ ) {
        var moleculeCenterOfMassIX = moleculeCenterOfMassPositions[ i ].x;
        var moleculeCenterOfMassIY = moleculeCenterOfMassPositions[ i ].y;
        for ( var j = i + 1; j < numberOfMolecules; j++ ) {
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
     * Update the translational and rotational velocities for the molecules, calculate the total energy, and record the
     * temperature value for the system.
     * @param moleculeDataSet
     * @param timeStep
     * @private
     */
    updateVelocitiesAndRotationRates: function( moleculeDataSet, timeStep ) {

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
      var translationalKineticEnergy = 0;
      var rotationalKineticEnergy = 0;

      // Update the velocities and rotation rates based on the forces being exerted on the molecules, then calculate
      // the kinetic energy of the system.
      for ( var i = 0; i < numberOfMolecules; i++ ) {
        var xVel = moleculeVelocities[ i ].x +
                   timeStepHalf * ( moleculeForces[ i ].x + nextMoleculeForces[ i ].x ) * massInverse;
        var yVel = moleculeVelocities[ i ].y +
                   timeStepHalf * ( moleculeForces[ i ].y + nextMoleculeForces[ i ].y ) * massInverse;
        moleculeVelocities[ i ].setXY( xVel, yVel );
        moleculeRotationRates[ i ] += timeStepHalf * ( moleculeTorques[ i ] + nextMoleculeTorques[ i ] ) *
                                      inertiaInverse;
        translationalKineticEnergy += 0.5 * moleculeDataSet.moleculeMass * moleculeVelocities[ i ].magnitudeSquared();
        rotationalKineticEnergy += 0.5 * moleculeDataSet.moleculeRotationalInertia *
                                   Math.pow( moleculeRotationRates[ i ], 2 );

        // Move the newly calculated forces and torques into the current spots.
        moleculeForces[ i ].setXY( nextMoleculeForces[ i ].x, nextMoleculeForces[ i ].y );
        moleculeTorques[ i ] = nextMoleculeTorques[ i ];
      }

      // Record the calculated temperature.
      if ( numberOfMolecules > 0 ) {
        this.calculatedTemperature = ( 2 / 3 ) * ( translationalKineticEnergy + rotationalKineticEnergy ) / numberOfMolecules;
      }
      else {
        this.calculatedTemperature = this.multipleParticleModel.minModelTemperature;
      }
    }
  } );
} );
