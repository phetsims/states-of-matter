// Copyright 2020, University of Colorado Boulder

/**
 * enumeration for the ways in which the forces can be depicted
 */
define( require => {
  'use strict';

  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  const ForceDisplayMode = Enumeration.byKeys( [ 'COMPONENTS', 'TOTAL', 'HIDDEN' ] );
  return statesOfMatter.register( 'ForceDisplayMode', ForceDisplayMode );
} );