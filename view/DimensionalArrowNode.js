define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var ArrowShape = require( 'SCENERY_PHET/ArrowShape' );
  var Vector2 = require( 'DOT/Vector2' );

  /*
   * @param {number} tailX
   * @param {number} tailY
   * @param {number} tipX
   * @param {number} tipY
   * @param {Object} [options]
   * @constructor
   */
  function DimensionalArrowNode( tailX, tailY, tipX, tipY, options ) {


    // default options
    options = _.extend( {
      headHeight: 10,
      headWidth: 10,
      tailWidth: 5,
      doubleHead: false, // true puts heads on both ends of the arrow, false puts a head at the tip
      fill: 'black',
      stroke: 'black',
      lineWidth: 1
    }, options );

    // things you're likely to mess up, add more as needed
    assert && assert( options.headWidth > options.tailWidth );

    Path.call( this, new ArrowShape( tailX, tailY, tipX, tipY, options ), options );
    this.options = options;
  }

  return inherit( Path, DimensionalArrowNode, {
    setTailAndTip: function( tailX, tailY, tipX, tipY ) {
      var tailLocation = new Vector2( tailX, tailY );
      var tipLocation = new Vector2( tipX, tipY );
      var tempHeadHeight;
      var tempHeadWidth;
      var tempTailWidth;
      if ( tailLocation.distance( tipLocation ) !== 0 ) {

        tempHeadHeight = this.options.headHeight;
        tempHeadWidth = this.options.headWidth;
        tempTailWidth = this.options.tailWidth;
        var length = tipLocation.distance( tailLocation );

        var fractionalHeadHeight = 0.5;
        if ( length < this.options.headHeight / fractionalHeadHeight ) {
          tempHeadHeight = length * fractionalHeadHeight;

          tempTailWidth = this.options.tailWidth * tempHeadHeight / this.options.headHeight;
          tempHeadWidth = this.options.headWidth * tempHeadHeight / this.options.headHeight;

        }
      }
      this.shape = new ArrowShape( tailX, tailY, tipX, tipY, {
        headHeight: tempHeadHeight,
        headWidth: tempHeadWidth,
        tailWidth: tempTailWidth
      } );
    }
  } );
} );

