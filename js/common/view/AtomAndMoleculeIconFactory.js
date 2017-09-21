// Copyright 2017, University of Colorado Boulder

/**
 * Icons, in the form of Scenery nodes, that are used in multiple places in the simulation to represent the various
 * atoms and molecules.
 */

define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Node = require( 'SCENERY/nodes/Node' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var SubstanceType = require( 'STATES_OF_MATTER/common/SubstanceType' );

  // define the object where all of the icons will be available
  var AtomAndMoleculeIconFactory = {

    createIcon: function( type ) {
      var icon;
      switch( type ) {

        case SubstanceType.NEON:
          icon = new Circle( 5, { fill: StatesOfMatterConstants.NEON_COLOR } );
          break;

        case SubstanceType.ARGON:
          icon = new Circle( 6, { fill: StatesOfMatterConstants.ARGON_COLOR } );
          break;

        case SubstanceType.ADJUSTABLE_ATOM:
          icon = new Circle( 6, { fill: StatesOfMatterConstants.ADJUSTABLE_ATTRACTION_COLOR } );
          break;

        case SubstanceType.DIATOMIC_OXYGEN:
          var oxygen1 = new Circle( 5, { fill: StatesOfMatterConstants.OXYGEN_COLOR } );
          var oxygen2 = new Circle( 5, { fill: StatesOfMatterConstants.OXYGEN_COLOR, left: oxygen1.right - 4 } );
          icon = new Node( { children: [ oxygen1, oxygen2 ] } );
          break;

        case SubstanceType.WATER:
          var waterOxygen = new Circle( 5, { fill: StatesOfMatterConstants.OXYGEN_COLOR } );
          var waterHydrogen1 = new Circle( 3, {
            fill: StatesOfMatterConstants.HYDROGEN_COLOR,
            stroke: StatesOfMatterConstants.HYDROGEN_COLOR, bottom: waterOxygen.top + 5, right: waterOxygen.left + 5
          } );
          var waterHydrogen2 = new Circle( 3, {
            fill: StatesOfMatterConstants.HYDROGEN_COLOR,
            stroke: StatesOfMatterConstants.HYDROGEN_COLOR, bottom: waterOxygen.top + 5, left: waterOxygen.right - 5
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