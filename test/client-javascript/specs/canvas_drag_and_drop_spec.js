/**
 * Test file for canvas_drag_and_drop client side javascript file. Will test the
 * ability to drag a shape into the canvas, drop the shape into the canvas, and
 * change the color of the draggable icons. Potentially, more actions will be
 * added.
 * 
 * @author msaltzman
 * @since 17-05-2013
 */

EnvJasmine.load( EnvJasmine.jsDir + 'canvas_drag_and_drop.js' );

describe( "Full test suite for canvas_drag_and_drop", function()
{
  // create variables initialized in beforeEach section
  var event;
  var dummyCanvasElement;
  var dummyElement;
  var strokeColorDiv;
  var fillColorDiv;
  var context;

  // used for drawing circles, canvas arc uses radians. Start point is the
  // beginning of the circle, end point is also the beginning of the circle, but
  // 360 degrees around first
  var startPoint = ( Math.PI / 180 ) * 0;
  var endPoint = ( Math.PI / 180 ) * 360;

  beforeEach( function()
  {
    // initializing the dummyElement with defaults for the values being
    // interacted with. dummyElement contains getContext to mock a
    // canvas element
    dummyCanvasElement = {
      style : {
        width : 500,
        height : 500
      },
      id : "dummy",
      // called when drawing inside a canvas element
      getContext : function()
      {
        return context;
      }
    };

    dummyElement = {
      style : {
        width : '150',
        height : '150'
      },
      id : "stroke_rect"
    };

    // mock for the event object. Contains a dummy value for each element with a
    // value, and an empty spy for each function. Functions requiring return
    // values have dummy return values prepared
    event = {
      dataTransfer : {
        setData : jasmine.createSpy( 'setData' ),
        getData : function()
        {
          return dummyElement.id + ',0,0';
        }
      },
      target : {
        id : ""
      },
      layerX : 0,
      layerY : 0,
      preventDefault : jasmine.createSpy( 'preventDefault' )
    };

    // mock for the document object
    document = {
      getElementById : function( id )
      {
        if ( id === "dummy" )
        {
          return dummyCanvasElement;
        }
        else if ( id === 'strokeColorDiv' )
        {
          return strokeColorDiv;
        }
        else if ( id === 'fillColorDiv' )
        {
          return fillColorDiv;
        }
        else
        {
          return dummyElement;
        }
      }
    };

    // mock for the strokeColorDiv object
    strokeColorDiv = {
      style : {
        backgroundColor : "color"
      }
    }

    // mock for the fillColorDiv object
    fillColorDiv = {
      style : {
        backgroundColor : "color"
      }
    }

    // mock for the context of a canvas element
    context = {
      // returning black as dummy background color
      strokeStyle : "",
      fillStyle : "",
      strokeRect : function()
      {
      },
      fillRect : function()
      {
      },
      arc : function()
      {
      },
      stroke : function()
      {
      },
      fill : function()
      {
      },
      beginPath : function()
      {
      },
      closePath : function()
      {
      }
    }
  } );

  // ************************************************************************
  // ************************* Tests begin here *****************************
  // ************************************************************************
  describe( "contains beginDrag tests", function()
  {
    beforeEach( function()
    {
      event.target.id = 'stroke_rect'
      spyOn( canvas_drag_and_drop, 'beginDrag' ).andCallThrough();
    } );

    it( "Calls methods from Event", function()
    {
      canvas_drag_and_drop.beginDrag( event );

      expect( event.dataTransfer.setData ).toHaveBeenCalledWith( "params", "stroke_rect,0,0" );
    } );
    it( "should never be called without an event", function()
    {
      expect( canvas_drag_and_drop.beginDrag ).toThrow( "event object is not defined" );
    } )
  } );

  describe( "contains allowDrop tests", function()
  {
    beforeEach( function()
    {
      spyOn( canvas_drag_and_drop, 'allowDrop' ).andCallThrough();
    } );

    it( "calls preventDefault from the event object", function()
    {
      canvas_drag_and_drop.allowDrop( event );

      expect( event.preventDefault ).not.toHaveBeenCalledWith( jasmine.any( Object ) );
    } );
    it( "should throw an error if called without an event object", function()
    {
      expect( canvas_drag_and_drop.allowDrop ).toThrow( "event object is not defined" );
    } );
  } );

  describe( "contains dropIntoCanvas tests", function()
  {
    beforeEach( function()
    {
      event.target.id = 'dummy';
      spyOn( canvas_drag_and_drop, 'dropIntoCanvas' ).andCallThrough();
    } );

    it( "disables the default action", function()
    {
      canvas_drag_and_drop.dropIntoCanvas( event );

      expect( event.preventDefault ).toHaveBeenCalled();
    } );
    it( "throws an error if called without an event object", function()
    {
      expect( canvas_drag_and_drop.allowDrop ).toThrow( "event object is not defined" );
    } );
    it( "invalidates the redo cache", function()
    {
      spyOn( canvas_drag_and_drop, 'invalidateRedoCache' ).andReturn( "true" );
      canvas_drag_and_drop.dropIntoCanvas( event );

      expect( canvas_drag_and_drop.invalidateRedoCache ).toHaveBeenCalled();
    } );
    it( "adds an element to the undo cache", function()
    {
      spyOn( canvas_drag_and_drop, 'addElementToUndoCache' ).andReturn( "true" );
      canvas_drag_and_drop.dropIntoCanvas( event );

      expect( canvas_drag_and_drop.addElementToUndoCache ).toHaveBeenCalledWith( 'stroke', 'rect',
          20, 20, 300, 300 );
    } );
    // creating a subgroup for shape determination. None work yet, will need to
    // fix.
    describe( "can determine which shape it needs to draw", function()
    {
      it( "can create an outline of a rectangle", function()
      {
        context.strokeRect = jasmine.createSpy( 'strokeRect' );
        canvas_drag_and_drop.dropIntoCanvas( event );

        expect( context.strokeRect ).toHaveBeenCalled();
      } );
      it( "can create a filled rectangle", function()
      {
        dummyElement.id = 'fill_rect';
        spyOn( context, 'fillRect' );
        canvas_drag_and_drop.dropIntoCanvas( event );

        expect( context.fillRect ).toHaveBeenCalled();
      } );
      it( "can create a circle", function()
      {
        dummyElement.id = 'stroke_circle';
        spyOn( context, 'arc' );
        spyOn( context, 'fill' );
        canvas_drag_and_drop.dropIntoCanvas( event );

        expect( context.arc ).toHaveBeenCalledWith( 0, 0, 150, startPoint, endPoint, true );
        expect( context.fill ).not.toHaveBeenCalled();
      } );
      it( "can create a filled circle", function()
      {
        dummyElement.id = 'fill_circle';
        spyOn( context, 'arc' );
        spyOn( context, 'fill' );
        canvas_drag_and_drop.dropIntoCanvas( event );

        expect( context.arc ).toHaveBeenCalledWith( 0, 0, 150, startPoint, endPoint, true );
        expect( context.fill ).toHaveBeenCalled();
      } );

    } );
  } );
} );