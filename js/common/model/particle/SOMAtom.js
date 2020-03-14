// Copyright 2014-2020, University of Colorado Boulder

/**
 * model of an atom with the attributes needed by the States of Matter simulation
 *
 * @author Aaron Davis
 * @author John Blanco
 */

import Emitter from '../../../../../axon/js/Emitter.js';
import EnumerationProperty from '../../../../../axon/js/EnumerationProperty.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../../dot/js/Vector2Property.js';
import Element from '../../../../../nitroglycerin/js/Element.js';
import statesOfMatter from '../../../statesOfMatter.js';
import SOMConstants from '../../SOMConstants.js';
import AtomType from '../AtomType.js';

// constants

// map of atom types to the attributes needed in this sim, can't use constructor due to limitations in IE
const MAP_ATOM_TYPE_TO_ATTRIBUTES = new Map(); // {key:AtomType, value:Object}
MAP_ATOM_TYPE_TO_ATTRIBUTES.set(
  AtomType.NEON,
  {
    radius: SOMConstants.NEON_RADIUS, // in picometers
    mass: Element.Ne.atomicWeight, // in atomic mass units,
    color: SOMConstants.NEON_COLOR
  }
);
MAP_ATOM_TYPE_TO_ATTRIBUTES.set(
  AtomType.ARGON,
  {
    radius: SOMConstants.ARGON_RADIUS, // in picometers
    mass: Element.Ar.atomicWeight, // in atomic mass units,
    color: SOMConstants.ARGON_COLOR
  }
);
MAP_ATOM_TYPE_TO_ATTRIBUTES.set(
  AtomType.OXYGEN,
  {
    radius: SOMConstants.OXYGEN_RADIUS, // in picometers
    mass: Element.O.atomicWeight, // in atomic mass units,
    color: SOMConstants.OXYGEN_COLOR
  }
);
MAP_ATOM_TYPE_TO_ATTRIBUTES.set(
  AtomType.HYDROGEN,
  {
    radius: SOMConstants.HYDROGEN_RADIUS, // in picometers
    mass: Element.H.atomicWeight, // in atomic mass units,
    color: SOMConstants.HYDROGEN_COLOR
  }
);
MAP_ATOM_TYPE_TO_ATTRIBUTES.set(
  AtomType.ADJUSTABLE,
  {
    radius: SOMConstants.ADJUSTABLE_ATTRACTION_DEFAULT_RADIUS, // in picometers
    mass: 25, // in atomic mass units,
    color: SOMConstants.ADJUSTABLE_ATTRACTION_COLOR
  }
);

class SOMAtom {

  /**
   * @param {AtomType} initialAtomType - initial type, aka element, for this atom
   * @param {number} initialXPosition - x position in the model, in picometers
   * @param {number} initialYPosition - y position in the model, in picometers
   * @constructor
   */
  constructor( initialAtomType, initialXPosition, initialYPosition ) {

    // @public {AtomType} - the type of atom being modeled, e.g. Argon, Neon, etc.
    this.atomTypeProperty = new EnumerationProperty( AtomType, initialAtomType );

    // @private, accessed through getter and setter methods below, see those methods for details
    this.positionProperty = new Vector2Property( new Vector2( initialXPosition, initialYPosition ) );

    // @private, accessed through the getter/setter methods below, this are not properties in order to improve performance
    this.velocity = new Vector2( 0, 0 );
    this.acceleration = new Vector2( 0, 0 );

    // @public {listen-only} - an emitter that indicates that the configuration of this atom have changed, done as an
    // emitter so that the view doesn't have to monitor a set of properties that all change at once
    this.configurationChanged = new Emitter();

    // @public {read-only} - attributes of the atom, changed as the atom type changes
    this.radius = 0;
    this.mass = 0;
    this.color = null;
    this.epsilon = 0;

    // update the attributes if and when the atom type changes
    this.atomTypeProperty.link( atomType => {
      const atomAttributes = MAP_ATOM_TYPE_TO_ATTRIBUTES.get( atomType );
      this.radius = atomAttributes.radius;
      this.mass = atomAttributes.mass;
      this.color = atomAttributes.color;
      this.configurationChanged.emit();
    } );
  }

  /**
   * @public
   * @param {number} x - atom x position in picometers
   * @param {number} y - atom y position in picometers
   * @constructor
   */
  setPosition( x, y ) {

    // use pools for better performance, this is why the methods need to be used instead of direct value setting
    const previousPosition = this.positionProperty.value;
    this.positionProperty.set( Vector2.createFromPool( x, y ) );
    previousPosition.freeToPool();
  }

  /**
   * @param other
   * @returns {boolean}
   * @public
   */
  equals( other ) {
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
    else if ( !this.acceleration.equals( other.acceleration ) ) {
      return false;
    }

    return true;
  }

  /**
   * @returns {number}
   * @public
   */
  getVy() {
    return this.velocity.y;
  }

  /**
   * @param {number} vy - atom velocity in y-direction
   * @public
   */
  setVy( vy ) {
    this.velocity.setY( vy );
  }

  /**
   * @returns {number}
   * @public
   */
  getVx() {
    return this.velocity.x;
  }

  /**
   * @param {number} vx - atom velocity in x-direction
   */
  setVx( vx ) {
    this.velocity.setX( vx );
  }

  /**
   * @returns {number}
   * @public
   */
  getAx() {
    return this.acceleration.x;
  }

  /**
   * @returns {number}
   * @public
   */
  getAy() {
    return this.acceleration.y;
  }

  /**
   * @param {number} ax - atom acceleration in x-direction
   * @public
   */
  setAx( ax ) {
    this.acceleration.setX( ax );
  }

  /**
   * @param {number} ay - atom acceleration in y-direction
   * @public
   */
  setAy( ay ) {
    this.acceleration.setY( ay );
  }

  /**
   * @returns {number}
   * @public
   */
  getX() {
    return this.positionProperty.value.x;
  }

  /**
   * @returns {number}
   * @public
   */
  getY() {
    return this.positionProperty.value.y;
  }

  getType() {
    return this.atomTypeProperty.value;
  }

  /**
   * @param {number} radius - radius of the atom
   * @public
   */
  setRadius( radius ) {
    this.radius = radius;
    this.configurationChanged.emit();
  }
}

statesOfMatter.register( 'SOMAtom', SOMAtom );
export default SOMAtom;