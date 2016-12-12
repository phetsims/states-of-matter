// Copyright 2016, University of Colorado Boulder

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

  // create the icon for water
  var dot1 = new Circle( 5, { fill: StatesOfMatterConstants.OXYGEN_COLOR } );
  var dot2 = new Circle( 3, {
    fill: StatesOfMatterConstants.HYDROGEN_COLOR,
    stroke: StatesOfMatterConstants.HYDROGEN_COLOR, bottom: dot1.top + 5, right: dot1.left + 5
  } );
  var dot3 = new Circle( 3, {
    fill: StatesOfMatterConstants.HYDROGEN_COLOR,
    stroke: StatesOfMatterConstants.HYDROGEN_COLOR, bottom: dot1.top + 5, left: dot1.right - 5
  } );
  var WATER_ICON = new Node( { children: [ dot3, dot1, dot2 ] } );

  // create the icon for oxygen
  var oxygen1 = new Circle( 5, { fill: StatesOfMatterConstants.OXYGEN_COLOR } );
  var oxygen2 = new Circle( 5, { fill: StatesOfMatterConstants.OXYGEN_COLOR, left: oxygen1.right - 4 } );
  var OXYGEN_ICON = new Node( { children: [ oxygen1, oxygen2 ] } );

  // define the object where all of the icons will be available
  var AtomAndMoleculeIcons = {
    ADJUSTABLE_ATTRACTION_ICON: new Circle( 6, { fill: StatesOfMatterConstants.ADJUSTABLE_ATTRACTION_COLOR } ),
    ARGON_ICON: new Circle( 6, { fill: StatesOfMatterConstants.ARGON_COLOR } ),
    NEON_ICON: new Circle( 5, { fill: StatesOfMatterConstants.NEON_COLOR } ),
    OXYGEN_ICON: OXYGEN_ICON,
    WATER_ICON: WATER_ICON
  };

  statesOfMatter.register( 'AtomAndMoleculeIcons', AtomAndMoleculeIcons );

  return AtomAndMoleculeIcons;
} );