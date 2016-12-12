// Copyright 2015, University of Colorado Boulder

/**
 * View for Atom
 * @author Aaron Davis
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var ArgonAtom = require( 'STATES_OF_MATTER/common/model/particle/ArgonAtom' );
  var Color = require( 'SCENERY/util/Color' );
  var ConfigurableStatesOfMatterAtom = require( 'STATES_OF_MATTER/common/model/particle/ConfigurableStatesOfMatterAtom' );
  var HydrogenAtom = require( 'STATES_OF_MATTER/common/model/particle/HydrogenAtom' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var NeonAtom = require( 'STATES_OF_MATTER/common/model/particle/NeonAtom' );
  var OxygenAtom = require( 'STATES_OF_MATTER/common/model/particle/OxygenAtom' );
  var Path = require( 'SCENERY/nodes/Path' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Shape = require( 'KITE/Shape' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var MVT_SCALE = 0.25;
  var OVERLAP_ENLARGEMENT_FACTOR = 1.25;

  /**
   * @param {Particle} particle  - The particle in the model that this node will represent in the view.
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinates
   * The gradient is computationally intensive to create, so use only when needed.
   * @param {boolean} enableOverlap - true if the node should be larger than the actual particle, thus allowing particles
   * @constructor
   */
  function ParticleNode( particle, modelViewTransform, enableOverlap ) {
    assert && assert( particle && modelViewTransform );

    Node.call( this );

    // @private
    this.particle = particle;
    this.modelViewTransform = modelViewTransform;
    this.overlapEnabled = enableOverlap;
    this.position = new Vector2();

    // Calculate the diameter of the circle.
    var circleDiameter = particle.radius * 2 * MVT_SCALE;
    if ( this.overlapEnabled ) {
      // Overlap is enabled, so make the shape slightly larger than the radius of the circle so that overlap will occur
      // during inter-particle collisions.
      circleDiameter = circleDiameter * OVERLAP_ENLARGEMENT_FACTOR;
    }

    // @private node that will represent this particle
    this.circle = new Path( new Shape().circle( 0, 0, circleDiameter / 2 ), { fill: this.createFill( particle ) } );
    this.addChild( this.circle );

    // Set ourself to be initially non-pickable so that we don't get mouse events.
    this.setPickable( false );

    this.updatePosition();
  }

  statesOfMatter.register( 'ParticleNode', ParticleNode );

  return inherit( Node, ParticleNode, {

    /**
     * @public
     */
    updatePosition: function() {
      if ( this.particle !== null ) {
        this.position = this.modelViewTransform.modelToViewPosition( this.particle.getPositionReference() );
        this.setTranslation( this.position );
      }
    },

    /**
     * If the radius of the particle changes, we need to redraw ourself to correspond.
     * @public
     */
    handleParticleRadiusChanged: function() {

      // If the size changes, the gradient must also change to match.
      this.circle.fill = this.createFill( this.particle );

      var circleDiameter = this.particle.getRadius() * 2 * MVT_SCALE;
      if ( this.overlapEnabled ) {
        // Make node larger than particle so that overlap appears to happen when the particles collide.
        circleDiameter = circleDiameter * OVERLAP_ENLARGEMENT_FACTOR;
      }
      this.circle.setShape( new Shape().circle( 0, 0, circleDiameter / 2 ) );
    },

    /**
     * Select the color and create the gradient fill for this particle.
     * @return paint to use for this particle
     * @private
     */
    createFill: function( atom ) {

      var baseColor = this.chooseColor( atom );
      var darkenedBaseColor = baseColor.colorUtilsDarker( 0.5 );
      var transparentDarkenedBasedColor = new Color(
        darkenedBaseColor.getRed(),
        darkenedBaseColor.getGreen(),
        darkenedBaseColor.getBlue(),
        0.3
      );

      var radius = ( this.overlapEnabled ? ( atom.getRadius() * OVERLAP_ENLARGEMENT_FACTOR ) :
                     atom.getRadius()) * MVT_SCALE;

      return ( new RadialGradient( 0, 0, 0, 0, 0, radius )
          .addColorStop( 0, baseColor )
          .addColorStop( 0.95, transparentDarkenedBasedColor )
      );
    },

    /**
     * Choose the base color for the node based on the type of atom.
     * @param atom
     * @return
     * @private
     */
    chooseColor: function( atom ) {
      var baseColor;

      if ( atom instanceof ArgonAtom ) {
        baseColor = new Color( StatesOfMatterConstants.ARGON_COLOR );
      }
      else if ( atom instanceof NeonAtom ) {
        baseColor = new Color( StatesOfMatterConstants.NEON_COLOR );
      }
      else if ( atom instanceof OxygenAtom ) {
        baseColor = new Color( StatesOfMatterConstants.OXYGEN_COLOR );
      }
      else if ( atom instanceof HydrogenAtom ) {
        baseColor = new Color( StatesOfMatterConstants.HYDROGEN_COLOR );
      }
      else if ( atom instanceof ConfigurableStatesOfMatterAtom ) {
        baseColor = new Color( StatesOfMatterConstants.ADJUSTABLE_ATTRACTION_COLOR );
      }
      else {
        assert && assert( false, 'unrecognized atom type, unable to assign a color' );
        baseColor = new Color( 'black' );
      }
      return baseColor;
    }
  } );
} )
;
