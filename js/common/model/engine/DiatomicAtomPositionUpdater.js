// Copyright 2014-2015, University of Colorado Boulder

/**
 *
 * This class updates the positions of atoms in a diatomic data set (i.e.
 * where each molecule is made up of two molecules).  IMPORTANT: This class
 * assumes that the two atoms that comprise each molecule are the same, e.g.
 * O2 (diatomic oxygen), and not different, such as OH.
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

  // static object (no constructor)
  var DiatomicAtomPositionUpdater =  {

    /**
     * @public
     * @param {MoleculeForceAndMotionDataSet} moleculeDataSet
     * @param {Number} timeStep
     */
    updateAtomPositions: function( moleculeDataSet, timeStep ) {

      // Make sure this is not being used on an inappropriate data set.
      assert && assert( moleculeDataSet.atomsPerMolecule === 2 );

      // Get direct references to the data in the data set.
      var atomPositions = moleculeDataSet.atomPositions;
      var moleculeCenterOfMassPositions = moleculeDataSet.moleculeCenterOfMassPositions;
      var moleculeRotationAngles = moleculeDataSet.moleculeRotationAngles;
      var insideContainers = moleculeDataSet.insideContainers;
      var xPos;
      var yPos;
      var cosineTheta;
      var sineTheta;
      for ( var i = 0; i < moleculeDataSet.getNumberOfMolecules(); i++ ) {
        insideContainers[ i ] = this.checkInContainer( moleculeCenterOfMassPositions[ i ],
          StatesOfMatterConstants.CONTAINER_LEFT_WALL + 0.5,
          StatesOfMatterConstants.CONTAINER_RIGHT_WALL,
          StatesOfMatterConstants.CONTAINER_TOP_WALL,
          StatesOfMatterConstants.CONTAINER_BOTTOM_WALL,
          insideContainers[ i ]
        );
        cosineTheta = Math.cos( moleculeRotationAngles[ i ] );
        sineTheta = Math.sin( moleculeRotationAngles[ i ] );
        if ( insideContainers[ i ] ) {
          xPos = Util.clamp( moleculeCenterOfMassPositions[ i ].x, StatesOfMatterConstants.CONTAINER_LEFT_WALL + 0.5,
              StatesOfMatterConstants.CONTAINER_RIGHT_WALL ) +
                 cosineTheta * (StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2);
          yPos = Math.max( moleculeCenterOfMassPositions[ i ].y, StatesOfMatterConstants.CONTAINER_BOTTOM_WALL ) +
                 sineTheta * (StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2);
          atomPositions[ i * 2 ].setXY( xPos, yPos );
          xPos = Util.clamp( moleculeCenterOfMassPositions[ i ].x, StatesOfMatterConstants.CONTAINER_LEFT_WALL + 0.5,
                 StatesOfMatterConstants.CONTAINER_RIGHT_WALL ) -
                 cosineTheta * (StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2);
          yPos = Math.max( moleculeCenterOfMassPositions[ i ].y, StatesOfMatterConstants.CONTAINER_BOTTOM_WALL ) -
                 sineTheta * (StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2);
          atomPositions[ i * 2 + 1 ].setXY( xPos, yPos );
        }
        else{
          xPos = moleculeCenterOfMassPositions[ i ].x +
                 cosineTheta * (StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2);
          yPos = moleculeCenterOfMassPositions[ i ].y +
                 sineTheta * (StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2);
          atomPositions[ i * 2 ].setXY( xPos, yPos );
          xPos = moleculeCenterOfMassPositions[ i ].x -
                 cosineTheta * (StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2);
          yPos = moleculeCenterOfMassPositions[ i ].y -
                 sineTheta * (StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE / 2);
          atomPositions[ i * 2 + 1 ].setXY( xPos, yPos );
        }
      }
    },

    checkInContainer: function( position, leftWall, rightWall, topWall, bottomWall, currentStatus ){
      if ( currentStatus && position.y >= topWall + 2 ){
        return false;
      }
      else{
        if ( !currentStatus && position.x > leftWall && position.x < rightWall &&
             position.y <= topWall && position. y >= bottomWall ){
          return true;
        }
        else{
          return currentStatus;
        }
      }
    }
  };

  statesOfMatter.register( 'DiatomicAtomPositionUpdater', DiatomicAtomPositionUpdater );

  return DiatomicAtomPositionUpdater;

} );
