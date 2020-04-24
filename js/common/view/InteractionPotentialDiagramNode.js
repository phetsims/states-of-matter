// Copyright 2014-2020, University of Colorado Boulder

/**
 * This class displays an interaction potential diagram.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import inherit from '../../../../phet-core/js/inherit.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import PositionMarker from '../../atomic-interactions/view/PositionMarker.js';
import ZoomableGridNode from '../../atomic-interactions/view/ZoomableGridNode.js';
import statesOfMatterStrings from '../../statesOfMatterStrings.js';
import statesOfMatter from '../../statesOfMatter.js';
import LjPotentialCalculator from '../model/LjPotentialCalculator.js';
import SOMConstants from '../SOMConstants.js';
import SOMColorProfile from './SOMColorProfile.js';
import merge from '../../../../phet-core/js/merge.js';

const distanceBetweenAtomsString = statesOfMatterStrings.distanceBetweenAtoms;
const distanceBetweenMoleculesString = statesOfMatterStrings.distanceBetweenMolecules;
const epsilonString = statesOfMatterStrings.epsilon;
const potentialEnergyString = statesOfMatterStrings.potentialEnergy;
const sigmaString = statesOfMatterStrings.sigma;

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
const ZOOM_BUTTONS_HEIGHT = 72;

/**
 * @param {number} sigma - Initial value of sigma, a.k.a. the atom diameter
 * @param {number} epsilon - Initial value of epsilon, a.k.a. the interaction strength
 * @param {boolean} wide - true if the widescreen version of the graph is needed, false if not.
 * @param {Object} [options]
 * @constructor
 */
