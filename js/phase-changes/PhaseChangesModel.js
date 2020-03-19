// Copyright 2020, University of Colorado Boulder

/**
 * PhaseChangesModel is a multiple particle model that adds some additional items specific to the "PhaseChanges" screen.
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import MultipleParticleModel from '../common/model/MultipleParticleModel.js';
import SOMConstants from '../common/SOMConstants.js';
import SubstanceType from '../common/SubstanceType.js';
import statesOfMatter from '../statesOfMatter.js';

// --------------------------------------------------------------------------------------------------------------------
// constants
// --------------------------------------------------------------------------------------------------------------------

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
    this.phaseDiagramExpandedProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'phaseDiagramExpandedProperty' )
    } );

    // @public (read-write)
    this.interactionPotentialDiagramExpandedProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'interactionPotentialDiagramExpandedProperty' )
    } );

    // @public (read-write) - interaction strength of the adjustable attraction atoms
    this.interactionStrengthProperty = new NumberProperty( MAX_ADJUSTABLE_EPSILON, {
      tandem: tandem.createTandem( 'interactionStrengthProperty' ),
      range: new Range( MIN_ADJUSTABLE_EPSILON, MAX_ADJUSTABLE_EPSILON )
    } );
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
   * @public
   */
  reset() {
    super.reset();
    this.interactionStrengthProperty.reset();
    this.phaseDiagramExpandedProperty.reset();
    this.interactionPotentialDiagramExpandedProperty.reset();
  }
}

// static constants
PhaseChangesModel.MAX_ADJUSTABLE_EPSILON = MAX_ADJUSTABLE_EPSILON;


statesOfMatter.register( 'PhaseChangesModel', PhaseChangesModel );
export default PhaseChangesModel;