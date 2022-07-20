// Copyright 2015-2022, University of Colorado Boulder

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import AtomType from '../../common/model/AtomType.js';
import InteractionStrengthTable from '../../common/model/InteractionStrengthTable.js';
import LjPotentialCalculator from '../../common/model/LjPotentialCalculator.js';
import SigmaTable from '../../common/model/SigmaTable.js';
import SOMConstants from '../../common/SOMConstants.js';
import statesOfMatter from '../../statesOfMatter.js';
import AtomPair from './AtomPair.js';
import ForceDisplayMode from './ForceDisplayMode.js';
import MotionAtom from './MotionAtom.js';

//---------------------------------------------------------------------------------------------------------------------
// constants
//---------------------------------------------------------------------------------------------------------------------

// Using normal dt values results in motion that is a bit slow, these multipliers are used to adjust that.
const NORMAL_MOTION_TIME_MULTIPLIER = 2;
const SLOW_MOTION_TIME_MULTIPLIER = 0.5;

// The maximum time step was empirically determined to be as large as possible while still making sure that energy
// is conserved in all interaction cases.  See https://github.com/phetsims/states-of-matter/issues/53 for more info.
const MAX_TIME_STEP = 0.005; // in seconds

// valid values in reduced usage scenario
const VALID_ATOM_PAIRS_FOR_REDUCED = [ AtomPair.NEON_NEON, AtomPair.ARGON_ARGON, AtomPair.ADJUSTABLE ];

// threshold used for limiting force to zero to prevent jitter, empirically determined
const MIN_FORCE_JITTER_THRESHOLD = 1e-30;

