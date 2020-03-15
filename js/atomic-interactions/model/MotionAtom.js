// Copyright 2014-2020, University of Colorado Boulder

/**
 * MotionAtom is a model of an atom with Axon Property values that track position, velocity, and acceleration, as well
 * as other attributes that needed by the Atomic Interactions screen.
 *
 * @author John Blanco
 */

import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import statesOfMatter from '../../statesOfMatter.js';
import SOMConstants from '../../common/SOMConstants.js';
import AtomType from '../../common/model/AtomType.js';

// constants

class MotionAtom {

  /**
   * @param {AtomType} initialAtomType - initial type, aka element, for this atom
   * @param {number} initialXPosition - x position in the model, in picometers
   * @param {number} initialYPosition - y position in the model, in picometers
   * @param {Tandem} tandem
   * @constructor
   */
  constructor( initialAtomType, initialXPosition, initialYPosition, tandem ) {

    // @public {AtomType} - the type of atom being modeled, e.g. Argon, Neon, etc.
    this.atomTypeProperty = new EnumerationProperty( AtomType, initialAtomType, {
      tandem: tandem.createTandem( 'atomTypeProperty' )
    } );

    // @private, accessed through getter and setter methods below, see those methods for details
    this.positionProperty = new Vector2Property( new Vector2( initialXPosition, initialYPosition ), {
      tandem: tandem.createTandem( 'positionProperty' )
    } );

    // @private, accessed through the getter/setter methods below
    this.velocityProperty = new Vector2Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'velocityProperty' )
    } );

    // @private, accessed through the getter/setter methods below
    this.accelerationProperty = new Vector2Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'accelerationProperty' )
    } );

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
      const atomAttributes = SOMConstants.MAP_ATOM_TYPE_TO_ATTRIBUTES.get( atomType );
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
    this.positionProperty.set( new Vector2( x, y ) );
  }

  /**
   * @returns {number}
   * @public
   */
  getVy() {
    return this.velocityProperty.value.y;
  }

  /**
   * @param {number} vy - atom velocity in y-direction
   * @public
   */
  setVy( vy ) {
    this.velocityProperty.set( new Vector2( this.velocityProperty.value.x, vy ) );
  }

  /**
   * @returns {number}
   * @public
   */
  getVx() {
    return this.velocityProperty.value.x;
  }

  /**
   * @param {number} vx - atom velocity in x-direction
   */
  setVx( vx ) {
    this.velocityProperty.set( new Vector2( vx, this.velocityProperty.value.y ) );
  }

  /**
   * @returns {number}
   * @public
   */
  getAx() {
    return this.accelerationProperty.value.x;
  }

  /**
   * @returns {number}
   * @public
   */
  getAy() {
    return this.accelerationProperty.value.y;
  }

  /**
   * @param {number} ax - atom acceleration in x-direction
   * @public
   */
  setAx( ax ) {
    this.accelerationProperty.set( new Vector2( ax, this.accelerationProperty.value.y ) );
  }

  /**
   * @param {number} ay - atom acceleration in y-direction
   * @public
   */
  setAy( ay ) {
    this.accelerationProperty.set( new Vector2( this.accelerationProperty.value.x, ay ) );
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

  reset() {
    this.atomTypeProperty.reset();
    this.positionProperty.reset();
    this.velocityProperty.reset();
    this.accelerationProperty.reset();

  }
}

statesOfMatter.register( 'MotionAtom', MotionAtom );
export default MotionAtom;