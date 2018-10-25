// Copyright 2015-2017, University of Colorado Boulder

/**
 * This is the model for two atoms interacting with a Lennard-Jones interaction potential.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var AtomFactory = require( 'STATES_OF_MATTER/common/model/AtomFactory' );
  var AtomPair = require( 'STATES_OF_MATTER/atomic-interactions/model/AtomPair' );
  var AtomType = require( 'STATES_OF_MATTER/common/model/AtomType' );
  var inherit = require( 'PHET_CORE/inherit' );
  var InteractionStrengthTable = require( 'STATES_OF_MATTER/common/model/InteractionStrengthTable' );
  var LjPotentialCalculator = require( 'STATES_OF_MATTER/common/model/LjPotentialCalculator' );
  var Property = require( 'AXON/Property' );
  var SigmaTable = require( 'STATES_OF_MATTER/common/model/SigmaTable' );
  var SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var DEFAULT_ATOM_TYPE = AtomType.NEON;

  // The maximum time step was empirically determined to be as large as possible while still making sure that energy
  // is conserved in all interaction cases.  See https://github.com/phetsims/states-of-matter/issues/53 for more info.
  var MAX_TIME_STEP = 0.005; // in seconds

  /**
   * @constructor
   */
  function DualAtomModel() {

    var self = this;

    //-----------------------------------------------------------------------------------------------------------------
    // observable model properties
    //-----------------------------------------------------------------------------------------------------------------

    // @public, read-write
    this.interactionStrengthProperty = new Property( 100 ); // Epsilon/k-Boltzmann is in Kelvin.
    this.motionPausedProperty = new Property( false );
    this.atomPairProperty = new Property( AtomPair.NEON_NEON );
    this.isPlayingProperty = new Property( true );
    this.simSpeedProperty = new Property( 'normal' );
    this.atomDiameterProperty = new Property( 300 );
    this.forcesDisplayModeProperty = new Property( 'hideForces' );
    this.forcesControlPanelExpandedProperty = new Property( false );
    this.movementHintVisibleProperty = new Property( true );

    //-----------------------------------------------------------------------------------------------------------------
    // other model attributes
    //-----------------------------------------------------------------------------------------------------------------

    // @public, read only
    this.fixedAtom = null;
    this.movableAtom = null;
    this.attractiveForce = 0;
    this.repulsiveForce = 0;

    // @private
    this.settingBothAtomTypes = false;  // Flag used to prevent getting in disallowed state.
    this.ljPotentialCalculator = new LjPotentialCalculator( SOMConstants.MIN_SIGMA, SOMConstants.MIN_EPSILON );
    this.residualTime = 0; // accumulates dt values not yet applied to model

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
     * @param {AtomType} atomType
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

        if ( this.fixedAtom !== null ) {
          this.fixedAtom = null;
        }

        this.fixedAtom = AtomFactory.createAtom( atomType );

        // Set the value for sigma used in the LJ potential calculations.
        if ( this.movableAtom !== null ) {
          this.ljPotentialCalculator.setSigma(
            SigmaTable.getSigma( this.fixedAtom.getType(), this.movableAtom.getType() )
          );
        }

        // If both atoms exist, set the value of epsilon.
        if ( this.movableAtom !== null ) {
          this.ljPotentialCalculator.setEpsilon(
            InteractionStrengthTable.getInteractionPotential( this.fixedAtom.getType(), this.movableAtom.getType() )
          );
        }

        this.fixedAtom.setPosition( 0, 0 );
        this.resetMovableAtomPos();
      }
    },

    /**
     * @param {AtomType} atomType
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

        if ( this.movableAtom !== null ) {
          this.movableAtom = null;
        }

        this.movableAtom = AtomFactory.createAtom( atomType );

        // Set the value for sigma used in the LJ potential calculations.
        if ( this.movableAtom !== null ) {
          this.ljPotentialCalculator.setSigma(
            SigmaTable.getSigma( this.fixedAtom.getType(), this.movableAtom.getType() )
          );
        }

        // If both atoms exist, set the value of epsilon.
        if ( this.fixedAtom !== null ) {
          this.ljPotentialCalculator.setEpsilon(
            InteractionStrengthTable.getInteractionPotential( this.fixedAtom.getType(), this.movableAtom.getType() ) );
        }
        this.resetMovableAtomPos();
      }
    },

    /**
     * @param {AtomType} atomType
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
     * @param {AtomType} atomType
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

        if ( sigma > SOMConstants.MAX_SIGMA ) {
          sigma = SOMConstants.MAX_SIGMA;
        }
        else if ( sigma < SOMConstants.MIN_SIGMA ) {
          sigma = SOMConstants.MIN_SIGMA;
        }
        this.ljPotentialCalculator.setSigma( sigma );
        this.movableAtom.setPosition( this.ljPotentialCalculator.calculateMinimumForceDistance(), 0 );
        this.fixedAtom.setRadius( sigma / 2 );
        this.movableAtom.setRadius( sigma / 2 );
      }
    },

    /**
     * Get the value of the sigma parameter that is being used for the motion calculations.  If the atoms are the same,
     * it will be the diameter of one atom.  If they are not, it will be a function of the diameters.
     * @returns {number}
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

      if ( epsilon < SOMConstants.MIN_EPSILON ) {
        epsilon = SOMConstants.MIN_EPSILON;
      }
      else if ( epsilon > SOMConstants.MAX_EPSILON ) {
        epsilon = SOMConstants.MAX_EPSILON;
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
     * @param {boolean} paused -  is to set particle motion
     * @public
     */
    setMotionPaused: function( paused ) {
      this.motionPausedProperty.set( paused );
      this.movableAtom.setVx( 0 );
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
      this.simSpeedProperty.reset();
      this.atomDiameterProperty.reset();
      this.forcesDisplayModeProperty.reset();
      this.forcesControlPanelExpandedProperty.reset();
      this.movementHintVisibleProperty.reset();

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
        switch( this.simSpeedProperty.get() ) {
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

        // Update the motion information.
        this.updateAtomMotion( modelTimeStep );
      }
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

        // Update the position and velocity of the atom.
        this.movableAtom.setVx( newVelocity );
        var xPos = this.movableAtom.getX() + ( this.movableAtom.getVx() * dt );
        this.movableAtom.setPosition( xPos, 0 );
      }
    }
  } );
} );
