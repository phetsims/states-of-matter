// Copyright 2019-2025, University of Colorado Boulder


/**
 * simple moving average calculator
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import statesOfMatter from '../../statesOfMatter.js';

type SelfOptions = {
  initialValue?: number;
};

type MovingAverageOptions = SelfOptions;

class MovingAverage {

  public size: number;
  public average: number;
  private readonly initialValue: number;
  private readonly array: number[];
  private currentIndex = 0;
  private total?: number;

  public constructor( size: number, providedOptions?: MovingAverageOptions ) {

    const options = optionize<MovingAverageOptions, SelfOptions>()( {
      initialValue: 0
    }, providedOptions );

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
  public addValue( newValue: number ): void {
    const replacedValue = this.array[ this.currentIndex ];
    this.array[ this.currentIndex ] = newValue;
    this.currentIndex = ( this.currentIndex + 1 ) % this.size;
    this.total = ( this.total! - replacedValue ) + newValue;
    this.average = this.total / this.size;
  }

  public reset(): void {
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