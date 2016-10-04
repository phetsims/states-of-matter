// Copyright 2014-2015, University of Colorado Boulder

/**
 * This is an abstract base class for classes that implement the Verlet algorithm for simulating molecular interactions
 * based on the Lennard-Jones potential.
 *
 * @author John Blanco
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants that control various aspects of the Verlet algorithm.
  var PRESSURE_CALC_TIME_WINDOW = 12; // in seconds, empirically determined to be responsive but not jumpy
  var WALL_DISTANCE_THRESHOLD = 1.122462048309373017; // distance at which repulsive LJ potential kicks in
  var SAFE_INTER_MOLECULE_DISTANCE = 2.0;

  // Pressure at which explosion of the container will occur.  This is currently set so that container blows roughly
  // when the pressure gauge hits its max value.
  var EXPLOSION_PRESSURE = 1.05;

  /**
   * @param {MultipleParticleModel} multipleParticleModel of the simulation
   * @constructor
   */
  function AbstractVerletAlgorithm( multipleParticleModel ) {
    this.multipleParticleModel = multipleParticleModel;
    this.potentialEnergy = 0;
    this.temperature = 0;

    PropertySet.call( this, {
      pressure: 0 // atm units
    } );

    // reusable vectors, used for efficiency
    this.topLeftOfContainer = new Vector2();
    this.topRightOfContainer = new Vector2();
    this.cornerForceVector = new Vector2();
  }

  statesOfMatter.register( 'AbstractVerletAlgorithm', AbstractVerletAlgorithm );

  return inherit( PropertySet, AbstractVerletAlgorithm, {

    /**
     * calculate the force due to the Lennard-Jones potential, uses the derivative of the standard formula
     * @param {number} distance
     * @returns {number}
     * @private
     */
    calculateForceFromLJPotential: function( distance ) {
      return ( 48 / ( Math.pow( distance, 13 ) ) ) - ( 24 / ( Math.pow( distance, 7 ) ) );
    },

    /**
     * calculate the Lennard-Jones potential for a given distance
     * @param {number} distance
     * @returns {number}
     * @private
     */
    calculateLJPotential: function( distance ) {
      return 4 / ( Math.pow( distance, 12 ) ) - 4 / ( Math.pow( distance, 6 ) ) + 1;
    },

    /**
     * @returns {boolean}
     * @param {Vector2} position
     */
    isNormalizedPositionInContainer: function( xPos, yPos ) {
      return xPos >= 0 && xPos <= this.multipleParticleModel.normalizedContainerWidth &&
             yPos >= 0 && yPos <= this.multipleParticleModel.normalizedTotalContainerHeight;
    },

    /**
     * Update the safety status of any molecules that may have previously been designated as unsafe.  An "unsafe"
     * molecule is one that was injected into the container and was found to be so close to one or more of the other
     * molecules that if its interaction forces were calculated, it would be given a ridiculously large amount of
     * kinetic energy that could end up launching it out of the container.
     * @protected
     */
    updateMoleculeSafety: function() {

      var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;
      var numberOfSafeMolecules = moleculeDataSet.getNumberOfSafeMolecules();
      var numberOfMolecules = moleculeDataSet.getNumberOfMolecules();

      if ( numberOfMolecules === numberOfSafeMolecules ) {
        // Nothing to do, so quit now.
        return;
      }

      var atomsPerMolecule = moleculeDataSet.getAtomsPerMolecule();
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var atomPositions = moleculeDataSet.getAtomPositions();
      var moleculeVelocities = moleculeDataSet.getMoleculeVelocities();
      var moleculeForces = moleculeDataSet.getMoleculeForces();
      var moleculeRotationRates = moleculeDataSet.getMoleculeRotationRates();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();

      for ( var i = numberOfSafeMolecules; i < numberOfMolecules; i++ ) {

        var moleculeIsUnsafe = false;

        // Find out if this molecule is still too close to all the "safe" molecules to become safe itself.
        for ( var j = 0; j < numberOfSafeMolecules; j++ ) {
          if ( moleculeCenterOfMassPositions[ i ].distance( moleculeCenterOfMassPositions[ j ] ) <
               SAFE_INTER_MOLECULE_DISTANCE ) {
            moleculeIsUnsafe = true;
            break;
          }
        }

        if ( !moleculeIsUnsafe ) {
          // The molecule just tested was safe, so adjust the arrays accordingly.
          if ( i !== numberOfSafeMolecules ) {
            // There is at least one unsafe atom/molecule in front of this one in the arrays, so some swapping must be
            // done before the number of safe atoms can be incremented.

            // Swap the atoms that comprise the safe molecules with the first unsafe one.
            var tempAtomPosition;
            for ( j = 0; j < atomsPerMolecule; j++ ) {
              tempAtomPosition = atomPositions[ ( numberOfSafeMolecules * atomsPerMolecule ) + j ];
              atomPositions[ ( numberOfSafeMolecules * atomsPerMolecule ) + j ] =
                atomPositions[ ( atomsPerMolecule * i ) + j ];
              atomPositions[ ( atomsPerMolecule * i ) + j ] = tempAtomPosition;
            }

            var firstUnsafeMoleculeIndex = numberOfSafeMolecules;

            var tempMoleculeCenterOfMassPosition = moleculeCenterOfMassPositions[ firstUnsafeMoleculeIndex ];
            moleculeCenterOfMassPositions[ firstUnsafeMoleculeIndex ] = moleculeCenterOfMassPositions[ i ];
            moleculeCenterOfMassPositions[ i ] = tempMoleculeCenterOfMassPosition;

            var tempMoleculeVelocity = moleculeVelocities[ firstUnsafeMoleculeIndex ];
            moleculeVelocities[ firstUnsafeMoleculeIndex ] = moleculeVelocities[ i ];
            moleculeVelocities[ i ] = tempMoleculeVelocity;

            var tempMoleculeForce = moleculeForces[ firstUnsafeMoleculeIndex ];
            moleculeForces[ firstUnsafeMoleculeIndex ] = moleculeForces[ i ];
            moleculeForces[ i ] = tempMoleculeForce;

            var tempMoleculeRotationAngle = moleculeRotationAngles[ firstUnsafeMoleculeIndex ];
            moleculeRotationAngles[ firstUnsafeMoleculeIndex ] = moleculeRotationAngles[ i ];
            moleculeRotationAngles[ i ] = tempMoleculeRotationAngle;

            var tempMoleculeRotationRate = moleculeRotationRates[ firstUnsafeMoleculeIndex ];
            moleculeRotationRates[ firstUnsafeMoleculeIndex ] = moleculeRotationRates[ i ];
            moleculeRotationRates[ i ] = tempMoleculeRotationRate;

            // Note: Don't worry about torque, since there isn't any until the molecules become "safe".
          }
          numberOfSafeMolecules++;
          moleculeDataSet.setNumberOfSafeMolecules( numberOfSafeMolecules );
        }
      }
    }
    ,

    setScaledEpsilon: function() {
      // This should be implemented in descendant classes.
      assert && assert( false, 'Setting epsilon is not implemented for this class' );
    }
    ,

    /**
     * @returns {number}
     * @public
     */
    getScaledEpsilon: function() {
      // This should be implemented in descendant classes.
      assert && assert( false, 'Getting scaled epsilon is not implemented for this class' );
      return 0;
    }
    ,

    /**
     * @param {number} pressureZoneWallForce
     * @param {number} dt
     * @public
     */
    updatePressure: function( pressureZoneWallForce, dt ) {
      if ( this.multipleParticleModel.isExploded ) {
        // If the container has exploded, there is essentially no pressure.
        this.pressure = 0;
      }
      else {
        this.pressure = ( dt / PRESSURE_CALC_TIME_WINDOW ) *
                        ( pressureZoneWallForce / ( this.multipleParticleModel.normalizedContainerWidth +
                                                    this.multipleParticleModel.normalizedContainerHeight ) ) +
                        ( PRESSURE_CALC_TIME_WINDOW - dt ) / PRESSURE_CALC_TIME_WINDOW * this.pressure;

        if ( ( this.pressure > EXPLOSION_PRESSURE ) && !this.multipleParticleModel.isExploded ) {
          // The pressure has reached the point where the container should explode, so blow 'er up.
          this.multipleParticleModel.setContainerExploded( true );
        }
      }
    },

    // static final
    PARTICLE_INTERACTION_DISTANCE_THRESH_SQRD: 6.25,

    // Parameters that control the increasing of gravity as the temperature approaches zero.  This is done to counteract
    // the tendency of the thermostat to slow falling molecules noticeably at low temps.  This is a "hollywooding" thing.
    TEMPERATURE_BELOW_WHICH_GRAVITY_INCREASES: 0.10,
    LOW_TEMPERATURE_GRAVITY_INCREASE_RATE: 50,

    // Constant used to limit the proximity of atoms when calculating the interaction potential.  This helps to prevent
    // getting huge potential value numbers and thus high particle velocities.  It is in model units and is empirically
    // determined such that the particles appear to interact well but don't go crazy when the container is compressed.
    MIN_DISTANCE_SQUARED: 0.95
  } );
} );
