// Copyright 2014-2022, University of Colorado Boulder

/**
 * This class defines a data set that is used to specify the positions, motions, and external forces for a collection of
 * molecules.  The data is organized as several parallel arrays where the index of a molecule is used to obtain the
 * various data values for that molecule.  This organizational approach was used to optimize performance of the
 * algorithm that makes use of this data.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import required from '../../../../phet-core/js/required.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import Float64ArrayIO from '../../../../tandem/js/types/Float64ArrayIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import statesOfMatter from '../../statesOfMatter.js';
import SOMConstants from '../SOMConstants.js';
import WaterMoleculeStructure from './engine/WaterMoleculeStructure.js';

// constants
const ArrayIONullableIOVector2IO = ArrayIO( NullableIO( Vector2.Vector2IO ) );
const ArrayIOBooleanIO = ArrayIO( BooleanIO );

class MoleculeForceAndMotionDataSet {

  /**
   * This creates the data set with the capacity to hold the maximum number of atoms/molecules, but does not create the
   * individual data for them.  That must be done explicitly through other calls.
   * @param {number} atomsPerMolecule
   */
  constructor( atomsPerMolecule ) {

    // @public (read-only) - attributes that describe the data set as a whole
    this.numberOfAtoms = 0;
    this.numberOfMolecules = 0;

    // @public (read-only) - attributes that apply to all elements of the data set
    this.atomsPerMolecule = atomsPerMolecule;

    // convenience variable
    const maxNumMolecules = Math.floor( SOMConstants.MAX_NUM_ATOMS / atomsPerMolecule );

    // @public Attributes of the individual molecules and the atoms that comprise them.
    this.atomPositions = new Array( SOMConstants.MAX_NUM_ATOMS );
    this.moleculeCenterOfMassPositions = new Array( maxNumMolecules );
    this.moleculeVelocities = new Array( maxNumMolecules );
    this.moleculeForces = new Array( maxNumMolecules );
    this.nextMoleculeForces = new Array( maxNumMolecules );
    this.insideContainer = new Array( maxNumMolecules );

    // Populate with null for vectors and false for booleans because PhET-iO cannot serialize undefined.
    for ( let i = 0; i < SOMConstants.MAX_NUM_ATOMS; i++ ) {
      this.atomPositions[ i ] = null;
      if ( i < maxNumMolecules ) {
        this.moleculeCenterOfMassPositions[ i ] = null;
        this.moleculeVelocities[ i ] = null;
        this.moleculeForces[ i ] = null;
        this.nextMoleculeForces[ i ] = null;
        this.insideContainer[ i ] = false;
      }
    }

    // @public - Note that some of the following are not used in the monatomic case, but need to be here for compatibility.
    this.moleculeRotationAngles = new Float64Array( maxNumMolecules );
    this.moleculeRotationRates = new Float64Array( maxNumMolecules );
    this.moleculeTorques = new Float64Array( maxNumMolecules );
    this.nextMoleculeTorques = new Float64Array( maxNumMolecules );
    for ( let i = 0; i < SOMConstants.MAX_NUM_ATOMS / this.atomsPerMolecule; i++ ) {
      this.moleculeRotationAngles[ i ] = 0;
      this.moleculeRotationRates[ i ] = 0;
      this.moleculeTorques[ i ] = 0;
      this.nextMoleculeTorques[ i ] = 0;
    }

    // Set default values.
    if ( atomsPerMolecule === 1 ) {
      this.moleculeMass = 1;
      this.moleculeRotationalInertia = 0;
    }
    else if ( atomsPerMolecule === 2 ) {
      this.moleculeMass = 2; // Two molecules, assumed to be the same.
      this.moleculeRotationalInertia = this.moleculeMass *
                                       Math.pow( SOMConstants.DIATOMIC_PARTICLE_DISTANCE, 2 ) / 2;
    }
    else if ( atomsPerMolecule === 3 ) {
      // NOTE: These settings only work for water, since that is the only supported triatomic molecule at the time of
      // this writing (Nov 2008).  If other 3-atom molecules are added, this will need to be changed.
      this.moleculeMass = 1.5; // Three molecules, one relatively heavy and two light
      this.moleculeRotationalInertia = WaterMoleculeStructure.rotationalInertia;
    }
  }

  /**
   * get the total kinetic energy of the particles in this data set
   * @public
   */
  getTotalKineticEnergy() {

    let translationalKineticEnergy = 0;
    let rotationalKineticEnergy = 0;
    const particleMass = this.moleculeMass;
    const numberOfParticles = this.getNumberOfMolecules();
    let i;

    if ( this.atomsPerMolecule > 1 ) {

      // Include rotational inertia in the calculation.
      const rotationalInertia = this.getMoleculeRotationalInertia();
      for ( i = 0; i < numberOfParticles; i++ ) {
        translationalKineticEnergy += 0.5 * particleMass *
                                      ( Math.pow( this.moleculeVelocities[ i ].x, 2 ) +
                                        Math.pow( this.moleculeVelocities[ i ].y, 2 ) );
        rotationalKineticEnergy += 0.5 * rotationalInertia * Math.pow( this.moleculeRotationRates[ i ], 2 );
      }
    }
    else {
      for ( i = 0; i < this.getNumberOfMolecules(); i++ ) {

        // For single-atom molecules only translational kinetic energy is used.
        translationalKineticEnergy += 0.5 * particleMass *
                                      ( Math.pow( this.moleculeVelocities[ i ].x, 2 ) +
                                        Math.pow( this.moleculeVelocities[ i ].y, 2 ) );
      }
    }

    return translationalKineticEnergy + rotationalKineticEnergy;
  }

  /**
   * @returns {number}
   * @public
   */
  getTemperature() {

    // The formula for kinetic energy in an ideal gas is used here with Boltzmann's constant normalized, i.e. equal to 1.
    return ( 2 / 3 ) * this.getTotalKineticEnergy() / this.getNumberOfMolecules();
  }

  /**
   * @returns {number}
   * @public
   */
  getNumberOfMolecules() {
    return this.numberOfAtoms / this.atomsPerMolecule;
  }

  /**
   * @returns {number}
   * @public
   */
  getMoleculeRotationalInertia() {
    return this.moleculeRotationalInertia;
  }

  /**
   * @returns {number}
   * @public
   */
  getMoleculeMass() {
    return this.moleculeMass;
  }

  /**
   * get the kinetic energy of the specified molecule
   * @param moleculeIndex
   * @public
   */
  getMoleculeKineticEnergy( moleculeIndex ) {
    assert && assert( moleculeIndex >= 0 && moleculeIndex < this.numberOfMolecules );
    const translationalKineticEnergy = 0.5 * this.moleculeMass *
                                       ( Math.pow( this.moleculeVelocities[ moleculeIndex ].x, 2 ) +
                                         Math.pow( this.moleculeVelocities[ moleculeIndex ].y, 2 ) );
    const rotationalKineticEnergy = 0.5 * this.moleculeRotationalInertia *
                                    Math.pow( this.moleculeRotationRates[ moleculeIndex ], 2 );
    return translationalKineticEnergy + rotationalKineticEnergy;
  }

  /**
   * Returns a value indicating how many more molecules can be added.
   * @returns {number}
   * @public
   */
  getNumberOfRemainingSlots() {
    return ( Math.floor( SOMConstants.MAX_NUM_ATOMS / this.atomsPerMolecule ) -
             ( this.numberOfAtoms / this.atomsPerMolecule ) );
  }

  /**
   * @returns {number}
   * @public
   */
  getAtomsPerMolecule() {
    return this.atomsPerMolecule;
  }

  /**
   * @returns {Array}
   * @public
   */
  getAtomPositions() {
    return this.atomPositions;
  }

  /**
   * @returns {number|}
   * @public
   */
  getNumberOfAtoms() {
    return this.numberOfAtoms;
  }

  /**
   * @returns {Array}
   * @public
   */
  getMoleculeCenterOfMassPositions() {
    return this.moleculeCenterOfMassPositions;
  }

  /**
   * @returns {Array}
   * @public
   */
  getMoleculeVelocities() {
    return this.moleculeVelocities;
  }

  /**
   * @returns {Array}
   * @public
   */
  getMoleculeForces() {
    return this.moleculeForces;
  }

  /**
   * @returns {Array}
   * @public
   */
  getNextMoleculeForces() {
    return this.nextMoleculeForces;
  }

  /**
   * @returns {Array}
   * @public
   */
  getMoleculeRotationAngles() {
    return this.moleculeRotationAngles;
  }

  /**
   * @param {[]}rotationAngles
   * @public
   */
  setMoleculeRotationAngles( rotationAngles ) {
    this.moleculeRotationAngles = rotationAngles;
  }

  /**
   * @returns {Array}
   * @public
   */
  getMoleculeRotationRates() {
    return this.moleculeRotationRates;
  }

  /**
   * @returns {Array}
   * @public
   */
  getMoleculeTorques() {
    return this.moleculeTorques;
  }

  /**
   * @returns {Array}
   * @public
   */
  getNextMoleculeTorques() {
    return this.nextMoleculeTorques;
  }

  /**
   * Add a new molecule to the model.  The molecule must have been created and initialized before being added.
   * @param {Array.<Vector2>} atomPositions
   * @param {Vector2} moleculeCenterOfMassPosition
   * @param {Vector2} moleculeVelocity
   * @param {number} moleculeRotationRate
   * @param {boolean} insideContainer
   * @returns {boolean} true if able to add, false if not.
   * @public
   */
  addMolecule( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, moleculeRotationRate, insideContainer ) {

    // error checking
    assert && assert( this.getNumberOfRemainingSlots() > 0, 'no space left in molecule data set' );
    if ( this.getNumberOfRemainingSlots() === 0 ) {
      return false;
    }

    // Add the information for this molecule to the data set.
    for ( let i = 0; i < this.atomsPerMolecule; i++ ) {
      this.atomPositions[ i + this.numberOfAtoms ] = atomPositions[ i ].copy();
    }
    const numberOfMolecules = this.numberOfAtoms / this.atomsPerMolecule;
    this.moleculeCenterOfMassPositions[ numberOfMolecules ] = moleculeCenterOfMassPosition;
    this.moleculeVelocities[ numberOfMolecules ] = moleculeVelocity;
    this.moleculeRotationRates[ numberOfMolecules ] = moleculeRotationRate;
    this.insideContainer[ numberOfMolecules ] = insideContainer;

    // Allocate memory for the information that is not specified.
    this.moleculeForces[ numberOfMolecules ] = new Vector2( 0, 0 );
    this.nextMoleculeForces[ numberOfMolecules ] = new Vector2( 0, 0 );

    // Increment the counts of atoms and molecules.
    this.numberOfAtoms += this.atomsPerMolecule;
    this.numberOfMolecules++;

    return true;
  }

  /**
   * Remove the molecule at the designated index.  This also removes all atoms and forces associated with the molecule
   * and shifts the various arrays to compensate.
   * <p/>
   * This is fairly compute intensive, and should be used sparingly.  This was originally created to support the
   * feature where the lid is returned and any molecules outside of the container disappear.
   * @param {number} moleculeIndex
   * @public
   */
  removeMolecule( moleculeIndex ) {

    assert && assert( moleculeIndex < this.numberOfAtoms / this.atomsPerMolecule, 'molecule index out of range' );

    let i;

    // Handle all data arrays that are maintained on a per-molecule basis.
    for ( i = moleculeIndex; i < this.numberOfAtoms / this.atomsPerMolecule - 1; i++ ) {
      // Shift the data in each array forward one slot.
      this.moleculeCenterOfMassPositions[ i ] = this.moleculeCenterOfMassPositions[ i + 1 ];
      this.moleculeVelocities[ i ] = this.moleculeVelocities[ i + 1 ];
      this.moleculeForces[ i ] = this.moleculeForces[ i + 1 ];
      this.nextMoleculeForces[ i ] = this.nextMoleculeForces[ i + 1 ];
      this.moleculeRotationAngles[ i ] = this.moleculeRotationAngles[ i + 1 ];
      this.moleculeRotationRates[ i ] = this.moleculeRotationRates[ i + 1 ];
      this.moleculeTorques[ i ] = this.moleculeTorques[ i + 1 ];
      this.nextMoleculeTorques[ i ] = this.nextMoleculeTorques[ i + 1 ];
    }

    // Handle all data arrays that are maintained on a per-atom basis.
    for ( i = moleculeIndex * this.atomsPerMolecule; i < ( this.numberOfAtoms - this.atomsPerMolecule );
          i += this.atomsPerMolecule ) {
      for ( let j = 0; j < this.atomsPerMolecule; j++ ) {
        this.atomPositions[ i + j ] = this.atomPositions[ i + this.atomsPerMolecule + j ];
      }
    }

    // Reduce the counts.
    this.numberOfAtoms -= this.atomsPerMolecule;
    this.numberOfMolecules--;
  }

  /**
   * serialize this instance for phet-io
   * @returns {Object}
   * @public - for phet-io support only
   */
  toStateObject() {
    return {
      atomsPerMolecule: this.atomsPerMolecule,
      numberOfAtoms: this.numberOfAtoms,
      numberOfMolecules: this.numberOfMolecules,
      moleculeMass: this.moleculeMass,
      moleculeRotationalInertia: this.moleculeRotationalInertia,

      // arrays
      atomPositions: ArrayIONullableIOVector2IO.toStateObject( this.atomPositions ),
      moleculeCenterOfMassPositions: ArrayIONullableIOVector2IO.toStateObject( this.moleculeCenterOfMassPositions ),
      moleculeVelocities: ArrayIONullableIOVector2IO.toStateObject( this.moleculeVelocities ),
      moleculeForces: ArrayIONullableIOVector2IO.toStateObject( this.moleculeForces ),
      nextMoleculeForces: ArrayIONullableIOVector2IO.toStateObject( this.nextMoleculeForces ),
      insideContainer: ArrayIOBooleanIO.toStateObject( this.insideContainer ),
      moleculeRotationAngles: Float64ArrayIO.toStateObject( this.moleculeRotationAngles ),
      moleculeRotationRates: Float64ArrayIO.toStateObject( this.moleculeRotationRates ),
      moleculeTorques: Float64ArrayIO.toStateObject( this.moleculeTorques ),
      nextMoleculeTorques: Float64ArrayIO.toStateObject( this.nextMoleculeTorques )
    };
  }

  /**
   * Set the state of this instance for phet-io.  This is used for phet-io, but not directly by the PhetioStateEngine -
   * it is instead called during explicit de-serialization.
   * @param {Object} stateObject - returned from toStateObject
   * @public
   */
  setState( stateObject ) {
    required( stateObject );

    // single values that pertain to the entire data set
    this.numberOfAtoms = stateObject.numberOfAtoms;
    this.numberOfMolecules = stateObject.numberOfMolecules;
    this.moleculeMass = stateObject.moleculeMass;
    this.moleculeRotationalInertia = stateObject.moleculeRotationalInertia;
    this.atomsPerMolecule = stateObject.atomsPerMolecule;

    // arrays - copy the values rather than overwriting any references
    const atomPositions = ArrayIONullableIOVector2IO.fromStateObject( stateObject.atomPositions );
    for ( let i = 0; i < this.numberOfAtoms; i++ ) {
      this.atomPositions[ i ] = atomPositions[ i ];
    }

    const moleculeCenterOfMassPositions = ArrayIONullableIOVector2IO.fromStateObject( stateObject.moleculeCenterOfMassPositions );
    const moleculeVelocities = ArrayIONullableIOVector2IO.fromStateObject( stateObject.moleculeVelocities );
    const moleculeForces = ArrayIONullableIOVector2IO.fromStateObject( stateObject.moleculeForces );
    const nextMoleculeForces = ArrayIONullableIOVector2IO.fromStateObject( stateObject.nextMoleculeForces );
    const moleculeRotationAngles = Float64ArrayIO.fromStateObject( stateObject.moleculeRotationAngles );
    const moleculeRotationRates = Float64ArrayIO.fromStateObject( stateObject.moleculeRotationRates );
    const moleculeTorques = Float64ArrayIO.fromStateObject( stateObject.moleculeTorques );
    const insideContainer = ArrayIOBooleanIO.fromStateObject( stateObject.insideContainer );
    for ( let i = 0; i < this.numberOfMolecules; i++ ) {
      this.moleculeCenterOfMassPositions[ i ] = moleculeCenterOfMassPositions[ i ];
      this.moleculeVelocities[ i ] = moleculeVelocities[ i ];
      this.moleculeForces[ i ] = moleculeForces[ i ];
      this.nextMoleculeForces[ i ] = nextMoleculeForces[ i ];
      this.moleculeRotationAngles[ i ] = moleculeRotationAngles[ i ];
      this.moleculeRotationRates[ i ] = moleculeRotationRates[ i ];
      this.moleculeTorques[ i ] = moleculeTorques[ i ];
      this.insideContainer[ i ] = insideContainer[ i ];
    }
  }

  /**
   * Dump this data set's information in a way that can then be incorporated into a phase state changer that needs to
   * use fixed positions, velocities, etc. to set the state of a substance.  This was created in order to come up with
   * good initial configurations instead of using an algorithmically generated ones, which can look unnatural.  See
   * https://github.com/phetsims/states-of-matter/issues/212.  To use this, set a debugger at a point in the code
   * where the substance is in the desired position, call this from the command line, and then incorporate the output
   * into the appropriate phase state changer object (e.g. WaterPhaseStateChanger).  Some hand-tweaking is generally
   * necessary.
   * @public
   */
  dump() {

    let i;
    const numMolecules = this.numberOfMolecules;

    console.log( 'moleculeCenterOfMassPositions:' );
    console.log( '[' );
    for ( i = 0; i < numMolecules; i++ ) {
      const comPos = this.moleculeCenterOfMassPositions[ i ];
      console.log( '{', 'x: ', Utils.toFixed( comPos.x, 3 ), ', y: ', Utils.toFixed( comPos.y, 3 ), '}' );
    }
    console.log( '],' );

    console.log( 'moleculeVelocities:' );
    console.log( '[' );
    for ( i = 0; i < numMolecules; i++ ) {
      const vel = this.moleculeVelocities[ i ];
      console.log( '{', 'x: ', Utils.toFixed( vel.x, 3 ), ', y: ', Utils.toFixed( vel.y, 3 ), '}' );
    }
    console.log( '],' );

    console.log( 'moleculeRotationAngles:' );
    console.log( '[' );
    for ( i = 0; i < numMolecules; i++ ) {
      const angle = this.moleculeRotationAngles[ i ];
      console.log( Utils.toFixed( angle, 3 ), ',' );
    }
    console.log( '],' );

    console.log( 'moleculeRotationRates:' );
    console.log( '[' );
    for ( i = 0; i < numMolecules; i++ ) {
      const rate = this.moleculeRotationRates[ i ];
      console.log( Utils.toFixed( rate, 3 ), ',' );
    }
    console.log( '],' );
  }
}

