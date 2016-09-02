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

    this.initialValue = options.initialValue;
    this.size = size;
    this.array = new Array( size );
    this.reset();
  }

  statesOfMatter.register( 'MovingAverage', MovingAverage );

  return inherit( Object, MovingAverage, {

    addValue: function( newValue ){
      var replacedValue = this.array[ this.currentIndex ];
      this.array[ this.currentIndex ] = newValue;
      this.currentIndex = ( this.currentIndex + 1 ) % this.size;
      this.total = ( this.total - replacedValue ) + newValue;
      this.average = this.total / this.size;
    },

    reset: function(){
      for( var i = 0; i < this.size; i++ ){
        this.array[ i ] = this.initialValue;
      }
      this.total = this.initialValue * this.size;
      this.average = this.total / this.size;
      this.currentIndex = 0;
    }
  } );
} );