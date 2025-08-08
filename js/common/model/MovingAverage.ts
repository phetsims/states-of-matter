// Copyright 2019-2020, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * simple moving average calculator
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import statesOfMatter from '../../statesOfMatter.js';

class MovingAverage {

  public size: number;
  public average: number;
  private initialValue: number;
  private array: number[];
  private currentIndex: number;
  private total: number;

  constructor( size: number, options?: { initialValue?: number } ) {

    options = merge( {
      initialValue: 0
    }, options );

    this.size = size;
    this.average = 0;

    this.initialValue = options.initialValue;
    this.array = new Array( size );

    // set up initial values
    this.reset();
  }

  /**
   * add a value to the moving average
   */
  public addValue( newValue: number ) {
    const replacedValue = this.array[ this.currentIndex ];
    this.array[ this.currentIndex ] = newValue;
    this.currentIndex = ( this.currentIndex + 1 ) % this.size;
    this.total = ( this.total - replacedValue ) + newValue;
    this.average = this.total / this.size;
  }

  public reset() {
    for ( let i = 0; i < this.size; i++ ) {
      this.array[ i ] = this.initialValue;
    }
    this.total = this.initialValue * this.size;
    this.average = this.total / this.size;
    this.currentIndex = 0;
  }
}

statesOfMatter.register( 'MovingAverage', MovingAverage );
export default MovingAverage;