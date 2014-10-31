// Copyright 2002-2011, University of Colorado
/**
 * This class is a singleton that provides information about the structure
 * of a water molecule (i.e. the spatial and angular relationships between
 * the atoms that comprise the molecule).
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterConstants' );


  //private
  var instance;

  /**
   * Constructor, which is private to force it to be created via the
   * getInstance method.
   */

    //private
  function WaterMoleculeStructure() {
    this.m_moleculeStructureX = new double[3];
    this.m_moleculeStructureY = new double[3];
    // zero.
    m_moleculeStructureX[0] = 0;
    m_moleculeStructureY[0] = 0;
    m_moleculeStructureX[1] = StatesOfMatterConstants.DISTANCE_FROM_OXYGEN_TO_HYDROGEN;
    m_moleculeStructureY[1] = 0;
    m_moleculeStructureX[2] = StatesOfMatterConstants.DISTANCE_FROM_OXYGEN_TO_HYDROGEN * Math.cos( StatesOfMatterConstants.THETA_HOH );
    m_moleculeStructureY[2] = StatesOfMatterConstants.DISTANCE_FROM_OXYGEN_TO_HYDROGEN * Math.sin( StatesOfMatterConstants.THETA_HOH );
    var xcm0 = (m_moleculeStructureX[0] + 0.25 * m_moleculeStructureX[1] + 0.25 * m_moleculeStructureX[2]) / 1.5;
    var ycm0 = (m_moleculeStructureY[0] + 0.25 * m_moleculeStructureY[1] + 0.25 * m_moleculeStructureY[2]) / 1.5;
    for ( var i = 0; i < 3; i++ ) {
      m_moleculeStructureX[i] -= xcm0;
      m_moleculeStructureY[i] -= ycm0;
    }
  }

  return inherit( Object, WaterMoleculeStructure, {
    getInstance: function() {
      if ( instance == null ) {
        instance = new WaterMoleculeStructure();
      }
      return instance;
    },
    getStructureArrayX: function() {
      return m_moleculeStructureX;
    },
    getStructureArrayY: function() {
      return m_moleculeStructureY;
    },
    getRotationalInertia: function() {
      return (Math.pow( m_moleculeStructureX[0], 2 ) + Math.pow( m_moleculeStructureY[0], 2 )) + 0.25 * (Math.pow( m_moleculeStructureX[1], 2 ) + Math.pow( m_moleculeStructureY[1], 2 )) + 0.25 * (Math.pow( m_moleculeStructureX[2], 2 ) + Math.pow( m_moleculeStructureY[2], 2 ));
    }
  } );
} );

