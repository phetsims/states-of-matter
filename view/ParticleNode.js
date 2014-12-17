// Copyright 2002-2013, University of Colorado Boulder

/**
 * ParticleNode
 *
 * @author Aaron Davis
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var Vector2 = require( 'DOT/Vector2' );
  var Color = require( 'SCENERY/util/Color' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var NeonAtom = require( 'STATES_OF_MATTER/common/model/particle/NeonAtom' );
  var ArgonAtom = require( 'STATES_OF_MATTER/common/model/particle/ArgonAtom' );
  var OxygenAtom = require( 'STATES_OF_MATTER/common/model/particle/OxygenAtom' );
  var HydrogenAtom = require( 'STATES_OF_MATTER/common/model/particle/HydrogenAtom' );
  var HydrogenAtom2 = require( 'STATES_OF_MATTER/common/model/particle/HydrogenAtom2' );
  var ConfigurableStatesOfMatterAtom = require( 'STATES_OF_MATTER/common/model/particle/ConfigurableStatesOfMatterAtom' );

  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  // constants
  var MVT_SCALE = 0.3;//StatesOfMatterConstants.VIEW_CONTAINER_WIDTH / StatesOfMatterConstants.CONTAINER_BOUNDS.width;

  var OVERLAP_ENLARGEMENT_FACTOR = 1.25;

  /**
   * Main constructor.
   *
   * @param particle      - The particle in the model that this node will represent in the view.
   * @param modelViewTransform           - The model view transform for transforming particle position.
   * @param useGradient   - True to use a gradient when displaying the node, false if not.  The gradient is
   *                      computationally intensive to create, so use only when needed.
   * @param enableOverlap - True if the node should be larger than the actual particle, thus allowing particles
   */
  function ParticleNode( particle, modelViewTransform, useGradient, enableOverlap ) {
    assert && assert( particle && modelViewTransform );

    Node.call( this );

    this.particle = particle;
    this.modelViewTransform = modelViewTransform;
    this.useGradient = useGradient;
    this.overlapEnabled = enableOverlap;
    this.position = new Vector2();

    // Register for synchronization with model.
    var thisNode = this;

    /*        this.position.link(function(){
     thisNode.updatePosition();
     });

     this.particle.link(function(){
     thisNode.handleParticleRemoved();
     });
     this.particle.radius.link(function(){
     thisNode.handleParticleRadiusChanged();
     });*/

    // Decide of the diameter of the circle/circle.
    var circleDiameter = particle.radius * 2 * MVT_SCALE;
    if ( this.overlapEnabled ) {
      // Overlap is enabled, so make the shape slightly larger than
      // the radius of the circle so that overlap will occur during
      // inter-particle collisions.
      circleDiameter = circleDiameter * OVERLAP_ENLARGEMENT_FACTOR;
    }

    // Create the node that will represent this particle.  If we are
    // using a gradient, specify that an image should be used, since it
    // will be less computationally intensive to move it around.
    //this.circle = new Circle( circleDiameter/2, { fill: this.choosePaint( particle ) } );
    this.circle = new Path( new Shape().circle( 0, 0, circleDiameter / 2 ), { fill: this.choosePaint( particle ) } );
    this.addChild( this.circle );

    // Set ourself to be non-pickable so that we don't get mouse events.
    this.setPickable( false );

    this.updatePosition();

  }

  return inherit( Node, ParticleNode, {

    getGradientEnabled: function() {
      return this.useGradient;
    },

    setGradientEnabled: function( gradientEnabled ) {
      if ( this.useGradient != gradientEnabled ) {

        this.useGradient = gradientEnabled;

        if ( this.useGradient ) {
          this.circle.fill = this.choosePaint( this.particle );
        }
        else {
          this.circle.fill = this.chooseColor( this.particle );
        }
      }
    },

    //----------------------------------------------------------------------------
    // Private Methods
    //----------------------------------------------------------------------------

    updatePosition: function() {
      if ( this.particle != null ) {
        this.position = this.modelViewTransform.modelToViewPosition( this.particle.positionProperty.value );
        this.setTranslation( this.position );
      }
    },

    /**
     * Handle the removal of the particle within the model that is being
     * represented in the view by this particle node.  This is done by
     * removing ourself from the canvas and by cleaning up any memory
     * references so that we can be garbage collected.
     */
    handleParticleRemoved: function() {

      // Remove ourself from the canvas.
      var parent = this.getParent();
      if ( parent != null ) {
        parent.removeChild( this );
      }

      // Remove all children, since they have a reference to this object.
      this.removeAllChildren();

      // Explicitly clear our reference to the particle in the model.
      this.particle = null;
    },

    /**
     * If the radius of the particle changes, we need to redraw ourself to
     * correspond.
     */
    handleParticleRadiusChanged: function( radius ) {

      if ( this.useGradient ) {
        // If the size changes, the gradient must also change to match.
        this.circle.fill = this.choosePaint( this.particle );
      }
      var circleDiameter = this.particle.getRadius() * 2 * MVT_SCALE;
      if ( this.overlapEnabled ) {
        // Make node larger than particle so that overlap appears to
        // happen when the particles collide.
        circleDiameter = circleDiameter * OVERLAP_ENLARGEMENT_FACTOR;
      }
      //  this.circle.setRadius( circleDiameter/(2*MVT_SCALE) );
      this.circle.setShape( new Shape().circle( 0, 0, circleDiameter / 2 ) );

    },

    /**
     * Select the color for this particle.
     *
     * @return Color to use for this particle.
     */
    choosePaint: function( atom ) {

      var baseColor = this.chooseColor( atom );
      var darkenedBaseColor = baseColor.colorUtilsDarker( 0.8 );
      var transparentDarkenedBasedColor = new Color( darkenedBaseColor.getRed(), darkenedBaseColor.getGreen(),
        darkenedBaseColor.getBlue(), 0.8 );

      if ( this.useGradient ) {
        var radius = (this.overlapEnabled ? (atom.getRadius() * OVERLAP_ENLARGEMENT_FACTOR) : atom.getRadius()) *
                     MVT_SCALE;

        return ( new RadialGradient( 0, 0, 0, 0, 0, radius )
          .addColorStop( 0, baseColor )
          .addColorStop( 1, transparentDarkenedBasedColor )
          );
      }
      else {
        return baseColor;
      }
    },

    /**
     * Choose the base color for the node based on the type of atom.
     *
     * @param atom
     * @return
     */
    chooseColor: function( atom ) {
      var baseColor;

      if ( atom instanceof ArgonAtom ) {
        baseColor = new Color( 255, 138, 117 );
      }
      else if ( atom instanceof NeonAtom ) {
        baseColor = new Color( 112, 212, 255 );
      }
      else if ( atom instanceof OxygenAtom ) {
        baseColor = new Color( 255, 85, 0 );
      }
      else if ( atom instanceof HydrogenAtom ) {
        baseColor = new Color( 255, 255, 255 );
      }
      else if ( atom instanceof HydrogenAtom2 ) {
        baseColor = new Color( 255, 255, 255 );
      }
      else if ( atom instanceof ConfigurableStatesOfMatterAtom ) {
        baseColor = new Color( 204, 102, 204 );
      }
      else {
        baseColor = new Color( 255, 138, 117 );
      }

      return baseColor;
    }
  } );
} );

