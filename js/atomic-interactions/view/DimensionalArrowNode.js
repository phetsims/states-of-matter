define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var ArrowShape = require( 'SCENERY_PHET/ArrowShape' );
  var Vector2 = require( 'DOT/Vector2' );

  /*
   * @param {Number} tailX - arrowNode tail X position
   * @param {Number} tailY - arrowNode tail Y position
   * @param {Number} tipX - arrowNode tip X position
   * @param {Number} tipY - arrowNode tip Y position
   * @param {Object} [options] that can be passed on to the underlying node
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

    // arrowNode tip and tail locations
    this.tailLocation = new Vector2( 0, 0 );
    this.tipLocation = new Vector2( 0, 0 );

    // things you're likely to mess up, add more as needed
    assert && assert( options.headWidth > options.tailWidth );

    Path.call( this, new ArrowShape( tailX, tailY, tipX, tipY, options ), options );
    this.options = options;
  }

  return inherit( Path, DimensionalArrowNode, {

    /**
     * @public
     * @param {Number} tailX - tail X position
     * @param {Number} tailY - tail Y position
     * @param {Number} tipX - tip X position
     * @param {Number} tipY - tip Y position
     */
    setTailAndTip: function( tailX, tailY, tipX, tipY ) {
      this.tailLocation.setXY( tailX, tailY );
      this.tipLocation.setXY( tipX, tipY );
      var tempHeadHeight;
      var tempHeadWidth;
      var tempTailWidth;
      if ( this.tailLocation.distance( this.tipLocation ) !== 0 ) {

        tempHeadHeight = this.options.headHeight;
        tempHeadWidth = this.options.headWidth;
        tempTailWidth = this.options.tailWidth;
        var length = this.tipLocation.distance( this.tailLocation );

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