/**
 * model for two atoms interacting with a Lennard-Jones interaction potential
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
class DualAtomModel {

  /**
   * @param {Tandem} tandem
   * @param {boolean} enableHeterogeneousMolecules
   */
  constructor( tandem, enableHeterogeneousMolecules = true ) {

    //-----------------------------------------------------------------------------------------------------------------
    // observable model properties
    //-----------------------------------------------------------------------------------------------------------------

    // @public (read-write) - epsilon/k-Boltzmann is in Kelvin.
    this.adjustableAtomInteractionStrengthProperty = new NumberProperty( 100, {
      tandem: tandem.createTandem( 'adjustableAtomInteractionStrengthProperty' ),
      phetioReadOnly: true,
      units: 'K',
      phetioDocumentation: 'intermolecular potential for the "Adjustable Attraction" atoms - this is a parameter in the Lennard-Jones potential equation'
    } );

    // @public (read-write) - indicates when motion is paused due to user interaction with the movable atom
    this.motionPausedProperty = new BooleanProperty( false );

    // @public (read-write)
    this.atomPairProperty = new EnumerationDeprecatedProperty( AtomPair, AtomPair.NEON_NEON, {
      validValues: enableHeterogeneousMolecules ? AtomPair.VALUES : VALID_ATOM_PAIRS_FOR_REDUCED,
      tandem: tandem.createTandem( 'atomPairProperty' )
    } );

    // @public (read-write) - paused or playing
    this.isPlayingProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isPlayingProperty' )
    } );

    // @public (read-write) - speed at which the model is running
    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed.NORMAL, {
      validValues: [ TimeSpeed.NORMAL, TimeSpeed.SLOW ],
      tandem: tandem.createTandem( 'timeSpeedProperty' )
    } );

    // @public (read-write) - diameter of the adjustable atoms
    this.adjustableAtomDiameterProperty = new NumberProperty( SOMConstants.ADJUSTABLE_ATTRACTION_DEFAULT_RADIUS * 2, {
      units: 'pm',
      tandem: tandem.createTandem( 'adjustableAtomDiameterProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'Diameter of the adjustable atom, in picometers'
    } );

    // @public (read-write)
    this.forcesDisplayModeProperty = new EnumerationDeprecatedProperty( ForceDisplayMode, ForceDisplayMode.HIDDEN, {
      tandem: tandem.createTandem( 'forcesDisplayModeProperty' )
    } );

    // @public (read-write)
    this.forcesExpandedProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'forcesExpandedProperty' )
    } );

    // @public (read-write)
    this.movementHintVisibleProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'movementHintVisibleProperty' )
    } );

    //-----------------------------------------------------------------------------------------------------------------
    // other model attributes
    //-----------------------------------------------------------------------------------------------------------------

    // @public, read only
    this.fixedAtom = new MotionAtom( AtomType.NEON, 0, 0, tandem.createTandem( 'fixedAtom' ) );
    this.movableAtom = new MotionAtom( AtomType.NEON, 0, 0, tandem.createTandem( 'movableAtom' ) );
    this.attractiveForce = 0;
    this.repulsiveForce = 0;

    // @private
    this.ljPotentialCalculator = new LjPotentialCalculator( SOMConstants.MIN_SIGMA, SOMConstants.MIN_EPSILON );
    this.residualTime = 0; // accumulates dt values not yet applied to model

    //-----------------------------------------------------------------------------------------------------------------
    // other initialization
    //-----------------------------------------------------------------------------------------------------------------

    // update the atom pair when the atom pair property is set
    this.atomPairProperty.link( atomPair => {
      this.fixedAtom.atomTypeProperty.set( atomPair.fixedAtomType );
      this.movableAtom.atomTypeProperty.set( atomPair.movableAtomType );
      this.ljPotentialCalculator.setSigma(
        SigmaTable.getSigma( this.fixedAtom.getType(), this.movableAtom.getType() )
      );

      // update the value of epsilon
      this.ljPotentialCalculator.setEpsilon(
        InteractionStrengthTable.getInteractionPotential( this.fixedAtom.getType(), this.movableAtom.getType() )
      );

      // reset other initial state variables
      if ( !phet.joist.sim.isSettingPhetioStateProperty.value ) {

        // only reset position if this is not a phet-io state update, otherwise this overwrites particle position
        this.resetMovableAtomPos();
      }
      this.updateForces();
    } );

    // update the LJ potential parameters when the adjustable attraction atom is in use
    Multilink.multilink(
      [ this.atomPairProperty, this.adjustableAtomInteractionStrengthProperty, this.adjustableAtomDiameterProperty ],
      ( atomPair, interactionStrength, atomDiameter ) => {
        if ( atomPair === AtomPair.ADJUSTABLE ) {
          this.setEpsilon( interactionStrength );
          this.setAdjustableAtomSigma( atomDiameter );
        }
        this.updateForces();
      }
    );

    // update the forces acting on the atoms when the movable atom changes position
    this.movableAtom.positionProperty.link( this.updateForces.bind( this ) );
  }

  /**
   * Set the sigma value, a.k.a. the Atomic Diameter Parameter, for the adjustable atom.  This is one of the two
   * parameters that are used for calculating the Lennard-Jones potential. If an attempt is made to set this value
   * when the adjustable atom is not selected, it is ignored.
   * @param {number}sigma - distance parameter
   * @public
   */
  setAdjustableAtomSigma( sigma ) {
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
      this.fixedAtom.radiusProperty.set( sigma / 2 );
      this.movableAtom.radiusProperty.set( sigma / 2 );

      // move the atom to the minimum force distance from the fixed atom (but not if this is a phet-io state update)
      if ( !phet.joist.sim.isSettingPhetioStateProperty.value ) {
        this.movableAtom.setPosition( this.ljPotentialCalculator.getMinimumForceDistance(), 0 );
      }
    }
  }

  /**
   * Get the value of the sigma parameter that is being used for the motion calculations.  If the atoms are the same,
   * it will be the diameter of one atom.  If they are not, it will be a function of the diameters.
   * @returns {number}
   * @public
   */
  getSigma() {
    return this.ljPotentialCalculator.getSigma();
  }

  /**
   * Set the epsilon value, a.k.a. the Interaction Strength Parameter, which is one of the two parameters that
   * describes the Lennard-Jones potential.
   * @param {number}epsilon - interaction strength parameter
   * @public
   */
  setEpsilon( epsilon ) {

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
  }

  /**
   * Get the epsilon value, a.k.a. the Interaction Strength Parameter, which is one of the two parameters that
   * describes the Lennard-Jones potential.
   * @returns {number}
   * @public
   */
  getEpsilon() {
    return this.ljPotentialCalculator.getEpsilon();
  }

  /**
   * @param {boolean} paused - is to set particle motion
   * @public
   */
  setMotionPaused( paused ) {
    this.motionPausedProperty.set( paused );
    this.movableAtom.setVx( 0 );
  }

  /**
   * @override
   * @public
   */
  reset() {

    // reset the observable properties
    this.adjustableAtomInteractionStrengthProperty.reset();
    this.motionPausedProperty.reset();
    this.atomPairProperty.reset();
    this.isPlayingProperty.reset();
    this.timeSpeedProperty.reset();
    this.adjustableAtomDiameterProperty.reset();
    this.forcesDisplayModeProperty.reset();
    this.forcesExpandedProperty.reset();
    this.movementHintVisibleProperty.reset();
    this.fixedAtom.reset();
    this.movableAtom.reset();
    this.resetMovableAtomPos();
  }

  /**
   * Put the movable atom back to the position where the force is minimized, and reset the velocity and
   * acceleration to 0.
   * @public
   */
  resetMovableAtomPos() {
    this.movableAtom.setPosition( this.ljPotentialCalculator.getMinimumForceDistance(), 0 );
    this.movableAtom.setVx( 0 );
    this.movableAtom.setAx( 0 );
  }

  /**
   * Called by the animation loop.
   * @param {number} dt - time in seconds
   * @public
   */
  step( dt ) {

    if ( this.isPlayingProperty.get() ) {

      // Using real world time for this results in the atoms moving a little slowly, so the time step is adjusted here.
      // The multipliers were empirically determined.
      let adjustedTimeStep;
      if ( this.timeSpeedProperty.value === TimeSpeed.SLOW ) {
        adjustedTimeStep = dt * SLOW_MOTION_TIME_MULTIPLIER;
      }
      else {
        adjustedTimeStep = dt * NORMAL_MOTION_TIME_MULTIPLIER;
      }
      this.stepInternal( adjustedTimeStep );
    }
  }

  /**
   * @param {number} dt -- time in seconds
   * @public
   */
  stepInternal( dt ) {

    let numInternalModelIterations = 1;
    let modelTimeStep = dt;

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

    // update the motion of the movable atom
    for ( let i = 0; i < numInternalModelIterations; i++ ) {
      this.updateAtomMotion( modelTimeStep );
    }
  }

  /**
   * @private
   */
  updateForces() {

    let distance = this.movableAtom.positionProperty.value.distance( Vector2.ZERO );

    if ( distance < ( this.fixedAtom.radius + this.movableAtom.radius ) / 8 ) {

      // The atoms are too close together, and calculating the force will cause unusable levels of speed later, so
      // we limit it.
      distance = ( this.fixedAtom.radius + this.movableAtom.radius ) / 8;
    }

    // Calculate the force.  The result should be in newtons.
    this.attractiveForce = this.ljPotentialCalculator.getAttractiveLjForce( distance );
    this.repulsiveForce = this.ljPotentialCalculator.getRepulsiveLjForce( distance );

    // The movable atom can end up showing a tiny but non-zero velocity in phet-io when intended to be at the minimum
    // potential threshold, so do some thresholding if this is the case, see
    // https://github.com/phetsims/states-of-matter/issues/282.
    if ( Math.abs( this.movableAtom.velocityProperty.value.x ) === 0 ) {
      if ( Math.abs( distance - this.ljPotentialCalculator.getMinimumForceDistance() ) < this.movableAtom.radiusProperty.value ) {
        const totalForceMagnitude = Math.abs( this.attractiveForce - this.repulsiveForce );
        if ( totalForceMagnitude > 0 && totalForceMagnitude < MIN_FORCE_JITTER_THRESHOLD ) {

          // Split the difference and make the attractive and repulsive forces equal.
          const averageForce = ( this.attractiveForce + this.repulsiveForce ) / 2;
          this.attractiveForce = averageForce;
          this.repulsiveForce = averageForce;
        }
      }
    }
  }

  /**
   * Update the position, velocity, and acceleration of the dummy movable atom.
   * @private
   */
  updateAtomMotion( dt ) {

    const mass = this.movableAtom.mass * 1.6605402E-27;  // Convert mass to kilograms.
    const acceleration = ( this.repulsiveForce - this.attractiveForce ) / mass;

    // Update the acceleration for the movable atom.  We do this regardless of whether movement is paused so that
    // the force vectors can be shown appropriately if the user moves the atoms.
    this.movableAtom.setAx( acceleration );

    if ( !this.motionPausedProperty.get() ) {

      // Calculate tne new velocity.
      const newVelocity = this.movableAtom.getVx() + ( acceleration * dt );

      // Update the position and velocity of the atom.
      this.movableAtom.setVx( newVelocity );
      const xPos = this.movableAtom.getX() + ( this.movableAtom.getVx() * dt );
      this.movableAtom.setPosition( xPos, 0 );
    }
  }
}

// static
DualAtomModel.NORMAL_MOTION_TIME_MULTIPLIER = NORMAL_MOTION_TIME_MULTIPLIER;

statesOfMatter.register( 'DualAtomModel', DualAtomModel );
export default DualAtomModel;
