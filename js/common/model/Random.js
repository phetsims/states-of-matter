// Copyright 2002-2013, University of Colorado Boulder

/**
 * Replacement for Java's Random.nextGaussian()
 * Code taken from http://developer.classpath.org/doc/java/util/Random-source.html
 *
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  function Random() {
    this.haveNextNextGaussian = false;
  }

  return inherit( Object, Random, {

    nextGaussian: function() {
      if ( this.haveNextNextGaussian ) {
        this.haveNextNextGaussian = false;
        return this.nextNextGaussian;
      }

      var v1, v2, s;
      do {
        v1 = 2 * Math.random() - 1; // Between -1.0 and 1.0.
        v2 = 2 * Math.random() - 1; // Between -1.0 and 1.0.
        s = v1 * v1 + v2 * v2;
      } while ( s >= 1 );

      var norm = Math.sqrt( -2 * Math.log( s ) / s );
      this.nextNextGaussian = v2 * norm;
      this.haveNextNextGaussian = true;
      return v1 * norm;
    }

  } );
} );