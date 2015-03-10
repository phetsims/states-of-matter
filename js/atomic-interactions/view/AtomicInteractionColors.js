//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Location for all colors
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Siddhartha Chinthapally (Actual Concepts)
 */
define( function( require ) {
  'use strict';

  // modules
  var extend = require( 'PHET_CORE/extend' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Color = require( 'SCENERY/util/Color' );

  var colors = {
    background: {
      default: new Color( 0, 0, 0 ),
      basics: new Color( 198, 226, 246 ),
      projector: new Color( 255, 255, 255 )
    },
    potentialEnergyLine: {
      default: new Color( 233, 233, 41 ),
      projector: new Color( 255, 0, 0 )

    },
    controlPanelText: {
      default: new Color( 230, 230, 230 ),
      projector: new Color( 0, 0, 0 )
    },
    ljGraphColorsMode: {
      default: new Color( 230, 230, 230 ),
      projector: new Color( 0, 0, 0 )
    },
    removePairGroup: {
      default: new Color( '#d00' )
    }
  };

  // initial properties object, to load into the PropertySet (so reset works nicely)
  var initialProperties = {};
  for ( var key in colors ) {
    initialProperties[ key ] = colors[ key ].default;
  }

  var AtomicInteractionColors = extend( new PropertySet( initialProperties ), {
    /*
     * Applies all colors for the specific named color scheme, ignoring colors that aren't specified for it.
     *
     * @param {string} profileName - one of 'default', 'basics' or 'projector'
     */
    applyProfile: function( profileName ) {
      assert && assert( profileName === 'default' || profileName === 'projector' );

      for ( var key in colors ) {
        if ( profileName in colors[ key ] ) {
          var oldColor = this[ key ];
          var newColor = colors[ key ][ profileName ];
          if ( !newColor.equals( oldColor ) ) {
            this[ key ] = newColor;
            reportColor( key );
          }
        }
      }
    }
  } );

  /*---------------------------------------------------------------------------*
   * Iframe communication
   *----------------------------------------------------------------------------*/

  // sends iframe communication to report the current color for the key name
  function reportColor( key ) {
    var hexColor = AtomicInteractionColors[ key ].toNumber().toString( 16 );
    while ( hexColor.length < 6 ) {
      hexColor = '0' + hexColor;
    }

    window.parent && window.parent.postMessage( JSON.stringify( {
      type: 'reportColor',
      name: key,
      value: '#' + hexColor
    } ), '*' );
  }

  // initial communication
  for ( var colorName in colors ) {
    reportColor( colorName );
  }

  // receives iframe communication to set a color
  window.addEventListener( 'message', function( evt ) {
    var data = JSON.parse( evt.data );
    if ( data.type === 'setColor' ) {
      AtomicInteractionColors[ data.name ] = new Color( data.value );
    }
  } );

  return AtomicInteractionColors;
} );

