// Copyright 2002-2014, University of Colorado Boulder
/**
 * This is the model for two atoms interacting with a Lennard-Jones
 * interaction potential.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'java.awt.geom.Vector2' );
  var ArrayList = require( 'java.util.ArrayList' );
  var Random = require( 'java.util.Random' );
  var ClockAdapter = require( 'edu.colorado.phet.common.phetcommon.model.clock.ClockAdapter' );
  var ClockEvent = require( 'edu.colorado.phet.common.phetcommon.model.clock.ClockEvent' );
  var ConstantDtClock = require( 'edu.colorado.phet.common.phetcommon.model.clock.ConstantDtClock' );
  var StatesOfMatterConstants = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterConstants' );
  var AtomicInteractionDefaults = require( 'STATES_OF_MATTER/states-of-matter/defaults/AtomicInteractionDefaults' );
  var ConfigurableStatesOfMatterAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/ConfigurableStatesOfMatterAtom' );
  var StatesOfMatterAtom = require( 'STATES_OF_MATTER/states-of-matter/model/particle/StatesOfMatterAtom' );

//----------------------------------------------------------------------------
// Class Data
//----------------------------------------------------------------------------
  var BONDING_STATE_UNBONDED = 0;
  var BONDING_STATE_BONDING = 1;
  var BONDING_STATE_BONDED = 2;

  //private
  var DEFAULT_ATOM_TYPE = AtomType.NEON;

  //private
  var CALCULATIONS_PER_TICK = 8;
// Used to distinguish small oscillations from real movement. 

  //private
  var THRESHOLD_VELOCITY = 100;
// In milliseconds. 

  //private
  var VIBRATION_DURATION = 1200;

  //private
  var VIBRATION_COUNTER_RESET_VALUE = VIBRATION_DURATION / AtomicInteractionDefaults.CLOCK_FRAME_DELAY;
// Proportion of atom radius.

  //private
  var BONDED_OSCILLATION_PROPORTION = 0.06;
  /**
   * This is a highly specialized function that is used for figuring out
   * the inter-atom distance at which the value of the potential on the left
   * side of the of the min of the LJ potential curve is equal to that at the
   * given distance to the right of the min of the LJ potential curve.
   *
   * @param distance - inter-atom distance, must be greater than the point at
   * which the potential is at the minimum value.
   * @return
   */

  //private
  var MAX_APPROXIMATION_ITERATIONS = 100;

  // static interface: Listener
  var Listener =
    define( function( require ) {

      return inherit( Object, Listener, {
        /**
         * Inform listeners that the model has been reset.
         */
        fixedAtomAdded: function( atom ) {},
        movableAtomAdded: function( atom ) {},
        fixedAtomRemoved: function( atom ) {},
        movableAtomRemoved: function( atom ) {},
        interactionPotentialChanged: function() {},
        fixedAtomDiameterChanged: function() {},
        movableAtomDiameterChanged: function() {}
      } );
    } );
  ;
  // static class: Adapter
  var Adapter =
    define( function( require ) {

      return inherit( Object, Adapter, {
        fixedAtomAdded: function( atom ) {
        },
        movableAtomAdded: function( atom ) {
        },
        fixedAtomRemoved: function( atom ) {
        },
        movableAtomRemoved: function( atom ) {
        },
        interactionPotentialChanged: function() {
        },
        fixedAtomDiameterChanged: function() {
        },
        movableAtomDiameterChanged: function() {
        }
      } );
    } );
  ;
  function DualAtomModel( clock ) {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------

    //private
    this.m_listeners = [];

    //private
    this.m_fixedAtom;

    //private
    this.m_movableAtom;

    //private
    this.m_shadowMovableAtom;

    //private
    this.m_attractiveForce;

    //private
    this.m_repulsiveForce;

    //private
    this.m_motionPaused;

    //private
    this.m_ljPotentialCalculator;

    //private
    this.m_timeStep;

    //private
    this.m_movableAtomListener;
    // Flag used to prevent getting in disallowed state.

    //private
    this.m_settingBothAtomTypes = false;
    // Tracks whether the atoms have formed a chemical bond.

    //private
    this.m_bondingState = BONDING_STATE_UNBONDED;
    // Used to vibrate fixed atom during bonding.

    //private
    this.m_vibrationCounter = 0;
    // Used to set magnitude of vibration.

    //private
    this.m_potentialWhenAtomReleased = 0;

    //private
    this.m_rand = new Random();

    //private
    this.m_bondedOscillationRightDistance;

    //private
    this.m_bondedOscillationLeftDistance;

    //private
    this.m_minPotentialDistance;

    //private
    this.m_clock;
    m_clock = clock;
    m_motionPaused = false;
    m_ljPotentialCalculator = new LjPotentialCalculator( StatesOfMatterConstants.MIN_SIGMA, // Initial values arbitrary, will be set during reset.
      StatesOfMatterConstants.MIN_EPSILON );
    updateTimeStep();
    // Register as a clock listener.
    clock.addClockListener( new ClockAdapter().withAnonymousClassBody( {
      clockTicked: function( clockEvent ) {
        handleClockTicked( clockEvent );
      },
      simulationTimeReset: function( clockEvent ) {
        reset();
      }
    } ) );
    // directly by the user.
    m_movableAtomListener = new StatesOfMatterAtom.Adapter().withAnonymousClassBody( {
      positionChanged: function() {
        if ( m_motionPaused ) {
          // Update the forces correspondingly.
          try {
            m_shadowMovableAtom = m_movableAtom.clone();
          }
          catch( /*CloneNotSupportedException*/ e ) {
            e.printStackTrace();
            return;
          }
          updateForces();
        }
      }
    } );
    // Put the model into its initial state.
    reset();
  }

  return inherit( Object, DualAtomModel, {
//----------------------------------------------------------------------------
// Accessor Methods
//----------------------------------------------------------------------------
      getFixedAtomRef: function() {
        return m_fixedAtom;
      },
      getMovableAtomRef: function() {
        return m_movableAtom;
      },
      getAttractiveForce: function() {
        return m_attractiveForce;
      },
      getRepulsiveForce: function() {
        return m_repulsiveForce;
      },
      getFixedAtomType: function() {
        return m_fixedAtom.getType();
      },
      getMovableAtomType: function() {
        return m_movableAtom.getType();
      },
      setFixedAtomType: function( atomType ) {
        if ( m_fixedAtom == null || m_fixedAtom.getType() != atomType ) {
          if ( !m_settingBothAtomTypes && ((atomType == AtomType.ADJUSTABLE && m_movableAtom.getType() != AtomType.ADJUSTABLE) || (atomType != AtomType.ADJUSTABLE && m_movableAtom.getType() == AtomType.ADJUSTABLE)) ) {
            System.err.println( this.getClass().getName() + " - Error: Cannot set just one atom to be adjustable, ignoring request." );
            return;
          }
          ensureValidAtomType( atomType );
          m_bondingState = BONDING_STATE_UNBONDED;
          // Inform any listeners of the removal of existing atoms.
          if ( m_fixedAtom != null ) {
            notifyFixedAtomRemoved( m_fixedAtom );
            m_fixedAtom = null;
          }
          m_fixedAtom = AtomFactory.createAtom( atomType );
          // Set the value for sigma used in the LJ potential calculations.
          if ( m_movableAtom != null ) {
            m_ljPotentialCalculator.setSigma( SigmaTable.getSigma( getFixedAtomType(), getMovableAtomType() ) );
          }
          // If both atoms exist, set the value of epsilon.
          if ( m_movableAtom != null ) {
            m_ljPotentialCalculator.setEpsilon( InteractionStrengthTable.getInteractionPotential( m_fixedAtom.getType(), m_movableAtom.getType() ) );
          }
          notifyFixedAtomAdded( m_fixedAtom );
          notifyInteractionPotentialChanged();
          notifyFixedAtomDiameterChanged();
          m_fixedAtom.setPosition( 0, 0 );
          resetMovableAtomPos();
        }
      },
      setMovableAtomType: function( atomType ) {
        if ( m_movableAtom == null || m_movableAtom.getType() != atomType ) {
          if ( !m_settingBothAtomTypes && ((atomType == AtomType.ADJUSTABLE && m_movableAtom.getType() != AtomType.ADJUSTABLE) || (atomType != AtomType.ADJUSTABLE && m_movableAtom.getType() == AtomType.ADJUSTABLE)) ) {
            System.err.println( this.getClass().getName() + " - Error: Cannot set just one atom to be adjustable, ignoring request." );
            return;
          }
          ensureValidAtomType( atomType );
          m_bondingState = BONDING_STATE_UNBONDED;
          if ( m_movableAtom != null ) {
            notifyMovableAtomRemoved( m_movableAtom );
            m_movableAtom.removeListener( m_movableAtomListener );
            m_movableAtom = null;
          }
          m_movableAtom = AtomFactory.createAtom( atomType );
          // tell when the user is moving it.
          m_movableAtom.addListener( m_movableAtomListener );
          // Set the value for sigma used in the LJ potential calculations.
          if ( m_movableAtom != null ) {
            m_ljPotentialCalculator.setSigma( SigmaTable.getSigma( getFixedAtomType(), getMovableAtomType() ) );
          }
          // If both atoms exist, set the value of epsilon.
          if ( m_fixedAtom != null ) {
            m_ljPotentialCalculator.setEpsilon( InteractionStrengthTable.getInteractionPotential( m_fixedAtom.getType(), m_movableAtom.getType() ) );
          }
          notifyMovableAtomAdded( m_movableAtom );
          notifyInteractionPotentialChanged();
          notifyMovableAtomDiameterChanged();
          resetMovableAtomPos();
        }
      },

      //private
      ensureValidAtomType: function( atomType ) {
        // Verify that this is a supported value.
        if ( (atomType != AtomType.NEON) && (atomType != AtomType.ARGON) && (atomType != AtomType.OXYGEN) && (atomType != AtomType.ADJUSTABLE) ) {
          System.err.println( "Error: Unsupported atom type." );
          assert && assert( false );
        }
      },
      setBothAtomTypes: function( atomType ) {
        if ( m_fixedAtom == null || m_movableAtom == null || m_fixedAtom.getType() != atomType || m_movableAtom.getType() != atomType ) {
          m_settingBothAtomTypes = true;
          setFixedAtomType( atomType );
          setMovableAtomType( atomType );
          m_settingBothAtomTypes = false;
        }
      },
      /**
       * Set the sigma value, a.k.a. the Atomic Diameter Parameter, for the
       * adjustable atom.  This is one of the two parameters that are used
       * for calculating the Lennard-Jones potential.  If an attempt is made to
       * set this value when the adjustable atom is not selected, it is ignored.
       *
       * @param sigma - distance parameter
       */
      setAdjustableAtomSigma: function( sigma ) {
        if ( (m_fixedAtom.getType() == AtomType.ADJUSTABLE) && (m_movableAtom.getType() == AtomType.ADJUSTABLE) && (sigma != m_ljPotentialCalculator.getSigma()) ) {
          if ( sigma > StatesOfMatterConstants.MAX_SIGMA ) {
            sigma = StatesOfMatterConstants.MAX_SIGMA;
          }
          else if ( sigma < StatesOfMatterConstants.MIN_SIGMA ) {
            sigma = StatesOfMatterConstants.MIN_SIGMA;
          }
          m_ljPotentialCalculator.setSigma( sigma );
          notifyInteractionPotentialChanged();
          m_movableAtom.setPosition( m_ljPotentialCalculator.calculateMinimumForceDistance(), 0 );
          (m_fixedAtom).setRadius( sigma / 2 );
          notifyFixedAtomDiameterChanged();
          (m_movableAtom).setRadius( sigma / 2 );
          notifyMovableAtomDiameterChanged();
        }
      },
      /**
       * Get the value of the sigma parameter that is being used for the motion
       * calculations.  If the atoms are the same, it will be the diameter
       * of one atom.  If they are not, it will be a function of the
       * diameters.
       *
       * @return
       */
      getSigma: function() {
        return m_ljPotentialCalculator.getSigma();
      },
      /**
       * Set the epsilon value, a.k.a. the Interaction Strength Parameter, which
       * is one of the two parameters that describes the Lennard-Jones potential.
       *
       * @param epsilon - interaction strength parameter
       */
      setEpsilon: function( epsilon ) {
        if ( epsilon < StatesOfMatterConstants.MIN_EPSILON ) {
          epsilon = StatesOfMatterConstants.MIN_EPSILON;
        }
        else if ( epsilon > StatesOfMatterConstants.MAX_EPSILON ) {
          epsilon = StatesOfMatterConstants.MAX_EPSILON;
        }
        if ( (m_fixedAtom.getType() == AtomType.ADJUSTABLE) && (m_movableAtom.getType() == AtomType.ADJUSTABLE) ) {
          m_ljPotentialCalculator.setEpsilon( epsilon );
          notifyInteractionPotentialChanged();
        }
      },
      /**
       * Get the epsilon value, a.k.a. the Interaction Strength Parameter, which
       * is one of the two parameters that describes the Lennard-Jones potential.
       *
       * @return
       */
      getEpsilon: function() {
        return m_ljPotentialCalculator.getEpsilon();
      },
      getBondingState: function() {
        return m_bondingState;
      },
//----------------------------------------------------------------------------
// Other Public Methods
//----------------------------------------------------------------------------
      /**
       * Reset the model.
       */
      reset: function() {
        if ( m_fixedAtom == null || m_fixedAtom.getType() != DEFAULT_ATOM_TYPE || m_movableAtom == null || m_movableAtom.getType() != DEFAULT_ATOM_TYPE ) {
          setBothAtomTypes( DEFAULT_ATOM_TYPE );
        }
        else {
          resetMovableAtomPos();
        }
        // Make sure we are not paused.
        m_motionPaused = false;
      },
      /**
       * Put the movable atom back to the location where the force is
       * minimized, and reset the velocity and acceleration to 0.
       */
      resetMovableAtomPos: function() {
        if ( m_movableAtom != null ) {
          m_movableAtom.setPosition( m_ljPotentialCalculator.calculateMinimumForceDistance(), 0 );
          m_movableAtom.setVx( 0 );
          m_movableAtom.setAx( 0 );
        }
      },
      addListener: function( listener ) {
        if ( m_listeners.contains( listener ) ) {
          // Don't bother re-adding.
          return;
        }
        m_listeners.add( listener );
      },
      removeListener: function( listener ) {
        return m_listeners.remove( listener );
      },
      setMotionPaused: function( paused ) {
        m_motionPaused = paused;
        m_movableAtom.setVx( 0 );
        if ( !paused ) {
          // enough for our purposes.
          m_potentialWhenAtomReleased = m_ljPotentialCalculator.calculatePotentialEnergy( m_movableAtom.getPositionReference().distance( m_fixedAtom.getPositionReference() ) );
        }
      },
      getMotionPaused: function() {
        return m_motionPaused;
      },
      /**
       * Release the bond that exists between the two atoms (if there is one).
       */
      releaseBond: function() {
        if ( m_bondingState == BONDING_STATE_BONDING ) {
          // is involved in the bonding process.
          m_vibrationCounter = 0;
        }
        m_bondingState = BONDING_STATE_UNBONDED;
      },
//----------------------------------------------------------------------------
// Private Methods
//----------------------------------------------------------------------------

      //private
      handleClockTicked: function( clockEvent ) {
        try {
          m_shadowMovableAtom = m_movableAtom.clone();
        }
        catch( /*CloneNotSupportedException*/ e ) {
          e.printStackTrace();
          return;
        }
        updateTimeStep();
        // Update the forces and motion of the atoms.
        for ( var i = 0; i < CALCULATIONS_PER_TICK; i++ ) {
          // Execute the force calculation.
          updateForces();
          // Update the motion information (unless the atoms are bonded).
          if ( m_bondingState != BONDING_STATE_BONDED ) {
            updateAtomMotion();
          }
        }
        // Update the atom that is visible to the view.
        syncMovableAtomWithDummy();
        // Handle inter-atom bonding.
        if ( m_movableAtom.getType() == AtomType.OXYGEN && m_fixedAtom.getType() == AtomType.OXYGEN ) {
          switch( m_bondingState ) {
            case BONDING_STATE_UNBONDED:
              if ( (m_movableAtom.getVx() > THRESHOLD_VELOCITY) && (m_movableAtom.getPositionReference().distance( m_fixedAtom.getPositionReference() ) < m_fixedAtom.getRadius() * 2.5) ) {
                // consider the bond to start forming.
                m_bondingState = BONDING_STATE_BONDING;
                startFixedAtomVibration();
              }
              break;
            case BONDING_STATE_BONDING:
              if ( m_attractiveForce > m_repulsiveForce ) {
                // to pass the bottom of the well.
                m_movableAtom.setAx( 0 );
                m_movableAtom.setVx( 0 );
                m_minPotentialDistance = m_ljPotentialCalculator.calculateMinimumForceDistance();
                m_bondedOscillationRightDistance = m_minPotentialDistance + BONDED_OSCILLATION_PROPORTION * m_movableAtom.getRadius();
                m_bondedOscillationLeftDistance = approximateEquivalentPotentialDistance( m_bondedOscillationRightDistance );
                m_bondingState = BONDING_STATE_BONDED;
                stepFixedAtomVibration();
              }
              break;
            case BONDING_STATE_BONDED:
              // for a while, then damps out, then starts up again.
              m_movableAtom.setAx( 0 );
              m_movableAtom.setVx( 0 );
              if ( m_movableAtom.getPositionReference().getX() > m_minPotentialDistance ) {
                m_movableAtom.setPosition( m_bondedOscillationLeftDistance, 0 );
              }
              else {
                m_movableAtom.setPosition( m_bondedOscillationRightDistance, 0 );
              }
              if ( isFixedAtomVibrating() ) {
                stepFixedAtomVibration();
              }
              break;
            default:
              System.err.println( this.getClass().getName() + " - Error: Unrecognized bonding state." );
              assert && assert( false );
              m_bondingState = BONDING_STATE_UNBONDED;
              break;
          }
        }
      },

      //private
      updateTimeStep: function() {
        m_timeStep = m_clock.getDt() / 1000 / CALCULATIONS_PER_TICK;
      },
      /**
       *
       */

      //private
      syncMovableAtomWithDummy: function() {
        m_movableAtom.setAx( m_shadowMovableAtom.getAx() );
        m_movableAtom.setVx( m_shadowMovableAtom.getVx() );
        m_movableAtom.setPosition( m_shadowMovableAtom.getX(), m_shadowMovableAtom.getY() );
      },

      //private
      updateForces: function() {
        var distance = m_shadowMovableAtom.getPositionReference().distance( new Vector2( 0, 0 ) );
        if ( distance < (m_fixedAtom.getRadius() + m_movableAtom.getRadius()) / 8 ) {
          // will cause unusable levels of speed later, so we limit it.
          distance = (m_fixedAtom.getRadius() + m_movableAtom.getRadius()) / 8;
        }
        // Calculate the force.  The result should be in newtons.
        m_attractiveForce = m_ljPotentialCalculator.calculateAttractiveLjForce( distance );
        m_repulsiveForce = m_ljPotentialCalculator.calculateRepulsiveLjForce( distance );
      },
      /**
       * Update the position, velocity, and acceleration of the dummy movable atom.
       */

      //private
      updateAtomMotion: function() {
        // Convert mass to kilograms.
        var mass = m_shadowMovableAtom.getMass() * 1.6605402E-27;
        var acceleration = (m_repulsiveForce - m_attractiveForce) / mass;
        // can be shown appropriately if the user moves the atoms.
        m_shadowMovableAtom.setAx( acceleration );
        if ( !m_motionPaused ) {
          // Update the position and velocity of the atom.
          m_shadowMovableAtom.setVx( m_shadowMovableAtom.getVx() + (acceleration * m_timeStep) );
          var xPos = m_shadowMovableAtom.getPositionReference().getX() + (m_shadowMovableAtom.getVx() * m_timeStep);
          m_shadowMovableAtom.setPosition( xPos, 0 );
        }
      },

      //private
      startFixedAtomVibration: function() {
        m_vibrationCounter = VIBRATION_COUNTER_RESET_VALUE;
      },

      //private
      stepFixedAtomVibration: function() {
        if ( m_vibrationCounter > 0 ) {
          var vibrationScaleFactor = 1;
          if ( m_vibrationCounter < VIBRATION_COUNTER_RESET_VALUE / 4 ) {
            // In the last part of the vibration, starting to wind it down.
            vibrationScaleFactor = m_vibrationCounter / (VIBRATION_COUNTER_RESET_VALUE / 4);
          }
          if ( m_fixedAtom.getPositionReference().getX() != 0 ) {
            // Go back to the original position every other time.
            m_fixedAtom.setPosition( 0, 0 );
          }
          else {
            // determined to look good on the screen.
            var xPos = (m_rand.nextDouble() * 2 - 1) * m_potentialWhenAtomReleased * 5e21 * vibrationScaleFactor;
            var yPos = (m_rand.nextDouble() * 2 - 1) * m_potentialWhenAtomReleased * 5e21 * vibrationScaleFactor;
            m_fixedAtom.setPosition( xPos, yPos );
          }
          // Decrement the vibration counter.
          m_vibrationCounter--;
        }
        else if ( m_fixedAtom.getPositionReference().getX() != 0 || m_fixedAtom.getPositionReference().getY() != 0 ) {
          m_fixedAtom.setPosition( 0, 0 );
        }
      },

      //private
      approximateEquivalentPotentialDistance: function( distance ) {
        if ( distance < m_ljPotentialCalculator.calculateMinimumForceDistance() ) {
          System.err.println( this.getClass().getName() + "- Error: Distance value out of range." );
          return 0;
        }
        // Iterate by a fixed amount until a reasonable value is found.
        var totalSpanDistance = distance - m_ljPotentialCalculator.getSigma();
        var distanceChangePerIteration = totalSpanDistance / MAX_APPROXIMATION_ITERATIONS;
        var targetPotential = m_ljPotentialCalculator.calculateLjPotential( distance );
        var equivalentPotentialDistance = m_ljPotentialCalculator.calculateMinimumForceDistance();
        for ( var i = 0; i < MAX_APPROXIMATION_ITERATIONS; i++ ) {
          if ( m_ljPotentialCalculator.calculateLjPotential( equivalentPotentialDistance ) > targetPotential ) {
            // Close enough.
            break;
          }
          equivalentPotentialDistance -= distanceChangePerIteration;
        }
        return equivalentPotentialDistance;
      },

      //private
      isFixedAtomVibrating: function() {
        return m_vibrationCounter > 0;
      },

      //private
      notifyFixedAtomAdded: function( atom ) {
        for ( var listener in m_listeners ) {
          (listener).fixedAtomAdded( atom );
        }
      },

      //private
      notifyMovableAtomAdded: function( particle ) {
        for ( var listener in m_listeners ) {
          listener.movableAtomAdded( particle );
        }
      },

      //private
      notifyFixedAtomRemoved: function( particle ) {
        for ( var listener in m_listeners ) {
          listener.fixedAtomRemoved( particle );
        }
      },

      //private
      notifyMovableAtomRemoved: function( atom ) {
        for ( var listener in m_listeners ) {
          listener.movableAtomRemoved( atom );
        }
      },

      //private
      notifyInteractionPotentialChanged: function() {
        for ( var listener in m_listeners ) {
          listener.interactionPotentialChanged();
        }
      },

      //private
      notifyFixedAtomDiameterChanged: function() {
        for ( var listener in m_listeners ) {
          listener.fixedAtomDiameterChanged();
        }
      },

      //private
      notifyMovableAtomDiameterChanged: function() {
        for ( var listener in m_listeners ) {
          listener.movableAtomDiameterChanged();
        }
      },
      getClock: function() {
        return m_clock;
      },
    },
//statics
    {
      BONDING_STATE_UNBONDED: BONDING_STATE_UNBONDED,
      BONDING_STATE_BONDING: BONDING_STATE_BONDING,
      BONDING_STATE_BONDED: BONDING_STATE_BONDED
    } );
} );

