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
      getContext : jasmine.createSpy( 'getContext' ).andReturn( context )
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
        //needs to be an "andCallFake" once the tests are fixed
        getData : jasmine.createSpy( 'getData' ).andReturn( 'stroke_rect,0,0' )
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
      getElementById : jasmine.createSpy( 'getElementById' ).andCallFake( function( id )
      {
        if ( id === "dummy" )
        {
          return dummyCanvasElement;
        }
        else if ( id === "stroke_rect" )
        {
          return dummyElement;
        }
        else if ( id === "fill_rect" )
        {
          return dummyElement;
        }
        else if ( id === 'strokeColorDiv' )
        {
          return strokeColorDiv;
        }
        else if ( id === 'fillColorDiv' )
        {
          return fillColorDiv;
        }
      } )
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
      strokeRect : jasmine.createSpy( 'strokeRect' ),
      fillRect : jasmine.createSpy( 'fillRect' ),
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

    it( "has a method called beginDrag", function()
    {
      expect( canvas_drag_and_drop.beginDrag ).toBeDefined();
    } );
    it( "which can be called", function()
    {
      canvas_drag_and_drop.beginDrag( event );

      expect( canvas_drag_and_drop.beginDrag ).toHaveBeenCalled();
    } );
    it( "which calls methods from Event", function()
    {
      canvas_drag_and_drop.beginDrag( event );

      expect( event.dataTransfer.setData ).toHaveBeenCalled();
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

    it( "has a method called allowDrop", function()
    {
      expect( canvas_drag_and_drop.allowDrop ).toBeDefined();
    } );
    it( "calls preventDefault from the event object", function()
    {
      canvas_drag_and_drop.allowDrop( event );

      expect( event.preventDefault ).toHaveBeenCalled();
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

    it( "has a method called dropIntoCanvas", function()
    {
      expect( canvas_drag_and_drop.dropIntoCanvas ).toBeDefined();
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

      expect( canvas_drag_and_drop.addElementToUndoCache ).toHaveBeenCalled();
      expect( canvas_drag_and_drop.addElementToUndoCache ).toHaveBeenCalledWith( 'stroke', 'rect',
          20, 20, 300, 300 );
    } );
    // creating a subgroup for shape determination. None work yet, will need to fix.
    describe( "can determine which shape it needs to draw", function()
    {
      it( "can create an outline of a rectangle", function()
      {
        canvas_drag_and_drop.dropIntoCanvas( event );

        expect( context.strokeRect ).toHaveBeenCalled();
      } );
      it( "can create a filled rectangle", function()
      {
        dummyElement.id = 'fill_rect';
        canvas_drag_and_drop.dropIntoCanvas( event );

        expect( context.fillRect ).toHaveBeenCalled();
      } );
    } );
  } );
} );