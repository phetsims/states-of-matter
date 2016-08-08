// Copyright 2014-2015, University of Colorado Boulder

/**
 * This class updates the positions of atoms in a water molecule based on the position and rotation information for the
 * molecule.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var Util = require( 'DOT/Util' );
  var WaterMoleculeStructure = require( 'STATES_OF_MATTER/common/model/engine/WaterMoleculeStructure' );

  // constants
  var STRUCTURE_X = WaterMoleculeStructure.moleculeStructureX;
  var STRUCTURE_Y = WaterMoleculeStructure.moleculeStructureY;

  // static object (no constructor)
  var WaterAtomPositionUpdater = {

    /**
     * @public
     * @param {MoleculeForceAndMotionDataSet} moleculeDataSet
     * @param {Number} timeStep
     */
    updateAtomPositions: function( moleculeDataSet ) {

      // Make sure this is not being used on an inappropriate data set.
      assert && assert( moleculeDataSet.getAtomsPerMolecule() === 3 );

      // Get direct references to the data in the data set.
      var atomPositions = moleculeDataSet.getAtomPositions();
      var moleculeCenterOfMassPositions = moleculeDataSet.getMoleculeCenterOfMassPositions();
      var moleculeRotationAngles = moleculeDataSet.getMoleculeRotationAngles();
      var insideContainers = moleculeDataSet.insideContainers;

      // other vars
      var xPos;
      var yPos;
      var cosineTheta;
      var sineTheta;

      // Loop through all molecules and position the individual atoms based on center of gravity position, molecule
      // structure, and rotational angle.
      for ( var i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
        insideContainers[ i ] = this.checkInContainer( moleculeCenterOfMassPositions[ i ],
          StatesOfMatterConstants.CONTAINER_LEFT_WALL,
          StatesOfMatterConstants.CONTAINER_RIGHT_WALL - 10,
          StatesOfMatterConstants.CONTAINER_TOP_WALL - 10,
          StatesOfMatterConstants.CONTAINER_BOTTOM_WALL,
          insideContainers[ i ]
        );
        cosineTheta = Math.cos( moleculeRotationAngles[ i ] );
        sineTheta = Math.sin( moleculeRotationAngles[ i ] );
        for ( var j = 0; j < 3; j++ ) {
          var xOffset = ( cosineTheta * STRUCTURE_X[ j ] ) - ( sineTheta * STRUCTURE_Y[ j ] );
          var yOffset = ( sineTheta * STRUCTURE_X[ j ] ) + ( cosineTheta * STRUCTURE_Y[ j ] );
          if ( insideContainers[ i ] ) {
            xPos = Util.clamp( moleculeCenterOfMassPositions[ i ].x, StatesOfMatterConstants.CONTAINER_LEFT_WALL,
                StatesOfMatterConstants.CONTAINER_RIGHT_WALL - 10 ) + xOffset;
            yPos = Math.max( moleculeCenterOfMassPositions[ i ].y, StatesOfMatterConstants.CONTAINER_BOTTOM_WALL ) + yOffset;
          }
          else{
            xPos = moleculeCenterOfMassPositions[ i ].x + xOffset;
            yPos = moleculeCenterOfMassPositions[ i ].y + yOffset;
          }

          atomPositions[ i * 3 + j ].setXY( xPos, yPos );
        }
      }
    },

    checkInContainer: function( position, leftWall, rightWall, topWall, bottomWall, currentStatus ){
      if ( currentStatus && position.y >= topWall + 2 ){
        return false;
      }
      else{
        if ( !currentStatus && position.x >= leftWall && position.x <= rightWall &&
             position.y <= topWall && position. y >= bottomWall ){
          return true;
        }
        else{
          return currentStatus;
        }
      }
    }
  };

  statesOfMatter.register( 'WaterAtomPositionUpdater', WaterAtomPositionUpdater );

  return WaterAtomPositionUpdater;
} );
