// Copyright 2002-2014, University of Colorado Boulder
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

  function WaterMoleculeStructure() {
    this.moleculeStructureX = [];
    this.moleculeStructureY = [];

    // oxygen at 0,0
    this.moleculeStructureX[0] = 0;
    this.moleculeStructureY[0] = 0;
    this.moleculeStructureX[1] = StatesOfMatterConstants.DISTANCE_FROM_OXYGEN_TO_HYDROGEN;
    this.moleculeStructureY[1] = 0;
    this.moleculeStructureX[2] = StatesOfMatterConstants.DISTANCE_FROM_OXYGEN_TO_HYDROGEN *
                                 Math.cos( StatesOfMatterConstants.THETA_HOH );
    this.moleculeStructureY[2] = StatesOfMatterConstants.DISTANCE_FROM_OXYGEN_TO_HYDROGEN *
                                 Math.sin( StatesOfMatterConstants.THETA_HOH );
    var xcm0 = (  this.moleculeStructureX[0] + 0.25 * this.moleculeStructureX[1] + 0.25 * this.moleculeStructureX[2]) /
               1.5;
    var ycm0 = (  this.moleculeStructureY[0] + 0.25 * this.moleculeStructureY[1] + 0.25 * this.moleculeStructureY[2]) /
               1.5;
    for ( var i = 0; i < 3; i++ ) {
      this.moleculeStructureX[i] -= xcm0;
      this.moleculeStructureY[i] -= ycm0;
    }
  }

  return inherit( Object, WaterMoleculeStructure, {
    getInstance: function() {
      if ( instance === null ) {
        instance = new WaterMoleculeStructure();
      }
      return instance;
    },
    getStructureArrayX: function() {
      return  this.moleculeStructureX;
    },
    getStructureArrayY: function() {
      return this.moleculeStructureY;
    },
    getRotationalInertia: function() {
      return (Math.pow( this.moleculeStructureX[0], 2 ) + Math.pow( this.moleculeStructureY[0], 2 )) +
             0.25 * (Math.pow( this.moleculeStructureX[1], 2 ) + Math.pow( this.moleculeStructureY[1], 2 )) +
             0.25 * (Math.pow( this.moleculeStructureX[2], 2 ) + Math.pow( this.moleculeStructureY[2], 2 ));
    }
  } );
} );

