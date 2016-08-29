// Copyright 2016, University of Colorado Boulder

/**
 * used to log timestamps and display the logged values, primarily intended for gathering and displaying performance
 * data on iPads
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var platform = require( 'PHET_CORE/platform' );
  var statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  /**
   * @param {number} dataSize
   * @param {Object} options
   * @constructor
   */
  function TimestampLogger( dataSize, options ) {

    options = _.assign( {
      autoDump: true, // when true, this will automatically dump the data when the buffer fills up, then reset
      maxLineLength: 65, // line feeds will be inserted to prevent lines longer than this during data dump
      decimalPlacesInData: 4,
      includeAverageInDump: true
    }, options );

    this.dataSize = dataSize;
    this.index = 0;
    this.dataArray = new Array( dataSize );
    this.autoDump = options.autoDump;
    this.maxLineLength = options.maxLineLength;
    this.decimalPlacesInData = options.decimalPlacesInData;
    this.mostRecentTimestamp = performance.now();
    this.currentLineLength = 0;
    this.includeAverageInDump = options.includeAverageInDump;
    this.total = 0;

    for ( var i = 0; i < dataSize; i++ ) {
      this.dataArray[ i ] = {
        text: null,
        timestamp: null
      };
    }
  }

  statesOfMatter.register( 'TimestampLogger', TimestampLogger );

  return inherit( Object, TimestampLogger, {

    // @public
    dumpDataAndReset: function() {
      var alertString = '';
      for ( var i = 0; i < this.index; i++ ) {
        var stringToAdd = this.dataArray[ i ].text ? this.dataArray[ i ].text + ': ' : '';
        stringToAdd += this.dataArray[ i ].timestamp.toFixed( this.decimalPlacesInData ) + ', ';
        if ( stringToAdd.length + this.currentLineLength > this.maxLineLength ) {
          // add a line feed prior to this line
          stringToAdd = '\n' + stringToAdd;
          this.currentLineLength = stringToAdd.length;
        }
        else {
          this.currentLineLength += stringToAdd.length;
        }
        alertString += stringToAdd;
      }

      if ( this.includeAverageInDump ){
        alertString += '\n' + 'average: ' + ( this.total / this.dataSize ).toFixed( this.decimalPlacesInData );
      }

      // decide how to best present the data
      if ( platform.mobileSafari ) {
        alert( alertString );
      }
      else {
        console.log( alertString );
      }

      this.reset();
    },

    /**
     * log an entry in the data array that is the difference between the last timestamp update and the current time
     * @param {String} [text] - optional text to describe what was happening at this time
     * @public
     */
    logDeltaTime: function( text ) {
      if ( this.index < this.dataSize ) {
        var deltaTime = performance.now() - this.mostRecentTimestamp;
        this.dataArray[ this.index ].timestamp = deltaTime;
        this.total += deltaTime;
        if ( text ) {
          this.dataArray[ this.index ].text = text;
        }
        this.index++;
        if ( this.autoDump && this.index >= this.dataSize ) {
          // data buffer is full, dump it and reset
          this.dumpDataAndReset();
        }
      }
    },

    // @public
    updateTimestamp: function() {
      this.mostRecentTimestamp = performance.now();
    },

    // @private
    reset: function() {
      this.index = 0;
      this.currentLineLength = 0;
      this.total = 0;
    }
  } );
} );