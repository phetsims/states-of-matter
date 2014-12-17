// Copyright 2002-2013, University of Colorado Boulder

/**
 * Scenery node that shows the grid lines.
 * Modified from energy-skate-park's GridNode implementation.
 * @author Sam Reid
 * @author Siddhartha Chinthapally
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var ZoomButton = require( 'SCENERY_PHET/buttons/ZoomButton' );

  var MAX_LINES_HORIZONTAL = 13;
  var MIN_LINES_HORIZONTAL = 5;
  var ZOOM_INCREMENT = 2; // 2 lines per zoom

  /**
   *
   * @param atomsView
   * @param {Number} offsetX
   * @param {Number} offsetY
   * @param {Number} width
   * @param {Number} height
   * @constructor
   */
  function ZoomableGridNode( atomsView, offsetX, offsetY, width, height ) {

    Node.call( this );
    var gridNode = this;
    var initialHorizontalLines = MIN_LINES_HORIZONTAL;
    this.horizontalLinesNode = new Path( null, {stroke: 'white', lineWidth: 0.8} );
    this.verticalLinesNode = new Path( null, {stroke: 'white', lineWidth: 0.8} );
    this.zoomInButton = new ZoomButton( {
      listener: function() {
        initialHorizontalLines += ZOOM_INCREMENT;
        gridNode.addHorizontalLines( offsetX, offsetY, width, height, initialHorizontalLines );
        //atomsView.interactiveInteractionPotentialDiagram.ljPotentialGraph.scale(1,1.9,false);
        //  atomsView.interactiveInteractionPotentialDiagram.verticalScalingFactor *= 1.33;
        // atomsView.interactiveInteractionPotentialDiagram.drawPotentialCurve();
      },
      baseColor: 'white',
      radius: 10,
      xMargin: 3,
      yMargin: 3
    } );
    this.zoomInButton.setTranslation( -50, 0 );
    this.zoomInButton.enabled = true;

    this.zoomOutButton = new ZoomButton( {
      listener: function() {
        initialHorizontalLines -= 2;
        gridNode.addHorizontalLines( offsetX, offsetY, width, height, initialHorizontalLines );
      },
      baseColor: 'white',
      radius: 10,
      xMargin: 3,
      yMargin: 3,
      in: false,
      top: this.zoomInButton.bottom + 5,
      left: this.zoomInButton.left
    } );
    this.zoomOutButton.enabled = false;
    this.addChild( this.zoomInButton );
    this.addChild( this.zoomOutButton );
    this.addChild( this.horizontalLinesNode );
    this.addChild( this.verticalLinesNode );

    this.verticalLines = [];
    for ( var x = 0; x < 4; x++ ) {
      var viewX = x * (width / 3);
      this.verticalLines.push( {
        x1: viewX + offsetX, y1: offsetY,
        x2: viewX + offsetX, y2: height + offsetY
      } );
    }
    var verticalLineShape = new Shape();
    var line;
    for ( var i = 0; i < this.verticalLines.length; i++ ) {
      line = this.verticalLines[i];
      verticalLineShape.moveTo( line.x1, line.y1 );
      verticalLineShape.lineTo( line.x2, line.y2 );
    }
    this.verticalLinesNode.setShape( verticalLineShape );

    this.horizontalLines = [];
    for ( var y = 0; y < initialHorizontalLines; y++ ) {
      var viewY = y * (height / (initialHorizontalLines - 1));
      this.horizontalLines.push( {
        x1: offsetX, y1: viewY + offsetY,
        x2: width + offsetX, y2: viewY + offsetY
      } );
    }
    var horizontalLineShape = new Shape();
    for ( i = 0; i < this.horizontalLines.length; i++ ) {
      line = this.horizontalLines[i];
      horizontalLineShape.moveTo( line.x1, line.y1 );
      horizontalLineShape.lineTo( line.x2, line.y2 );
    }
    this.horizontalLinesNode.setShape( horizontalLineShape );
  }

  return inherit( Node, ZoomableGridNode, {

    /**
     *
     * @param offsetX
     * @param offsetY
     * @param width
     * @param height
     * @param noOfHorizontalLines
     */
    addHorizontalLines: function( offsetX, offsetY, width, height, noOfHorizontalLines ) {

      this.horizontalLines = [];
      for ( var y = 0; y < noOfHorizontalLines; y++ ) {
        var viewY = y * (height / (noOfHorizontalLines - 1));
        this.horizontalLines.push( { x1: offsetX, y1: viewY + offsetY,
          x2: width + offsetX, y2: viewY + offsetY
        } );
      }
      var horizontalLineShape = new Shape();
      var line;
      for ( var i = 0; i < this.horizontalLines.length; i++ ) {
        line = this.horizontalLines[i];
        horizontalLineShape.moveTo( line.x1, line.y1 );
        horizontalLineShape.lineTo( line.x2, line.y2 );
      }
      this.horizontalLinesNode.setShape( horizontalLineShape );
      this.zoomInButton.enabled = (noOfHorizontalLines < MAX_LINES_HORIZONTAL);
      this.zoomOutButton.enabled = (noOfHorizontalLines > MIN_LINES_HORIZONTAL);

    }
  } );
} );