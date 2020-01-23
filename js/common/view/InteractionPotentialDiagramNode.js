// Copyright 2014-2020, University of Colorado Boulder

/**
 * This class displays an interaction potential diagram.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const LjPotentialCalculator = require( 'STATES_OF_MATTER/common/model/LjPotentialCalculator' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const PositionMarker = require( 'STATES_OF_MATTER/atomic-interactions/view/PositionMarker' );
  const SOMColorProfile = require( 'STATES_OF_MATTER/common/view/SOMColorProfile' );
  const SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Vector2 = require( 'DOT/Vector2' );
  const ZoomableGridNode = require( 'STATES_OF_MATTER/atomic-interactions/view/ZoomableGridNode' );

  // strings
  const distanceBetweenAtomsString = require( 'string!STATES_OF_MATTER/distanceBetweenAtoms' );
  const distanceBetweenMoleculesString = require( 'string!STATES_OF_MATTER/distanceBetweenMolecules' );
  const epsilonString = require( 'string!STATES_OF_MATTER/epsilon' );
  const potentialEnergyString = require( 'string!STATES_OF_MATTER/potentialEnergy' );
  const sigmaString = require( 'string!STATES_OF_MATTER/sigma' );

  // Constant that controls the range of data that is graphed.
  const GRAPH_X_RANGE = 1300; // in picometers

  // constants that control the appearance of the diagram.
  const NARROW_VERSION_WIDTH = 135;
  const WIDE_VERSION_WIDTH = 350;
  const AXIS_LINE_WIDTH = 2;
  const AXES_ARROW_HEAD_HEIGHT = 4 * AXIS_LINE_WIDTH;

  // Size of pos marker wrt overall width.
  const POSITION_MARKER_DIAMETER_PROPORTION = 0.03;

  // constants that control the location and size of the graph.
  const VERT_AXIS_SIZE_PROPORTION = 0.85;

  // Font for the labels used on the axes and within the graph.
  const GREEK_LETTER_FONT_SIZE = 18;
  let GREEK_LETTER_FONT = new PhetFont( GREEK_LETTER_FONT_SIZE );
  let GREEK_LETTER_MAX_WIDTH;

  // zoom buttons height
  const zoomButtonsHeight = 72;

  /**
   * @param {number} sigma - Initial value of sigma, a.k.a. the atom diameter
   * @param {number} epsilon - Initial value of epsilon, a.k.a. the interaction strength
   * @param {boolean} wide - true if the widescreen version of the graph is needed, false if not.
   * @param {Tandem} tandem
   * @constructor
   */
  function InteractionPotentialDiagramNode( sigma, epsilon, wide, tandem ) {

    Node.call( this );
    this.positionMarkerEnabled = false;
    this.graphMin = new Vector2( 0, 0 );
    this.zeroCrossingPoint = new Vector2( 0, 0 );
    this.markerDistance = 0;
    this.ljPotentialCalculator = new LjPotentialCalculator( sigma, epsilon );

    let axisLabelFont;

    // Set up for the normal or wide version of the graph.
    if ( wide ) {
      this.widthOfGraph = WIDE_VERSION_WIDTH;
      this.heightOfGraph = this.widthOfGraph * 0.75;
      GREEK_LETTER_FONT = new PhetFont( 22 );
      axisLabelFont = new PhetFont( { size: 16, fill: SOMColorProfile.controlPanelTextProperty } );
      GREEK_LETTER_MAX_WIDTH = 60;
    }
    else {
      this.widthOfGraph = NARROW_VERSION_WIDTH;
      this.heightOfGraph = this.widthOfGraph * 0.8;
      axisLabelFont = new PhetFont( { size: 11, fill: SOMColorProfile.controlPanelTextProperty } );
      GREEK_LETTER_FONT = new PhetFont( GREEK_LETTER_FONT_SIZE );
      GREEK_LETTER_MAX_WIDTH = 17;
    }
    this.graphXOrigin = 0.05 * this.widthOfGraph;
    this.graphYOrigin = 0.85 * this.heightOfGraph;
    this.graphWidth = this.widthOfGraph - this.graphXOrigin - AXES_ARROW_HEAD_HEIGHT;

    this.graphHeight = this.heightOfGraph * VERT_AXIS_SIZE_PROPORTION - AXES_ARROW_HEAD_HEIGHT;

    // Layer where the graph elements are added.
    this.ljPotentialGraph = new Node();

    //  Using ~45% (1/2.2) of graph height instead of 50 % graph height as in the Java version.
    // This is done to fix the point flickering at the bottom most point.
    // see https://github.com/phetsims/states-of-matter/issues/63 and
    // https://github.com/phetsims/states-of-matter/issues/25
    this.verticalScalingFactor = ( this.graphHeight / 2.2 ) /
                                 ( SOMConstants.MAX_EPSILON * SOMConstants.K_BOLTZMANN );
    this.horizontalLineCount = 5;

    // Add the arrows and labels that will depict sigma and epsilon.
    this.epsilonArrow = new ArrowNode( 0, 0, 0, 0, {
      headHeight: 8,
      headWidth: 20,
      tailWidth: 9,
      doubleHead: false,
      fill: SOMColorProfile.controlPanelTextProperty,
      lineWidth: 0.5
    } );
    this.ljPotentialGraph.addChild( this.epsilonArrow );

    this.epsilonLabel = new Text( epsilonString, {
      font: GREEK_LETTER_FONT,
      fill: SOMColorProfile.controlPanelTextProperty,
      maxWidth: GREEK_LETTER_MAX_WIDTH,
      boundsMethod: 'accurate' // This seems necessary for good graph layout, and doesn't seem to impact performance.
    } );

    // For some of the string tests, a boundsMethod value of 'accurate' causes undefined bounds, so handle this here.
    // TODO: Removve this code if the issue https://github.com/phetsims/scenery/issues/595 is addressed.
    if ( isNaN( this.epsilonLabel.width ) || isNaN( this.epsilonLabel.height ) ) {
      this.epsilonLabel.boundsMethod = 'hybrid';
    }
    this.ljPotentialGraph.addChild( this.epsilonLabel );

    this.sigmaLabel = new Text( sigmaString, {
      font: GREEK_LETTER_FONT,
      fill: SOMColorProfile.controlPanelTextProperty,
      maxWidth: GREEK_LETTER_MAX_WIDTH
    } );
    this.ljPotentialGraph.addChild( this.sigmaLabel );
    this.sigmaArrow = new ArrowNode( 0, 0, 0, 0, {
      headHeight: 8,
      headWidth: 8,
      tailWidth: 3,
      doubleHead: true,
      fill: SOMColorProfile.controlPanelTextProperty,
      lineWidth: 0.5
    } );
    this.ljPotentialGraph.addChild( this.sigmaArrow );

    // Add the layer where the eplison line marker will go, this is done so we can achieve the desired layering.
    this.epsilonLineLayer = new Node(); // @protected
    this.ljPotentialGraph.addChild( this.epsilonLineLayer );

    // Add the position marker.
    const markerDiameter = POSITION_MARKER_DIAMETER_PROPORTION * this.graphWidth;
    this.positionMarker = new PositionMarker( markerDiameter / 2, 'rgb( 117, 217, 255 )' );
    this.positionMarker.setVisible( this.positionMarkerEnabled );
    this.ljPotentialGraph.addChild( this.positionMarker );

    // now that the graph portion is built, position it correctly
    this.ljPotentialGraph.x = this.graphXOrigin;
    this.ljPotentialGraph.y = this.graphYOrigin - this.graphHeight;

    // Create and add the horizontal axis line for the graph.
    this.horizontalAxis = new ArrowNode( 0, 0, this.graphWidth + AXES_ARROW_HEAD_HEIGHT, 0, {
      fill: SOMColorProfile.controlPanelTextProperty,
      stroke: SOMColorProfile.controlPanelTextProperty,
      headHeight: 8,
      headWidth: 8,
      tailWidth: 2,
      x: this.graphXOrigin,
      y: this.graphYOrigin
    } );

    this.horizontalAxisLabel = new Text( distanceBetweenAtomsString, {
      fill: SOMColorProfile.controlPanelTextProperty,
      font: axisLabelFont
    } );
    if ( this.horizontalAxisLabel.width > this.horizontalAxis.width ) {
      if ( wide ) {
        this.horizontalAxisLabel.maxWidth = this.horizontalAxis.width;
      }
      else {
        this.horizontalAxisLabel.maxWidth = this.horizontalAxis.width + 30;
      }
    }

    this.setMolecular( false );

    // Create and add the vertical axis line for the graph.
    this.verticalAxis = new ArrowNode( 0, 0, 0, -this.graphHeight - AXES_ARROW_HEAD_HEIGHT, {
      fill: SOMColorProfile.controlPanelTextProperty,
      stroke: SOMColorProfile.controlPanelTextProperty,
      headHeight: 8,
      headWidth: 8,
      tailWidth: AXIS_LINE_WIDTH,
      x: this.graphXOrigin,
      y: this.graphYOrigin
    } );

    this.verticalAxisLabel = new Text( potentialEnergyString, {
      fill: SOMColorProfile.controlPanelTextProperty,
      font: axisLabelFont
    } );

    // restricted vertical  axis label
    const verticalAxisHeight = wide ? this.verticalAxis.height - zoomButtonsHeight : this.verticalAxis.height;
    if ( this.verticalAxisLabel.width > verticalAxisHeight ) {
      this.verticalAxisLabel.scale( verticalAxisHeight / this.verticalAxisLabel.width );
    }

    this.verticalAxisLabel.setTranslation( this.graphXOrigin / 2 - this.verticalAxisLabel.height / 2,
      this.graphYOrigin );
    this.verticalAxisLabel.setRotation( 3 * Math.PI / 2 );

    // Initializing here to reduce allocations
    this.epsilonArrowStartPt = new Vector2( 0, 0 );

    // Draw the initial curve upon the graph.
    this.drawPotentialCurve();

    if ( wide ) {
      this.gridNode = new ZoomableGridNode(
        this,
        0,
        0,
        this.graphWidth,
        this.graphHeight,
        tandem.createTandem( 'gridNode' )
      );
      this.gridNode.x = this.graphXOrigin;
      this.gridNode.y = this.graphYOrigin - this.graphHeight;
      this.addChild( this.gridNode );

      // adjusting zoom buttons  position on interaction diagram
      this.gridNode.zoomInButton.right = this.verticalAxis.left - this.gridNode.zoomInButton.width;
      this.gridNode.zoomOutButton.right = this.verticalAxis.left - this.gridNode.zoomInButton.width;
      this.gridNode.zoomInButton.top = this.verticalAxis.top - AXES_ARROW_HEAD_HEIGHT / 2;
      this.gridNode.zoomOutButton.top = this.gridNode.zoomInButton.bottom + 5;
    }
  }

  statesOfMatter.register( 'InteractionPotentialDiagramNode', InteractionPotentialDiagramNode );

  return inherit( Node, InteractionPotentialDiagramNode, {

    /**
     * Set the parameters that define the shape of the Lennard-Jones potential curve.
     * @param{number} sigma -  atom diameter
     * @param {number} epsilon - interaction strength
     * @public
     */
    setLjPotentialParameters: function( sigma, epsilon ) {

      // Update the Lennard-Jones force calculator.
      this.ljPotentialCalculator.setEpsilon( epsilon );
      this.ljPotentialCalculator.setSigma( sigma );
    },

    /**
     * @public
     */
    reset: function() {
      this.verticalScalingFactor = (this.graphHeight / 2.2) /
                                   (SOMConstants.MAX_EPSILON * SOMConstants.K_BOLTZMANN);
      this.horizontalLineCount = 5;
      this.gridNode.setHorizontalLines( 0, 0, this.graphWidth, this.graphHeight, this.horizontalLineCount );
      this.drawPotentialCurve();
    },

    /**
     * @returns {number}
     * @public
     */
    getGraphHeight: function() {
      return this.graphHeight;
    },

    /**
     * @returns {number}
     * @public
     */
    getGraphWidth: function() {
      return this.graphWidth;
    },

    /**
     * @returns {Vector2}
     * @public
     */
    getZeroCrossingPoint: function() {
      return this.zeroCrossingPoint;
    },

    /**
     * @returns {Vector2}
     * @public
     */
    getGraphMin: function() {
      return this.graphMin;
    },

    /**
     * @param {boolean} enabled - indicate to whether enable the position marker or not.
     * @public
     */
    setMarkerEnabled: function( enabled ) {
      this.positionMarkerEnabled = enabled;
    },

    /**
     * Set the position of the position marker.  Note that is is only possible to set the x axis position, which is
     * distance.  The y axis position is always on the LJ potential curve.
     * @param {number}distance - distance from the center of the interacting molecules.
     * @public
     */
    setMarkerPosition: function( distance ) {
      this.markerDistance = distance;
      const xPos = this.markerDistance * ( this.graphWidth / GRAPH_X_RANGE );
      const potential = this.calculateLennardJonesPotential( this.markerDistance );
      const yPos = ( ( this.graphHeight / 2 ) - ( potential * this.verticalScalingFactor ) );
      if ( this.positionMarkerEnabled && xPos > 0 && xPos < this.graphWidth && yPos > 0 && yPos < this.graphHeight ) {
        this.positionMarker.setVisible( true );
        this.positionMarker.setTranslation( xPos, yPos );
      }
      else {
        this.positionMarker.setVisible( false );
      }
    },

    /**
     * Set whether the graph is showing the potential between individual atoms or multi-atom molecules.
     * @param {boolean} molecular - true if graph is portraying molecules, false for individual atoms.
     * @public
     */
    setMolecular: function( molecular ) {
      if ( molecular ) {
        this.horizontalAxisLabel.setText( distanceBetweenMoleculesString );
      }
      else {
        this.horizontalAxisLabel.setText( distanceBetweenAtomsString );
      }
      this.horizontalAxisLabel.centerX = this.graphXOrigin + ( this.graphWidth / 2 );
      this.horizontalAxisLabel.top = this.graphYOrigin;
    },

    /**
     * Calculate the Lennard-Jones potential for the given distance.
     * @param {number} radius
     * @returns {number}
     * @public
     */
    calculateLennardJonesPotential: function( radius ) {
      return (  this.ljPotentialCalculator.calculateLjPotential( radius ));
    },

    /**
     * Draw the curve that reflects the Lennard-Jones potential based upon the current values for sigma and epsilon.
     */
    drawPotentialCurve: function() {
      // must be overridden in descendant types, so assert if called here
      assert && assert( false, 'this function must be overridden in descendant classes' );
    },

    GRAPH_X_RANGE: GRAPH_X_RANGE
  } );
} );