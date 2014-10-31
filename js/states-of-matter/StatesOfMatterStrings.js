// Copyright 2002-2014, University of Colorado Boulder
/**
 * StatesOfMatterStrings is the collection of localized strings used by this simulations.
 * We load all strings as statics so that we will be warned at startup time of any missing strings.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetCommonResources = require( 'edu.colorado.phet.common.phetcommon.resources.PhetCommonResources' );

  var STOVE_CONTROL_PANEL_TITLE = StatesOfMatterResources.getString( "Stove.Title" );
  var STOVE_CONTROL_PANEL_HEAT_LABEL = StatesOfMatterResources.getString( "Stove.Heat" );
  var STOVE_CONTROL_PANEL_COOL_LABEL = StatesOfMatterResources.getString( "Stove.Cool" );
  var PRESSURE_GAUGE_TITLE = StatesOfMatterResources.getString( "PressureGauge.Title" );
  var PRESSURE_GAUGE_UNITS = StatesOfMatterResources.getString( "PressureGauge.Units" );
  var PRESSURE_GAUGE_OVERLOAD = StatesOfMatterResources.getString( "PressureGauge.Overload" );
  var TITLE_SOLID_LIQUID_GAS_MODULE = StatesOfMatterResources.getString( "ModuleTitle.SolidLiquidGasModule" );
  var TITLE_PHASE_CHANGES_MODULE = StatesOfMatterResources.getString( "ModuleTitle.PhaseChangesModule" );
  var TITLE_INTERACTION_POTENTIAL_MODULE = StatesOfMatterResources.getString( "ModuleTitle.InteractionPotentialModule" );
  var MOLECULE_TYPE_SELECT_LABEL = StatesOfMatterResources.getString( "SolidLiquidGasControl.MoleculeSelection" );
  var OXYGEN_SELECTION_LABEL = StatesOfMatterResources.getString( "SolidLiquidGasControl.Oxygen" );
  var NEON_SELECTION_LABEL = StatesOfMatterResources.getString( "SolidLiquidGasControl.Neon" );
  var ARGON_SELECTION_LABEL = StatesOfMatterResources.getString( "SolidLiquidGasControl.Argon" );
  var WATER_SELECTION_LABEL = StatesOfMatterResources.getString( "SolidLiquidGasControl.Water" );
  var ADJUSTABLE_ATTRACTION_SELECTION_LABEL = StatesOfMatterResources.getString( "SolidLiquidGasControl.AdjustableAttraction" );
  var FORCE_STATE_CHANGE = StatesOfMatterResources.getString( "SolidLiquidGasControl.StateSelection" );
  var PHASE_STATE_SOLID = StatesOfMatterResources.getString( "SolidLiquidGasControl.Solid" );
  var PHASE_STATE_LIQUID = StatesOfMatterResources.getString( "SolidLiquidGasControl.Liquid" );
  var PHASE_STATE_GAS = StatesOfMatterResources.getString( "SolidLiquidGasControl.Gas" );
  var PHASE_DIAGRAM_X_AXIS_LABEL = StatesOfMatterResources.getString( "PhaseChanges.PhaseDiagram.xAxisLabel" );
  var PHASE_DIAGRAM_Y_AXIS_LABEL = StatesOfMatterResources.getString( "PhaseChanges.PhaseDiagram.yAxisLabel" );
  var PHASE_DIAGRAM_SOLID = StatesOfMatterResources.getString( "PhaseChanges.PhaseDiagram.Solid" );
  var PHASE_DIAGRAM_LIQUID = StatesOfMatterResources.getString( "PhaseChanges.PhaseDiagram.Liquid" );
  var PHASE_DIAGRAM_GAS = StatesOfMatterResources.getString( "PhaseChanges.PhaseDiagram.Gas" );
  var PHASE_DIAGRAM_TRIPLE_POINT = StatesOfMatterResources.getString( "PhaseChanges.PhaseDiagram.TriplePoint" );
  var PHASE_DIAGRAM_CRITICAL_POINT = StatesOfMatterResources.getString( "PhaseChanges.PhaseDiagram.CriticalPoint" );
  var PHASE_DIAGRAM_BUTTON_LABEL = StatesOfMatterResources.getString( "PhaseChanges.PhaseDiagram.ButtonLabel" );
  var INTERACTION_POTENTIAL_ATOM_SELECT_LABEL = StatesOfMatterResources.getString( "InteractionPotential.Atoms" );
  var FIXED_ATOM_LABEL = StatesOfMatterResources.getString( "InteractionPotential.FixedAtom" );
  var MOVABLE_ATOM_LABEL = StatesOfMatterResources.getString( "InteractionPotential.MovableAtom" );
  var INTERACTION_POTENTIAL_SHOW_FORCES = StatesOfMatterResources.getString( "InteractionPotential.ShowForces" );
  var INTERACTION_POTENTIAL_HIDE_FORCES = StatesOfMatterResources.getString( "InteractionPotential.HideForces" );
  var INTERACTION_POTENTIAL_TOTAL_FORCES = StatesOfMatterResources.getString( "InteractionPotential.TotalForces" );
  var INTERACTION_POTENTIAL_COMPONENT_FORCES = StatesOfMatterResources.getString( "InteractionPotential.ComponentForces" );
  var ATTRACTIVE_FORCE_KEY = StatesOfMatterResources.getString( "InteractionPotential.AttractiveForce" );
  var REPULSIVE_FORCE_KEY = StatesOfMatterResources.getString( "InteractionPotential.RepulsiveForce" );
  var STOP_ATOM = StatesOfMatterResources.getString( "InteractionPotential.StopAtom" );
  var RETRIEVE_ATOM = StatesOfMatterResources.getString( "InteractionPotential.RetrieveAtom" );
  var INTERACTION_POTENTIAL_GRAPH_X_AXIS_LABEL_ATOMS = StatesOfMatterResources.getString( "PhaseChanges.InteractionPotentialGraph.xAxisLabelAtoms" );
  var INTERACTION_POTENTIAL_GRAPH_X_AXIS_LABEL_MOLECULES = StatesOfMatterResources.getString( "PhaseChanges.InteractionPotentialGraph.xAxisLabelMolecules" );
  var INTERACTION_POTENTIAL_GRAPH_Y_AXIS_LABEL = StatesOfMatterResources.getString( "PhaseChanges.InteractionPotentialGraph.yAxisLabel" );
  var INTERACTION_POTENTIAL_BUTTON_LABEL = StatesOfMatterResources.getString( "PhaseChanges.InteractionPotentialGraph.ButtonLabel" );
  var GRAVITY_CONTROL_TITLE = StatesOfMatterResources.getString( "GravityControl.Title" );
  var GRAVITY_CONTROL_NONE = StatesOfMatterResources.getString( "GravityControl.None" );
  var GRAVITY_CONTROL_LOTS = StatesOfMatterResources.getString( "GravityControl.Lots" );
  var ATOM_DIAMETER_CONTROL_TITLE = StatesOfMatterResources.getString( "AtomDiameterControl.Title" );
  var ATOM_DIAMETER_SMALL = StatesOfMatterResources.getString( "AtomDiameterControl.Small" );
  var ATOM_DIAMETER_LARGE = StatesOfMatterResources.getString( "AtomDiameterControl.Large" );
  var INTERACTION_STRENGTH_CONTROL_TITLE = StatesOfMatterResources.getString( "InteractionStrengthControl.Title" );
  var INTERACTION_STRENGTH_WEAK = StatesOfMatterResources.getString( "InteractionStrengthControl.Weak" );
  var INTERACTION_STRENGTH_STRONG = StatesOfMatterResources.getString( "InteractionStrengthControl.Strong" );
  var CLOCK_SPEED_CONTROL_CAPTION = PhetCommonResources.getString( "Common.sim.speed" );
  var RESET = StatesOfMatterResources.getString( "Reset" );
  var WIGGLE_ME_CAPTION = StatesOfMatterResources.getString( "WiggleMeCaption" );
  var RETURN_LID = StatesOfMatterResources.getString( "ReturnLid" );
  var KELVIN = StatesOfMatterResources.getString( "Kelvin" );
  var CELSIUS = StatesOfMatterResources.getString( "Celsius" );
  var UNITS_K = StatesOfMatterResources.getString( "units.K" );
  var UNITS_C = StatesOfMatterResources.getString( "units.C" );
  /* Not intended for instantiation. */

  //private
  function StatesOfMatterStrings() {
  }

  return inherit( Object, StatesOfMatterStrings, {
    },
//statics
    {
      STOVE_CONTROL_PANEL_TITLE: STOVE_CONTROL_PANEL_TITLE,
      STOVE_CONTROL_PANEL_HEAT_LABEL: STOVE_CONTROL_PANEL_HEAT_LABEL,
      STOVE_CONTROL_PANEL_COOL_LABEL: STOVE_CONTROL_PANEL_COOL_LABEL,
      PRESSURE_GAUGE_TITLE: PRESSURE_GAUGE_TITLE,
      PRESSURE_GAUGE_UNITS: PRESSURE_GAUGE_UNITS,
      PRESSURE_GAUGE_OVERLOAD: PRESSURE_GAUGE_OVERLOAD,
      TITLE_SOLID_LIQUID_GAS_MODULE: TITLE_SOLID_LIQUID_GAS_MODULE,
      TITLE_PHASE_CHANGES_MODULE: TITLE_PHASE_CHANGES_MODULE,
      TITLE_INTERACTION_POTENTIAL_MODULE: TITLE_INTERACTION_POTENTIAL_MODULE,
      MOLECULE_TYPE_SELECT_LABEL: MOLECULE_TYPE_SELECT_LABEL,
      OXYGEN_SELECTION_LABEL: OXYGEN_SELECTION_LABEL,
      NEON_SELECTION_LABEL: NEON_SELECTION_LABEL,
      ARGON_SELECTION_LABEL: ARGON_SELECTION_LABEL,
      WATER_SELECTION_LABEL: WATER_SELECTION_LABEL,
      ADJUSTABLE_ATTRACTION_SELECTION_LABEL: ADJUSTABLE_ATTRACTION_SELECTION_LABEL,
      FORCE_STATE_CHANGE: FORCE_STATE_CHANGE,
      PHASE_STATE_SOLID: PHASE_STATE_SOLID,
      PHASE_STATE_LIQUID: PHASE_STATE_LIQUID,
      PHASE_STATE_GAS: PHASE_STATE_GAS,
      PHASE_DIAGRAM_X_AXIS_LABEL: PHASE_DIAGRAM_X_AXIS_LABEL,
      PHASE_DIAGRAM_Y_AXIS_LABEL: PHASE_DIAGRAM_Y_AXIS_LABEL,
      PHASE_DIAGRAM_SOLID: PHASE_DIAGRAM_SOLID,
      PHASE_DIAGRAM_LIQUID: PHASE_DIAGRAM_LIQUID,
      PHASE_DIAGRAM_GAS: PHASE_DIAGRAM_GAS,
      PHASE_DIAGRAM_TRIPLE_POINT: PHASE_DIAGRAM_TRIPLE_POINT,
      PHASE_DIAGRAM_CRITICAL_POINT: PHASE_DIAGRAM_CRITICAL_POINT,
      PHASE_DIAGRAM_BUTTON_LABEL: PHASE_DIAGRAM_BUTTON_LABEL,
      INTERACTION_POTENTIAL_ATOM_SELECT_LABEL: INTERACTION_POTENTIAL_ATOM_SELECT_LABEL,
      FIXED_ATOM_LABEL: FIXED_ATOM_LABEL,
      MOVABLE_ATOM_LABEL: MOVABLE_ATOM_LABEL,
      INTERACTION_POTENTIAL_SHOW_FORCES: INTERACTION_POTENTIAL_SHOW_FORCES,
      INTERACTION_POTENTIAL_HIDE_FORCES: INTERACTION_POTENTIAL_HIDE_FORCES,
      INTERACTION_POTENTIAL_TOTAL_FORCES: INTERACTION_POTENTIAL_TOTAL_FORCES,
      INTERACTION_POTENTIAL_COMPONENT_FORCES: INTERACTION_POTENTIAL_COMPONENT_FORCES,
      ATTRACTIVE_FORCE_KEY: ATTRACTIVE_FORCE_KEY,
      REPULSIVE_FORCE_KEY: REPULSIVE_FORCE_KEY,
      STOP_ATOM: STOP_ATOM,
      RETRIEVE_ATOM: RETRIEVE_ATOM,
      INTERACTION_POTENTIAL_GRAPH_X_AXIS_LABEL_ATOMS: INTERACTION_POTENTIAL_GRAPH_X_AXIS_LABEL_ATOMS,
      INTERACTION_POTENTIAL_GRAPH_X_AXIS_LABEL_MOLECULES: INTERACTION_POTENTIAL_GRAPH_X_AXIS_LABEL_MOLECULES,
      INTERACTION_POTENTIAL_GRAPH_Y_AXIS_LABEL: INTERACTION_POTENTIAL_GRAPH_Y_AXIS_LABEL,
      INTERACTION_POTENTIAL_BUTTON_LABEL: INTERACTION_POTENTIAL_BUTTON_LABEL,
      GRAVITY_CONTROL_TITLE: GRAVITY_CONTROL_TITLE,
      GRAVITY_CONTROL_NONE: GRAVITY_CONTROL_NONE,
      GRAVITY_CONTROL_LOTS: GRAVITY_CONTROL_LOTS,
      ATOM_DIAMETER_CONTROL_TITLE: ATOM_DIAMETER_CONTROL_TITLE,
      ATOM_DIAMETER_SMALL: ATOM_DIAMETER_SMALL,
      ATOM_DIAMETER_LARGE: ATOM_DIAMETER_LARGE,
      INTERACTION_STRENGTH_CONTROL_TITLE: INTERACTION_STRENGTH_CONTROL_TITLE,
      INTERACTION_STRENGTH_WEAK: INTERACTION_STRENGTH_WEAK,
      INTERACTION_STRENGTH_STRONG: INTERACTION_STRENGTH_STRONG,
      CLOCK_SPEED_CONTROL_CAPTION: CLOCK_SPEED_CONTROL_CAPTION,
      RESET: RESET,
      WIGGLE_ME_CAPTION: WIGGLE_ME_CAPTION,
      RETURN_LID: RETURN_LID,
      KELVIN: KELVIN,
      CELSIUS: CELSIUS,
      UNITS_K: UNITS_K,
      UNITS_C: UNITS_C
    } );
} );

