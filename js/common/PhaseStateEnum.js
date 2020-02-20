// Copyright 2015-2020, University of Colorado Boulder

/**
 * enumeration of the various possible phases of matter
 */
define( require => {
  'use strict';

  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );

  const PhaseStateEnum = Enumeration.byKeys( [ 'SOLID', 'LIQUID', 'GAS', 'UNKNOWN' ] );
  return statesOfMatter.register( 'PhaseStateEnum', PhaseStateEnum );
} );