// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for Atom .
 * @author Aaron Davis
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
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
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );

  // constants
  var MVT_SCALE = 0.25;
  var OVERLAP_ENLARGEMENT_FACTOR = 1.25;

  /**
   * @param {Particle} particle  - The particle in the model that this node will represent in the view.
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinates
   * @param {Boolean}useGradient - true to use a gradient when displaying the node, false if not.
   * The gradient is computationally intensive to create, so use only when needed.
   * @param {Boolean}enableOverlap - true if the node should be larger than the actual particle, thus allowing particles
   * @constructor
   */
  function ParticleNode( particle, modelViewTransform, useGradient, enableOverlap ) {
    assert && assert( particle && modelViewTransform );

    Node.call( this );

    this.particle = particle;
    this.modelViewTransform = modelViewTransform;
    this.useGradient = useGradient;
    this.overlapEnabled = enableOverlap;
    this.position = new Vector2();

    // Calculate the diameter of the circle.
    var circleDiameter = particle.radius * 2 * MVT_SCALE;
    if ( this.overlapEnabled ) {
      // Overlap is enabled, so make the shape slightly larger than
      // the radius of the circle so that overlap will occur during
      // inter-particle collisions.
      circleDiameter = circleDiameter * OVERLAP_ENLARGEMENT_FACTOR;
    }

    // Create the node that will represent this particle.
    this.circle = new Path( new Shape().circle( 0, 0, circleDiameter / 2 ), { fill: this.choosePaint( particle ) } );
    this.addChild( this.circle );

    // Set ourself to be initially non-pickable so that we don't get mouse events.
    this.setPickable( false );

    this.updatePosition();
  }

  return inherit( Node, ParticleNode, {

    /**
     * @public
     * @returns {boolean}
     */
    getGradientEnabled: function() {
      return this.useGradient;
    },

    /**
     * @public
     * @param gradientEnabled
     */
    setGradientEnabled: function( gradientEnabled ) {
      if ( this.useGradient !== gradientEnabled ) {
        this.useGradient = gradientEnabled;

        if ( this.useGradient ) {
          this.circle.fill = this.choosePaint( this.particle );
        }
        else {
          this.circle.fill = this.chooseColor( this.particle );
        }
      }
    },

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
     * @public
     * If the radius of the particle changes, we need to redraw ourself to correspond.
     */
    handleParticleRadiusChanged: function() {

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
      this.circle.setShape( new Shape().circle( 0, 0, circleDiameter / 2 ) );
    },

    /**
     * Select the color and create the solid or gradient paint for this particle.
     *
     * @return paint to use for this particle
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
        baseColor = PhetColorScheme.RED_COLORBLIND;
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
