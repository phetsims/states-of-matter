// Copyright 2002-2015, University of Colorado Boulder

/**
 * Model of Atom
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
   * @param {number} x  - x position in picometers
   * @param {number} y  - y position in picometers
   * @param {number} radius - radius  of the atom in picometers
   * @param {number} mass - mass  of the atom in atomic mass units.
   * @param {Color} color  - color of the atom
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
     * @public
     * @param {number} x - atom x position in picometers
     * @param {number} y - atom y position in picometers
     * @constructor
     */
    setPosition: function( x, y ) {
      this.positionProperty.value.setXY( x, y );
      this.positionProperty._notifyObservers();
    },

    /**
     * @public
     * @param other
     * @returns {boolean}
     */
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
      else if ( !this.accel.equals( other.accel ) ) {
        return false;
      }

      return true;
    },

    /**
     * @public
     * @returns {number}
     */
    getVy: function() {
      return this.velocity.y;
    },
    /**
     * @public
     * @param {number} vy - atom velocity in y-direction
     */
    setVy: function( vy ) {
      this.velocity.setY( vy );
    },

    /**
     * @public
     * @returns {number}
     */
    getVx: function() {
      return this.velocity.x;
    },

    /**
     *
     * @param {number} vx - atom velocity in x-direction
     */
    setVx: function( vx ) {
      this.velocity.setX( vx );
    },

    /**
     * @public
     * @returns {number}
     */
    getAx: function() {
      return this.accel.x;
    },

    /**
     * @public
     * @returns {number}
     */
    getAy: function() {
      return this.accel.y;
    },

    /**
     * @public
     * @param {number} ax - atom acceleration in x-direction
     */
    setAx: function( ax ) {
      this.accel.setX( ax );
    },

    /**
     * @public
     * @param {number} ay - atom acceleration in y-direction
     */
    setAy: function( ay ) {
      this.accel.setY( ay );

    },
    /**
     * @public
     * @returns {number}
     */
    getX: function() {
      return this.positionProperty.value.x;
    },

    /**
     * @public
     * @returns {number}
     */
    getY: function() {
      return this.positionProperty.value.y;
    },

    /**
     * @public
     * @returns {number}
     */
    getMass: function() {
      return this.mass;
    },

    /**
     * @public
     * @returns {number}
     */
    getRadius: function() {
      return this.radius;
    },

    /**
     * @public
     * @param {number} radius - radius of the atom
     */
    setRadius: function( radius ) {
      this.radius = radius;
    },

    /**
     * @public
     * @returns {Vector2}
     */
    getPositionReference: function() {
      return this.positionProperty.value;
    },

    /**
     * @public
     * @returns {Vector2}
     */
    getVelocity: function() {
      return this.velocity;
    },

    /**
     * @public
     * @returns {Vector2}
     */
    getAccel: function() {
      return this.accel;
    }
  } );
} );
