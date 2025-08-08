// Copyright 2020, University of Colorado Boulder

/**
 * ScaledAtom is a simple model of an atom with the attributes needed by the particle interaction simulation portion of
 * the States of Matter simulation.  It is "scaled" in the sense that it has position and radius values that are set to
 * somewhat realistic values for atoms, whereas other parts of the simulation use normalized values for computational
 * efficiency.
 *
 * @author Aaron Davis
 * @author John Blanco
 */

import Vector2 from '../../../../../dot/js/Vector2.js';
import statesOfMatter from '../../../statesOfMatter.js';
import SOMConstants from '../../SOMConstants.js';

class ScaledAtom {

  /**
   * @param {AtomType} atomType - initial type, aka element, for this atom
   * @param {number} initialXPosition - x position in the model, in picometers
   * @param {number} initialYPosition - y position in the model, in picometers
   */
  constructor( atomType, initialXPosition, initialYPosition ) {

    // @public {AtomType} - the type of atom being modeled, e.g. Argon, Neon, etc.
    this.atomType = atomType;

    // @private, accessed through getter and setter methods below, see those methods for details
    this.position = new Vector2( initialXPosition, initialYPosition );

    // @public {read-only} - attributes of the atom, changed as the atom type changes
    this.radius = 0;
    this.mass = 0;
    this.color = null;
    this.epsilon = 0;

    // set the attributes based on the atom type
    const atomAttributes = SOMConstants.MAP_ATOM_TYPE_TO_ATTRIBUTES.get( atomType );
    this.radius = atomAttributes.radius;
    this.mass = atomAttributes.mass;
    this.color = atomAttributes.color;
  }

  /**
   * @param {number} x - atom x position in picometers
   * @param {number} y - atom y position in picometers
   * @public
   */
  setPosition( x, y ) {

    // use pools for better performance, this is why the methods need to be used instead of direct value setting
    this.position.setXY( x, y );
  }

  /**
   * @returns {number}
   * @public
   */
  getX() {
    return this.position.x;
  }

  /**
   * @returns {number}
   * @public
   */
  getY() {
    return this.position.y;
  }

  /**
   * @returns {AtomType}
   * @public
   */
  getType() {
    return this.atomType;
  }
}

statesOfMatter.register( 'ScaledAtom', ScaledAtom );
export default ScaledAtom;