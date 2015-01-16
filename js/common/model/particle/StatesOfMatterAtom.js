// Copyright 2002-2013, University of Colorado Boulder

/**
 * Model of a photon for single bulb screen.
 *
 * @author Aaron Davis
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Property = require( 'AXON/Property' );

  /**
   *
   * @param {Number} x position in picometers
   * @param {Number} y position in picometers
   * @param {Number} radius of the atom in picometers
   * @param {Number} mass of the atom in atomic mass units.
   * @param {Color} color of the atom
   * @constructor
   */
  function StatesOfMatterAtom( x, y, radius, mass, color ) {
    this.positionProperty = new Property( new Vector2( x, y ) );
    this.velocity = new Vector2( 0, 0 );
    this.accel = new Vector2( 0, 0 );
    this.color = color;
    this.mass = mass;
    this.radius = radius;
  }

  return inherit( Object, StatesOfMatterAtom, {

    /**
     * @param {Number} x - atom x position in picometers
     * @param {Number} y - atom y position in picometers
     * @constructor
     */
    setPosition: function( x, y ) {
      this.positionProperty.value.setXY( x, y );
      this.positionProperty._notifyObservers();
    },

    equals: function( other ) {
      if ( this === other ) {
        return true;
      }

      if ( this.mass !== other.mass ) {
        return false;
      }
      if ( this.radius !== other.radius ) {
        return false;
      }
      if ( !this.velocity.equals( other.velocity ) ) {
        return false;
      }
      if ( !this.positionProperty.equals( other.positionProperty ) ) {
        return false;
      }
      if ( !this.accel.equals( other.accel ) ) {
        return false;
      }

      return true;
    },
    getVy: function() {
      return this.velocity.y;
    },
    /**
     *
     * @param {Number} vy - atom velocity in y-direction
     */
    setVy: function( vy ) {
      this.velocity.setY( vy );
    },

    getVx: function() {
      return this.velocity.x;
    },

    /**
     *
     * @param {Number} vx - atom velocity in x-direction
     */
    setVx: function( vx ) {
      this.velocity.setX( vx );
    },

    getAx: function() {
      return this.accel.x;
    },

    getAy: function() {
      return this.accel.y;
    },

    /**
     *
     * @param {Number} ax - atom acceleration in x-direction
     */
    setAx: function( ax ) {
      this.accel.setX( ax );
    },
    /**
     *
     * @param {Number} ay - atom acceleration in y-direction
     */
    setAy: function( ay ) {
      this.accel.setY( ay );

    },
    getX: function() {
      return this.positionProperty.value.x;
    },

    getY: function() {
      return this.positionProperty.value.y;
    },

    getMass: function() {
      return this.mass;
    },

    getRadius: function() {
      return this.radius;
    },
    /**
     *
     * @param {Number} radius - radius of the atom
     */
    setRadius: function( radius ) {
      this.radius = radius;
    },


    getPositionReference: function() {
      return this.positionProperty.value;
    },

    getVelocity: function() {
      return this.velocity;
    },

    getAccel: function() {
      return this.accel;
    }
  } );
} );
