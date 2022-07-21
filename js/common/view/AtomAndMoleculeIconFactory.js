// Copyright 2017-2022, University of Colorado Boulder

/**
 * Icons, in the form of Scenery nodes, that are used in multiple places in the simulation to represent the various
 * atoms and molecules.
 */

import { Circle, Node } from '../../../../scenery/js/imports.js';
import statesOfMatter from '../../statesOfMatter.js';
import SOMConstants from '../SOMConstants.js';
import SubstanceType from '../SubstanceType.js';

// define the object where all of the icons will be available
const AtomAndMoleculeIconFactory = {

  createIcon: type => {
    let icon;
    switch( type ) {

      case SubstanceType.NEON:
        icon = new Circle( 5, { fill: SOMConstants.NEON_COLOR } );
        break;

      case SubstanceType.ARGON:
        icon = new Circle( 6, { fill: SOMConstants.ARGON_COLOR } );
        break;

      case SubstanceType.ADJUSTABLE_ATOM:
        icon = new Circle( 6, { fill: SOMConstants.ADJUSTABLE_ATTRACTION_COLOR } );
        break;

      case SubstanceType.DIATOMIC_OXYGEN: {
        const oxygen1 = new Circle( 5, { fill: SOMConstants.OXYGEN_COLOR } );
        const oxygen2 = new Circle( 5, { fill: SOMConstants.OXYGEN_COLOR, left: oxygen1.right - 4 } );
        icon = new Node( { children: [ oxygen1, oxygen2 ] } );
        break;
      }

      case SubstanceType.WATER: {
        const waterOxygen = new Circle( 5, { fill: SOMConstants.OXYGEN_COLOR } );
        const waterHydrogen1 = new Circle( 3, {
          fill: SOMConstants.HYDROGEN_COLOR,
          stroke: SOMConstants.HYDROGEN_COLOR, bottom: waterOxygen.top + 5, right: waterOxygen.left + 5
        } );
        const waterHydrogen2 = new Circle( 3, {
          fill: SOMConstants.HYDROGEN_COLOR,
          stroke: SOMConstants.HYDROGEN_COLOR, bottom: waterOxygen.top + 5, left: waterOxygen.right - 5
        } );
        icon = new Node( { children: [ waterHydrogen2, waterOxygen, waterHydrogen1 ] } );
        break;
      }

      default:
        assert && assert( false, 'unknown substance, unable to create icon' );
    }
    return icon;
  }
};

statesOfMatter.register( 'AtomAndMoleculeIconFactory', AtomAndMoleculeIconFactory );

export default AtomAndMoleculeIconFactory;