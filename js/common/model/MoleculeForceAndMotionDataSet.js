// Copyright 2002-2013, University of Colorado Boulder

/**
 * This class represents the bundle of data that represents the position,
 * motion, and forces acting upon a set of molecules.
 *
 * @author John Blanco
 * @author Aaron Davis
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/common/StatesOfMatterConstants' );
  var WaterMoleculeStructure = require( 'STATES_OF_MATTER/common/model/engine/WaterMoleculeStructure' );

  /**
   * This creates the data set with the capacity to hold the
   * maximum number of atoms/molecules, but does not create the individual
   * data for them.  That must be done explicitly through other calls.
   * @param {Number} atomsPerMolecule
   * @constructor
   */
  function MoleculeForceAndMotionDataSet( atomsPerMolecule ) {
    this.numberOfAtoms = 0;
    this.numberOfSafeMolecules = 0;

    this.atomsPerMolecule = atomsPerMolecule;

    this.atomPositions = [];
    this.moleculeCenterOfMassPositions = [];
    this.moleculeVelocities = [];
    this.moleculeForces = [];
    this.nextMoleculeForces = [];

    // Note that some of the following are not used in the monatomic case, but need to be here for compatibility.
    this.moleculeRotationAngles = [];
    this.moleculeRotationRates = [];
    this.moleculeTorques = [];
    this.nextMoleculeTorques = [];
    for ( var i = 0; i < StatesOfMatterConstants.MAX_NUM_ATOMS / this.atomsPerMolecule; i++ ) {
      this.moleculeRotationAngles [ i ] = 0;
      this.moleculeRotationRates[ i ] = 0;
      this.moleculeTorques[ i ] = 0;
      this.nextMoleculeTorques [ i ] = 0;
    }


    // Set default values.
    if ( atomsPerMolecule === 1 ) {
      this.moleculeMass = 1;
    }
    else if ( atomsPerMolecule === 2 ) {
      this.moleculeMass = 2; // Two molecules, assumed to be the same.
      this.moleculeRotationalInertia = Math.pow( StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE, 2 ) / 2;
    }
    else if ( atomsPerMolecule === 3 ) {
      // NOTE: These settings only work for water, since that is the
      // only supported triatomic molecule at the time of this writing
      // (Nov 2008).  If other 3-atom molecules are added, this will
      // need to be changed.
      this.moleculeMass = 1.5; // Two molecules, assumed to be the same.

      this.moleculeRotationalInertia = (new WaterMoleculeStructure()).getRotationalInertia();
    }
  }

  return inherit( Object, MoleculeForceAndMotionDataSet, {
    /**
     * @public
     * @returns {number}
     */
    getNumberOfMolecules: function() {
      return this.numberOfAtoms / this.atomsPerMolecule;
    },
    /**
     * @public
     * @returns {number|*}
     */
    getMoleculeRotationalInertia: function() {
      return this.moleculeRotationalInertia;
    },
    /**
     * @public
     * @returns {number}
     */
    getMoleculeMass: function() {
      return this.moleculeMass;
    },
    /**
     * Returns a value indicating how many more molecules can be added.
     * @public
     */
    getNumberOfRemainingSlots: function() {
      return ( ( StatesOfMatterConstants.MAX_NUM_ATOMS / this.atomsPerMolecule ) -
               ( this.numberOfAtoms / this.atomsPerMolecule ) );
    },

    /**
     * @public
     * @returns {Number|*}
     */
    getAtomsPerMolecule: function() {
      return this.atomsPerMolecule;
    },
    /**
     * @public
     * @returns {Array}
     */
    getAtomPositions: function() {
      return this.atomPositions;
    },
    /**
     * @public
     * @returns {Number|*}
     */
    getNumberOfAtoms: function() {
      return this.numberOfAtoms;
    },
    /**
     * @public
     * @returns {*}
     */
    getNumberOfSafeMolecules: function() {
      return this.numberOfSafeMolecules;
    },
    /**
     * @public
     * @returns {Array}
     */
    getMoleculeCenterOfMassPositions: function() {
      return this.moleculeCenterOfMassPositions;
    },
    /**
     * @public
     * @returns {IsokineticThermostat.moleculeVelocities|*}
     */
    getMoleculeVelocities: function() {
      return this.moleculeVelocities;
    },
    /**
     * @public
     * @returns {Array}
     */
    getMoleculeForces: function() {
      return this.moleculeForces;
    },
    /**
     * @public
     * @returns {Array}
     */
    getNextMoleculeForces: function() {
      return this.nextMoleculeForces;
    },
    /**
     * @public
     * @returns {*}
     */
    getMoleculeRotationAngles: function() {
      return this.moleculeRotationAngles;
    },
    /**
     * @public
     * @param rotationAngles
     */
    setMoleculeRotationAngles: function( rotationAngles ) {
      this.moleculeRotationAngles = rotationAngles;
    },
    /**
     * @public
     * @returns {IsokineticThermostat.moleculeRotationRates|*}
     */
    getMoleculeRotationRates: function() {
      return this.moleculeRotationRates;
    },
    /**
     * @public
     * @returns {Array}
     */
    getMoleculeTorques: function() {
      return this.moleculeTorques;
    },
    /**
     * @public
     * @returns {Array}
     */
    getNextMoleculeTorques: function() {
      return this.nextMoleculeTorques;
    },
    /**
     * @public
     * @param numSafeMolecules
     */
    setNumberOfSafeMolecules: function( numSafeMolecules ) {
      this.numberOfSafeMolecules = numSafeMolecules;
    },

    /**
     * Calculate the temperature of the system based on the total kinetic
     * energy of the molecules.
     * @public
     * @return {Number} temperature in model units (as opposed to Kelvin, Celsius, or whatever)
     */
    calculateTemperatureFromKineticEnergy: function() {
      var translationalKineticEnergy = 0;
      var rotationalKineticEnergy = 0;
      var numberOfMolecules = this.numberOfAtoms / this.atomsPerMolecule;
      var kineticEnergyPerMolecule;
      var i;

      if ( this.atomsPerMolecule === 1 ) {
        for ( i = 0; i < this.numberOfAtoms; i++ ) {
          translationalKineticEnergy += ( ( this.moleculeVelocities[ i ].x * this.moleculeVelocities[ i ].x ) +
                                          ( this.moleculeVelocities[ i ].y * this.moleculeVelocities[ i ].y ) ) / 2;
        }
        kineticEnergyPerMolecule = translationalKineticEnergy / this.numberOfAtoms;
      }
      else {
        for ( i = 0; i < this.numberOfAtoms / this.atomsPerMolecule; i++ ) {
          translationalKineticEnergy += 0.5 * this.moleculeMass *
                                        ( Math.pow( this.moleculeVelocities[ i ].x, 2 ) +
                                          Math.pow( this.moleculeVelocities[ i ].y, 2 ) );
          rotationalKineticEnergy += 0.5 * this.moleculeRotationalInertia *
                                     Math.pow( this.moleculeRotationRates[ i ], 2 );
        }
        kineticEnergyPerMolecule = ( translationalKineticEnergy + rotationalKineticEnergy ) / numberOfMolecules / 1.5;
      }

      return kineticEnergyPerMolecule;
    },

    /**
     * Add a new molecule to the model.  The molecule must have been created
     * and initialized before being added.  It is considered to be "unsafe",
     * meaning that it can't interact with other molecules, until an external
     * entity (generally the motion-and-force calculator) changes that
     * designation.
     * @public
     * @param {Array<Vector2>} atomPositions
     * @param {Vector2} moleculeCenterOfMassPosition
     * @param {Vector2} moleculeVelocity
     * @param {Number} moleculeRotationRate
     * @return {Boolean} true if able to add, false if not.
     */
    addMolecule: function( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, moleculeRotationRate ) {

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

      // Allocate memory for the information that is not specified.
      this.moleculeForces[ numberOfMolecules ] = new Vector2();
      this.nextMoleculeForces[ numberOfMolecules ] = new Vector2();

      // Increment the number of atoms.  Note that we DON'T increment the number of safe atoms - that must
      // be done by some outside entity.
      this.numberOfAtoms += this.atomsPerMolecule;

      assert && assert( !isNaN( this.moleculeCenterOfMassPositions[ numberOfMolecules ].x ) );

      return true;
    },

    /**
     * Remove the molecule at the designated index.  This also removes all
     * atoms and forces associated with the molecule and shifts the various
     * arrays to compensate.
     * <p/>
     * This is fairly compute intensive, and should be used sparingly.  This
     * was originally created to support the feature where the lid is returned
     * and any molecules outside of the container disappear.
     *
     * @param {Number} moleculeIndex
     */
    removeMolecule: function( moleculeIndex ) {
      // assert moleculeIndex < this.numberOfAtoms / this.atomsPerMolecule;
      if ( moleculeIndex >= this.numberOfAtoms / this.atomsPerMolecule ) {
        // Ignore this out-of-range request.
        return;
      }
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

      // Reduce the atom count.
      this.numberOfAtoms -= this.atomsPerMolecule;
    }

  } );
} );
