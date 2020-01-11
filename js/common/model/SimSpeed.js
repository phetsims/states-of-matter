// Copyright 2020, University of Colorado Boulder

/**
 * enum for sim speed settings
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const statesOfMatter = require( 'STATES_OF_MATTER/statesOfMatter' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );

  // @public
  const SimSpeed = Enumeration.byKeys( [ 'NORMAL', 'SLOW_MOTION' ] );

  return statesOfMatter.register( 'SimSpeed', SimSpeed );
} );
