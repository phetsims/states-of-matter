// Copyright 2002-2013, University of Colorado Boulder

/**
 * ParticleNode
 *
 * @author Aaron Davis
 */
//TODO: Can be deleted as we are using canvas particle layer
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );

  // constants
  var MVT_SCALE = StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / StatesOfMatterConstants.CONTAINER_BOUNDS.width;


  /**
   * Main constructor.
   *
   * @param {StatesOfMatterAtom} particle The particle in the model that this node will represent in the view.
   * @param {ModelViewTransform} modelViewTransform The model view transform for transforming particle position.
   * @constructor
   */
  function ParticleNode( particle, modelViewTransform ) {
    assert && assert( particle && modelViewTransform );

    Node.call( this );

    this.particle = particle;
    this.modelViewTransform = modelViewTransform;

    // Register for synchronization with model.
    var thisNode = this;
    /*  this.particle.positionProperty.link( function( position ) {
     var location = modelViewTransform.modelToViewPosition( position );
     thisNode.x = location.x;
     thisNode.y = location.y;
     } );*/

    // Decide of the diameter of the sphere/circle.
    var radius = particle.radius * MVT_SCALE;

    this.circle = new Circle( radius, { fill: particle.color } );
    this.addChild( this.circle );
  }

  return inherit( Node, ParticleNode );
} );
