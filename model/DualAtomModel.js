// Copyright 2002-2014, University of Colorado Boulder
/**
 * This is the model for two atoms interacting with a Lennard-Jones
 * interaction potential.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );
  var Random = require( 'STATES_OF_MATTER/common/model/Random' );
  var LjPotentialCalculator = require( 'STATES_OF_MATTER/common/model/LjPotentialCalculator' );
  var InteractionStrengthTable = require( 'STATES_OF_MATTER/common/model/InteractionStrengthTable' );
  var SigmaTable = require( 'STATES_OF_MATTER/common/model/SigmaTable' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var AtomFactory = require( 'STATES_OF_MATTER/common/model/AtomFactory' );

  var BONDING_STATE_UNBONDED = 0;
  var BONDING_STATE_BONDING = 1;
  var BONDING_STATE_BONDED = 2;

  var DEFAULT_ATOM_TYPE = AtomType.NEON;
  var CALCULATIONS_PER_TICK = 8;
  var THRESHOLD_VELOCITY = 100;  // Used to distinguish small oscillations from real movement.
  var VIBRATION_DURATION = 1200;  // In milliseconds.
  var VIBRATION_COUNTER_RESET_VALUE = VIBRATION_DURATION;/// AtomicInteractionDefaults.CLOCK_FRAME_DELAY;
  var BONDED_OSCILLATION_PROPORTION = 0.06; // Proportion of atom radius.
  var MAX_APPROXIMATION_ITERATIONS = 100;


  function DualAtomModel() {

    this.fixedAtom = null;
    this.movableAtom = null;
    this.timeStep = 0.3;
    this.settingBothAtomTypes = false;  // Flag used to prevent getting in disallowed state.
    this.bondingState = BONDING_STATE_UNBONDED; // Tracks whether the atoms have formed a chemical bond.
    this.vibrationCounter = 0; // Used to vibrate fixed atom during bonding.
    this.potentialWhenAtomReleased = 0; // Used to set magnitude of vibration.
    this.rand = new Random();
    this.sigmaTable = new SigmaTable();
    this.atomFactory = new AtomFactory();
    this.ljPotentialCalculator = new LjPotentialCalculator( StatesOfMatterConstants.MIN_SIGMA,
      StatesOfMatterConstants.MIN_EPSILON ); // Initial values arbitrary, will be set during reset.
    PropertySet.call( this, {
        interactionStrength: 0, // notifyInteractionStrengthChanged
        motionPaused: false,
        moleculeType: 'NEON_NEON',
        isPlaying: true,
        speed: 'normal',
        atomDiameter: 150,// atom diameter
        forces: 'hideForces'
      }
    );

    // Put the model into its initial state.
    this.reset();
  }

  return inherit( PropertySet, DualAtomModel, {

      getFixedAtomRef: function() {
        return this.fixedAtom;
      },
      getMovableAtomRef: function() {
        return this.movableAtom;
      },
      getAttractiveForce: function() {
        return this.attractiveForce;
      },
      getRepulsiveForce: function() {
        return this.repulsiveForce;
      },
      getFixedAtomType: function() {
        return this.fixedAtom.getType();
      },
      getMovableAtomType: function() {
        return this.movableAtom.getType();
      },

      setFixedAtomType: function( atomType ) {

        if ( this.fixedAtom === null || this.fixedAtom.getType() !== atomType ) {
          if ( !this.settingBothAtomTypes &&
               ( ( atomType === AtomType.ADJUSTABLE && this.movableAtom.getType() !== AtomType.ADJUSTABLE ) ||
                 ( atomType !== AtomType.ADJUSTABLE && this.movableAtom.getType() === AtomType.ADJUSTABLE ) ) ) {
            console.log( " - Error: Cannot set just one atom to be adjustable, ignoring request." );
            return;
          }
          this.ensureValidAtomType( atomType );
          this.bondingState = BONDING_STATE_UNBONDED;

          // Inform any listeners of the removal of existing atoms.
          if ( this.fixedAtom !== null ) {
            this.fixedAtom = null;
          }

          this.fixedAtom = this.atomFactory.createAtom( atomType );

          // Set the value for sigma used in the LJ potential calculations.
          if ( this.movableAtom !== null ) {
            this.ljPotentialCalculator.setSigma( this.sigmaTable.getSigma( this.getFixedAtomType(),
              this.getMovableAtomType() ) );
          }

          // If both atoms exist, set the value of epsilon.
          if ( this.movableAtom !== null ) {
            this.ljPotentialCalculator.setEpsilon(
              InteractionStrengthTable.getInteractionPotential( this.fixedAtom.getType(),
                this.movableAtom.getType() ) );
          }

          this.fixedAtom.setPosition( 0, 0 );
          this.resetMovableAtomPos();
        }
      },
      setMovableAtomType: function( atomType ) {

        if ( this.movableAtom === null || this.movableAtom.getType() !== atomType ) {

          if ( !this.settingBothAtomTypes &&
               ( ( atomType === AtomType.ADJUSTABLE && this.movableAtom.getType() !== AtomType.ADJUSTABLE ) ||
                 ( atomType !== AtomType.ADJUSTABLE && this.movableAtom.getType() === AtomType.ADJUSTABLE ) ) ) {
            console.log( " - Error: Cannot set just one atom to be adjustable, ignoring request." );
            return;
          }

          this.ensureValidAtomType( atomType );
          this.bondingState = BONDING_STATE_UNBONDED;

          if ( this.movableAtom !== null ) {
            this.movableAtom = null;
          }

          this.movableAtom = this.atomFactory.createAtom( atomType );

          // Register to listen to motion of the movable atom so that we can
          // tell when the user is moving it.
          //this.movableAtom.addListener(this.movableAtomListener);

          // Set the value for sigma used in the LJ potential calculations.
          if ( this.movableAtom !== null ) {
            this.ljPotentialCalculator.setSigma( this.sigmaTable.getSigma( this.getFixedAtomType(),
              this.getMovableAtomType() ) );
          }

          // If both atoms exist, set the value of epsilon.
          if ( this.fixedAtom !== null ) {
            this.ljPotentialCalculator.setEpsilon(
              InteractionStrengthTable.getInteractionPotential( this.fixedAtom.getType(),
                this.movableAtom.getType() ) );
          }


          this.resetMovableAtomPos();
        }
      },

      ensureValidAtomType: function( atomType ) {
        // Verify that this is a supported value.
        if ( ( atomType !== AtomType.NEON ) &&
             ( atomType !== AtomType.ARGON ) &&
             ( atomType !== AtomType.OXYGEN ) &&
             ( atomType !== AtomType.ADJUSTABLE ) ) {
          // console.error( "Error: Unsupported atom type." );
          //assert false;
        }
      },
      setBothAtomTypes: function( atomType ) {

        if ( this.fixedAtom === null || this.movableAtom === null || this.fixedAtom.getType() !== atomType ||
             this.movableAtom.getType() !== atomType ) {
          this.settingBothAtomTypes = true;
          this.setFixedAtomType( atomType );
          this.setMovableAtomType( atomType );
          this.settingBothAtomTypes = false;
        }
      },

      /**
       * Set the sigma value, a.k.a. the Atomic Diameter Parameter, for the
       * adjustable atom.  This is one of the two parameters that are used
       * for calculating the Lennard-Jones potential.  If an attempt is made to
       * set this value when the adjustable atom is not selected, it is ignored.
       *
       * @param sigma - distance parameter
       */
      setAdjustableAtomSigma: function( sigma ) {
        if ( ( this.fixedAtom.getType() === AtomType.ADJUSTABLE ) &&
             ( this.movableAtom.getType() === AtomType.ADJUSTABLE ) &&
             ( sigma !== this.ljPotentialCalculator.getSigma() ) ) {

          if ( sigma > StatesOfMatterConstants.MAX_SIGMA ) {
            sigma = StatesOfMatterConstants.MAX_SIGMA;
          }
          else if ( sigma < StatesOfMatterConstants.MIN_SIGMA ) {
            sigma = StatesOfMatterConstants.MIN_SIGMA;
          }
          this.ljPotentialCalculator.setSigma( sigma );
          this.movableAtom.setPosition( this.ljPotentialCalculator.calculateMinimumForceDistance(), 0 );
          this.fixedAtom.setRadius( sigma / 2 );
          this.movableAtom.setRadius( sigma / 2 );
        }
      },

      /**
       * Get the value of the sigma parameter that is being used for the motion
       * calculations.  If the atoms are the same, it will be the diameter
       * of one atom.  If they are not, it will be a function of the
       * diameters.
       *
       * @return
       */
      getSigma: function() {
        return this.ljPotentialCalculator.getSigma();
      },

      /**
       * Set the epsilon value, a.k.a. the Interaction Strength Parameter, which
       * is one of the two parameters that describes the Lennard-Jones potential.
       *
       * @param epsilon - interaction strength parameter
       */
      setEpsilon: function( epsilon ) {

        if ( epsilon < StatesOfMatterConstants.MIN_EPSILON ) {
          epsilon = StatesOfMatterConstants.MIN_EPSILON;
        }
        else if ( epsilon > StatesOfMatterConstants.MAX_EPSILON ) {
          epsilon = StatesOfMatterConstants.MAX_EPSILON;
        }

        if ( ( this.fixedAtom.getType() === AtomType.ADJUSTABLE ) &&
             ( this.movableAtom.getType() === AtomType.ADJUSTABLE ) ) {

          this.ljPotentialCalculator.setEpsilon( epsilon );
        }
      },

      /**
       * Get the epsilon value, a.k.a. the Interaction Strength Parameter, which
       * is one of the two parameters that describes the Lennard-Jones potential.
       *
       * @return
       */
      getEpsilon: function() {
        return this.ljPotentialCalculator.getEpsilon();
      },

      getBondingState: function() {
        return this.bondingState;
      },

      reset: function() {
        PropertySet.prototype.reset.call( this );
        if ( this.fixedAtom === null || this.fixedAtom.getType() !== DEFAULT_ATOM_TYPE ||
             this.movableAtom === null || this.movableAtom.getType() !== DEFAULT_ATOM_TYPE ) {
          this.setBothAtomTypes( DEFAULT_ATOM_TYPE );
        }
        else {
          this.resetMovableAtomPos();
        }
        // Make sure we are not paused.
        this.motionPaused = false;

      },

      /**
       * Put the movable atom back to the location where the force is
       * minimized, and reset the velocity and acceleration to 0.
       */
      resetMovableAtomPos: function() {
        if ( this.movableAtom !== null ) {
          this.movableAtom.setPosition( this.ljPotentialCalculator.calculateMinimumForceDistance(), 0 );
          this.movableAtom.setVx( 0 );
          this.movableAtom.setAx( 0 );
        }
      },


      setMotionPaused: function( paused ) {
        this.motionPaused = paused;
        this.movableAtom.setVx( 0 );
        if ( !paused ) {
          // The atom is being released by the user.  Record the amount of
          // energy that the atom has at this point in time for later use.  The
          // calculation is made be evaluating the force at the current
          // location and multiplying it by the distance to the point where
          // the LJ potential is minimized.  Note that this is not precisely
          // correct, since the potential is not continuous, but is close
          // enough for our purposes.
          this.potentialWhenAtomReleased =
          this.ljPotentialCalculator.calculatePotentialEnergy( this.movableAtom.getPositionReference().distance( this.fixedAtom.getPositionReference() ) );
        }
      },

      getMotionPaused: function() {
        return this.motionPaused;
      },

      /**
       * Release the bond that exists between the two atoms (if there is one).
       */
      releaseBond: function() {
        if ( this.bondingState === BONDING_STATE_BONDING ) {
          // A bond is in the process of forming, so reset everything that
          // is involved in the bonding process.
          this.vibrationCounter = 0;
        }
        this.bondingState = BONDING_STATE_UNBONDED;
      },

      clone: function( movableAtom ) {
        this.shadowMovableAtom.setPosition( movableAtom.getX(), movableAtom.getY() );
        this.shadowMovableAtom.velocity = movableAtom.getVelocity();
        this.shadowMovableAtom.accel = movableAtom.getAccel();
      },

      step: function( dt ) {
        // prevent sudden dt bursts when the user comes back to the tab after a while
        dt = ( dt > 0.04 ) ? 0.04 : dt;

        if ( this.isPlaying ) {
          var adjustedDT = this.speed === 'normal' ? dt : dt * 0.33;
          this.stepInternal( adjustedDT );
        }
      },
      stepInternal: function( dt ) {
        this.handleClockTicked( dt );
      },
      handleClockTicked: function( clockEvent ) {

        // atom type doesn't really matter for the shadowMovableAtom. Position, acceleration, velocity matter though
        this.shadowMovableAtom = this.atomFactory.createAtom( DEFAULT_ATOM_TYPE );
        this.clone( this.movableAtom );

        this.updateTimeStep( clockEvent );

        // Update the forces and motion of the atoms.
        for ( var i = 0; i < CALCULATIONS_PER_TICK; i++ ) {

          // Execute the force calculation.
          this.updateForces();

          // Update the motion information (unless the atoms are bonded).
          if ( this.bondingState !== BONDING_STATE_BONDED ) {
            this.updateAtomMotion();
          }
        }

        // Update the atom that is visible to the view.
        this.syncMovableAtomWithDummy();

        // Handle inter-atom bonding.
        if ( this.movableAtom.getType() === AtomType.OXYGEN && this.fixedAtom.getType() === AtomType.OXYGEN ) {
          switch( this.bondingState ) {

            case BONDING_STATE_UNBONDED:
              if ( ( this.movableAtom.getVx() > THRESHOLD_VELOCITY ) &&
                   ( this.movableAtom.getPositionReference().distance( this.fixedAtom.getPositionReference() ) <
                     this.fixedAtom.getRadius() * 2.5 ) ) {
                // The atoms are close together and the movable one is
                // starting to move away, which is the point at which we
                // consider the bond to start forming.
                this.bondingState = BONDING_STATE_BONDING;
                this.startFixedAtomVibration();
              }
              break;

            case BONDING_STATE_BONDING:
              if ( this.attractiveForce > this.repulsiveForce ) {
                // A bond is forming and the force just exceeded the
                // repulsive force, meaning that the atom is starting
                // to pass the bottom of the well.
                this.movableAtom.setAx( 0 );
                this.movableAtom.setVx( 0 );
                this.minPotentialDistance = this.ljPotentialCalculator.calculateMinimumForceDistance();
                this.bondedOscillationRightDistance = this.minPotentialDistance +
                                                      BONDED_OSCILLATION_PROPORTION * this.movableAtom.getRadius();
                this.bondedOscillationLeftDistance =
                this.approximateEquivalentPotentialDistance( this.bondedOscillationRightDistance );
                this.bondingState = BONDING_STATE_BONDED;
                this.stepFixedAtomVibration();
              }
              break;

            case BONDING_STATE_BONDED:
              // Override the atom motion calculations and cause the atom to
              // oscillate a fixed distance from the bottom of the well.
              // This is necessary because otherwise we tend to have an
              // aliasing problem where it appears that the atom oscillates
              // for a while, then damps out, then starts up again.
              this.movableAtom.setAx( 0 );
              this.movableAtom.setVx( 0 );
              if ( this.movableAtom.getX() > this.minPotentialDistance ) {
                this.movableAtom.setPosition( this.bondedOscillationLeftDistance, 0 );
              }
              else {
                this.movableAtom.setPosition( this.bondedOscillationRightDistance, 0 );
              }

              if ( this.isFixedAtomVibrating() ) {
                this.stepFixedAtomVibration();
              }
              break;

            default:
              console.log( " - Error: Unrecognized bonding state." );
              // assert false;
              this.bondingState = BONDING_STATE_UNBONDED;
              break;
          }
        }
      },
      updateTimeStep: function( dt ) {
        this.timeStep = dt / CALCULATIONS_PER_TICK;
      },


      syncMovableAtomWithDummy: function() {
        this.movableAtom.setAx( this.shadowMovableAtom.getAx() );
        this.movableAtom.setVx( this.shadowMovableAtom.getVx() );
        this.movableAtom.setPosition( this.shadowMovableAtom.getX(), this.shadowMovableAtom.getY() );
      },

      updateForces: function() {

        var distance = this.shadowMovableAtom.getPositionReference().distance( new Vector2( 0, 0 ) );

        if ( distance < ( this.fixedAtom.getRadius() + this.movableAtom.getRadius() ) / 8 ) {
          // The atoms are too close together, and calculating the force
          // will cause unusable levels of speed later, so we limit it.
          distance = ( this.fixedAtom.getRadius() + this.movableAtom.getRadius() ) / 8;
        }

        // Calculate the force.  The result should be in newtons.
        this.attractiveForce = this.ljPotentialCalculator.calculateAttractiveLjForce( distance );
        this.repulsiveForce = this.ljPotentialCalculator.calculateRepulsiveLjForce( distance );
      },

      /**
       * Update the position, velocity, and acceleration of the dummy movable atom.
       */
      updateAtomMotion: function() {

        var mass = this.shadowMovableAtom.getMass() * 1.6605402E-27;  // Convert mass to kilograms.
        var acceleration = ( this.repulsiveForce - this.attractiveForce ) / mass;

        // Update the acceleration for the movable atom.  We do this
        // regardless of whether movement is paused so that the force vectors
        // can be shown appropriately if the user moves the atoms.
        this.shadowMovableAtom.setAx( acceleration );

        if ( !this.motionPaused ) {
          // Update the position and velocity of the atom.
          this.shadowMovableAtom.setVx( this.shadowMovableAtom.getVx() + ( acceleration * this.timeStep ) );
          var xPos = this.shadowMovableAtom.getX() + ( this.shadowMovableAtom.getVx() * this.timeStep );
          this.shadowMovableAtom.setPosition( xPos, 0 );
        }
      },

      startFixedAtomVibration: function() {
        this.vibrationCounter = VIBRATION_COUNTER_RESET_VALUE;
      },
      stepFixedAtomVibration: function() {
        if ( this.vibrationCounter > 0 ) {
          var vibrationScaleFactor = 1;
          if ( this.vibrationCounter < VIBRATION_COUNTER_RESET_VALUE / 4 ) {
            // In the last part of the vibration, starting to wind it down.
            vibrationScaleFactor = this.vibrationCounter / ( VIBRATION_COUNTER_RESET_VALUE / 4 );
          }
          if ( this.fixedAtom.getX() !== 0 ) {
            // Go back to the original position every other time.
            this.fixedAtom.setPosition( 0, 0 );
          }
          else {
            // Move some distance from the original position based on the
            // energy contained at the time of bonding.  The
            // multiplication factor in the equation below is empirically
            // determined to look good on the screen.
            var xPos = ( Math.random() * 2 - 1 ) * this.potentialWhenAtomReleased * 5e21 * vibrationScaleFactor;
            var yPos = ( Math.random() * 2 - 1 ) * this.potentialWhenAtomReleased * 5e21 * vibrationScaleFactor;
            this.fixedAtom.setPosition( xPos, yPos );
          }

          // Decrement the vibration counter.
          this.vibrationCounter--;
        }
        else if ( this.fixedAtom.getX() !== 0 ||
                  this.fixedAtom.getY() !== 0 ) {
          this.fixedAtom.setPosition( 0, 0 );
        }
      },

      /**
       * This is a highly specialized function that is used for figuring out
       * the inter-atom distance at which the value of the potential on the left
       * side of the of the min of the LJ potential curve is equal to that at the
       * given distance to the right of the min of the LJ potential curve.
       *
       * @param distance - inter-atom distance, must be greater than the point at
       * which the potential is at the minimum value.
       * @return
       */


      approximateEquivalentPotentialDistance: function( distance ) {

        if ( distance < this.ljPotentialCalculator.calculateMinimumForceDistance() ) {
          console.log( "- Error: Distance value out of range." );
          return 0;
        }

        // Iterate by a fixed amount until a reasonable value is found.
        var totalSpanDistance = distance - this.ljPotentialCalculator.getSigma();
        var distanceChangePerIteration = totalSpanDistance / MAX_APPROXIMATION_ITERATIONS;
        var targetPotential = this.ljPotentialCalculator.calculateLjPotential( distance );
        var equivalentPotentialDistance = this.ljPotentialCalculator.calculateMinimumForceDistance();
        for ( var i = 0; i < MAX_APPROXIMATION_ITERATIONS; i++ ) {
          if ( this.ljPotentialCalculator.calculateLjPotential( equivalentPotentialDistance ) > targetPotential ) {
            // We've crossed over to where the potential is less negative.
            // Close enough.
            break;
          }
          equivalentPotentialDistance -= distanceChangePerIteration;
        }

        return equivalentPotentialDistance;
      },

      isFixedAtomVibrating: function() {
        return this.vibrationCounter > 0;
      }

    },
    {
      BONDING_STATE_UNBONDED: BONDING_STATE_UNBONDED,
      BONDING_STATE_BONDING: BONDING_STATE_BONDING,
      BONDING_STATE_BONDED: BONDING_STATE_BONDED
    } );
} );
