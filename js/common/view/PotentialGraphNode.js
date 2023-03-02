// Copyright 2014-2023, University of Colorado Boulder

/**
 * This class displays a graph that depicts and interaction potential.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line, Node, Text } from '../../../../scenery/js/imports.js';
import PositionMarker from '../../atomic-interactions/view/PositionMarker.js';
import ZoomableGridNode from '../../atomic-interactions/view/ZoomableGridNode.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';
import LjPotentialCalculator from '../model/LjPotentialCalculator.js';
import SOMConstants from '../SOMConstants.js';
import SOMColors from './SOMColors.js';

const distanceBetweenAtomsString = StatesOfMatterStrings.distanceBetweenAtoms;
const distanceBetweenMoleculesString = StatesOfMatterStrings.distanceBetweenMolecules;
const epsilonString = StatesOfMatterStrings.epsilon;
const potentialEnergyString = StatesOfMatterStrings.potentialEnergy;
const sigmaString = StatesOfMatterStrings.sigma;

// constant that controls the range of data that is graphed
const X_RANGE = 1300; // in picometers

// constants that control the appearance of the graph
const NARROW_VERSION_WIDTH = 135;
const WIDE_VERSION_WIDTH = 350;
const AXIS_LINE_WIDTH = 2;
const AXES_ARROW_HEAD_HEIGHT = 4 * AXIS_LINE_WIDTH;

// Size of pos marker wrt overall width.
const POSITION_MARKER_DIAMETER_PROPORTION = 0.03;

// constants that control the position and size of the graph.
const VERT_AXIS_SIZE_PROPORTION = 0.85;

// Font for the labels used on the axes and within the graph.
const GREEK_LETTER_FONT_SIZE = 18;
let GREEK_LETTER_FONT = new PhetFont( GREEK_LETTER_FONT_SIZE );
let GREEK_LETTER_MAX_WIDTH;

// zoom buttons height
const ZOOM_BUTTONS_HEIGHT = 72;

class PotentialGraphNode extends Node {

  /**
   * @param {number} sigma - Initial value of sigma, a.k.a. the atom diameter
   * @param {number} epsilon - Initial value of epsilon, a.k.a. the interaction strength
   * @param {Object} [options]
   */
  constructor( sigma, epsilon, options ) {

    options = merge( {

      // {boolean} - true if the widescreen version of the graph is needed, false if not
      wide: false,

      // {boolean} - whether or not this graph instance should have a position marker
      includePositionMarker: false,

      // {boolean} - whether or not this graph instance should allow interactivity (see usage for more information)
      allowInteraction: false

    }, options );

    super();

    // @public (read-only)
    this.graphMin = new Vector2( 0, 0 );
    this.xRange = X_RANGE;
    this.zeroCrossingPoint = new Vector2( 0, 0 );
    this.markerDistance = 0;
    this.ljPotentialCalculator = new LjPotentialCalculator( sigma, epsilon );

    let axisLabelFont;

    // Set up for the normal or wide version of the graph.
    if ( options.wide ) {
      this.widthOfGraph = WIDE_VERSION_WIDTH;
      this.heightOfGraph = this.widthOfGraph * 0.75;
      GREEK_LETTER_FONT = new PhetFont( 22 );
      axisLabelFont = new PhetFont( { size: 16, fill: SOMColors.controlPanelTextProperty } );
      GREEK_LETTER_MAX_WIDTH = 60;
    }
    else {
      this.widthOfGraph = NARROW_VERSION_WIDTH;
      this.heightOfGraph = this.widthOfGraph * 0.8;
      axisLabelFont = new PhetFont( { size: 11, fill: SOMColors.controlPanelTextProperty } );
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
      fill: SOMColors.controlPanelTextProperty,
      lineWidth: 0.5
    } );

    this.epsilonLabel = new Text( epsilonString, {
      font: GREEK_LETTER_FONT,
      fill: SOMColors.controlPanelTextProperty,
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
      fill: SOMColors.controlPanelTextProperty,
      maxWidth: GREEK_LETTER_MAX_WIDTH
    } );
    this.sigmaArrow = new ArrowNode( 0, 0, 0, 0, {
      headHeight: 8,
      headWidth: 8,
      tailWidth: 3,
      doubleHead: true,
      fill: SOMColors.controlPanelTextProperty,
      lineWidth: 0.5
    } );

    const sigmaGraphLabel = new Node( {
      children: [ this.sigmaArrow, this.sigmaLabel ],
      tandem: options.tandem.createTandem( 'sigmaGraphLabel' )
    } );
    this.ljPotentialGraph.addChild( sigmaGraphLabel );

    // If enabled, add the layer where interactive controls can be placed and other infrastructure.  This does not provide
    // any interactivity by itself, it merely creates support for interactive controls that can be added by subclasses.
    if ( options.allowInteraction ) {

      // @protected - layer where interactive controls can be added by subclasses
      this.interactiveControlsLayer = new Node( {
        tandem: options.tandem.createTandem( 'interactiveControls' ),
        phetioDocumentation: 'Used for \'Adjustable Attraction\' only'
      } );
      this.ljPotentialGraph.addChild( this.interactiveControlsLayer );

      // @protected - an object where specific controls can be added for controlling the epsilon parameter in the Lennard-
      // Jones potential calculations, see usages in subclasses
      this.epsilonControls = {
        arrow: null,
        line: null
      };

      // @protected - an object where a specific control can be added for controlling the sigma parameter in the Lennard-
      // Jones potential calculations, see usages in subclasses.  See usages in subclasses.
      this.sigmaControls = {
        arrow: null
      };
    }

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
      fill: SOMColors.controlPanelTextProperty,
      stroke: SOMColors.controlPanelTextProperty,
      headHeight: 8,
      headWidth: 8,
      tailWidth: 2,
      x: this.graphXOrigin,
      y: this.graphYOrigin
    } );

    this.horizontalAxisLabel = new Text( distanceBetweenAtomsString, {
      fill: SOMColors.controlPanelTextProperty,
      font: axisLabelFont
    } );
    if ( this.horizontalAxisLabel.width > this.horizontalAxis.width ) {
      if ( options.wide ) {
        this.horizontalAxisLabel.maxWidth = this.horizontalAxis.width;
      }
      else {
        this.horizontalAxisLabel.maxWidth = this.horizontalAxis.width + 30;
      }
    }

    this.setMolecular( false );

    // Create the vertical axis line for the graph.
    this.verticalAxis = new ArrowNode( 0, 0, 0, -this.graphHeight - AXES_ARROW_HEAD_HEIGHT, {
      fill: SOMColors.controlPanelTextProperty,
      stroke: SOMColors.controlPanelTextProperty,
      headHeight: 8,
      headWidth: 8,
      tailWidth: AXIS_LINE_WIDTH,
      x: this.graphXOrigin,
      y: this.graphYOrigin
    } );

    this.verticalAxisLabel = new Text( potentialEnergyString, {
      fill: SOMColors.controlPanelTextProperty,
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
    const verticalAxisHeight = options.wide ? this.verticalAxis.height - ZOOM_BUTTONS_HEIGHT : this.verticalAxis.height;
    if ( this.verticalAxisLabel.width > verticalAxisHeight ) {
      this.verticalAxisLabel.scale( verticalAxisHeight / this.verticalAxisLabel.width );
    }

    this.verticalAxisLabel.setTranslation(
      this.graphXOrigin / 2 - this.verticalAxisLabel.height / 2,
      this.graphYOrigin
    );
    this.verticalAxisLabel.setRotation( 3 * Math.PI / 2 );

    // Draw the initial curve upon the graph.
    this.drawPotentialCurve();

    if ( options.wide ) {
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
    }
  }

  /**
   * Set the parameters that define the shape of the Lennard-Jones potential curve.
   * @param{number} sigma -  atom diameter
   * @param {number} epsilon - interaction strength
   * @public
   */
  setLjPotentialParameters( sigma, epsilon ) {

    // Update the Lennard-Jones force calculator.
    this.ljPotentialCalculator.setEpsilon( epsilon );
    this.ljPotentialCalculator.setSigma( sigma );
  }

  /**
   * @public
   */
  reset() {
    this.verticalScalingFactor = ( this.graphHeight / 2.2 ) /
                                 ( SOMConstants.MAX_EPSILON * SOMConstants.K_BOLTZMANN );
    this.horizontalLineCount = 5;
    this.drawPotentialCurve();
    this.gridNode && this.gridNode.reset();
  }

  /**
   * @returns {number}
   * @public
   */
  getGraphHeight() {
    return this.graphHeight;
  }

  /**
   * @returns {number}
   * @public
   */
  getGraphWidth() {
    return this.graphWidth;
  }

  /**
   * @returns {Vector2}
   * @public
   */
  getZeroCrossingPoint() {
    return this.zeroCrossingPoint;
  }

  /**
   * @returns {Vector2}
   * @public
   */
  getGraphMin() {
    return this.graphMin;
  }

  /**
   * Set the position of the position marker.  Note that is is only possible to set the x axis position, which is
   * distance.  The y axis position is always on the LJ potential curve.
   * @param {number}distance - distance from the center of the interacting molecules.
   * @public
   */
  setMarkerPosition( distance ) {
    assert && assert( this.positionMarker, 'position marker not enabled for this potential graph node' );
    this.markerDistance = distance;
    const xPos = this.markerDistance * ( this.graphWidth / this.xRange );
    const potential = this.calculateLennardJonesPotential( this.markerDistance );
    const yPos = ( ( this.graphHeight / 2 ) - ( potential * this.verticalScalingFactor ) );
    if ( xPos > 0 && xPos < this.graphWidth && yPos > 0 && yPos < this.graphHeight ) {
      this.positionMarker.setVisible( true );
      this.positionMarker.setTranslation( xPos, yPos );
    }
    else {
      this.positionMarker.setVisible( false );
    }
  }

  /**
   * Set whether the graph is showing the potential between individual atoms or multi-atom molecules.
   * @param {boolean} molecular - true if graph is portraying molecules, false for individual atoms.
   * @public
   */
  setMolecular( molecular ) {
    if ( molecular ) {
      this.horizontalAxisLabel.setString( distanceBetweenMoleculesString );
    }
    else {
      this.horizontalAxisLabel.setString( distanceBetweenAtomsString );
    }
    this.horizontalAxisLabel.centerX = this.graphXOrigin + ( this.graphWidth / 2 );
    this.horizontalAxisLabel.top = this.graphYOrigin + 5;
  }

  /**
   * Calculate the Lennard-Jones potential for the given distance.
   * @param {number} radius
   * @returns {number}
   * @public
   */
  calculateLennardJonesPotential( radius ) {
    return ( this.ljPotentialCalculator.getLjPotential( radius ) );
  }

  /**
   * Draw the curve that reflects the Lennard-Jones potential based upon the current values for sigma and epsilon.
   * @public
   */
  drawPotentialCurve() {
    // must be overridden in descendant types, so assert if called here
    assert && assert( false, 'this function must be overridden in descendant classes' );
  }
}

statesOfMatter.register( 'PotentialGraphNode', PotentialGraphNode );
export default PotentialGraphNode;