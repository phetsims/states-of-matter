// Copyright 2014-2023, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * MotionAtom is a model of an atom with Axon Property values that track position, velocity, and acceleration, as well
 * as other attributes that needed by the Atomic Interactions screen.
 *
 * @author John Blanco
 */

import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import isSettingPhetioStateProperty from '../../../../tandem/js/isSettingPhetioStateProperty.js';
import AtomType from '../../common/model/AtomType.js';
import SOMConstants from '../../common/SOMConstants.js';
import statesOfMatter from '../../statesOfMatter.js';

class MotionAtom {

  /**
   * @param initialAtomType - initial type, aka element, for this atom
   * @param initialXPosition - x position in the model, in picometers
   * @param initialYPosition - y position in the model, in picometers
   * @param tandem
   */
  public constructor( initialAtomType: AtomType, initialXPosition: number, initialYPosition: number, tandem: Tandem ) {

    // @public (read-write) {EnumerationDeprecatedProperty.<AtomType>} - the type of atom being modeled, e.g. Argon, Neon, etc.
    this.atomTypeProperty = new EnumerationDeprecatedProperty( AtomType, initialAtomType, {
      tandem: tandem.createTandem( 'atomTypeProperty' ),
      phetioReadOnly: true
    } );

    // get the default attributes associated with this atom
    const initialAtomAttributes = SOMConstants.MAP_ATOM_TYPE_TO_ATTRIBUTES.get( initialAtomType );

    // @public (read-write) {NumberProperty} - radius of this atom, should only be changed for adjustable atoms
    this.radiusProperty = new NumberProperty( initialAtomAttributes.radius, {
      units: 'pm',
      tandem: tandem.createTandem( 'radiusProperty' ),
      phetioReadOnly: true
    } );

    // @private, accessed through getter and setter methods below, see those methods for details
    this.positionProperty = new Vector2Property( new Vector2( initialXPosition, initialYPosition ), {
      units: 'pm',
      tandem: tandem.createTandem( 'positionProperty' )
    } );

    // @private, accessed through the getter/setter methods below
    this.velocityProperty = new Vector2Property( Vector2.ZERO, {
      units: 'pm/s',
      tandem: tandem.createTandem( 'velocityProperty' )
    } );

    // @private, accessed through the getter/setter methods below
    this.accelerationProperty = new Vector2Property( Vector2.ZERO, {
      units: 'pm/s^2',
      tandem: tandem.createTandem( 'accelerationProperty' )
    } );

    // @public {listen-only} - An emitter that indicates that the configuration of this atom have changed, done as an
    // emitter so that the view doesn't have to separately monitor a set of properties that all change at once.
    this.configurationChanged = new Emitter();

    // @public {read-only} - attributes of the atom, changed as the atom type changes
    this.mass = 0;
    this.color = null;
    this.epsilon = 0;

    // update the attributes if and when the atom type changes
    this.atomTypeProperty.link( atomType => {
      const atomAttributes = SOMConstants.MAP_ATOM_TYPE_TO_ATTRIBUTES.get( atomType );
      this.mass = atomAttributes.mass;
      this.color = atomAttributes.color;

      // Generally the radius is set here too, but not when this is an adjustable atom and state is being set via
      // phet-io, because the radius needs to come from the atom diameter setting.
      if ( !( isSettingPhetioStateProperty.value && atomType === AtomType.ADJUSTABLE ) ) {
        this.radiusProperty.set( atomAttributes.radius );
      }

      // signal that the configuration has changed
      this.configurationChanged.emit();
    } );
  }

  /**
   * @param x - atom x position in picometers
   * @param y - atom y position in picometers
   */
  public setPosition( x: number, y: number ): void {
    this.positionProperty.set( new Vector2( x, y ) );
  }

  public getVy(): number {
    return this.velocityProperty.value.y;
  }

  /**
   * @param vy - atom velocity in y-direction
   */
  public setVy( vy: number ): void {
    this.velocityProperty.set( new Vector2( this.velocityProperty.value.x, vy ) );
  }

  public getVx(): number {
    return this.velocityProperty.value.x;
  }

  /**
   * @param vx - atom velocity in x-direction
   */
  public setVx( vx: number ): void {
    this.velocityProperty.set( new Vector2( vx, this.velocityProperty.value.y ) );
  }

  public getAx(): number {
    return this.accelerationProperty.value.x;
  }

  public getAy(): number {
    return this.accelerationProperty.value.y;
  }

  /**
   * @param ax - atom acceleration in x-direction
   */
  public setAx( ax: number ): void {
    this.accelerationProperty.set( new Vector2( ax, this.accelerationProperty.value.y ) );
  }

  /**
   * @param ay - atom acceleration in y-direction
   */
  public setAy( ay: number ): void {
    this.accelerationProperty.set( new Vector2( this.accelerationProperty.value.x, ay ) );
  }

  public getX(): number {
    return this.positionProperty.value.x;
  }

  public getY(): number {
    return this.positionProperty.value.y;
  }

  public getType(): AtomType {
    return this.atomTypeProperty.value;
  }

  public reset(): void {
    this.atomTypeProperty.reset();
    this.positionProperty.reset();
    this.velocityProperty.reset();
    this.accelerationProperty.reset();
  }
}

statesOfMatter.register( 'MotionAtom', MotionAtom );
export default MotionAtom;