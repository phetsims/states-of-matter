// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  // constants
  var NUM_SEGMENTS = 24;


  function VerticalAmountIndicatorNode( width, height, proportionProperty, options ) {
    Node.call( this );
    var self = this;
    this.addChild( new Rectangle( 0, 0, width, height, { fill: 'black', lineWidth: 2, stroke: 'black' } ) );

    var segmentHeight = height / NUM_SEGMENTS;
    var segments = [];
    _.times( NUM_SEGMENTS, function( index ) {
      var segment = new Rectangle( 0, 0, width, segmentHeight, {
        bottom: ( NUM_SEGMENTS - index ) * segmentHeight,
        fill: '#39FF14',
        lineWidth: 2,
        stroke: 'black'
      } );
      self.addChild( segment );
      segments.push( segment );
    } );

    proportionProperty.link( function( proportion ) {
      var numVisibleSegments = Math.floor( NUM_SEGMENTS * proportion );
      for ( var i = 0; i < NUM_SEGMENTS; i++ ) {
        segments[ i ].visible = i < numVisibleSegments;
      }
    } );
    this.mutate( options );
  }

  statesOfMatter.register( 'VerticalAmountIndicatorNode', VerticalAmountIndicatorNode );

  return inherit( Node, VerticalAmountIndicatorNode, {
    //TODO prototypes
  } );
} );