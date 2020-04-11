// Copyright 2020, University of Colorado Boulder

/**
 * PhaseChangesModel is a multiple particle model that adds some additional items specific to the "PhaseChanges" screen.
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
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

class PhaseChangesModel extends MultipleParticleModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    super( tandem );

    // @public (read-write)
    this.phaseDiagramAccordionBoxExpandedProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'phaseDiagramAccordionBoxExpandedProperty' )
    } );

    // @public (read-write)
    this.interactionPotentialAccordionBoxExpandedProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'interactionPotentialAccordionBoxExpandedProperty' )
    } );

    // @public (read-write) - interaction strength of the adjustable attraction atoms
    this.interactionStrengthProperty = new NumberProperty( MAX_ADJUSTABLE_EPSILON, {
      tandem: tandem.createTandem( 'interactionStrengthProperty' ),
      range: new Range( MIN_ADJUSTABLE_EPSILON, MAX_ADJUSTABLE_EPSILON ),
      phetioDocumentation: 'intermolecular potential for the "Adjustable Attraction" atoms - this is a parameter in the Lennard-Jones potential equation'
    } );

    // @public (read-write)
    this.targetContainerHeightProperty = new NumberProperty( MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT, {
      tandem: tandem.createTandem( 'targetContainerHeightProperty' ),
      range: new Range( MIN_ALLOWABLE_CONTAINER_HEIGHT, MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT )
    } );

    // @private - This flag is used to avoid problems when the superconstructor calls the overrides in this subclass
    // before the subclass-specific properties have been added.
    this.phaseChangeModelConstructed = true;
  }

  /**
   * @param {number} epsilon
   * @public
   */
  setEpsilon( epsilon ) {
    if ( this.substanceProperty.get() === SubstanceType.ADJUSTABLE_ATOM ) {
      if ( epsilon < MIN_ADJUSTABLE_EPSILON ) {
        epsilon = MIN_ADJUSTABLE_EPSILON;
      }
      else if ( epsilon > MAX_ADJUSTABLE_EPSILON ) {
        epsilon = MAX_ADJUSTABLE_EPSILON;
      }
      this.moleculeForceAndMotionCalculator.setScaledEpsilon( this.convertEpsilonToScaledEpsilon( epsilon ) );
    }
    else {
      assert && assert( false, 'Error: Epsilon cannot be set when non-configurable molecule is in use.' );
    }
  }

  /**
   * Convert a value for epsilon that is in the real range of values into a scaled value that is suitable for use with
   * the motion and force calculators.
   * @param {number} epsilon
   * @private
   */
  convertEpsilonToScaledEpsilon( epsilon ) {
    // The following conversion of the target value for epsilon to a scaled value for the motion calculator object was
    // determined empirically such that the resulting behavior roughly matched that of the existing monatomic
    // molecules.
    return epsilon / ( SOMConstants.MAX_EPSILON / 2 );
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
   * @override
   */
  resetContainerSize() {

    if ( this.phaseChangeModelConstructed ) {
      this.targetContainerHeightProperty.reset();
    }
    super.resetContainerSize();
  }

  /**
   * @public
   */
  reset() {
    super.reset();
    this.targetContainerHeightProperty.reset();
    this.interactionStrengthProperty.reset();
    this.phaseDiagramAccordionBoxExpandedProperty.reset();
    this.interactionPotentialAccordionBoxExpandedProperty.reset();
  }
}

// static constants
PhaseChangesModel.MAX_ADJUSTABLE_EPSILON = MAX_ADJUSTABLE_EPSILON;


statesOfMatter.register( 'PhaseChangesModel', PhaseChangesModel );
export default PhaseChangesModel;