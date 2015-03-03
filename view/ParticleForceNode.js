// Copyright 2002-2011, University of Colorado

/**
 * This class adds the ability to display force-depicting arrows to its super class.
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ParticleNode = require( 'ATOMIC_INTERACTIONS/atomic-interactions/view/ParticleNode' );
  var Color = require( 'SCENERY/util/Color' );
  var DimensionalArrowNode = require( 'ATOMIC_INTERACTIONS/atomic-interactions/view/DimensionalArrowNode' );

  // The following constants control some of the aspects of the appearance of
  // the force arrows.  The values are arbitrary and are chosen to look good
  // in this particular sim, so tweak them as needed for optimal appearance.
  var ATTRACTIVE_FORCE_COLOR = '#FC9732';
  var REPULSIVE_FORCE_COLOR = new Color( 255, 0, 255, 175 ); // Magenta.
  var TOTAL_FORCE_COLOR = '#49B649';
  var COMPONENT_FORCE_ARROW_REFERENCE_LENGTH = 150;
  var COMPONENT_FORCE_ARROW_REFERENCE_MAGNITUDE = 1E-22;
  var TOTAL_FORCE_ARROW_REFERENCE_LENGTH = 200;

  var TOTAL_FORCE_ARROW_REFERENCE_MAGNITUDE = 1E-22;
  var FORCE_ARROW_TAIL_WIDTH = 30;
  var FORCE_ARROW_HEAD_WIDTH = 50;
  var FORCE_ARROW_HEAD_LENGTH = 50;

  /**
   *
   * @param {Particle} particle - The particle in the model that this node will represent in the view.
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinates
   * @param {Boolean} useGradient - true to use a gradient when displaying the node, false if not.
   * The gradient is computationally intensive to create, so use only when needed.
   * @param {Boolean} enableOverlap - true if the node should be larger than the actual particle, thus allowing particles
   * @constructor
   */
  function ParticleForceNode( particle, modelViewTransform, useGradient, enableOverlap ) {


    ParticleNode.call( this, particle, modelViewTransform, useGradient, enableOverlap );

    this.attractiveForce = 0;
    this.repulsiveForce = 0;
    var particleForceNode = this;

    // add attractive force node
    this.attractiveForceVectorNode = new DimensionalArrowNode( 0, 0, COMPONENT_FORCE_ARROW_REFERENCE_LENGTH, 0, {
      fill: ATTRACTIVE_FORCE_COLOR,
      headHeight: FORCE_ARROW_HEAD_LENGTH,
      headWidth: FORCE_ARROW_HEAD_WIDTH,
      tailWidth: FORCE_ARROW_TAIL_WIDTH
    } );
    this.addChild( this.attractiveForceVectorNode );
    this.attractiveForceVectorNode.setVisible( false );

    // add repulsive force node
    this.repulsiveForceVectorNode = new DimensionalArrowNode( 0, 0, COMPONENT_FORCE_ARROW_REFERENCE_LENGTH, 0, {
      fill: REPULSIVE_FORCE_COLOR,
      headHeight: FORCE_ARROW_HEAD_LENGTH,
      headWidth: FORCE_ARROW_HEAD_WIDTH,
      tailWidth: FORCE_ARROW_TAIL_WIDTH
    } );
    this.addChild( this.repulsiveForceVectorNode );
    this.repulsiveForceVectorNode.setVisible( false );

    // add total force node
    this.totalForceVectorNode = new DimensionalArrowNode( 0, 0, TOTAL_FORCE_ARROW_REFERENCE_LENGTH, 0, {
      fill: TOTAL_FORCE_COLOR,
      headHeight: FORCE_ARROW_HEAD_LENGTH,
      headWidth: FORCE_ARROW_HEAD_WIDTH,
      tailWidth: FORCE_ARROW_TAIL_WIDTH
    } );
    this.addChild( this.totalForceVectorNode );
    this.totalForceVectorNode.setVisible( false );

    particle.positionProperty.link( function( position ) {
      particleForceNode.setTranslation( modelViewTransform.modelToViewX( position.x ),
        modelViewTransform.modelToViewY( position.y ) );
    } );


  }

  return inherit( ParticleNode, ParticleForceNode, {

    /**
     * Set the levels of attractive and repulsive forces being experienced by
     * the particles in the model so that they may be represented as force
     * vectors.
     * @param {Number}attractiveForce
     * @param {Number}repulsiveForce
     */
    setForces: function( attractiveForce, repulsiveForce ) {
      this.attractiveForce = attractiveForce;
      this.repulsiveForce = repulsiveForce;
      this.updateForceVectors();
    },

    /**
     *
     * @param {Boolean} showAttractiveForces - true to show attractive force,false is to not show
     */
    setShowAttractiveForces: function( showAttractiveForces ) {
      this.attractiveForceVectorNode.setVisible( showAttractiveForces );
    },

    /**
     *
     * @param {Boolean} showRepulsiveForces - true to show repulsive force,false is to not show
     */
    setShowRepulsiveForces: function( showRepulsiveForces ) {
      this.repulsiveForceVectorNode.setVisible( showRepulsiveForces );
    },

    /**
     *
     * @param {Boolean} showTotalForce - true to show total force,false is to not show
     */
    setShowTotalForces: function( showTotalForce ) {
      this.totalForceVectorNode.setVisible( showTotalForce );
    },

    /**
     * Update the force vectors to reflect the forces being experienced by the
     * atom.
     */
    updateForceVectors: function() {
      var angle = 0;
      var attractiveY = this.attractiveForce * Math.sin( angle ) *
                        (COMPONENT_FORCE_ARROW_REFERENCE_LENGTH / COMPONENT_FORCE_ARROW_REFERENCE_MAGNITUDE);
      var attractiveX = this.attractiveForce * Math.cos( angle ) *
                        (COMPONENT_FORCE_ARROW_REFERENCE_LENGTH / COMPONENT_FORCE_ARROW_REFERENCE_MAGNITUDE);
      this.attractiveForceVectorNode.setTailAndTip( 0, 0, attractiveX, attractiveY );

      var repulsiveY = this.repulsiveForce * Math.sin( angle ) *
                       (COMPONENT_FORCE_ARROW_REFERENCE_LENGTH / COMPONENT_FORCE_ARROW_REFERENCE_MAGNITUDE);
      var repulsiveX = this.repulsiveForce * Math.cos( angle ) *
                       (COMPONENT_FORCE_ARROW_REFERENCE_LENGTH / COMPONENT_FORCE_ARROW_REFERENCE_MAGNITUDE);
      this.repulsiveForceVectorNode.setTailAndTip( 0, 0, repulsiveX, repulsiveY );

      var totalForceY = (this.attractiveForce + this.repulsiveForce) * Math.sin( angle ) *
                        (TOTAL_FORCE_ARROW_REFERENCE_LENGTH / TOTAL_FORCE_ARROW_REFERENCE_MAGNITUDE);
      var totalForceX = (this.attractiveForce + this.repulsiveForce) * Math.cos( angle ) *
                        (TOTAL_FORCE_ARROW_REFERENCE_LENGTH / TOTAL_FORCE_ARROW_REFERENCE_MAGNITUDE );
      this.totalForceVectorNode.setTailAndTip( 0, 0, totalForceX, totalForceY );
    }
  } );
} );
