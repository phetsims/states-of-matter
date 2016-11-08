// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  /**
   * {number} length - max number of entries in the queue
   * {number} maxTimeSpan - max span of time that can be stored, in seconds
   * @constructor
   */
  function TimeSpanDataQueue( length, maxTimeSpan ) {
    assert && assert( length > 0, 'length must be positive' );
    this.length = length;
    this.maxTimeSpan = maxTimeSpan;

    // allocate a fixed-size array so that subsequent allocations are not needed
    this.dataQueue = new Array( length );

    // initialize the data array with a set of reusable objects so that subsequent allocations are not needed
    for ( var i = 0; i < length; i++ ) {
      this.dataQueue[ i ] = { deltaTime: 0, value: null };
    }

    // initialize the variables used to make this thing work
    this.head = 0;
    this.tail = 0;
    this.total = 0;
    this.timeSpan = 0;
  }

  statesOfMatter.register( 'TimeSpanDataQueue', TimeSpanDataQueue );

  return inherit( Object, TimeSpanDataQueue, {

    /**
     * add a new value with associated delta time - this automatically removes data values that go beyond the max time
     * span, and also updates the total value and the current time span
     * @param value
     * @param dt
     */
    add: function( value, dt ) {

      assert && assert( dt < this.maxTimeSpan, 'dt value is greater than max time span' );
      var nextHead = ( this.head + 1 ) % this.length;
      assert && assert( nextHead !== this.tail, 'no space left in moving time window' );

      // in non-debug mode ignore requests that would exceed the capacity
      if ( nextHead === this.tail ) {
        return;
      }

      // add the new data item to the queue
      this.dataQueue[ this.head ].value = value;
      this.dataQueue[ this.head ].deltaTime = dt;
      this.timeSpan += dt;
      this.total += value;
      this.head = nextHead;

      // remove the oldest data items until we are back within the maximum time span
      while ( this.timeSpan > this.maxTimeSpan ) {
        var nextTail = ( this.tail + 1 ) % this.length;
        if ( nextTail === nextHead ) {
          // nothing more can be removed, so bail
          assert && assert( false, 'time span exceeded, but nothing appears to be in the queue - probably a bug' );
          break;
        }
        this.total -= this.dataQueue[ this.tail ].value;
        this.timeSpan -= this.dataQueue[ this.tail ].deltaTime;
        this.tail = nextTail;
      }
    },

    /**
     * clear all data from the queue
     */
    clear: function() {
      this.head = 0;
      this.tail = 0;
      this.total = 0;
      this.timeSpan = 0;
    }
  } );
} );