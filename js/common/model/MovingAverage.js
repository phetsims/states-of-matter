// Copyright 2016, University of Colorado Boulder

/**
 * simple moving average calculator
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  /**
   * @constructor
   */
  function MovingAverage( size, options ) {

    options = _.extend( {
      initialValue: 0
    }, options );

    this.currentIndex = 0;
    this.size = size;
    this.array = [];
    for( var i = 0; i < size; i++ ){
      this.array.push( options.initialValue );
    }
    this.total = options.initialValue * size;
    this.average = this.total / size;
  }

  statesOfMatter.register( 'MovingAverage', MovingAverage );

  return inherit( Object, MovingAverage, {
    addValue: function( newValue ){
      var replacedValue = this.array[ this.currentIndex ];
      this.array[ this.currentIndex ] = newValue;
      this.currentIndex = ( this.currentIndex + 1 ) % this.size;
      this.total = this.total - replacedValue + newValue;
      this.average = this.total / this.size;
    }
  } );
} );