// Copyright 2002-2014, University of Colorado Boulder
/**
 * This class displays an interaction potential diagram.
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var LjPotentialCalculator = require( 'STATES_OF_MATTER/common/model/LjPotentialCalculator' );
  var Vector2 = require( 'DOT/Vector2' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var GridNode = require( 'ATOMIC_INTERACTIONS/view/ZoomableGridNode' );
  var PositionMarker = require( 'ATOMIC_INTERACTIONS/view/PositionMarker' );
  //strings
  var distanceBetweenAtomsString = require( 'string!STATES_OF_MATTER/distanceBetweenAtoms' );
  var potentialEnergyString = require( 'string!STATES_OF_MATTER/potentialEnergy' );
  var sigmaString = require( 'string!STATES_OF_MATTER/sigma' );
  var epsilonString = require( 'string!STATES_OF_MATTER/epsilon' );

// Constants that control the range of data that is graphed.
// In picometers.
  var MAX_INTER_ATOM_DISTANCE = 1800;

// Constants that control the appearance of the diagram.
  var NARROW_VERSION_WIDTH = 135;
  var WIDE_VERSION_WIDTH = 500;
  var AXIS_LINE_WIDTH = 1;
  var AXES_ARROW_HEAD_HEIGHT = 8 * AXIS_LINE_WIDTH;


// Size of pos marker wrt overall width.
  var POSITION_MARKER_DIAMETER_PROPORTION = 0.03;

// Constants that control the location and size of the graph.
  var VERT_AXIS_SIZE_PROPORTION = 0.85;

// Font for the labels used on the axes and within the graph.
  var AXIS_LABEL_FONT_SIZE = 12;
  var AXIS_LABEL_FONT = new PhetFont( AXIS_LABEL_FONT_SIZE );
  var GREEK_LETTER_FONT_SIZE = 16;
  var GREEK_LETTER_FONT = new PhetFont( GREEK_LETTER_FONT_SIZE );


  /**
   *
   * @param {Number} sigma - Initial value of sigma, a.k.a. the atom diameter
   * @param {Number} epsilon - Initial value of epsilon, a.k.a. the interaction strength
   * @param {Boolean} wide - true if the widescreen version of the graph is needed, false if not.
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
    }
    else {
      this.widthOfGraph = NARROW_VERSION_WIDTH;
      this.heightOfGraph = this.widthOfGraph * 0.8;
    }
    this.graphXOrigin = 0.10 * this.widthOfGraph;
    this.graphYOrigin = 0.85 * this.heightOfGraph;
    this.graphWidth = this.widthOfGraph - this.graphXOrigin - AXES_ARROW_HEAD_HEIGHT;

    this.graphHeight = this.heightOfGraph * VERT_AXIS_SIZE_PROPORTION - AXES_ARROW_HEAD_HEIGHT;

    // Layer where the graph elements are added.
    this.ljPotentialGraph = new Node();
    this.verticalScalingFactor = (this.graphHeight / 2) /
                                 (StatesOfMatterConstants.MAX_EPSILON * StatesOfMatterConstants.K_BOLTZMANN);


    if ( wide ) {

      this.gridNode = new GridNode( this, 0, 0, this.graphWidth, this.graphHeight );
      this.ljPotentialGraph.addChild( this.gridNode );
    }

    // Create and add the portion that depicts the Lennard-Jones potential curve.
    this.ljPotentialGraph.setTranslation( this.graphXOrigin, this.graphYOrigin - this.graphHeight );

    // Create and add the center axis line for the graph.
    var centerAxis = new Path( new Shape().lineTo( 0, 0 )
      .lineTo( this.graphWidth, 0 ), { lineWidth: 4, stroke: '#A7A7A7' } );
    this.ljPotentialGraph.addChild( centerAxis );
    centerAxis.setTranslation( 0, this.graphHeight / 2 );

    // Create and add the potential energy line.
    this.potentialEnergyLine = new Path( null, { lineWidth: 2, stroke: 'yellow' } );

    this.ljPotentialGraph.addChild( this.potentialEnergyLine );

    // Add the arrows and labels that will depict sigma and epsilon.
    this.epsilonArrow = new ArrowNode( 0, 0, 0, this.graphHeight / 2,
      {
        fill: 'white',
        stroke: 'white',
        doubleHead: true,
        headHeight: 5,
        headWidth: 5,
        tailWidth: 1
      } );
    this.ljPotentialGraph.addChild( this.epsilonArrow );

    this.epsilonLabel = new Text( epsilonString, { font: GREEK_LETTER_FONT, fill: 'white' } );
    this.ljPotentialGraph.addChild( this.epsilonLabel );

    this.sigmaLabel = new Text( sigmaString, { font: GREEK_LETTER_FONT, fill: 'white' } );
    this.ljPotentialGraph.addChild( this.sigmaLabel );
    this.sigmaArrow = new ArrowNode( 0, 0, 0, 0, {
      headHeight: 8,
      headWidth: 8,
      tailWidth: 3, doubleHead: true, fill: 'white'
    } );
    this.ljPotentialGraph.addChild( this.sigmaArrow );

    // Variables for controlling the appearance, visibility, and location of
    // the position marker.
    // Add the position marker.
    var markerDiameter = POSITION_MARKER_DIAMETER_PROPORTION * this.graphWidth;
    this.positionMarker = new PositionMarker( markerDiameter / 2, 'rgb( 117, 217, 255 )' );

    this.positionMarker.setVisible( this.positionMarkerEnabled );
    this.epsilonLineLayer = new Node();
    this.ljPotentialGraph.addChild( this.epsilonLineLayer );
    this.ljPotentialGraph.addChild( this.positionMarker );


    // Create and add the horizontal axis line for the graph.
    this.horizontalAxis = new ArrowNode( 0, 0, this.graphWidth + AXES_ARROW_HEAD_HEIGHT, 0,
      {
        stroke: 'white',
        fill: 'white',
        headHeight: 8,
        headWidth: 8,
        tailWidth: 2
      } );

    this.horizontalAxis.setTranslation( this.graphXOrigin, this.graphYOrigin );


    this.horizontalAxisLabel = new Text( distanceBetweenAtomsString,
      {
        fill: 'white',
        font: AXIS_LABEL_FONT
      } );

    this.setMolecular( false );

    // Create and add the vertical axis line for the graph.
    this.verticalAxis = new ArrowNode( 0, 0, 0, -this.graphHeight - AXES_ARROW_HEAD_HEIGHT,
      {
        stroke: 'white',
        fill: 'white',
        headHeight: 8,
        headWidth: 8,
        tailWidth: 2
      } );
    this.verticalAxis.setTranslation( this.graphXOrigin, this.graphYOrigin );

    this.verticalAxisLabel = new Text( potentialEnergyString, { fill: 'white', font: AXIS_LABEL_FONT } );
    this.verticalAxisLabel.setTranslation( this.graphXOrigin / 2 - 5,
      this.graphYOrigin - (  this.graphHeight / 2) + ( this.verticalAxisLabel.width / 2) );
    this.verticalAxisLabel.setRotation( 3 * Math.PI / 2 );

    // Initializing here to reduce allocations
    this.epsilonArrowStartPt = new Vector2( 0, 0 );

    // Draw the curve upon the graph.
    this.drawPotentialCurve();
  }

  return inherit( Node, InteractionPotentialDiagramNode, {
    /**
     * Set the parameters that define the shape of the Lennard-Jones
     * potential curve.
     *
     * @param sigma
     * @param epsilon
     */
    setLjPotentialParameters: function( sigma, epsilon ) {

      // Update the Lennard-Jones force calculator.
      this.ljPotentialCalculator.setEpsilon( epsilon );
      this.ljPotentialCalculator.setSigma( sigma );
      // Redraw the graph to reflect the new parameters.
      this.drawPotentialCurve();
    },
    getGraphHeight: function() {
      return this.graphHeight;
    },
    getGraphWidth: function() {
      return this.graphWidth;
    },
    getZeroCrossingPoint: function() {
      return this.zeroCrossingPoint;
    },
    getGraphMin: function() {
      return this.graphMin;
    },
    setMarkerEnabled: function( enabled ) {
      this.positionMarkerEnabled = enabled;
    },
    /**
     * Set the position of the position marker.  Note that is is only possible
     * to set the x axis position, which is distance.  The y axis position is
     * always on the LJ potential curve.
     *
     * @param distance - distance from the center of the interacting molecules.
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
     * Get the range of values over which the potential curve is graphed.  It
     * is assumed to go from 0 to the value returned by this function.
     */
    getXAxisRange: function() {
      return MAX_INTER_ATOM_DISTANCE;
    },
    /**
     * Returns a value between 0 and 1 representing the fraction of the
     * overall node that is actually used for graphing in the x direction.
     * This is generally used for determining how to scale the graph when
     * used in an environment where the scale must match the surroundings.
     */
    getXAxisGraphProportion: function() {
      return this.graphWidth / this.width;
    },
    /**
     * Returns a values between 0 and 1 representing the fraction of the
     * overall node that exists to the left of the X axis.  This is generally
     * used for alignment and positioning of this node on a canvas.
     */
    getXAxisOffsetProportion: function() {
      return 1 - (  this.graphWidth + AXES_ARROW_HEAD_HEIGHT) / this.width;
    },
    /**
     * Set whether the graph is showing the potential between individual atoms
     * or multi-atom molecules.
     *
     * @param molecular - true if graph is portraying molecules, false for
     *                  individual atoms.
     */
    setMolecular: function( molecular ) {
      /*if ( molecular ) {
       // this.horizontalAxisLabel.setText( 'atoms' );
       }
       else {
       // this.horizontalAxisLabel.setText( 'Distance between Molecules' );
       }*/
      this.horizontalAxisLabel.setTranslation( this.graphXOrigin + (  this.graphWidth / 2) -
                                               (  this.horizontalAxisLabel.width / 2.4),
        this.graphYOrigin + (  this.horizontalAxisLabel.height ) );
    },

    /**
     * Calculate the Lennard-Jones potential for the given distance.
     *
     * @param radius
     * @return
     */

    calculateLennardJonesPotential: function( radius ) {
      return (  this.ljPotentialCalculator.calculateLjPotential( radius ));
    },
    /**
     * Draw the curve that reflects the Lennard-Jones potential based upon the
     * current values for sigma and epsilon.
     */
    drawPotentialCurve: function() {
      var potentialEnergyLineShape = new Shape();
      potentialEnergyLineShape.moveTo( 0, 0 );
      this.graphMin.setXY( 0, 0 );
      this.zeroCrossingPoint.setXY( 0, 0 );
      var horizontalIndexMultiplier = MAX_INTER_ATOM_DISTANCE / this.graphWidth;
      for ( var i = 1; i < this.graphWidth; i++ ) {
        var potential = this.calculateLennardJonesPotential( i * horizontalIndexMultiplier );
        var yPos = ((  this.graphHeight / 2) - (potential * this.verticalScalingFactor));
        if ( yPos > this.graphMin.y ) {
          this.graphMin.setXY( i, yPos );
        }
        if ( (yPos > 0) && (yPos < this.graphHeight) ) {
          potentialEnergyLineShape.lineTo( i, (yPos) );
          if ( (potential > 0) || (  this.zeroCrossingPoint.x === 0) ) {
            // zero crossing point.
            this.zeroCrossingPoint.setXY( i, this.graphHeight / 2 );
          }
        }
        else {
          // Move to a good location from which to start graphing.
          if ( yPos > this.graphHeight ) {
            potentialEnergyLineShape.lineTo( i, this.graphHeight );
            if ( (potential > 0) || (  this.zeroCrossingPoint.x === 0) ) {
              // zero crossing point.
              this.zeroCrossingPoint.setXY( i, this.graphHeight / 2 );
            }
          }
          if ( yPos < 0 ) {
            potentialEnergyLineShape.moveTo( i + 1, 0 );
          }
        }
      }
      this.potentialEnergyLine.setShape( potentialEnergyLineShape );
      this.epsilonArrowStartPt.setXY( this.graphMin.x, this.graphHeight / 2 );
      if ( this.epsilonArrowStartPt.distance( this.graphMin ) > 5 ) {
        this.epsilonArrow.setVisible( true );
        try {
          if ( this.graphMin.y > this.graphHeight ) {
            this.epsilonArrow.setTailAndTip( this.graphMin.x, this.graphHeight,
              this.epsilonArrowStartPt.x, this.epsilonArrowStartPt.y );
            this.epsilonArrow.doubleHead = false;
          }
          else {
            this.epsilonArrow.setTailAndTip( this.graphMin.x, this.graphMin.y, this.epsilonArrowStartPt.x,
              this.epsilonArrowStartPt.y );
            this.epsilonArrow.doubleHead = true;
          }
        }
        catch( e ) {
          console.error( "Error: Caught exception while positioning epsilon arrow - " + e );
        }
      }
      else {
        // Don't show the arrow if there isn't enough space.
        this.epsilonArrow.setVisible( false );
      }
      this.epsilonLabel.setTranslation( this.graphMin.x + this.epsilonLabel.width,
        ((  this.graphMin.y - (  this.graphHeight / 2)) / 3) - (  this.epsilonLabel.height / 2) +
        this.graphHeight / 2 );
      // Position the arrow that depicts sigma along with its label.
      this.sigmaLabel.setTranslation( this.zeroCrossingPoint.x / 2 - this.sigmaLabel.width / 2,
        this.graphHeight / 2 - this.sigmaLabel.height / 3 );
      try {
        this.sigmaArrow.setTailAndTip( 0, this.graphHeight / 2,
          this.zeroCrossingPoint.x, this.zeroCrossingPoint.y );
      }
      catch( r ) {
        console.error( "Error: Caught exception while positioning sigma arrow - " + r );
      }
      // Update the position of the marker in case the curve has moved.
      this.setMarkerPosition( this.markerDistance );
    },

    MAX_INTER_ATOM_DISTANCE: MAX_INTER_ATOM_DISTANCE
  } );
} );

