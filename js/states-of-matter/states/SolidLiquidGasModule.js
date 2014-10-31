// Copyright 2002-2011, University of Colorado
/**
 * This class is where the model and view classes for the "Solid, Liquid, and
 * Gas" tab of this simulation are created and contained.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ConstantDtClock = require( 'edu.colorado.phet.common.phetcommon.model.clock.ConstantDtClock' );
  var PiccoloModule = require( 'edu.colorado.phet.common.piccolophet.PiccoloModule' );
  var StatesOfMatterStrings = require( 'STATES_OF_MATTER/states-of-matter/StatesOfMatterStrings' );
  var SolidLiquidGasDefaults = require( 'STATES_OF_MATTER/states-of-matter/defaults/SolidLiquidGasDefaults' );
  var MultipleParticleModel = require( 'STATES_OF_MATTER/states-of-matter/model/MultipleParticleModel' );

  function SolidLiquidGasModule() {
    //----------------------------------------------------------------------------
    // Instance Data
    //----------------------------------------------------------------------------

    //private
    this.m_model;
    PiccoloModule.call( this, StatesOfMatterStrings.TITLE_SOLID_LIQUID_GAS_MODULE, new ConstantDtClock( SolidLiquidGasDefaults.CLOCK_FRAME_DELAY, SolidLiquidGasDefaults.CLOCK_DT ) );
    // Model
    m_model = new MultipleParticleModel( getClock() );
    // Canvas
    setSimulationPanel( new SolidLiquidGasCanvas( m_model ) );
    // Control panel
    setControlPanel( new SolidLiquidGasControlPanel( this ) );
    // Turn off the clock control panel - a floating node is used for clock control.
    setClockControlPanel( null );
    // Help
    if ( hasHelp() ) {
    }
    // Set initial state
    reset();
  }

  return inherit( PiccoloModule, SolidLiquidGasModule, {
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
      setClockRunningWhenActive( SolidLiquidGasDefaults.CLOCK_RUNNING );
    }
  } );
} );

