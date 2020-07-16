// Copyright 2016-2020, University of Colorado Boulder

/**
 * A queue that stores data values along with time change (dt) values and automatically removes data when it exceeds
 * a maximum time span.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import statesOfMatter from '../../statesOfMatter.js';

class TimeSpanDataQueue {

  /**
   * {number} length - max number of entries in the queue
   * {number} maxTimeSpan - max span of time that can be stored, in seconds
   */
  constructor( length, maxTimeSpan ) {
    assert && assert( length > 0, 'length must be positive' );
    this.length = length;
    this.maxTimeSpan = maxTimeSpan;

    // @private - array where entries are kept
    this.dataQueue = new Array( length );

    // initialize the data array with a set of reusable objects so that subsequent allocations are not needed
    for ( let i = 0; i < length; i++ ) {
      this.dataQueue[ i ] = { deltaTime: 0, value: null };
    }

    // @public (read-only) {number} - the total of all values currently in the queue
    this.total = 0;

    // @private - variables used to make this thing work
    this.head = 0;
    this.tail = 0;
    this.timeSpan = 0;
  }

  /**
   * add a new value with associated delta time - this automatically removes data values that go beyond the max time
   * span, and also updates the total value and the current time span
   * @param {number} value
   * @param {number} dt
   * @public
   */
  add( value, dt ) {

    assert && assert( dt < this.maxTimeSpan, 'dt value is greater than max time span' );
    const nextHead = ( this.head + 1 ) % this.length;
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
      const nextTail = ( this.tail + 1 ) % this.length;
      if ( nextTail === nextHead ) {

        // nothing more can be removed, so bail
        assert && assert( false, 'time span exceeded, but nothing appears to be in the queue - probably a bug' );
        break;
      }
      this.total -= this.dataQueue[ this.tail ].value;
      this.timeSpan -= this.dataQueue[ this.tail ].deltaTime;
      this.tail = nextTail;
    }
  }

  /**
   * clear all data from the queue
   * @public
   */
  clear() {
    this.head = 0;
    this.tail = 0;
    this.total = 0;
    this.timeSpan = 0;
  }
}

statesOfMatter.register( 'TimeSpanDataQueue', TimeSpanDataQueue );
export default TimeSpanDataQueue;