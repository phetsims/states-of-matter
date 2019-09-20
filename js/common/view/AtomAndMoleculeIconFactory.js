// Copyright 2017-2019, University of Colorado Boulder

/**
 * Icons, in the form of Scenery nodes, that are used in multiple places in the simulation to represent the various
 * atoms and molecules.
 */

define( require => {
  'use strict';

  // modules
  const Circle = require( 'SCENERY/nodes/Circle' );
  const Node = require( 'SCENERY/nodes/Node' );
  const SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const SubstanceType = require( 'STATES_OF_MATTER/common/SubstanceType' );

  // define the object where all of the icons will be available
  const AtomAndMoleculeIconFactory = {

    createIcon: function( type ) {
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

        case SubstanceType.DIATOMIC_OXYGEN:
          var oxygen1 = new Circle( 5, { fill: SOMConstants.OXYGEN_COLOR } );
          var oxygen2 = new Circle( 5, { fill: SOMConstants.OXYGEN_COLOR, left: oxygen1.right - 4 } );
          icon = new Node( { children: [ oxygen1, oxygen2 ] } );
          break;

        case SubstanceType.WATER:
          var waterOxygen = new Circle( 5, { fill: SOMConstants.OXYGEN_COLOR } );
          var waterHydrogen1 = new Circle( 3, {
            fill: SOMConstants.HYDROGEN_COLOR,
            stroke: SOMConstants.HYDROGEN_COLOR, bottom: waterOxygen.top + 5, right: waterOxygen.left + 5
          } );
          var waterHydrogen2 = new Circle( 3, {
            fill: SOMConstants.HYDROGEN_COLOR,
            stroke: SOMConstants.HYDROGEN_COLOR, bottom: waterOxygen.top + 5, left: waterOxygen.right - 5
          } );
          icon = new Node( { children: [ waterHydrogen2, waterOxygen, waterHydrogen1 ] } );
          break;

        default:
          assert && assert( false, 'unknown substance, unable to create icon' );
      }
      return icon;
    }
  };

  statesOfMatter.register( 'AtomAndMoleculeIconFactory', AtomAndMoleculeIconFactory );

  return AtomAndMoleculeIconFactory;
} );