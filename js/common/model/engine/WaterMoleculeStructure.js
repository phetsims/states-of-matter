// Copyright 2002-2015, University of Colorado Boulder

/**
 * This class is a singleton that provides information about the structure
 * of a water molecule (i.e. the spatial and angular relationships between
 * the atoms that comprise the molecule).
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  //private
  var instance;

  var moleculeStructureX = [];
  var moleculeStructureY = [];

  // oxygen at 0,0
  moleculeStructureX[ 0 ] = 0;
  moleculeStructureY[ 0 ] = 0;
  moleculeStructureX[ 1 ] = StatesOfMatterConstants.DISTANCE_FROM_OXYGEN_TO_HYDROGEN;
  moleculeStructureY[ 1 ] = 0;
  moleculeStructureX[ 2 ] = StatesOfMatterConstants.DISTANCE_FROM_OXYGEN_TO_HYDROGEN *
                            Math.cos( StatesOfMatterConstants.THETA_HOH );
  moleculeStructureY[ 2 ] = StatesOfMatterConstants.DISTANCE_FROM_OXYGEN_TO_HYDROGEN *
                            Math.sin( StatesOfMatterConstants.THETA_HOH );
  var xcm0 = (  moleculeStructureX[ 0 ] + 0.25 * moleculeStructureX[ 1 ] + 0.25 * moleculeStructureX[ 2 ]) /
             1.5;
  var ycm0 = (  moleculeStructureY[ 0 ] + 0.25 * moleculeStructureY[ 1 ] + 0.25 * moleculeStructureY[ 2 ]) /
             1.5;
  for ( var i = 0; i < 3; i++ ) {
    moleculeStructureX[ i ] -= xcm0;
    moleculeStructureY[ i ] -= ycm0;
  }

  var rotationalInertia = ( Math.pow( moleculeStructureX[ 0 ], 2 ) + Math.pow( moleculeStructureY[ 0 ], 2 )) +
                          0.25 * ( Math.pow( moleculeStructureX[ 1 ], 2 ) + Math.pow( moleculeStructureY[ 1 ], 2 ) ) +
                          0.25 * ( Math.pow( moleculeStructureX[ 2 ], 2 ) + Math.pow( moleculeStructureY[ 2 ], 2 ) );

  return {
    moleculeStructureX: moleculeStructureX,
    moleculeStructureY: moleculeStructureY,
    rotationalInertia: rotationalInertia
  };
} );

