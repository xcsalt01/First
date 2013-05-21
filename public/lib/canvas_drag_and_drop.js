/**
 * JSON class containing functions and variables related to drag and drop
 * functionality from the tools panel to the canvas itself. Does not handle any
 * shapes or text within the canvas element.
 * 
 * @author Matthew Saltzman
 * @since 5-18-2013
 */

// Handled as a JSON object to understand which method handles what
var canvas_drag_and_drop = {
  // list of elements currently in the canvas
  undoList : [],
  // list of elements removed from the canvas via undo action -- clears
  // if any action is taken other than clicking the redo button
  redoList : [],
  /**
   * Function for handling the initial dragging action from the tools panel.
   * Sets the data to be transferred during the drop action.
   * 
   * @param event
   *          The event object that this function handles
   * @throws error
   *           if function is called without an event
   */
  beginDrag : function( event )
  {
    // end processing here if the event object is not defined
    if ( !event )
    {
      throw "event object is not defined";
    }

    // "params" - Identifier for the set of parameters being passed into the
    // dataTransfer object
    // event.target.id - The identifier for the object being dragged (also
    // contains shape identifier after an _ character)
    // event.layerX - The X coordinate for the mouse within the object
    // event.layerY - The Y coordinate for the mouse within the object
    event.dataTransfer
        .setData( "params", event.target.id + "," + event.layerX + "," + event.layerY );
  },
  /**
   * Function for handling the dragover event for the canvas object. All this
   * should do is prevent the canvas object from rejecting the drop action.
   * 
   * @param event
   *          The event object that this function handles
   * @throws error
   *           if function is called without an event
   */
  allowDrop : function( event )
  {
    // end processing here if the event object is not defined
    if ( !event )
    {
      throw "event object is not defined";
    }

    // default, in this case, is to reject drop actions. Preventing it allows
    // the drop action to occur
    event.preventDefault();
  },
  /**
   * Function for handling drop event into canvas object. Draws an object double
   * the size of the dragged object in the canvas at the drop point.
   * 
   * @param event
   *          The event object that this function handles
   * @throws error
   *           If function is called without an event
   */
  dropIntoCanvas : function( event )
  {
    // end processing here if the event object is not defined
    if ( !event )
    {
      throw "event object is not defined";
    }
    // this time, preventDefault prevents redirecting to a new page, which is
    // the default drop action
    event.preventDefault();

    // since we added another element, we need to invalidate the redo cache,
    // as we no longer have a path to redo
    this.invalidateRedoCache();

    // obtain the canvas element
    var canvas = document.getElementById( event.target.id );
    // what we actually need is the 2d context of the canvas
    var context = canvas.getContext( "2d" );
    // get the data from dataTransfer object as well, will be used later
    var data = event.dataTransfer.getData( "params" ).split( ',' );
    var shapeElement = document.getElementById( data[ 0 ] );

    // create dimensions for an object 2x the size of the original
    var xpos = event.layerX - data[ 1 ] * 2 + 10 * 2;
    var ypos = event.layerY - data[ 2 ] * 2 + 10 * 2;
    var digitsWidth = shapeElement.style.width.match( /\d+/ )[ 0 ] * 2;
    var digitsHeight = shapeElement.style.height.match( /\d+/ )[ 0 ] * 2;

    // set stroke style and fill style in accordance with settings on the page
    var strokeColor = document.getElementById( "strokeColorDiv" ).style.backgroundColor;
    var fillColor = document.getElementById( "fillColorDiv" ).style.backgroundColor;

    // create shape in the canvas
    context.strokeStyle = strokeColor;
    context.fillStyle = fillColor;
    var shape = this.helpers.determineShape( data[ 0 ] );
    var style = this.helpers.determineStyle( data[ 0 ] );

    switch ( shape )
    {
      case 'rect':
        if ( style === 'stroke' )
        {
          // stroke, in this case, means draw the outline only
          context.strokeRect( xpos, ypos, digitsWidth, digitsHeight );
        }
        else if ( style === 'fill' )
        {
          context.fillRect( xpos, ypos, digitsWidth, digitsHeight );
        }
        break;
      case 'circle':
        // setting up radians to draw a circle
        var startPoint = ( Math.PI / 180 ) * 0;
        var endPoint = ( Math.PI / 180 ) * 360;

        // Unlike rectangles, circles need a full path item, there isn't a
        // shortcut to drawing one
        context.beginPath();
        // Drawing circle at center mouse point is not ideal, but unlike
        // rectangle, simply shifting the center point by the position of the
        // mouse will not put the circle in the right place, also, direction
        // of drawn circle is not important (6th parameter)
        // digitsWidth is used for the radius of the circle, thus dividing by 2
        context.arc( event.layerX, event.layerY, digitsWidth / 2, startPoint, endPoint, true );
        context.stroke();
        // only difference between stroke and fill is whether or not a call to
        // context.fill() is executed
        if ( style === 'fill' )
        {
          context.fill();
        }
        // end the path, and finish drawing the circle
        context.closePath();
        break;
    }

    this.addElementToUndoCache( style, shape, xpos, ypos, digitsWidth, digitsHeight );
  },
  invalidateRedoCache : function()
  {
  },
  addElementToUndoCache : function()
  {
  },
  // Contains a set of helper functions, to move repeatable functionality out of
  // individual methods
  helpers : {
    /**
     * Helper method that gets the shape being dropped or drawn in the canvas
     * 
     * @param id
     *          Identifier for the element being dropped, contains the shape as
     *          the second half, after the underscore
     */
    determineShape : function( id )
    {
      var shape = id.split( '_' );
      return shape[ 1 ];
    },
    /**
     * Helper method that gets the style ( filled or outline ) being dropped or
     * drawn in the canvas
     * 
     * @param id
     *          Identifier for the element being dropped, contains the style as
     *          the first half, before the underscore
     */
    determineStyle : function( id )
    {
      var style = id.split( '_' );
      return style[ 0 ];
    }
  }
};