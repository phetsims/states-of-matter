// Copyright 2002-2012, University of Colorado
/**
 * This class represents the bundle of data that represents the position,
 * motion, and forces acting upon a set of molecules.  IN CASE YOU'RE
 * WONDERING why there isn't an array of individual objects where each of
 * them have all of these fields, the answer is that this approach is much
 * more efficient in terms of processor usage, since these arrays are accessed
 * a lot.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'java.awt.geom.Vector2' );
  var Vector2 = require( 'DOT/Vector2' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterConstants' );
  var WaterMoleculeStructure = require( 'STATES_OF_MATTER/states-of-matter/model/engine/WaterMoleculeStructure' );

  /**
   * Constructor - This creates the data set with the capacity to hold the
   * maximum number of atoms/molecules, but does not create the individual
   * data for them.  That must be done explicitly through other calls.
   */
  function MoleculeForceAndMotionDataSet( atomsPerMolecule ) {
    // Attributes that describe the data set as a whole.

    //private
    this.m_numberOfAtoms;

    //private
    this.m_numberOfSafeMolecules;
    // Attributes that apply to all elements of the data set.

    //private
    this.m_atomsPerMolecule;

    //private
    this.m_moleculeMass;

    //private
    this.m_moleculeRotationalInertia;
    // Attributes of the individual molecules and the atoms that comprise them.

    //private
    this.m_atomPositions;

    //private
    this.m_moleculeCenterOfMassPositions;

    //private
    this.m_moleculeVelocities;

    //private
    this.m_moleculeForces;

    //private
    this.m_nextMoleculeForces;

    //private
    this.m_moleculeRotationAngles;

    //private
    this.m_moleculeRotationRates;

    //private
    this.m_moleculeTorques;

    //private
    this.m_nextMoleculeTorques;
    m_atomsPerMolecule = atomsPerMolecule;
    m_atomPositions = new Vector2[StatesOfMatterConstants.MAX_NUM_ATOMS];
    m_moleculeCenterOfMassPositions = new Vector2[StatesOfMatterConstants.MAX_NUM_ATOMS / m_atomsPerMolecule];
    m_moleculeVelocities = new Vector2[StatesOfMatterConstants.MAX_NUM_ATOMS / m_atomsPerMolecule];
    m_moleculeForces = new Vector2[StatesOfMatterConstants.MAX_NUM_ATOMS / m_atomsPerMolecule];
    m_nextMoleculeForces = new Vector2[StatesOfMatterConstants.MAX_NUM_ATOMS / m_atomsPerMolecule];
    // but need to be here for compatibility.
    m_moleculeRotationAngles = new double[StatesOfMatterConstants.MAX_NUM_ATOMS / m_atomsPerMolecule];
    m_moleculeRotationRates = new double[StatesOfMatterConstants.MAX_NUM_ATOMS / m_atomsPerMolecule];
    m_moleculeTorques = new double[StatesOfMatterConstants.MAX_NUM_ATOMS / m_atomsPerMolecule];
    m_nextMoleculeTorques = new double[StatesOfMatterConstants.MAX_NUM_ATOMS / m_atomsPerMolecule];
    // Set default values.
    if ( atomsPerMolecule == 1 ) {
      m_moleculeMass = 1;
    }
    else if ( atomsPerMolecule == 2 ) {
      // Two molecules, assumed to be the same.
      m_moleculeMass = 2;
      m_moleculeRotationalInertia = Math.pow( StatesOfMatterConstants.DIATOMIC_PARTICLE_DISTANCE, 2 ) / 2;
    }
    else if ( atomsPerMolecule == 3 ) {
      // Two molecules, assumed to be the same.
      m_moleculeMass = 1.5;
      m_moleculeRotationalInertia = WaterMoleculeStructure.getInstance().getRotationalInertia();
    }
  }

  return inherit( Object, MoleculeForceAndMotionDataSet, {
//----------------------------------------------------------------------------
// Getters and Setters
//----------------------------------------------------------------------------
    getAtomsPerMolecule: function() {
      return m_atomsPerMolecule;
    },
    getAtomPositions: function() {
      return m_atomPositions;
    },
    setAtomPositions: function( positions ) {
      m_atomPositions = positions;
    },
    getNumberOfAtoms: function() {
      return m_numberOfAtoms;
    },
    getNumberOfMolecules: function() {
      return m_numberOfAtoms / m_atomsPerMolecule;
    },
    getNumberOfSafeMolecules: function() {
      return m_numberOfSafeMolecules;
    },
    setNumberOfSafeMolecules: function( numSafeMolecules ) {
      m_numberOfSafeMolecules = numSafeMolecules;
    },
    getMoleculeCenterOfMassPositions: function() {
      return m_moleculeCenterOfMassPositions;
    },
    setMoleculeCenterOfMassPositions: function( centerOfMassPositions ) {
      m_moleculeCenterOfMassPositions = centerOfMassPositions;
    },
    getMoleculeVelocities: function() {
      return m_moleculeVelocities;
    },
    setMoleculeVelocities: function( velocities ) {
      m_moleculeVelocities = velocities;
    },
    getMoleculeForces: function() {
      return m_moleculeForces;
    },
    setMoleculeForces: function( forces ) {
      m_moleculeForces = forces;
    },
    getNextMoleculeForces: function() {
      return m_nextMoleculeForces;
    },
    setNextMoleculeForces: function( moleculeForces ) {
      m_nextMoleculeForces = moleculeForces;
    },
    getMoleculeRotationAngles: function() {
      return m_moleculeRotationAngles;
    },
    setMoleculeRotationAngles: function( rotationAngles ) {
      m_moleculeRotationAngles = rotationAngles;
    },
    getMoleculeRotationRates: function() {
      return m_moleculeRotationRates;
    },
    setMoleculeRotationRates: function( rotationRates ) {
      m_moleculeRotationRates = rotationRates;
    },
    getMoleculeTorques: function() {
      return m_moleculeTorques;
    },
    setMoleculeTorques: function( torques ) {
      m_moleculeTorques = torques;
    },
    getNextMoleculeTorques: function() {
      return m_nextMoleculeTorques;
    },
    setNextMoleculeTorques: function( moleculeTorques ) {
      m_nextMoleculeTorques = moleculeTorques;
    },
    getMoleculeMass: function() {
      return m_moleculeMass;
    },
    setMoleculeMass: function( mass ) {
      m_moleculeMass = mass;
    },
    getMoleculeRotationalInertia: function() {
      return m_moleculeRotationalInertia;
    },
    setMoleculeRotationalInertia: function( rotationalInertia ) {
      m_moleculeRotationalInertia = rotationalInertia;
    },
//----------------------------------------------------------------------------
// Other public methods
//----------------------------------------------------------------------------
    /**
     * Returns a value indicating how many more molecules can be added.
     */
    getNumberOfRemainingSlots: function() {
      return ((StatesOfMatterConstants.MAX_NUM_ATOMS / m_atomsPerMolecule) - (m_numberOfAtoms / m_atomsPerMolecule));
    },
    /**
     * Calculate the temperature of the system based on the total kinetic
     * energy of the molecules.
     *
     * @return - temperature in model units (as opposed to Kelvin, Celsius, or whatever)
     */
    calculateTemperatureFromKineticEnergy: function() {
      var translationalKineticEnergy = 0;
      var rotationalKineticEnergy = 0;
      var numberOfMolecules = m_numberOfAtoms / m_atomsPerMolecule;
      var kineticEnergyPerMolecule;
      if ( m_atomsPerMolecule == 1 ) {
        for ( var i = 0; i < m_numberOfAtoms; i++ ) {
          translationalKineticEnergy += ((m_moleculeVelocities[i].getX() * m_moleculeVelocities[i].getX()) + (m_moleculeVelocities[i].getY() * m_moleculeVelocities[i].getY())) / 2;
        }
        kineticEnergyPerMolecule = translationalKineticEnergy / m_numberOfAtoms;
      }
      else {
        for ( var i = 0; i < m_numberOfAtoms / m_atomsPerMolecule; i++ ) {
          translationalKineticEnergy += 0.5 * m_moleculeMass * (Math.pow( m_moleculeVelocities[i].getX(), 2 ) + Math.pow( m_moleculeVelocities[i].getY(), 2 ));
          rotationalKineticEnergy += 0.5 * m_moleculeRotationalInertia * Math.pow( m_moleculeRotationRates[i], 2 );
        }
        kineticEnergyPerMolecule = (translationalKineticEnergy + rotationalKineticEnergy) / numberOfMolecules / 1.5;
      }
      return kineticEnergyPerMolecule;
    },
    /**
     * Add a new molecule to the model.  The molecule must have been created
     * and initialized before being added.  It is considered to be "unsafe",
     * meaning that it can't interact with other molecules, until an external
     * entity (generally the motion-and-force calculator) changes that
     * designation.
     *
     * @return - true if able to add, false if not.
     */
    addMolecule: function( atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, moleculeRotationRate ) {
      if ( getNumberOfRemainingSlots() == 0 ) {
        return false;
      }
      // Add the information for this molecule to the data set.
      System.arraycopy( atomPositions, 0, m_atomPositions, 0 + m_numberOfAtoms, m_atomsPerMolecule );
      var numberOfMolecules = m_numberOfAtoms / m_atomsPerMolecule;
      m_moleculeCenterOfMassPositions[numberOfMolecules] = moleculeCenterOfMassPosition;
      m_moleculeVelocities[numberOfMolecules] = moleculeVelocity;
      m_moleculeRotationRates[numberOfMolecules] = moleculeRotationRate;
      // Allocate memory for the information that is not specified.
      m_moleculeForces[numberOfMolecules] = new Vector2();
      m_nextMoleculeForces[numberOfMolecules] = new Vector2();
      // be done by some outside entity.
      m_numberOfAtoms += m_atomsPerMolecule;
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
     * @param moleculeIndex
     */
    removeMolecule: function( moleculeIndex ) {
      //        assert moleculeIndex < m_numberOfAtoms / m_atomsPerMolecule;
      if ( moleculeIndex >= m_numberOfAtoms / m_atomsPerMolecule ) {
        // Ignore this out-of-range request.
        return;
      }
      // Handle all data arrays that are maintained on a per-molecule basis.
      for ( var i = moleculeIndex; i < m_numberOfAtoms / m_atomsPerMolecule - 1; i++ ) {
        // Shift the data in each array forward one slot.
        m_moleculeCenterOfMassPositions[i] = m_moleculeCenterOfMassPositions[i + 1];
        m_moleculeVelocities[i] = m_moleculeVelocities[i + 1];
        m_moleculeForces[i] = m_moleculeForces[i + 1];
        m_nextMoleculeForces[i] = m_nextMoleculeForces[i + 1];
        m_moleculeRotationAngles[i] = m_moleculeRotationAngles[i + 1];
        m_moleculeRotationRates[i] = m_moleculeRotationRates[i + 1];
        m_moleculeTorques[i] = m_moleculeTorques[i + 1];
        m_nextMoleculeTorques[i] = m_nextMoleculeTorques[i + 1];
      }
      // Handle all data arrays that are maintained on a per-atom basis.
      for ( var i = moleculeIndex * m_atomsPerMolecule; i < m_numberOfAtoms - m_atomsPerMolecule; i += m_atomsPerMolecule ) {
        System.arraycopy( m_atomPositions, i + m_atomsPerMolecule + 0, m_atomPositions, i + 0, m_atomsPerMolecule );
      }
      // Reduce the atom count.
      m_numberOfAtoms -= m_atomsPerMolecule;
    }
  } );
} );