// IO Type for MoleculeForceAndMotionDataSet, uses "data type" serialization where `fromStateObject returns a new
// instance.
MoleculeForceAndMotionDataSet.MoleculeForceAndMotionDataSetIO = new IOType( 'MoleculeForceAndMotionDataSetIO', {
  valueType: MoleculeForceAndMotionDataSet,
  documentation: 'particle data set',
  toStateObject: moleculeForceAndMotionDataSet => moleculeForceAndMotionDataSet.toStateObject(),
  stateSchema: {
    atomsPerMolecule: NumberIO,
    numberOfAtoms: NumberIO,
    numberOfMolecules: NumberIO,
    moleculeMass: NumberIO,
    moleculeRotationalInertia: NumberIO,

    // arrays
    atomPositions: ArrayIONullableIOVector2IO,
    moleculeCenterOfMassPositions: ArrayIONullableIOVector2IO,
    moleculeVelocities: ArrayIONullableIOVector2IO,
    moleculeForces: ArrayIONullableIOVector2IO,
    nextMoleculeForces: ArrayIONullableIOVector2IO,
    insideContainer: ArrayIOBooleanIO,
    moleculeRotationAngles: Float64ArrayIO,
    moleculeRotationRates: Float64ArrayIO,
    moleculeTorques: Float64ArrayIO,
    nextMoleculeTorques: Float64ArrayIO
  }
} );

statesOfMatter.register( 'MoleculeForceAndMotionDataSet', MoleculeForceAndMotionDataSet );
export default MoleculeForceAndMotionDataSet;