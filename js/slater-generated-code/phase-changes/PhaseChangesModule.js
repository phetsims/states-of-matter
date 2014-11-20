// Copyright 2002-2014, University of Colorado Boulder
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ConstantDtClock = require( 'edu.colorado.phet.common.phetcommon.model.clock.ConstantDtClock' );
  var PiccoloModule = require( 'edu.colorado.phet.common.piccolophet.PiccoloModule' );
  var StatesOfMatterStrings = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterStrings' );
  var PhaseChangesDefaults = require( 'STATES_OF_MATTER/states-of-matter/defaults/PhaseChangesDefaults' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/states-of-matter/model/MultipleParticleModel' );

  function PhaseChangesModule( advanced ) {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------

    //private
    this.m_model;
    PiccoloModule.call( this, StatesOfMatterStrings.TITLE_PHASE_CHANGES_MODULE, new ConstantDtClock( PhaseChangesDefaults.CLOCK_FRAME_DELAY, PhaseChangesDefaults.CLOCK_DT ) );
    // Model
    m_model = new MultipleParticleModel( getClock() );
    // Canvas
    setSimulationPanel( new PhaseChangesCanvas( m_model ) );
    // Control panel
    setControlPanel( new PhaseChangesControlPanel( this, advanced ) );
    // Turn off the clock control panel - a floating node is used for clock control.
    setClockControlPanel( null );
    // Help
    if ( hasHelp() ) {
    }
    // Set initial state
    reset();
  }

  return inherit( PiccoloModule, PhaseChangesModule, {
//----------------------------------------------------------------------------
// Accessor Methods
//----------------------------------------------------------------------------
    getMultiParticleModel: function() {
      return m_model;
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
      setClockRunningWhenActive( PhaseChangesDefaults.CLOCK_RUNNING );
    }
  } );
} );

