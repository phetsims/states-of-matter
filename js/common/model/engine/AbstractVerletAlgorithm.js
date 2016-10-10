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

  // constants that control various aspects of the Verlet algorithm.
  var PRESSURE_CALC_TIME_WINDOW = 12; // in seconds, empirically determined to be responsive but not jumpy
  var SAFE_INTER_MOLECULE_DISTANCE = 2.0;

  // Pressure at which explosion of the container will occur.  This is currently set so that container blows roughly
  // when the pressure gauge hits its max value.
  var EXPLOSION_PRESSURE = 1.05;

  /**
   * @param {MultipleParticleModel} multipleParticleModel of the simulation
   * @constructor
   */
  function AbstractVerletAlgorithm( multipleParticleModel ) {

    PropertySet.call( this, {
      pressure: 0 // @public, read-only, in atm (atmospheres)
    } );

    this.multipleParticleModel = multipleParticleModel; // @protected, read only

    // @protected, read-write, used to set where particles bounce
    this.sideBounceInset = 1;
    this.bottomBounceInset = 1;
    this.topBounceInset = 1;

    // @protected
    this.potentialEnergy = 0;
    this.temperature = 0;
    
    // Flag that indicates whether the lid affected the velocity of one or more particles, set during execution of the
    // Verlet algorithm, must be cleared by the client.
    this.lidChangedParticleVelocity = false;
  }

  statesOfMatter.register( 'AbstractVerletAlgorithm', AbstractVerletAlgorithm );

  return inherit( PropertySet, AbstractVerletAlgorithm, {

    /**
     * @returns {boolean}
     * @param {number} xPos
     * @param {number} yPos
     * @protected
     */
    isNormalizedPositionInContainer: function( xPos, yPos ) {
      return xPos >= 0 && xPos <= this.multipleParticleModel.normalizedContainerWidth &&
             yPos >= 0 && yPos <= this.multipleParticleModel.normalizedTotalContainerHeight;
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
      var minX = this.sideBounceInset;
      var minY = this.bottomBounceInset;
      var maxX = this.multipleParticleModel.normalizedContainerWidth - this.sideBounceInset;
      var maxY = this.multipleParticleModel.normalizedContainerHeight - this.topBounceInset;
      
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

        if ( !moleculeDataSet.insideContainer[ i ] && this.isNormalizedPositionInContainer( xPos, yPos ) ){

          // The particle had left the container, but is now back inside, so update the status
          moleculeDataSet.insideContainer[ i ] = true;
        }

        // handle any bouncing off of the walls of the container
        if ( moleculeDataSet.insideContainer[ i ] ) {

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
          else if ( yPos >= maxY  ) {

            if ( !this.multipleParticleModel.getContainerExploded() ) {

              // This particle bounced off the top, so use the lid's velocity in calculation of the new velocity
              yPos = maxY;
              var lidVelocity = this.multipleParticleModel.normalizedLidVelocityY;
              if ( moleculeVelocityY > 0 ) {

                // Add the lid's downward velocity to the particle's velocity, but not quite all of it.  The multiplier
                // was empirically determined to look reasonable without causing the pressure to go up too quickly when
                // compressing the container.
                moleculeVelocity.y = -( moleculeVelocityY + lidVelocity * 0.5 );
                
                if ( Math.abs( lidVelocity ) > 0 ){
                  this.lidChangedParticleVelocity = true;
                }
              }
              else if ( moleculeVelocityY < lidVelocity ) {
                moleculeVelocity.y = lidVelocity;
                this.lidChangedParticleVelocity = true;
              }
              accumulatedPressure += Math.abs( moleculeVelocityY );
            }
            else{
              // This particle has left the container.
              moleculeDataSet.insideContainer[ i ] = false;
            }
          }
        }

        // set new position
        moleculeCenterOfMassPositions[ i ].setXY( xPos, yPos );

        // set new rotation (does nothing in the monatomic case)
        moleculeRotationAngles[ i ] += ( timeStep * moleculeRotationRates[ i ]) +
                                       ( timeStepSqrHalf * moleculeTorques[ i ] * inertiaInverse);
      }

      // Now that the molecule position information has been updated, update the positions of the individual atoms.
      this.positionUpdater.updateAtomPositions( moleculeDataSet );

      // Update the pressure - the multiplier is empirically determined to get pressure values that work in the larger
      // context of the sim.
      this.updatePressure( accumulatedPressure * 65, timeStep );
    },

    /**
     * Update the safety status of any molecules that may have previously been designated as unsafe.  An "unsafe"
     * molecule is one that was injected into the container and was found to be so close to one or more of the other
     * molecules that if its interaction forces were calculated, it would be given a ridiculously large amount of
     * kinetic energy that could end up launching it out of the container.
     * @protected
     */
    updateMoleculeSafety: function( moleculeDataSet ) {

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
    },

    /**
     * Update the motion of the particles and the forces that are acting upon them.  This is the heart of this class,
     * and it is here that the actual Verlet algorithm is contained.
     * @public
     */
    updateForcesAndMotion: function( timeStep ) {

      // Obtain references to the model data and parameters so that we can perform fast manipulations.
      var moleculeDataSet = this.multipleParticleModel.moleculeDataSet;

      // Update the atom positions based on velocities, current forces, and interactions with the wall.
      this.updateMoleculePositions( moleculeDataSet, timeStep );

      // Update the "safety status" of the molecules, which determines if they are okay to interact with others.
      this.updateMoleculeSafety( moleculeDataSet );

      // Set initial values for the forces that are acting on each atom or molecule, will be further updated below.
      this.initializeForces( moleculeDataSet );

      // Calculate the forces created through interactions with other atoms/molecules.
      this.updateInteractionForces( moleculeDataSet );

      // Update the velocities and rotation rates based on the forces acting on the atoms/molecules.
      this.updateVelocitiesAndRotationRates( moleculeDataSet, timeStep );
    },

    // @protected
    initializeForces: function( moleculeDataSet ) {
      assert && assert( false, 'abstract method, must be overridden in descendant classes' );
    },

    // @protected
    updateInteractionForces: function( moleculeDataSet ) {
      assert && assert( false, 'abstract method, must be overridden in descendant classes' );
    },

    // @protected
    updateVelocitiesAndRotationRates: function( moleculeDataSet ) {
      assert && assert( false, 'abstract method, must be overridden in descendant classes' );
    },

    setScaledEpsilon: function() {
      // This should be implemented in descendant classes.
      assert && assert( false, 'Setting epsilon is not implemented for this class' );
    },

    /**
     * @returns {number}
     * @public
     */
    getScaledEpsilon: function() {
      // This should be implemented in descendant classes.
      assert && assert( false, 'Getting scaled epsilon is not implemented for this class' );
      return 0;
    },

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

    // Constant used to limit the proximity of atoms when calculating the interaction potential.  This does NOT actually
    // limit how close they can get to one another, just the value used in the LJ calculation.  Having such a limit
    // helps to prevent getting huge potential value numbers and thus unmanageably high particle velocities.  It is in
    // model units and is empirically determined such that the particles appear to interact well but don't go crazy when
    // the container is compressed.  Take care when modifying it - such modifications can have somewhat unexpected side
    // effects, such as changing how water crystalizes when it freezes.
    MIN_DISTANCE_SQUARED: 0.90
  } );
} );
