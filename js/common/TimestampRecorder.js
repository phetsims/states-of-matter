// Copyright 2016, University of Colorado Boulder

/**
 * type used to record and display a series of time stamp values, primarily intended for gathering and displaying
 * performance data on iPads
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var platform = require( 'PHET_CORE/platform' );

  /**
   * @param {number} dataSize
   * @constructor
   */
  function TimestampRecorder( dataSize, options ) {

    options = _.extend( {
      autoDump: true, // when true, this will automatically dump the data when the buffer fills up, then reset
      maxLineLength: 100, // line feeds will be inserted to prevent lines longer than this during data dump
      decimalPlacesInData: 4
    }, options);

    this.dataSize = dataSize;
    this.index = 0;
    this.dataArray = new Array( dataSize );
    this.autoDump = options.autoDump;
    this.maxLineLength = options.maxLineLength;
    this.decimalPlacesInData = options.decimalPlacesInData;
    this.mostRecentTimeStamp = performance.now();
    this.currentLineLength = 0;

    for ( var i = 0; i < dataSize; i++ ){
      this.dataArray[ i ] = {
        text: null,
        timeValue: null
      };
    }
  }

  return inherit( Object, TimestampRecorder, {

    // @public
    dumpDataAndReset: function(){
      var alertString = '';
      for ( var i = 0; i < this.index; i++ ) {
        var stringToAdd = this.dataArray[ i ].text ? this.dataArray[ i ].text + ': ' : '';
        stringToAdd += this.dataArray[ i ].toFixed( this.decimalPlacesInData ) + ', ';
        if ( stringToAdd.length + this.currentLineLength > this.maxLineLength ){
          // add a line feed prior to this line
          stringToAdd = '\n' + stringToAdd;
          this.currentLineLength = stringToAdd.length;
        }
        else{
          this.currentLineLength += stringToAdd.length;
        }

        alertString += stringToAdd;
      }

      // on mobile Safari, pop the data up in an alert dialog, otherwise just dump it to the console
      if ( platform.mobileSafari ) {
        alert( alertString );
      }
      else {
        console.log( alertString );
      }

      this.reset();
    },

    /**
     * @param {String} [text] - optional text to describe what was happening at this time
     * @public
     */
    logAndUpdateTimestamp: function( text ){
      if ( this.index < this.size ){
        this.dataArray[ this.index ].data = this.mostRecentTimeStamp;
        if ( text ){
          this.dataArray[ this.index ].text = text;
        }
        this.mostRecentTimeStamp = performance.now();
        this.index++;
        if ( this.autoDump && this.index >= this.dataSize ){
          // data buffer is full, dump it and reset
          this.dumpDataAndReset();
        }
      }
    },

    // @private
    reset: function(){
      this.index = 0;
      this.currentLineLength = 0;
    }
  } );
} );