// Copyright 2020-2021, University of Colorado Boulder

/**
 * PhaseChangesModel is a multiple particle model that adds some additional items specific to the "PhaseChanges" screen.
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import AtomType from '../common/model/AtomType.js';
import InteractionStrengthTable from '../common/model/InteractionStrengthTable.js';
import MultipleParticleModel from '../common/model/MultipleParticleModel.js';
import SOMConstants from '../common/SOMConstants.js';
import SubstanceType from '../common/SubstanceType.js';
import statesOfMatter from '../statesOfMatter.js';

// --------------------------------------------------------------------------------------------------------------------
// constants
// --------------------------------------------------------------------------------------------------------------------
const MIN_ALLOWABLE_CONTAINER_HEIGHT = 1500; // empirically determined, almost all the way to the bottom
const MAX_CONTAINER_SHRINK_RATE = 1250; // in model units per second

// Min a max values for adjustable epsilon.  Originally there was a wider allowable range, but the simulation did not
// work so well, so the range below was arrived at empirically and seems to work reasonably well.
const MIN_ADJUSTABLE_EPSILON = SOMConstants.MIN_ADJUSTABLE_EPSILON;
const MAX_ADJUSTABLE_EPSILON = SOMConstants.MAX_ADJUSTABLE_EPSILON;

// constant table of the sigma values used in the LJ potential calculations for the various substances used in the sim
// Note: Can't used Map constructor due to lack of support in IE
const SIGMA_TABLE = new Map();
SIGMA_TABLE.set( SubstanceType.NEON, SOMConstants.NEON_RADIUS * 2 );
SIGMA_TABLE.set( SubstanceType.ARGON, SOMConstants.ARGON_RADIUS * 2 );
SIGMA_TABLE.set( SubstanceType.DIATOMIC_OXYGEN, SOMConstants.SIGMA_FOR_DIATOMIC_OXYGEN );
SIGMA_TABLE.set( SubstanceType.WATER, SOMConstants.SIGMA_FOR_WATER );
SIGMA_TABLE.set( SubstanceType.ADJUSTABLE_ATOM, SOMConstants.ADJUSTABLE_ATTRACTION_DEFAULT_RADIUS * 2 );

// constant table of the epsilon values used in the LJ potential calculations for the various substances used in the sim
const EPSILON_TABLE = new Map();
EPSILON_TABLE.set( SubstanceType.NEON, InteractionStrengthTable.getInteractionPotential( AtomType.NEON, AtomType.NEON ) );
EPSILON_TABLE.set( SubstanceType.ARGON, InteractionStrengthTable.getInteractionPotential( AtomType.ARGON, AtomType.ARGON ) );
EPSILON_TABLE.set( SubstanceType.DIATOMIC_OXYGEN, SOMConstants.EPSILON_FOR_DIATOMIC_OXYGEN );
EPSILON_TABLE.set( SubstanceType.WATER, SOMConstants.EPSILON_FOR_WATER );

class PhaseChangesModel extends MultipleParticleModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    super( tandem );

    // @public (read-write)
    this.phaseDiagramExpandedProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'phaseDiagramExpandedProperty' )
    } );

    // @public (read-write)
    this.interactionPotentialExpandedProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'interactionPotentialExpandedProperty' )
    } );

    // @public (read-write) - interaction strength of the adjustable attraction atoms
    this.adjustableAtomInteractionStrengthProperty = new NumberProperty( MAX_ADJUSTABLE_EPSILON, {
      tandem: tandem.createTandem( 'adjustableAtomInteractionStrengthProperty' ),
      range: new Range( MIN_ADJUSTABLE_EPSILON, MAX_ADJUSTABLE_EPSILON ),
      phetioDocumentation: 'intermolecular potential for the "Adjustable Attraction" atoms - this is a parameter in the Lennard-Jones potential equation'
    } );

    // @public (read-write)
    this.targetContainerHeightProperty = new NumberProperty( MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT, {
      tandem: tandem.createTandem( 'targetContainerHeightProperty' ),
      range: new Range( MIN_ALLOWABLE_CONTAINER_HEIGHT, MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT )
    } );

    // @public (read-only) - a derived property that indicates whether the lid is higher than the injection point
    this.lidAboveInjectionPointProperty = new DerivedProperty( [ this.containerHeightProperty ], containerHeight => {

      // This may appear a little suspect, but the model is designed such that the container height is always reset
      // to its max when the particle diameter and injection change, so this can be trusted.
      return ( containerHeight / this.particleDiameter ) > this.injectionPoint.y;
    } );

    // Reset the target container height in the event of an explosion.
    this.isExplodedProperty.lazyLink( isExploded => {
      if ( isExploded ) {
        this.targetContainerHeightProperty.reset();
      }
    } );

    // Reset the target container height when the substance changes.
    this.substanceProperty.lazyLink( () => {
      this.targetContainerHeightProperty.reset();
    } );

    // @private - This flag is used to avoid problems when the superconstructor calls the overrides in this subclass
    // before the subclass-specific properties have been added.
    this.phaseChangeModelConstructed = true;
  }

  /**
   * Get the sigma value, which is one of the two parameters that describes the Lennard-Jones potential.
   * @returns {number}
   * @public
   */
  getSigma() {
    return SIGMA_TABLE.get( this.substanceProperty.value );
  }

  /**
   * Get the epsilon value, which is one of the two parameters that describes the Lennard-Jones potential.
   * @returns {number}
   * @public
   */
  getEpsilon() {
    const substance = this.substanceProperty.value;
    let epsilon;
    if ( substance === SubstanceType.ADJUSTABLE_ATOM ) {
      epsilon = this.adjustableAtomInteractionStrengthProperty.value;
    }
    else {
      epsilon = EPSILON_TABLE.get( substance );
    }
    return epsilon;
  }

  /**
   * @param {number} epsilon
   * @public
   */
  setEpsilon( epsilon ) {
    if ( this.substanceProperty.get() === SubstanceType.ADJUSTABLE_ATOM ) {
      this.moleculeForceAndMotionCalculator.setScaledEpsilon(
        convertEpsilonToScaledEpsilon( Utils.clamp( epsilon, MIN_ADJUSTABLE_EPSILON, MAX_ADJUSTABLE_EPSILON ) )
      );
    }
    else {
      assert && assert( false, 'Error: Epsilon cannot be set when non-configurable molecule is in use.' );
    }
  }

  /**
   * handler that sets up the various portions of the model to support the newly selected substance
   * @param {SubstanceType} substance
   * @protected
   * @override
   */
  handleSubstanceChanged( substance ) {

    // reset the target container height whenever the substance changes
    this.targetContainerHeightProperty && this.targetContainerHeightProperty.reset();

    // base class does most of the heavy lifting on this
    super.handleSubstanceChanged( substance );

    // If the adjustable atom has been selected, set the epsilon value of the LJ potential to be based on the previously
    // set interaction strength.
    if ( substance === SubstanceType.ADJUSTABLE_ATOM ) {
      this.setEpsilon( this.adjustableAtomInteractionStrengthProperty.value );
    }
  }

  /**
   * Sets the target height of the container.  The target height is set rather than the actual height because the
   * model limits the rate at which the height can changed.  The model will gradually move towards the target height.
   * @param {number} desiredContainerHeight
   * @public
   */
  setTargetContainerHeight( desiredContainerHeight ) {
    this.targetContainerHeightProperty.set( Utils.clamp(
      desiredContainerHeight,
      MIN_ALLOWABLE_CONTAINER_HEIGHT,
      MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT
    ) );
  }

  /**
   * @protected
   * @override
   */
  updateContainerSize( dt ) {

    if ( !this.phaseChangeModelConstructed ||
         this.isExplodedProperty.value ||
         this.targetContainerHeightProperty.value === this.containerHeightProperty.value ) {

      // in this case, the super makes the needed adjustments
      super.updateContainerSize( dt );
    }
    else if ( this.targetContainerHeightProperty.value !== this.containerHeightProperty.value ) {
      this.heightChangeThisStep = this.targetContainerHeightProperty.get() - this.containerHeightProperty.get();
      if ( this.heightChangeThisStep > 0 ) {

        // the container is expanding, limit the change to the max allowed rate
        this.heightChangeThisStep = Math.min(
          this.heightChangeThisStep,
          MultipleParticleModel.MAX_CONTAINER_EXPAND_RATE * dt );

        this.containerHeightProperty.set( Math.min(
          this.containerHeightProperty.get() + this.heightChangeThisStep,
          MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT
        ) );
      }
      else {

        // the container is shrinking, limit the change to the max allowed rate
        this.heightChangeThisStep = Math.max( this.heightChangeThisStep, -MAX_CONTAINER_SHRINK_RATE * dt );

        this.containerHeightProperty.set( Math.max(
          this.containerHeightProperty.get() + this.heightChangeThisStep,
          MIN_ALLOWABLE_CONTAINER_HEIGHT
        ) );
      }
      this.normalizedContainerHeight = this.containerHeightProperty.get() / this.particleDiameter;
      this.normalizedLidVelocityY = ( this.heightChangeThisStep / this.particleDiameter ) / dt;
    }
  }

  /**
   * @public
   */
  reset() {
    super.reset();
    this.targetContainerHeightProperty.reset();
    this.adjustableAtomInteractionStrengthProperty.reset();
    this.phaseDiagramExpandedProperty.reset();
    this.interactionPotentialExpandedProperty.reset();
  }
}

// helper function - The following conversion of the target value for epsilon to a scaled value for the motion
// calculator object was determined empirically such that the resulting behavior roughly matched that of the existing
// monatomic molecules.
const convertEpsilonToScaledEpsilon = epsilon => epsilon / ( SOMConstants.MAX_EPSILON / 2 );

// static constants
PhaseChangesModel.MAX_ADJUSTABLE_EPSILON = MAX_ADJUSTABLE_EPSILON;

statesOfMatter.register( 'PhaseChangesModel', PhaseChangesModel );
export default PhaseChangesModel;