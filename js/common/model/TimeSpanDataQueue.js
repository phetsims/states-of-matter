// Copyright 2016-2021, University of Colorado Boulder

/**
 * A queue that stores data values along with time change (dt) values and automatically removes data when it exceeds
 * a maximum time span.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import statesOfMatter from '../../statesOfMatter.js';
import SOMConstants from '../SOMConstants.js';

// constants
const MIN_EXPECTED_DT = SOMConstants.NOMINAL_TIME_STEP;

class TimeSpanDataQueue {

  /**
   * {number} maxTimeSpan - max span of time that can be stored, in seconds
   * {number} minExpectedDt - the minimum expected dt (delta time) value in seconds, used to allocate memory
   */
  constructor( maxTimeSpan, minExpectedDt = MIN_EXPECTED_DT ) {

    // @public (read-only) - the total of all values currently in the queue
    this.total = 0;

    // @private - the amount of time currently represent by the entries in the queue
    this.timeSpan = 0;

    // @private
    this.maxTimeSpan = maxTimeSpan;

    // @private {DataQueueEntry[]} - data queue, which is an array where entries are kept that track times and values
    this.dataQueue = [];

    // The queue length is calculated based on the specified time span and the expected minimum dt value.  There is some
    // margin built into this calculation.  This value is used to pre-allocate all of the memory which is expected to
    // be needed, and thus optimize performance.
    const maxExpectedDataQueueLength = Math.ceil( maxTimeSpan / minExpectedDt * 1.1 );

    // @private {DataQueueEntry[]} - a pool of unused data queue entries, pre-allocated for performance
    this.unusedDataQueueEntries = [];
    for ( let i = 0; i < maxExpectedDataQueueLength; i++ ) {
      this.unusedDataQueueEntries.push( new DataQueueEntry( 0, null ) );
    }
  }

  /**
   * Add a new value with associated dt (delta time).  This automatically removes data values that go beyond the max
   * time span from the queue, and also updates the total value and the current time span.
   * @param {number} value
   * @param {number} dt
   * @public
   */
  add( value, dt ) {

    assert && assert( dt < this.maxTimeSpan, 'dt value is greater than max time span, this won\'t work' );

    // Add the new data item to the queue.
    let dataQueueEntry;
    if ( this.unusedDataQueueEntries.length > 0 ) {
      dataQueueEntry = this.unusedDataQueueEntries.pop();
      dataQueueEntry.dt = dt;
      dataQueueEntry.value = value;
    }
    else {

      // The pool has run dry, allocate a new entry.  Ideally, this should never happen, because we try to pre-allocate
      // everything needed, but it can occur in cases where the browser is running at a different frequency than the
      // expected nominal rate.  See https://github.com/phetsims/states-of-matter/issues/354.
      dataQueueEntry = new DataQueueEntry( dt, value );
    }
    this.dataQueue.push( dataQueueEntry );
    this.timeSpan += dt;
    this.total += value;

    // Check if the total time span represented by the items in the queue exceeds the max time and, if so, remove items.
    while ( this.timeSpan > this.maxTimeSpan ) {
      assert && assert( this.dataQueue.length > 0, 'data queue is empty but max time is exceeded, there must ba a bug' );
      const removedDataQueueEntry = this.dataQueue.shift();
      this.timeSpan -= removedDataQueueEntry.dt;
      this.total -= removedDataQueueEntry.value;

      // Mark the removed entry as unused and return it to the pool.
      removedDataQueueEntry.value = null;
      this.unusedDataQueueEntries.push( removedDataQueueEntry );
    }
  }

  /**
   * Clear all data from the queue.
   * @public
   */
  clear() {
    this.total = 0;
    this.timeSpan = 0;
    this.dataQueue.forEach( dataQueueItem => {
      dataQueueItem.value = null;
      this.unusedDataQueueEntries.push( dataQueueItem );
    } );
    this.dataQueue.length = 0;
  }
}

/**
 * simple inner class that defines the entries that go into the data queue
 */
class DataQueueEntry {

  /**
   * @param {number} dt - delta time, in seconds
   * @param {number|null} value - the value for this entry, null if this entry is unused
   */
  constructor( dt, value ) {
    this.dt = dt;
    this.value = value;
  }
}

statesOfMatter.register( 'TimeSpanDataQueue', TimeSpanDataQueue );
export default TimeSpanDataQueue;