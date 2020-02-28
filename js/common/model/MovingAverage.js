// Copyright 2019-2020, University of Colorado Boulder

/**
 * simple moving average calculator
 */

import inherit from '../../../../phet-core/js/inherit.js';
import merge from '../../../../phet-core/js/merge.js';
import statesOfMatter from '../../statesOfMatter.js';

/**
 * @constructor
 */
function MovingAverage( size, options ) {

  options = merge( {
    initialValue: 0
  }, options );

  // @public
  this.size = size;
  this.average = 0;

  // @private
  this.initialValue = options.initialValue;
  this.array = new Array( size );

  // set up initial values
  this.reset();
}

statesOfMatter.register( 'MovingAverage', MovingAverage );

export default inherit( Object, MovingAverage, {

  addValue: function( newValue ) {
    const replacedValue = this.array[ this.currentIndex ];
    this.array[ this.currentIndex ] = newValue;
    this.currentIndex = ( this.currentIndex + 1 ) % this.size;
    this.total = ( this.total - replacedValue ) + newValue;
    this.average = this.total / this.size;
  },

  reset: function() {
    for ( let i = 0; i < this.size; i++ ) {
      this.array[ i ] = this.initialValue;
    }
    this.total = this.initialValue * this.size;
    this.average = this.total / this.size;
    this.currentIndex = 0;
  }
} );