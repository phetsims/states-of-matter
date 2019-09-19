// Copyright 2014-2019, University of Colorado Boulder

/**
 * This class represents the bundle of data that represents the position, motion, and forces acting upon a set of
 * molecules.  The data is organized this way rather than as a set of objects (one object per molecule) for performance
 * reasons.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( require => {
  'use strict';

  // modules
  const inherit = require( 'PHET_CORE/inherit' );
  const SOMConstants = require( 'STATES_OF_MATTER/common/SOMConstants' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const Vector2 = require( 'DOT/Vector2' );
  const WaterMoleculeStructure = require( 'STATES_OF_MATTER/common/model/engine/WaterMoleculeStructure' );

  /**
   * This creates the data set with the capacity to hold the maximum number of atoms/molecules, but does not create the
   * individual data for them.  That must be done explicitly through other calls.
   * @param {number} atomsPerMolecule
   * @constructor
   */
  function MoleculeForceAndMotionDataSet( atomsPerMolecule ) {

    // @public Attributes that describe the data set as a whole.
    this.numberOfAtoms = 0;
    this.numberOfMolecules = 0;

    // @public Attributes that apply to all elements of the data set.
    this.atomsPerMolecule = atomsPerMolecule;

    // convenience variable
    var maxNumMolecules = Math.floor( SOMConstants.MAX_NUM_ATOMS / atomsPerMolecule );

    // @public Attributes of the individual molecules and the atoms that comprise them.
    this.atomPositions = new Array( SOMConstants.MAX_NUM_ATOMS );
    this.moleculeCenterOfMassPositions = new Array( maxNumMolecules );
    this.moleculeVelocities = new Array( maxNumMolecules );
    this.moleculeForces = new Array( maxNumMolecules );
    this.nextMoleculeForces = new Array( maxNumMolecules );
    this.insideContainer = new Array( maxNumMolecules );

    // @public Note that some of the following are not used in the monatomic case, but need to be here for compatibility.
    this.moleculeRotationAngles = new Array( maxNumMolecules );
    this.moleculeRotationRates = new Array( maxNumMolecules );
    this.moleculeTorques = new Array( maxNumMolecules );
    this.nextMoleculeTorques = new Array( maxNumMolecules );
    for ( var i = 0; i < SOMConstants.MAX_NUM_ATOMS / this.atomsPerMolecule; i++ ) {
      this.moleculeRotationAngles [ i ] = 0;
      this.moleculeRotationRates[ i ] = 0;
      this.moleculeTorques[ i ] = 0;
      this.nextMoleculeTorques [ i ] = 0;
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

  statesOfMatter.register( 'MoleculeForceAndMotionDataSet', MoleculeForceAndMotionDataSet );

  return inherit( Object, MoleculeForceAndMotionDataSet, {

    /**
     * get the total kinetic energy of the particles in this data set
     */
    getTotalKineticEnergy: function(){

      var translationalKineticEnergy = 0;
      var rotationalKineticEnergy = 0;
      var particleMass = this.moleculeMass;
      var numberOfParticles = this.getNumberOfMolecules();
      var i;

      if ( this.atomsPerMolecule > 1 ) {

        // Include rotational inertia in the calculation.
        var rotationalInertia = this.getMoleculeRotationalInertia();
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
    },

    getTemperature: function(){

      // The formula for kinetic energy in an ideal gas is used here with Boltzmann's constant normalized, i.e. equal to 1.
      return ( 2 / 3 ) * this.getTotalKineticEnergy() / this.getNumberOfMolecules();
    },

    /**
     * @returns {number}
     * @public
     */
    getNumberOfMolecules: function() {
      return this.numberOfAtoms / this.atomsPerMolecule;
    },

    /**
     * @returns {number}
     * @public
     */
    getMoleculeRotationalInertia: function() {
      return this.moleculeRotationalInertia;
    },

    /**
     * @returns {number}
     * @public
     */
    getMoleculeMass: function() {
      return this.moleculeMass;
    },

    /**
     * get the kinetic energy of the specified molecule
     * @param moleculeIndex
     */
    getMoleculeKineticEnergy: function( moleculeIndex ){
      assert && assert ( moleculeIndex >= 0 && moleculeIndex < this.numberOfMolecules );
      var translationalKineticEnergy = 0.5 * this.moleculeMass *
                                    ( Math.pow( this.moleculeVelocities[ moleculeIndex ].x, 2 ) +
                                      Math.pow( this.moleculeVelocities[ moleculeIndex ].y, 2 ) );
      var rotationalKineticEnergy = 0.5 * this.moleculeRotationalInertia *
                                    Math.pow( this.moleculeRotationRates[ moleculeIndex ], 2 );
      return translationalKineticEnergy + rotationalKineticEnergy;
    },

    /**
     * Returns a value indicating how many more molecules can be added.
     * @returns {number}
     * @public
     */
    getNumberOfRemainingSlots: function() {
      return ( Math.floor( SOMConstants.MAX_NUM_ATOMS / this.atomsPerMolecule ) -
               ( this.numberOfAtoms / this.atomsPerMolecule ) );
    },

    /**
     * @returns {number}
     * @public
     */
    getAtomsPerMolecule: function() {
      return this.atomsPerMolecule;
    },

    /**
     * @returns {Array}
     * @public
     */
    getAtomPositions: function() {
      return this.atomPositions;
    },

    /**
     * @returns {number|}
     * @public
     */
    getNumberOfAtoms: function() {
      return this.numberOfAtoms;
    },

    /**
     * @returns {number}
     * @public
     */
    getnumberOfMolecules: function() {
      return this.numberOfMolecules;
    },

    /**
     * @returns {Array}
     * @public
     */
    getMoleculeCenterOfMassPositions: function() {
      return this.moleculeCenterOfMassPositions;
    },

    /**
     * @returns {Array}
     * @public
     */
    getMoleculeVelocities: function() {
      return this.moleculeVelocities;
    },

    /**
     * @returns {Array}
     * @public
     */
    getMoleculeForces: function() {
      return this.moleculeForces;
    },

    /**
     * @returns {Array}
     * @public
     */
    getNextMoleculeForces: function() {
      return this.nextMoleculeForces;
    },

    /**
     * @returns {Array}
     * @public
     */
    getMoleculeRotationAngles: function() {
      return this.moleculeRotationAngles;
    },

    /**
     * @param {[]}rotationAngles
     * @public
     */
    setMoleculeRotationAngles: function( rotationAngles ) {
      this.moleculeRotationAngles = rotationAngles;
    },

    /**
     * @returns {Array}
     * @public
     */
    getMoleculeRotationRates: function() {
      return this.moleculeRotationRates;
    },

    /**
     * @returns {Array}
     * @public
     */
    getMoleculeTorques: function() {
      return this.moleculeTorques;
    },

    /**
     * @returns {Array}
     * @public
     */
    getNextMoleculeTorques: function() {
      return this.nextMoleculeTorques;
    },

    /**
     * Add a new molecule to the model.  The molecule must have been created and initialized before being added.
     * @param {Array<Vector2>} atomPositions
     * @param {Vector2} moleculeCenterOfMassPosition
     * @param {Vector2} moleculeVelocity
     * @param {number} moleculeRotationRate
     * @param {boolean} insideContainer
     * @returns {boolean} true if able to add, false if not.
     * @public
     */
    addMolecule: function( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, moleculeRotationRate, insideContainer ) {

      // error checking
      assert && assert( this.getNumberOfRemainingSlots() > 0, 'no space left in molecule data set' );
      if ( this.getNumberOfRemainingSlots() === 0 ) {
        return false;
      }

      // Add the information for this molecule to the data set.
      for ( var i = 0; i < this.atomsPerMolecule; i++ ) {
        this.atomPositions[ i + this.numberOfAtoms ] = atomPositions[ i ].copy();
      }
      var numberOfMolecules = this.numberOfAtoms / this.atomsPerMolecule;
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
    },

    /**
     * Remove the molecule at the designated index.  This also removes all atoms and forces associated with the molecule
     * and shifts the various arrays to compensate.
     * <p/>
     * This is fairly compute intensive, and should be used sparingly.  This was originally created to support the
     * feature where the lid is returned and any molecules outside of the container disappear.
     * @param {number} moleculeIndex
     * @public
     */
    removeMolecule: function( moleculeIndex ) {

      assert && assert( moleculeIndex < this.numberOfAtoms / this.atomsPerMolecule, 'molecule index out of range' );

      var i;

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
        for ( var j = 0; j < this.atomsPerMolecule; j++ ) {
          this.atomPositions[ i + j ] = this.atomPositions[ i + this.atomsPerMolecule + j ];
        }
      }

      // Reduce the counts.
      this.numberOfAtoms -= this.atomsPerMolecule;
      this.numberOfMolecules--;
    },

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
    dump: function() {

      var i;
      var numMolecules = this.numberOfMolecules;

      console.log( 'moleculeCenterOfMassPositions:' );
      console.log( '[' );
      for ( i = 0; i < numMolecules; i++ ) {
        var comPos = this.moleculeCenterOfMassPositions[ i ];
        console.log( '{', 'x: ', comPos.x.toFixed( 3 ), ', y: ', comPos.y.toFixed( 3 ), '},' );
      }
      console.log( '],' );

      console.log( 'moleculeVelocities:' );
      console.log( '[' );
      for ( i = 0; i < numMolecules; i++ ) {
        var vel = this.moleculeVelocities[ i ];
        console.log( '{', 'x: ', vel.x.toFixed( 3 ), ', y: ', vel.y.toFixed( 3 ), '},' );
      }
      console.log( '],' );

      console.log( 'moleculeRotationAngles:' );
      console.log( '[' );
      for ( i = 0; i < numMolecules; i++ ) {
        var angle = this.moleculeRotationAngles[ i ];
        console.log( angle.toFixed( 3 ), ',' );
      }
      console.log( '],' );

      console.log( 'moleculeRotationRates:' );
      console.log( '[' );
      for ( i = 0; i < numMolecules; i++ ) {
        var rate = this.moleculeRotationRates[ i ];
        console.log( rate.toFixed( 3 ), ',' );
      }
      console.log( '],' );
    }

  } );
} );
