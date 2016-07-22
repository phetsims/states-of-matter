// Copyright 2014-2015, University of Colorado Boulder

/**
 * This class displays an interaction potential diagram.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var ZoomableGridNode = require( 'STATES_OF_MATTER/atomic-interactions/view/ZoomableGridNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LjPotentialCalculator = require( 'STATES_OF_MATTER/common/model/LjPotentialCalculator' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PositionMarker = require( 'STATES_OF_MATTER/atomic-interactions/view/PositionMarker' );
  var Shape = require( 'KITE/Shape' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var distanceBetweenAtomsString = require( 'string!STATES_OF_MATTER/distanceBetweenAtoms' );
  var distanceBetweenMoleculesString = require( 'string!STATES_OF_MATTER/distanceBetweenMolecules' );
  var potentialEnergyString = require( 'string!STATES_OF_MATTER/potentialEnergy' );
  var sigmaString = require( 'string!STATES_OF_MATTER/sigma' );
  var epsilonString = require( 'string!STATES_OF_MATTER/epsilon' );

  // Constant that controls the range of data that is graphed.
  var MAX_INTER_ATOM_DISTANCE = 1700; // in picometers

  // constants that control the appearance of the diagram.
  var NARROW_VERSION_WIDTH = 135;
  var WIDE_VERSION_WIDTH = 450;
  var AXIS_LINE_WIDTH = 2;
  var AXES_ARROW_HEAD_HEIGHT = 4 * AXIS_LINE_WIDTH;

  // Size of pos marker wrt overall width.
  var POSITION_MARKER_DIAMETER_PROPORTION = 0.03;

  // constants that control the location and size of the graph.
  var VERT_AXIS_SIZE_PROPORTION = 0.85;

  // Font for the labels used on the axes and within the graph.
  var AXIS_LABEL_FONT_SIZE = 12;
  var AXIS_LABEL_FONT;
  var GREEK_LETTER_FONT_SIZE = 18;
  var GREEK_LETTER_FONT = new PhetFont( GREEK_LETTER_FONT_SIZE );
  var GREEK_LETTER_MAX_WIDTH;

  // zoom buttons height
  var zoomButtonsHeight = 72;

  /**
   * @param {number} sigma - Initial value of sigma, a.k.a. the atom diameter
   * @param {number} epsilon - Initial value of epsilon, a.k.a. the interaction strength
   * @param {boolean} wide - true if the widescreen version of the graph is needed, false if not.
   * @constructor
   */
  function InteractionPotentialDiagramNode( sigma, epsilon, wide ) {

    Node.call( this );
    this.positionMarkerEnabled = false;
    this.graphMin = new Vector2( 0, 0 );
    this.zeroCrossingPoint = new Vector2( 0, 0 );
    this.markerDistance = 0;
    this.ljPotentialCalculator = new LjPotentialCalculator( sigma, epsilon );

    // Set up for the normal or wide version of the graph.
    if ( wide ) {
      this.widthOfGraph = WIDE_VERSION_WIDTH;
      this.heightOfGraph = this.widthOfGraph * 0.6;
      GREEK_LETTER_FONT = new PhetFont( 22 );
      AXIS_LABEL_FONT = new PhetFont( 16 );
      GREEK_LETTER_MAX_WIDTH = 60;
    }
    else {
      this.widthOfGraph = NARROW_VERSION_WIDTH;
      this.heightOfGraph = this.widthOfGraph * 0.8;
      AXIS_LABEL_FONT = new PhetFont( AXIS_LABEL_FONT_SIZE );
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
    this.verticalScalingFactor = (this.graphHeight / 2.2) /
                                 (StatesOfMatterConstants.MAX_EPSILON * StatesOfMatterConstants.K_BOLTZMANN);
    this.horizontalLineCount = 5;

    // Create and add the portion that depicts the Lennard-Jones potential curve.
    this.ljPotentialGraph.setTranslation( this.graphXOrigin, this.graphYOrigin - this.graphHeight );

    // Create and add the center axis line for the graph.
    var centerAxis = new Path( Shape.lineSegment( 0, 0, this.graphWidth, 0 ), { lineWidth: 0.8, stroke: '#A7A7A7' } );
    this.ljPotentialGraph.addChild( centerAxis );
    centerAxis.setTranslation( 0, this.graphHeight / 2 );

    // Add the arrows and labels that will depict sigma and epsilon.
    this.epsilonArrow = new ArrowNode( 0, 0, 0, 0, {
      headHeight: 8,
      headWidth: 20,
      tailWidth: 9,
      doubleHead: false,
      fill: 'white',
      lineWidth: 0.5
    } );
    this.ljPotentialGraph.addChild( this.epsilonArrow );

    this.epsilonLabel = new Text( epsilonString, {
      font: GREEK_LETTER_FONT,
      fill: 'white',
      maxWidth: GREEK_LETTER_MAX_WIDTH
    } );
    this.ljPotentialGraph.addChild( this.epsilonLabel );

    this.sigmaLabel = new Text( sigmaString, {
      font: GREEK_LETTER_FONT,
      fill: 'white',
      maxWidth: GREEK_LETTER_MAX_WIDTH
    } );
    this.ljPotentialGraph.addChild( this.sigmaLabel );
    this.sigmaArrow = new ArrowNode( 0, 0, 0, 0, {
      headHeight: 8,
      headWidth: 8,
      tailWidth: 3,
      doubleHead: true,
      fill: 'white',
      lineWidth: 0.5
    } );
    this.ljPotentialGraph.addChild( this.sigmaArrow );

    // Add the position marker.
    var markerDiameter = POSITION_MARKER_DIAMETER_PROPORTION * this.graphWidth;
    this.positionMarker = new PositionMarker( markerDiameter / 2, 'rgb( 117, 217, 255 )' );
    this.positionMarker.setVisible( this.positionMarkerEnabled );

    this.epsilonLineLayer = new Node();
    this.ljPotentialGraph.addChild( this.epsilonLineLayer );
    this.ljPotentialGraph.addChild( this.positionMarker );

    // Create and add the horizontal axis line for the graph.
    this.horizontalAxis = new ArrowNode( 0, 0, this.graphWidth + AXES_ARROW_HEAD_HEIGHT, 0, {
      stroke: 'white',
      fill: 'white',
      headHeight: 8,
      headWidth: 8,
      tailWidth: 2,
      x: this.graphXOrigin,
      y: this.graphYOrigin
    } );

    this.horizontalAxisLabel = new Text( distanceBetweenAtomsString, {
      fill: 'white',
      font: wide? AXIS_LABEL_FONT : AXIS_LABEL_FONT - 1
    } );
    if ( this.horizontalAxisLabel.width > this.horizontalAxis.width ) {
      if ( wide ){
        this.horizontalAxisLabel.maxWidth = this.horizontalAxis.width;
      }
      else{
        this.horizontalAxisLabel.maxWidth = this.horizontalAxis.width + 50;
      }

    }

    this.setMolecular( false );

    // Create and add the vertical axis line for the graph.
    this.verticalAxis = new ArrowNode( 0, 0, 0, -this.graphHeight - AXES_ARROW_HEAD_HEIGHT, {
      fill: 'white',
      headHeight: 8,
      headWidth: 8,
      tailWidth: AXIS_LINE_WIDTH,
      x: this.graphXOrigin,
      y: this.graphYOrigin
    } );

    this.verticalAxisLabel = new Text( potentialEnergyString, {
      fill: 'white',
      font: AXIS_LABEL_FONT
    } );

    // restricted vertical  axis label
    var verticalAxisHeight = wide ? this.verticalAxis.height - zoomButtonsHeight : this.verticalAxis.height;
    if ( this.verticalAxisLabel.width > verticalAxisHeight ) {
      this.verticalAxisLabel.scale( verticalAxisHeight / this.verticalAxisLabel.width );
    }

    this.verticalAxisLabel.setTranslation( this.graphXOrigin / 2 - this.verticalAxisLabel.height / 2,
      this.graphYOrigin );
    this.verticalAxisLabel.setRotation( 3 * Math.PI / 2 );

    // Initializing here to reduce allocations
    this.epsilonArrowStartPt = new Vector2( 0, 0 );

    // Draw the curve upon the graph.
    this.drawPotentialCurve();
    var epsilonLabelYOffset = wide ? 60 : 24;
    this.epsilonLabel.setTranslation( this.graphMin.x + this.epsilonLabel.width,
      ( this.graphMin.y - this.epsilonLabel.height / 2 + this.graphHeight / 2) / 2 + epsilonLabelYOffset );
    if ( wide ) {
      this.gridNode = new ZoomableGridNode( this, 0, 0, this.graphWidth, this.graphHeight );
      this.ljPotentialGraph.addChild( this.gridNode );
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
                                   (StatesOfMatterConstants.MAX_EPSILON * StatesOfMatterConstants.K_BOLTZMANN);
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
      var xPos = this.markerDistance * (  this.graphWidth / MAX_INTER_ATOM_DISTANCE);
      var potential = this.calculateLennardJonesPotential( this.markerDistance );
      var yPos = ((  this.graphHeight / 2) - (potential * this.verticalScalingFactor));
      if ( this.positionMarkerEnabled && (xPos > 0) && (xPos < this.graphWidth) &&
           (yPos > 0) && (yPos < this.graphHeight) ) {
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
     * @return {number}
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

    MAX_INTER_ATOM_DISTANCE: MAX_INTER_ATOM_DISTANCE
  } );
} );