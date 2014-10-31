// Copyright 2002-2014, University of Colorado Boulder
/**
 * This class is where the model and view classes for the "Interaction
 * Potential" tab of this simulation are created and contained.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ConstantDtClock = require( 'edu.colorado.phet.common.phetcommon.model.clock.ConstantDtClock' );
  var SimSpeedControl = require( 'edu.colorado.phet.common.phetcommon.view.clock.SimSpeedControl' );
  var PiccoloModule = require( 'edu.colorado.phet.common.piccolophet.PiccoloModule' );
  var PiccoloClockControlPanel = require( 'edu.colorado.phet.common.piccolophet.nodes.mediabuttons.PiccoloClockControlPanel' );
  var StatesOfMatterStrings = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterStrings' );
  var AtomicInteractionDefaults = require( 'STATES_OF_MATTER/states-of-matter/defaults/AtomicInteractionDefaults' );
  var DualAtomModel = require( 'STATES_OF_MATTER/states-of-matter/model/DualAtomModel' );

  function AtomicInteractionsModule( enableHeterogeneousAtoms ) {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------

    //private
    this.m_model;

    //private
    this.m_canvas;
    PiccoloModule.call( this, StatesOfMatterStrings.TITLE_INTERACTION_POTENTIAL_MODULE, new ConstantDtClock( AtomicInteractionDefaults.CLOCK_FRAME_DELAY, AtomicInteractionDefaults.CLOCK_DT ) );
    // logo creates more room.
    setLogoPanel( null );
    // Model
    m_model = new DualAtomModel( getClock() );
    // Canvas
    m_canvas = new AtomicInteractionsCanvas( m_model );
    setSimulationPanel( m_canvas );
    // Control panel
    setControlPanel( new AtomicInteractionsControlPanel( this, enableHeterogeneousAtoms ) );
    // Add a slider for controlling speed to the clock controls.
    var clockControlPanel = new PiccoloClockControlPanel( getClock() );
    var timeSpeedSlider = new SimSpeedControl( AtomicInteractionDefaults.CLOCK_DT / 5, AtomicInteractionDefaults.CLOCK_DT, getClock(), StatesOfMatterStrings.CLOCK_SPEED_CONTROL_CAPTION );
    clockControlPanel.addBetweenTimeDisplayAndButtons( timeSpeedSlider );
    setClockControlPanel( clockControlPanel );
    // Help
    if ( hasHelp() ) {
    }
    // Set initial state
    reset();
  }

  return inherit( PiccoloModule, AtomicInteractionsModule, {
//----------------------------------------------------------------------------
// Accessor Methods
//----------------------------------------------------------------------------
    getDualParticleModel: function() {
      return m_model;
    },
    getCanvas: function() {
      return m_canvas;
    },
//----------------------------------------------------------------------------
// Module overrides
//----------------------------------------------------------------------------
    /**
     * Resets the module.
     */
    reset: function() {
      // Reset the clock, which ultimately resets the model too.
      getClock().resetSimulationTime();
      setClockRunningWhenActive( AtomicInteractionDefaults.CLOCK_RUNNING );
    }
  } );
} );