function InteractionPotentialDiagramNode( sigma, epsilon, wide, options ) {

  options = merge( {

    // {boolean} - whether or not this diagram should have a position marker
    includePositionMarker: false
  }, options );

  Node.call( this );
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

  this.epsilonLabel = new Text( epsilonString, {
    font: GREEK_LETTER_FONT,
    fill: SOMColorProfile.controlPanelTextProperty,
    maxWidth: GREEK_LETTER_MAX_WIDTH,
    boundsMethod: 'accurate' // This seems necessary for good graph layout, and doesn't seem to impact performance.
  } );

  // For some of the string tests, a boundsMethod value of 'accurate' causes undefined bounds, so handle this here.
  // TODO: Remove this code if the issue https://github.com/phetsims/scenery/issues/595 is addressed.
  if ( isNaN( this.epsilonLabel.width ) || isNaN( this.epsilonLabel.height ) ) {
    this.epsilonLabel.boundsMethod = 'hybrid';
  }

  const epsilonGraphLabel = new Node( {
    children: [ this.epsilonArrow, this.epsilonLabel ],
    tandem: options.tandem.createTandem( 'epsilonGraphLabel' )
  } );
  this.ljPotentialGraph.addChild( epsilonGraphLabel );

  this.sigmaLabel = new Text( sigmaString, {
    font: GREEK_LETTER_FONT,
    fill: SOMColorProfile.controlPanelTextProperty,
    maxWidth: GREEK_LETTER_MAX_WIDTH
  } );
  this.sigmaArrow = new ArrowNode( 0, 0, 0, 0, {
    headHeight: 8,
    headWidth: 8,
    tailWidth: 3,
    doubleHead: true,
    fill: SOMColorProfile.controlPanelTextProperty,
    lineWidth: 0.5
  } );

  const sigmaGraphLabel = new Node( {
    children: [ this.sigmaArrow, this.sigmaLabel ],
    tandem: options.tandem.createTandem( 'sigmaGraphLabel' )
  } );
  this.ljPotentialGraph.addChild( sigmaGraphLabel );

  // Add the layer where the epsilon line marker will go, this is done so we can achieve the desired layering.
  this.epsilonLineLayer = new Node(); // @protected
  this.ljPotentialGraph.addChild( this.epsilonLineLayer );

  // Add the position marker if included.
  if ( options.includePositionMarker ) {
    const markerDiameter = POSITION_MARKER_DIAMETER_PROPORTION * this.graphWidth;
    this.positionMarker = new PositionMarker( markerDiameter / 2, 'rgb( 117, 217, 255 )', {
      tandem: options.tandem.createTandem( 'positionMarker' )
    } );
    this.ljPotentialGraph.addChild( this.positionMarker );
  }

  // now that the graph portion is built, position it correctly
  this.ljPotentialGraph.x = this.graphXOrigin;
  this.ljPotentialGraph.y = this.graphYOrigin - this.graphHeight;

  // Create the horizontal axis line for the graph.
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

  // Create the vertical axis line for the graph.
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

  // Create the center axis line for the graph.
  this.centerAxis = new Line( 0, 0, this.graphWidth, 0, {
    lineWidth: 0.8,
    stroke: '#A7A7A7',
    x: this.graphXOrigin,
    y: this.graphYOrigin - this.graphHeight / 2
  } );

  // restricted vertical axis label
  const verticalAxisHeight = wide ? this.verticalAxis.height - ZOOM_BUTTONS_HEIGHT : this.verticalAxis.height;
  if ( this.verticalAxisLabel.width > verticalAxisHeight ) {
    this.verticalAxisLabel.scale( verticalAxisHeight / this.verticalAxisLabel.width );
  }

  this.verticalAxisLabel.setTranslation(
    this.graphXOrigin / 2 - this.verticalAxisLabel.height / 2,
    this.graphYOrigin
  );
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
      {
        addZoomButtons: options.zoomable,
        tandem: options.tandem.createTandem( 'gridNode' )
      }
    );
    this.gridNode.x = this.graphXOrigin;
    this.gridNode.y = this.graphYOrigin - this.graphHeight;
    this.addChild( this.gridNode );

    // adjusting zoom buttons  position on interaction diagram
    if ( options.zoomable ) {
      this.gridNode.zoomInButton.right = this.verticalAxis.left - this.gridNode.zoomInButton.width;
      this.gridNode.zoomOutButton.right = this.verticalAxis.left - this.gridNode.zoomInButton.width;
      this.gridNode.zoomInButton.top = this.verticalAxis.top - AXES_ARROW_HEAD_HEIGHT / 2;
      this.gridNode.zoomOutButton.top = this.gridNode.zoomInButton.bottom + 5;
    }
  }
}

statesOfMatter.register( 'InteractionPotentialDiagramNode', InteractionPotentialDiagramNode );

export default inherit( Node, InteractionPotentialDiagramNode, {

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
    this.verticalScalingFactor = ( this.graphHeight / 2.2 ) /
                                 ( SOMConstants.MAX_EPSILON * SOMConstants.K_BOLTZMANN );
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
   * Set the position of the position marker.  Note that is is only possible to set the x axis position, which is
   * distance.  The y axis position is always on the LJ potential curve.
   * @param {number}distance - distance from the center of the interacting molecules.
   * @public
   */
  setMarkerPosition: function( distance ) {
    assert && assert( this.positionMarker, 'position marker not enabled for this potential diagram node' );
    this.markerDistance = distance;
    const xPos = this.markerDistance * ( this.graphWidth / GRAPH_X_RANGE );
    const potential = this.calculateLennardJonesPotential( this.markerDistance );
    const yPos = ( ( this.graphHeight / 2 ) - ( potential * this.verticalScalingFactor ) );
    if ( xPos > 0 && xPos < this.graphWidth && yPos > 0 && yPos < this.graphHeight ) {
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
    this.horizontalAxisLabel.top = this.graphYOrigin + 5;
  },

  /**
   * Calculate the Lennard-Jones potential for the given distance.
   * @param {number} radius
   * @returns {number}
   * @public
   */
  calculateLennardJonesPotential: function( radius ) {
    return ( this.ljPotentialCalculator.calculateLjPotential( radius ) );
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