// Copyright 2014-2020, University of Colorado Boulder

/**
 * Model of Atom
 *
 * @author Aaron Davis
 */

import Vector2 from '../../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../../dot/js/Vector2Property.js';
import inherit from '../../../../../phet-core/js/inherit.js';
import statesOfMatter from '../../../statesOfMatter.js';

/**
 * @param {number} x - x position in picometers
 * @param {number} y - y position in picometers
 * @param {number} radius - radius  of the atom in picometers
 * @param {number} mass - mass of the atom in atomic mass units.
 * @param {Color} color  - color of the atom
 * @constructor
 */
function SOMAtom( x, y, radius, mass, color ) {

  // @private, accessed through getter and setter methods below, basically because that's how it worked in Java sim
  this.positionProperty = new Vector2Property( new Vector2( x, y ) );
  this.velocity = new Vector2( 0, 0 );
  this.accel = new Vector2( 0, 0 );
  this.color = color;
  this.mass = mass;
  this.radius = radius;
}

statesOfMatter.register( 'SOMAtom', SOMAtom );

export default inherit( Object, SOMAtom, {

  /**
   * @public
   * @param {number} x - atom x position in picometers
   * @param {number} y - atom y position in picometers
   * @constructor
   */
  setPosition: function( x, y ) {

    // do the following instead of allocating a new vector for better performance
    this.positionProperty.value.setXY( x, y );
    this.positionProperty._notifyListeners(); // TODO: Don't call this private method
  },

  /**
   * @param other
   * @returns {boolean}
   * @public
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
   * @returns {number}
   * @public
   */
  getVy: function() {
    return this.velocity.y;
  },
  /**
   * @param {number} vy - atom velocity in y-direction
   * @public
   */
  setVy: function( vy ) {
    this.velocity.setY( vy );
  },

  /**
   * @returns {number}
   * @public
   */
  getVx: function() {
    return this.velocity.x;
  },

  /**
   * @param {number} vx - atom velocity in x-direction
   */
  setVx: function( vx ) {
    this.velocity.setX( vx );
  },

  /**
   * @returns {number}
   * @public
   */
  getAx: function() {
    return this.accel.x;
  },

  /**
   * @returns {number}
   * @public
   */
  getAy: function() {
    return this.accel.y;
  },

  /**
   * @param {number} ax - atom acceleration in x-direction
   * @public
   */
  setAx: function( ax ) {
    this.accel.setX( ax );
  },

  /**
   * @param {number} ay - atom acceleration in y-direction
   * @public
   */
  setAy: function( ay ) {
    this.accel.setY( ay );
  },

  /**
   * @returns {number}
   * @public
   */
  getX: function() {
    return this.positionProperty.value.x;
  },

  /**
   * @returns {number}
   * @public
   */
  getY: function() {
    return this.positionProperty.value.y;
  },

  /**
   * @returns {number}
   * @public
   */
  getMass: function() {
    return this.mass;
  },

  /**
   * @returns {number}
   * @public
   */
  getRadius: function() {
    return this.radius;
  },

  /**
   * @param {number} radius - radius of the atom
   * @public
   */
  setRadius: function( radius ) {
    this.radius = radius;
  },

  /**
   * @returns {Vector2}
   * @public
   */
  getPositionReference: function() {
    return this.positionProperty.value;
  },

  /**
   * @returns {Vector2}
   * @public
   */
  getVelocity: function() {
    return this.velocity;
  },

  /**
   * @returns {Vector2}
   * @public
   */
  getAccel: function() {
    return this.accel;
  }
} );