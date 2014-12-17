// Copyright 2002-2011, University of Colorado

/**
 * This class adds the ability to display force-depicting arrows to its super
 * class.
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ParticleNode = require( 'ATOMIC_INTERACTIONS/atomic-interactions/view/ParticleNode' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var Color = require( 'SCENERY/util/Color' );

  // The following constants control some of the aspects of the appearance of
  // the force arrows.  The values are arbitrary and are chosen to look good
  // in this particular sim, so tweak them as needed for optimal appearance.
  var ATTRACTIVE_FORCE_COLOR = new Color( 255, 255, 0, 175 );
  var REPULSIVE_FORCE_COLOR = new Color( 255, 0, 255, 175 ); // Magenta.
  var TOTAL_FORCE_COLOR = new Color( 0, 255, 0, 125 );
  var COMPONENT_FORCE_ARROW_REFERENCE_LENGTH = 500;
  //var COMPONENT_FORCE_ARROW_REFERENCE_MAGNITUDE = 1E-22;
  var TOTAL_FORCE_ARROW_REFERENCE_LENGTH = 1000;
  //var TOTAL_FORCE_ARROW_REFERENCE_MAGNITUDE = 1E-22;
  var FORCE_ARROW_TAIL_WIDTH = 100;
  var FORCE_ARROW_HEAD_WIDTH = 200;
  var FORCE_ARROW_HEAD_LENGTH = 200;

  function ParticleForceNode( particle, mvt, useGradient, enableOverlap ) {


    ParticleNode.call( this, particle, mvt, useGradient, enableOverlap );

    this.attractiveForce = 0;
    this.repulsiveForce = 0;

    this.attractiveForceVectorNode = new ArrowNode( 0, 0, COMPONENT_FORCE_ARROW_REFERENCE_LENGTH, 0, {
      fill: ATTRACTIVE_FORCE_COLOR,
      headHeight: FORCE_ARROW_HEAD_LENGTH,
      headWidth: FORCE_ARROW_HEAD_WIDTH,
      tailWidth: FORCE_ARROW_TAIL_WIDTH
    } );
    this.addChild( this.attractiveForceVectorNode );
    this.attractiveForceVectorNode.setVisible( false );

    /*        this.attractiveForceVectorNode = new Vector2DNode( 0, 0, COMPONENT_FORCE_ARROW_REFERENCE_MAGNITUDE,
     COMPONENT_FORCE_ARROW_REFERENCE_LENGTH );
     this.attractiveForceVectorNode.setMagnitudeAngle( 0, 0 );
     this.addChild( this.attractiveForceVectorNode );
     this.attractiveForceVectorNode.setArrowFillPaint( ATTRACTIVE_FORCE_COLOR );
     this.attractiveForceVectorNode.setHeadSize( FORCE_ARROW_HEAD_WIDTH, FORCE_ARROW_HEAD_LENGTH );
     this.attractiveForceVectorNode.setTailWidth( FORCE_ARROW_TAIL_WIDTH );
     this.attractiveForceVectorNode.setVisible( false );*/

    this.repulsiveForceVectorNode = new ArrowNode( 0, 0, COMPONENT_FORCE_ARROW_REFERENCE_LENGTH, 0, {
      fill: REPULSIVE_FORCE_COLOR,
      headHeight: FORCE_ARROW_HEAD_LENGTH,
      headWidth: FORCE_ARROW_HEAD_WIDTH,
      tailWidth: FORCE_ARROW_TAIL_WIDTH
    } );
    this.addChild( this.repulsiveForceVectorNode );
    this.repulsiveForceVectorNode.setVisible( false );

    /*        this.repulsiveForceVectorNode = new Vector2DNode( 0, 0, COMPONENT_FORCE_ARROW_REFERENCE_MAGNITUDE,
     COMPONENT_FORCE_ARROW_REFERENCE_LENGTH );
     this.repulsiveForceVectorNode.setMagnitudeAngle( 0, 0 );
     addChild( this.repulsiveForceVectorNode );
     this.repulsiveForceVectorNode.setArrowFillPaint( REPULSIVE_FORCE_COLOR );
     this.repulsiveForceVectorNode.setHeadSize( FORCE_ARROW_HEAD_WIDTH, FORCE_ARROW_HEAD_LENGTH );
     this.repulsiveForceVectorNode.setTailWidth( FORCE_ARROW_TAIL_WIDTH );
     this.repulsiveForceVectorNode.setVisible( false );*/

    this.totalForceVectorNode = new ArrowNode( 0, 0, TOTAL_FORCE_ARROW_REFERENCE_LENGTH, 0, {
      fill: TOTAL_FORCE_COLOR,
      headHeight: FORCE_ARROW_HEAD_LENGTH,
      headWidth: FORCE_ARROW_HEAD_WIDTH,
      tailWidth: FORCE_ARROW_TAIL_WIDTH
    } );
    this.addChild( this.totalForceVectorNode );
    this.totalForceVectorNode.setVisible( false );

    /*        this.totalForceVectorNode = new Vector2DNode( 0, 0, TOTAL_FORCE_ARROW_REFERENCE_MAGNITUDE,
     TOTAL_FORCE_ARROW_REFERENCE_LENGTH );
     this.totalForceVectorNode.setMagnitudeAngle( 0, 0 );
     addChild( this.totalForceVectorNode );
     this.totalForceVectorNode.setArrowFillPaint( TOTAL_FORCE_COLOR );
     this.totalForceVectorNode.setHeadSize( FORCE_ARROW_HEAD_WIDTH, FORCE_ARROW_HEAD_LENGTH );
     this.totalForceVectorNode.setTailWidth( FORCE_ARROW_TAIL_WIDTH );
     this.totalForceVectorNode.setVisible( false );*/
  }

  return inherit( ParticleNode, ParticleForceNode, {

    /**
     * Set the levels of attractive and repulsive forces being experienced by
     * the particles in the model so that they may be represented as force
     * vectors.
     */
    setForces: function( attractiveForce, repulsiveForce ) {
      this.attractiveForce = attractiveForce;
      this.repulsiveForce = repulsiveForce;
      this.updateForceVectors();
    },

    setShowAttractiveForces: function( showAttractiveForces ) {
      this.attractiveForceVectorNode.setVisible( showAttractiveForces );
    },

    setShowRepulsiveForces: function( showRepulsiveForces ) {
      this.repulsiveForceVectorNode.setVisible( showRepulsiveForces );
    },

    setShowTotalForces: function( showTotalForce ) {
      this.totalForceVectorNode.setVisible( showTotalForce );
    },


    /**
     * Update the force vectors to reflect the forces being experienced by the
     * atom.
     */
    updateForceVectors: function() {
      this.attractiveForceVectorNode.headWidth = this.attractiveForce;
      //this.attractiveForceVectorNode.setMagnitudeAngle( this.attractiveForce, 0 );
      //this.repulsiveForceVectorNode.setMagnitudeAngle( this.repulsiveForce, 0 );
      //this.totalForceVectorNode.setMagnitudeAngle( this.attractiveForce + this.repulsiveForce, 0 );
    }
  } );
} );
