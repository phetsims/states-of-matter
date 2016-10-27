// Copyright 2016, University of Colorado Boulder

/**
 * a node that represents a quantity as a segmented bar graph, supports a number of options to control appearance
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  /**
   * @param {number} width
   * @param {number} height
   * @param {Property.<number>} proportionProperty - a property with a value range from 0 to 1
   * @param {Object} options
   * @constructor
   */
  function SegmentedBarGraphNode( width, height, proportionProperty, options ) {
    Node.call( this );
    var self = this;
    options = _.extend( {
      numSegments: 10,
      backgroundColor: 'black',
      fullyLitIndicatorColor: '#1EC700',

      // proportion of the width consumed by the indicator in the vertical direction, must be > 0 and <= to 1
      indicatorWidthProportion: 0.8,

      // proportion of the each segment consumed by the indicator in the vertical direction, must be > 0 and <= to 1
      indicatorHeightProportion: 0.8
    }, options );

    // add the background
    this.addChild( new Rectangle( 0, 0, width, height, { fill: options.backgroundColor } ) );

    // add the indicator segments
    var indicatorWidth = width * options.indicatorWidthProportion;
    var segmentHeight = height / options.numSegments;
    var indicatorHeight = segmentHeight * options.indicatorHeightProportion;
    var indicators = [];
    _.times( options.numSegments, function( index ) {
      var indicator = new Rectangle( 0, 0, indicatorWidth, indicatorHeight, {
        centerX: width / 2,
        centerY: height - index * segmentHeight - segmentHeight * 0.5,
        fill: options.fullyLitIndicatorColor
      } );
      self.addChild( indicator );
      indicators.push( indicator );
    } );

    // set the visibility and opacity of each of the segments based and the proportion property
    proportionProperty.link( function( proportion ) {
      var numVisibleIndicators = Math.ceil( options.numSegments * proportion );
      for ( var i = 0; i < options.numSegments; i++ ) {
        indicators[ i ].visible = i < numVisibleIndicators;
        indicators[ i ].opacity = 1;
      }
      if ( numVisibleIndicators > 0 ) {
        indicators[ numVisibleIndicators - 1 ].opacity =
          1 - ( Math.ceil( options.numSegments * proportion ) - ( options.numSegments * proportion ) );
      }
    } );

    this.mutate( options );
  }

  statesOfMatter.register( 'SegmentedBarGraphNode', SegmentedBarGraphNode );

  return inherit( Node, SegmentedBarGraphNode );
} );