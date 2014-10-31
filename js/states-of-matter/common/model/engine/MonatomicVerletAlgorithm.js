// Copyright 2002-2012, University of Colorado
/**
 * Implementation of the Verlet algorithm for simulating molecular interaction
 * based on the Lennard-Jones potential - monatomic (i.e. one atom per
 * molecule) version.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'java.awt.geom.Vector2' );
  var Vector2 = require( 'DOT/Vector2' );
  var MoleculeForceAndMotionDataSet = require( 'STATES_OF_MATTER/states-of-matter/model/MoleculeForceAndMotionDataSet' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/states-of-matter/model/MultipleParticleModel' );

  function MonatomicVerletAlgorithm( model ) {
    //----------------------------------------------------------------------------
    // Class Data
    //----------------------------------------------------------------------------
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------

    //private
    this.m_positionUpdater = new MonatomicAtomPositionUpdater();
    // Controls the strength of particle interaction.

    //private
    this.m_epsilon = 1;
    AbstractVerletAlgorithm.call( this, model );
  }

  return inherit( AbstractVerletAlgorithm, MonatomicVerletAlgorithm, {
//----------------------------------------------------------------------------
// Public Methods
//----------------------------------------------------------------------------
    getPressure: function() {
      return m_pressure;
    },
    getTemperature: function() {
      return m_temperature;
    },
    setScaledEpsilon: function( scaledEpsilon ) {
      m_epsilon = scaledEpsilon;
    },
    getScaledEpsilon: function() {
      return m_epsilon;
    },
    /**
     * Update the motion of the particles and the forces that are acting upon
     * them.  This is the heart of this class, and it is here that the actual
     * Verlet algorithm is contained.
     */
    updateForcesAndMotion: function() {
      var kineticEnergy = 0;
      var potentialEnergy = 0;
      // perform fast manipulations.
      var moleculeDataSet = m_model.getMoleculeDataSetRef();
      var numberOfAtoms = moleculeDataSet.getNumberOfAtoms();
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
      var moleculeForces = moleculeDataSet.getMoleculeForces();
      var nextMoleculeForces = moleculeDataSet.getNextMoleculeForces();
      // velocities and the forces acting on them.
      for ( var i = 0; i < numberOfAtoms; i++ ) {
        var xPos = moleculeCenterOfMassPositions[i].getX() + (TIME_STEP * moleculeVelocities[i].getX()) + (TIME_STEP_SQR_HALF * moleculeForces[i].getX());
        var yPos = moleculeCenterOfMassPositions[i].getY() + (TIME_STEP * moleculeVelocities[i].getY()) + (TIME_STEP_SQR_HALF * moleculeForces[i].getY());
        moleculeCenterOfMassPositions[i].setLocation( xPos, yPos );
      }
      // walls and by gravity.
      var pressureZoneWallForce = 0;
      for ( var i = 0; i < numberOfAtoms; i++ ) {
        // Clear the previous calculation's particle forces.
        nextMoleculeForces[i].setComponents( 0, 0 );
        // Get the force values caused by the container walls.
        calculateWallForce( moleculeCenterOfMassPositions[i], m_model.getNormalizedContainerWidth(), m_model.getNormalizedContainerHeight(), nextMoleculeForces[i] );
        // exerted on the walls of the container.
        if ( nextMoleculeForces[i].getY() < 0 ) {
          pressureZoneWallForce += -nextMoleculeForces[i].getY();
        }
        else if ( moleculeCenterOfMassPositions[i].getY() > m_model.getNormalizedContainerHeight() / 2 ) {
          // in that value to the pressure.
          pressureZoneWallForce += Math.abs( nextMoleculeForces[i].getX() );
        }
        nextMoleculeForces[i].setY( nextMoleculeForces[i].getY() - m_model.getGravitationalAcceleration() );
      }
      // Update the pressure calculation.
      updatePressure( pressureZoneWallForce );
      // check them to see if they can be moved into the "safe" category.
      if ( moleculeDataSet.getNumberOfSafeMolecules() < numberOfAtoms ) {
        updateMoleculeSafety();
      }
      var numberOfSafeAtoms = moleculeDataSet.getNumberOfSafeMolecules();
      // particles.
      var force = new Vector2();
      for ( var i = 0; i < numberOfSafeAtoms; i++ ) {
        for ( var j = i + 1; j < numberOfSafeAtoms; j++ ) {
          var dx = moleculeCenterOfMassPositions[i].getX() - moleculeCenterOfMassPositions[j].getX();
          var dy = moleculeCenterOfMassPositions[i].getY() - moleculeCenterOfMassPositions[j].getY();
          var distanceSqrd = (dx * dx) + (dy * dy);
          if ( distanceSqrd == 0 ) {
            // particles.
            dx = 1;
            dy = 1;
            distanceSqrd = 2;
          }
          if ( distanceSqrd < PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD ) {
            // that we need to calculate their interaction forces.
            if ( distanceSqrd < MIN_DISTANCE_SQUARED ) {
              distanceSqrd = MIN_DISTANCE_SQUARED;
            }
            var r2inv = 1 / distanceSqrd;
            var r6inv = r2inv * r2inv * r2inv;
            var forceScalar = 48 * r2inv * r6inv * (r6inv - 0.5) * m_epsilon;
            force.setX( dx * forceScalar );
            force.setY( dy * forceScalar );
            nextMoleculeForces[i].add( force );
            nextMoleculeForces[j].subtract( force );
            potentialEnergy += 4 * r6inv * (r6inv - 1) + 0.016316891136;
          }
        }
      }
      // that are acting on the particle.
      var velocityIncrement = new Vector2();
      for ( var i = 0; i < numberOfAtoms; i++ ) {
        velocityIncrement.setX( TIME_STEP_HALF * (moleculeForces[i].getX() + nextMoleculeForces[i].getX()) );
        velocityIncrement.setY( TIME_STEP_HALF * (moleculeForces[i].getY() + nextMoleculeForces[i].getY()) );
        moleculeVelocities[i].add( velocityIncrement );
        kineticEnergy += ((moleculeVelocities[i].getX() * moleculeVelocities[i].getX()) + (moleculeVelocities[i].getY() * moleculeVelocities[i].getY())) / 2;
      }
      // Record the calculated temperature.
      m_temperature = kineticEnergy / numberOfAtoms;
      // Synchronize the molecule and atom positions.
      m_positionUpdater.updateAtomPositions( moleculeDataSet );
      // Replace the new forces with the old ones.
      for ( var i = 0; i < numberOfAtoms; i++ ) {
        moleculeForces[i].setComponents( nextMoleculeForces[i].getX(), nextMoleculeForces[i].getY() );
      }
    }
  } );
} );

