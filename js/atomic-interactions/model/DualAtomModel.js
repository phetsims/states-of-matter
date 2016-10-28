// Copyright 2015, University of Colorado Boulder

/**
 * This is the model for two atoms interacting with a Lennard-Jones interaction potential.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var BondingState = require( 'STATES_OF_MATTER/atomic-interactions/model/BondingState' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );
  var LjPotentialCalculator = require( 'STATES_OF_MATTER/common/model/LjPotentialCalculator' );
  var InteractionStrengthTable = require( 'STATES_OF_MATTER/common/model/InteractionStrengthTable' );
  var SigmaTable = require( 'STATES_OF_MATTER/common/model/SigmaTable' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var AtomFactory = require( 'STATES_OF_MATTER/common/model/AtomFactory' );
  var AtomPair = require( 'STATES_OF_MATTER/atomic-interactions/model/AtomPair' );

  // constants
  var BONDED_OSCILLATION_PROPORTION = 0.06; // Proportion of atom radius.
  var DEFAULT_ATOM_TYPE = AtomType.NEON;
  var MAX_APPROXIMATION_ITERATIONS = 100;
  var BONDING_THRESHOLD_VELOCITY = 100;  // Used to distinguish small oscillations from real movement, empirically determined.
  var FIXED_ATOM_VIBRATION_TIME = 2; // seconds
  var FIXED_ATOM_JUMP_PERIOD = 2 * ( 1 / 60 ); // in seconds, intended to work well with 60 Hz frame rate
  var MOVABLE_ATOM_OSCILLATION_PERIOD = 4 * ( 1 / 60 ); // in seconds, intended to work well with 60 Hz frame rate
  var MAX_ATOM_VELOCITY = 10000; // used to limit velocity so that atom doesn't move so quickly that it can't be seen
  var ESCAPE_POTENTIAL_THRESHOLD = 5E-18; // empirically determined

  // The maximum time step was empirically determined to be as large as possible while still making sure that energy
  // is conserved in all interaction cases.  See https://github.com/phetsims/states-of-matter/issues/53 for more info.
  var MAX_TIME_STEP = 0.005;

  /**
   * @constructor
   */
  function DualAtomModel() {

    var self = this;

    //-----------------------------------------------------------------------------------------------------------------
    // observable model properties
    //-----------------------------------------------------------------------------------------------------------------

    // @public
    this.interactionStrengthProperty = new Property( 100 ); // Epsilon/k-Boltzmann is in Kelvin.
    this.motionPausedProperty = new Property( false );
    this.atomPairProperty = new Property( AtomPair.NEON_NEON );
    this.isPlayingProperty = new Property( true );
    this.speedProperty = new Property( 'normal' );
    this.atomDiameterProperty = new Property( 300 );
    this.forcesDisplayModeProperty = new Property( 'hideForces' );
    this.forcesControlPanelExpandedProperty = new Property( false );

    //-----------------------------------------------------------------------------------------------------------------
    // other model attributes
    //-----------------------------------------------------------------------------------------------------------------

    // TODO: viz annotations
    this.fixedAtom = null;
    this.movableAtom = null;
    this.settingBothAtomTypes = false;  // Flag used to prevent getting in disallowed state.
    this.bondingState = BondingState.UNBONDED; // Tracks whether the atoms have formed a chemical bond.
    this.fixedAtomVibrationCountdown = 0; // Used to vibrate fixed atom during bonding.
    this.movableAtomVibrationCountdown = 0; // Used to vibrate movable atom during bonding and when bonded.
    this.potentialWhenAtomReleased = 0; // Used to set magnitude of vibration.
    this.atomFactory = AtomFactory;
    this.isHandNodeVisible = true; // indicate moving hand node visible or not
    this.ljPotentialCalculator = new LjPotentialCalculator(
      StatesOfMatterConstants.MIN_SIGMA,
      StatesOfMatterConstants.MIN_EPSILON
    );
    this.residualTime = 0; // accumulates dt values not yet applied to model
    this.justReleased = false;

    //-----------------------------------------------------------------------------------------------------------------
    // other initialization
    //-----------------------------------------------------------------------------------------------------------------

    // update the atom pair when the atom pair property is set
    this.atomPairProperty.link( function( atomPair ) {
      switch( atomPair ) {
        case AtomPair.NEON_NEON:
          self.setBothAtomTypes( AtomType.NEON );
          break;

        case AtomPair.ARGON_ARGON:
          self.setBothAtomTypes( AtomType.ARGON );
          break;

        case AtomPair.OXYGEN_OXYGEN:
          self.setBothAtomTypes( AtomType.OXYGEN );
          break;

        case AtomPair.NEON_ARGON:
          self.settingBothAtomTypes = true;
          self.setFixedAtomType( AtomType.NEON );
          self.setMovableAtomType( AtomType.ARGON );
          self.settingBothAtomTypes = false;
          break;

        case AtomPair.NEON_OXYGEN:
          self.settingBothAtomTypes = true;
          self.setFixedAtomType( AtomType.NEON );
          self.setMovableAtomType( AtomType.OXYGEN );
          self.settingBothAtomTypes = false;
          break;

        case AtomPair.ARGON_OXYGEN:
          self.settingBothAtomTypes = true;
          self.setFixedAtomType( AtomType.ARGON );
          self.setMovableAtomType( AtomType.OXYGEN );
          self.settingBothAtomTypes = false;
          break;

        case AtomPair.ADJUSTABLE:
          self.setBothAtomTypes( AtomType.ADJUSTABLE );
          break;

        default:
          throw new Error( 'invalid atomPair: ' + atomPair );
      } //end of switch
    } );

    // Put the model into its initial state.
    this.reset();
  }

  statesOfMatter.register( 'DualAtomModel', DualAtomModel );

  return inherit( Object, DualAtomModel, {

    /**
     * @returns {StatesOfMatterAtom/null}
     * @public
     */
    getFixedAtomRef: function() {
      return this.fixedAtom;
    },

    /**
     * @returns {StatesOfMatterAtom/null}
     * @public
     */
    getMovableAtomRef: function() {
      return this.movableAtom;
    },

    /**
     * @returns {number}
     * @public
     */
    getAttractiveForce: function() {
      return this.attractiveForce;
    },

    /**
     * @returns {number}
     * @public
     */
    getRepulsiveForce: function() {
      return this.repulsiveForce;
    },

    /**
     * @returns {string}
     * @public
     */
    getFixedAtomType: function() {
      return this.fixedAtom.getType();
    },

    /**
     * @returns {string}
     * @public
     */
    getMovableAtomType: function() {
      return this.movableAtom.getType();
    },

    /***
     * @returns {boolean}
     * @public
     */
    getMotionPaused: function() {
      return this.motionPaused;
    },

    /**
     * @param {string} atomType -  indicates type of molecule
     * @private
     */
    setFixedAtomType: function( atomType ) {

      if ( this.fixedAtom === null || this.fixedAtom.getType() !== atomType ) {

        // make sure that a legal configuration is being set
        assert && assert( this.settingBothAtomTypes ||
                          ( ( atomType === AtomType.ADJUSTABLE && this.movableAtom.getType() === AtomType.ADJUSTABLE ) ||
                          ( atomType !== AtomType.ADJUSTABLE && this.movableAtom.getType() !== AtomType.ADJUSTABLE ) ),
          'Error: Cannot set just one atom to be adjustable'
        );

        this.ensureValidAtomType( atomType );
        this.bondingState = BondingState.UNBONDED;

        if ( this.fixedAtom !== null ) {
          this.fixedAtom = null;
        }

        this.fixedAtom = this.atomFactory.createAtom( atomType );

        // Set the value for sigma used in the LJ potential calculations.
        if ( this.movableAtom !== null ) {
          this.ljPotentialCalculator.setSigma( SigmaTable.getSigma( this.getFixedAtomType(),
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

    /**
     * @param {string} atomType - indicates type of molecule
     * @private
     */
    setMovableAtomType: function( atomType ) {

      if ( this.movableAtom === null || this.movableAtom.getType() !== atomType ) {

        assert && assert( this.settingBothAtomTypes ||
                          ( ( atomType === AtomType.ADJUSTABLE && this.fixedAtom.getType() === AtomType.ADJUSTABLE ) ||
                          ( atomType !== AtomType.ADJUSTABLE && this.fixedAtom.getType() !== AtomType.ADJUSTABLE ) ),
          'Error: Cannot set just one atom to be adjustable'
        );

        this.ensureValidAtomType( atomType );
        this.bondingState = BondingState.UNBONDED;

        if ( this.movableAtom !== null ) {
          this.movableAtom = null;
        }

        this.movableAtom = this.atomFactory.createAtom( atomType );

        // Set the value for sigma used in the LJ potential calculations.
        if ( this.movableAtom !== null ) {
          this.ljPotentialCalculator.setSigma( SigmaTable.getSigma( this.getFixedAtomType(),
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

    /**
     * @param {string} atomType - indicates type of molecule
     * @public
     */
    ensureValidAtomType: function( atomType ) {
      // Verify that this is a supported value.
      assert && assert( ( atomType === AtomType.NEON ) ||
                        ( atomType === AtomType.ARGON ) ||
                        ( atomType === AtomType.OXYGEN ) ||
                        ( atomType === AtomType.ADJUSTABLE ),
        'Error: Unsupported atom type.' );
    },

    /**
     * @param {string} atomType
     * @private
     */
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
     * Set the sigma value, a.k.a. the Atomic Diameter Parameter, for the adjustable atom.  This is one of the two
     * parameters that are used for calculating the Lennard-Jones potential. If an attempt is made to set this value
     * when the adjustable atom is not selected, it is ignored.
     * @param {number}sigma - distance parameter
     * @public
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
     * Get the value of the sigma parameter that is being used for the motion calculations.  If the atoms are the
     * same, it will be the diameter of one atom.  If they are not, it will be a function of the diameters.
     * @return {number}
     * @public
     */
    getSigma: function() {
      return this.ljPotentialCalculator.getSigma();
    },

    /**
     * Set the epsilon value, a.k.a. the Interaction Strength Parameter, which is one of the two parameters that
     * describes the Lennard-Jones potential.
     * @param {number}epsilon - interaction strength parameter
     * @public
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
     * Get the epsilon value, a.k.a. the Interaction Strength Parameter, which is one of the two parameters that
     * describes the Lennard-Jones potential.
     * @returns {number}
     * @public
     */
    getEpsilon: function() {
      return this.ljPotentialCalculator.getEpsilon();
    },

    /**
     * @returns {number}
     * @public
     */
    getBondingState: function() {
      return this.bondingState;
    },

    /**
     * @param {boolean} paused -  is to set particle motion
     * @public
     */
    setMotionPaused: function( paused ) {
      this.motionPausedProperty.set( paused );
      this.movableAtom.setVx( 0 );
      if ( !paused ) {
        // The atom is being released by the user.  Record the amount of energy that the atom has at this point in
        // time for later use.  The calculation is made be evaluating the force at the current location and
        // multiplying it by the distance to the point where the LJ potential is minimized.  Note that this is not
        // precisely correct, since the potential is not continuous, but is close enough for our purposes.
        this.potentialWhenAtomReleased =
          this.ljPotentialCalculator.calculatePotentialEnergy( this.movableAtom.getPositionReference().distance(
            this.fixedAtom.getPositionReference() ) );

        // set a flag that indicates that this was just released, which will be used by the bonding update method
        this.justReleased = true;
      }
    },

    /**
     * Release the bond that exists between the two atoms (if there is one).
     * @public
     */
    releaseBond: function() {
      if ( this.bondingState === BondingState.BONDING ) {
        // A bond is in the process of forming, so reset everything that is involved in the bonding process.
        this.fixedAtomVibrationCountdown = 0;
      }
      this.bondingState = BondingState.UNBONDED;
    },

    /**
     * @override
     * @public
     */
    reset: function() {

      // reset the observable properties
      this.interactionStrengthProperty.reset();
      this.motionPausedProperty.reset();
      this.atomPairProperty.reset();
      this.isPlayingProperty.reset();
      this.speedProperty.reset();
      this.atomDiameterProperty.reset();
      this.forcesDisplayModeProperty.reset();
      this.forcesControlPanelExpandedProperty.reset();

      // set the default atom types
      if ( this.fixedAtom === null || this.fixedAtom.getType() !== DEFAULT_ATOM_TYPE ||
           this.movableAtom === null || this.movableAtom.getType() !== DEFAULT_ATOM_TYPE ) {
        this.setBothAtomTypes( DEFAULT_ATOM_TYPE );
      }
      else {
        this.resetMovableAtomPos();
      }

      // make sure we are not paused
      this.motionPausedProperty.set( false );
    },

    /**
     * Put the movable atom back to the location where the force is minimized, and reset the velocity and
     * acceleration to 0.
     * @public
     */
    resetMovableAtomPos: function() {
      if ( this.movableAtom !== null ) {
        this.movableAtom.setPosition( this.ljPotentialCalculator.calculateMinimumForceDistance(), 0 );
        this.movableAtom.setVx( 0 );
        this.movableAtom.setAx( 0 );
      }
    },

    /**
     * Called by the animation loop.
     * @param {number} simulationTimeStep -- time in seconds
     * @public
     */
    step: function( simulationTimeStep ) {

      // If simulationTimeStep is excessively large, ignore it - it probably means the user returned to the tab after
      // the tab or the browser was hidden for a while.
      if ( simulationTimeStep > 1.0 ) {
        return;
      }

      if ( this.isPlayingProperty.get() ) {

        // Using real world time for this results in the atoms moving a little slowly, so the time step is adjusted
        // here.  The multipliers were empirically determined.
        var adjustedTimeStep;
        switch( this.speedProperty.get() ) {
          case 'normal':
            adjustedTimeStep = simulationTimeStep * 2;
            break;
          case 'slow':
            adjustedTimeStep = simulationTimeStep * 0.5;
            break;
          default:
            assert( false, 'invalid setting for model speed' );
        }

        this.stepInternal( adjustedTimeStep );
      }
    },

    /**
     * @param {number} dt -- time in seconds
     * @private
     */
    stepInternal: function( dt ) {

      var numInternalModelIterations = 1;
      var modelTimeStep = dt;

      // if the time step is bigger than the max allowed, set up multiple iterations of the model
      if ( dt > MAX_TIME_STEP ) {
        numInternalModelIterations = dt / MAX_TIME_STEP;
        this.residualTime += dt - ( numInternalModelIterations * MAX_TIME_STEP );
        modelTimeStep = MAX_TIME_STEP;
      }

      // If residual time has accumulated enough, add an iteration.
      if ( this.residualTime > modelTimeStep ) {
        numInternalModelIterations++;
        this.residualTime -= modelTimeStep;
      }

      // Update the forces and motion of the atoms.
      for ( var i = 0; i < numInternalModelIterations; i++ ) {

        // Execute the force calculation.
        this.updateForces();

        // Update the motion information (unless the atoms are bonded).
        if ( this.bondingState !== BondingState.BONDED ) {
          this.updateAtomMotion( modelTimeStep );
        }

        // Update the bonding state (only affects some combinations of atoms).
        this.updateBondingState( dt );
      }

      this.stepAtomVibration( dt );
    },

    /**
     * Called when the movable atom is moved
     * @public
     */
    positionChanged: function() {
      if ( this.motionPausedProperty.get() ) {
        // The user must be moving the atom from the view. Update the forces correspondingly.
        this.updateForces();
      }
    },

    /**
     * @private
     */
    updateForces: function() {

      var distance = this.movableAtom.getPositionReference().distance( Vector2.ZERO );

      if ( distance < ( this.fixedAtom.getRadius() + this.movableAtom.getRadius() ) / 8 ) {

        // The atoms are too close together, and calculating the force will cause unusable levels of speed later, so
        // we limit it.
        distance = ( this.fixedAtom.getRadius() + this.movableAtom.getRadius() ) / 8;
      }

      // Calculate the force.  The result should be in newtons.
      this.attractiveForce = this.ljPotentialCalculator.calculateAttractiveLjForce( distance );
      this.repulsiveForce = this.ljPotentialCalculator.calculateRepulsiveLjForce( distance );
    },

    /**
     * Update the position, velocity, and acceleration of the dummy movable atom.
     * @private
     */
    updateAtomMotion: function( dt ) {

      var mass = this.movableAtom.getMass() * 1.6605402E-27;  // Convert mass to kilograms.
      var acceleration = ( this.repulsiveForce - this.attractiveForce ) / mass;

      // Update the acceleration for the movable atom.  We do this regardless of whether movement is paused so that
      // the force vectors can be shown appropriately if the user moves the atoms.
      this.movableAtom.setAx( acceleration );

      if ( !this.motionPausedProperty.get() ) {

        // Calculate tne new velocity.
        var newVelocity = this.movableAtom.getVx() + ( acceleration * dt );

        // If the velocity gets too large, the atom can get away before the bond can be tested, and it will appear to
        // vanish from the screen, so we limit it here to an empirically determined max value.
        newVelocity = Math.min( newVelocity, MAX_ATOM_VELOCITY );

        // Update the position and velocity of the atom.
        this.movableAtom.setVx( newVelocity );
        var xPos = this.movableAtom.getX() + ( this.movableAtom.getVx() * dt );
        this.movableAtom.setPosition( xPos, 0 );
      }
    },

    updateBondingState: function() {
      if ( this.movableAtom.getType() === AtomType.OXYGEN && this.fixedAtom.getType() === AtomType.OXYGEN ) {
        switch( this.bondingState ) {

          case BondingState.UNBONDED:
            if ( ( this.movableAtom.getVx() > BONDING_THRESHOLD_VELOCITY ) &&
                 ( this.movableAtom.getPositionReference().distance( this.fixedAtom.getPositionReference() ) <
                   this.fixedAtom.getRadius() * 2.5 ) ) {

              if ( this.justReleased && this.potentialWhenAtomReleased > ESCAPE_POTENTIAL_THRESHOLD ) {
                // the user just released the movable atom in an area of relatively high potential, so let it escape
                this.bondingState = BondingState.ALLOWING_ESCAPE;
              }
              else {
                // The atoms are close together and the movable one is starting to move away, and the potential does
                // not exceed the escape threshold, so we consider this to be the start of bond formation.
                this.bondingState = BondingState.BONDING;
                this.startFixedAtomVibration();
              }
            }
            break;

          case BondingState.BONDING:
            if ( this.attractiveForce > this.repulsiveForce ) {

              // A bond is forming and the force just exceeded the repulsive force, meaning that the atom is starting
              // to pass the bottom of the well.
              this.movableAtom.setAx( 0 );
              this.movableAtom.setVx( 0 );
              this.minPotentialDistance = this.ljPotentialCalculator.calculateMinimumForceDistance();
              this.bondedOscillationRightDistance = this.minPotentialDistance +
                                                    BONDED_OSCILLATION_PROPORTION * this.movableAtom.getRadius();
              this.bondedOscillationLeftDistance = this.approximateEquivalentPotentialDistance(
                this.bondedOscillationRightDistance );
              this.bondingState = BondingState.BONDED;
              this.movableAtomVibrationCountdown = 0;
            }
            break;

          case BondingState.BONDED:
            // Nothing done here, bonded state ends when user grabs atom or performs a reset.
            break;

          case BondingState.ALLOWING_ESCAPE:
            // Nothing done here, this state ends when user grabs atom or performs a reset.
            break;

          default:
            assert && assert( false, 'invalid bonding state' );
            break;
        }
      }

      // clear the flag that indicates whether the atom was just released by the user
      this.justReleased = false;
    },

    /**
     * @private
     */
    startFixedAtomVibration: function() {
      this.fixedAtomVibrationCountdown = FIXED_ATOM_VIBRATION_TIME;
      this.timeSinceLastFixedAtomJump = Number.POSITIVE_INFINITY;
    },

    /**
     * Make the atoms appear to vibrate if they are in the correct state.
     * @private
     */
    stepAtomVibration: function( dt ) {

      // handle movable atom vibration
      if ( this.bondingState === BondingState.BONDED ) {

        // Override the atom motion calculations and cause the atom to oscillate a fixed distance from the bottom
        // of the well. This is necessary because otherwise we tend to have an aliasing problem where it appears
        // that the atom oscillates for a while, then damps out, then starts up again.
        this.movableAtom.setAx( 0 );
        this.movableAtom.setVx( 0 );
        this.movableAtomVibrationCountdown -= dt;
        if ( this.movableAtomVibrationCountdown <= 0 ) {
          if ( this.movableAtom.getX() > this.minPotentialDistance ) {
            this.movableAtom.setPosition( this.bondedOscillationLeftDistance, 0 );
          }
          else {
            this.movableAtom.setPosition( this.bondedOscillationRightDistance, 0 );
          }
          this.movableAtomVibrationCountdown = MOVABLE_ATOM_OSCILLATION_PERIOD;
        }
      }

      // handle the fixed atom vibration
      if ( ( this.bondingState === BondingState.BONDING || this.bondingState === BondingState.BONDED ) &&
           this.fixedAtomVibrationCountdown > 0 ) {

        if ( this.timeSinceLastFixedAtomJump > FIXED_ATOM_JUMP_PERIOD ) {
          this.timeSinceLastFixedAtomJump = 0;
          var vibrationScaleFactor = 1;

          if ( this.fixedAtomVibrationCountdown < FIXED_ATOM_VIBRATION_TIME / 4 ) {
            // In the last part of the vibration, starting to wind it down.
            vibrationScaleFactor = this.fixedAtomVibrationCountdown / ( FIXED_ATOM_VIBRATION_TIME / 4 );
          }

          if ( this.fixedAtom.getX() !== 0 ) {
            // Go back to the original position every other time.
            this.fixedAtom.setPosition( 0, 0 );
          }
          else {
            // Calculate the max motion amount based on the amount of potential in the bond.  The multiplier was
            // empirically determined.
            var maxMovement = Math.min( this.potentialWhenAtomReleased * 5e19, this.fixedAtom.radius / 2 ) *
                              vibrationScaleFactor;

            // Move some distance from the original position, but only move away from the movable atom so that we don't
            // end up creating high repulsive forces.
            var xPos = -phet.joist.random.nextDouble() * maxMovement;
            var yPos = ( phet.joist.random.nextDouble() * 2 - 1 ) * maxMovement;
            this.fixedAtom.setPosition( xPos, yPos );
          }
        }
        else {
          this.timeSinceLastFixedAtomJump += dt;
        }

        // Decrement the vibration countdown value.
        this.fixedAtomVibrationCountdown -= dt;
      }
      else if ( this.fixedAtom.getX() !== 0 || this.fixedAtom.getY() !== 0 ) {
        this.fixedAtom.setPosition( 0, 0 );
      }
    },

    /**
     * This is a highly specialized function that is used for figuring out the inter-atom distance at which the value
     * of the potential on the left side of the of the min of the LJ potential curve is equal to that at the given
     * distance to the right of the min of the LJ potential curve.
     * @param {number} distance - inter-atom distance, must be greater than the point at which the potential is at the
     * minimum value.
     * @return{number}
     * @private
     */
    approximateEquivalentPotentialDistance: function( distance ) {

      assert && assert(
        distance >= this.ljPotentialCalculator.calculateMinimumForceDistance(),
        'Error: Distance value out of range.'
      );

      // Iterate by a fixed amount until a reasonable value is found.
      var totalSpanDistance = distance - this.ljPotentialCalculator.getSigma();
      var distanceChangePerIteration = totalSpanDistance / MAX_APPROXIMATION_ITERATIONS;
      var targetPotential = this.ljPotentialCalculator.calculateLjPotential( distance );
      var equivalentPotentialDistance = this.ljPotentialCalculator.calculateMinimumForceDistance();
      for ( var i = 0; i < MAX_APPROXIMATION_ITERATIONS; i++ ) {
        if ( this.ljPotentialCalculator.calculateLjPotential( equivalentPotentialDistance ) > targetPotential ) {
          // We've crossed over to where the potential is less negative. Close enough.
          break;
        }
        equivalentPotentialDistance -= distanceChangePerIteration;
      }

      return equivalentPotentialDistance;
    }
  } );
} );
