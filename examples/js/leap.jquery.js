 (function($) {       
    var leapData = [];
    //var returnLeapData = [];
    var ws;     
    var funcs = [];
    var deltaTime;
    var frameCount = 0;
    var fps;
    var lastFrameTime;
    var lastFrameHands = 0;
    var blankFunc = function() { }; 
    var isInit = false;
    var lastFramePointers = 0;
    var timeBegan = 0;
    var timeElapsed = 0;
    var tapBegan = false;
    
    var funcs = {
        onHandEnter : blankFunc,
        onHandExit : blankFunc,
        onHandChange : blankFunc,
        onPointerChange : blankFunc,
        onFrame : blankFunc,
        onConnect : blankFunc,
        onDisconnect : blankFunc,
        onSecondChange : blankFunc,
        onTap : blankFunc
    }
    
    //define our functions
    var methods = {
        initLeap : function() {
          console.log("Loaded plugin.");
          //set some default vars  
          
          // Support both the WebSocket and MozWebSocket objects
          if ((typeof(WebSocket) == 'undefined') && (typeof(MozWebSocket) != 'undefined')) {
             WebSocket = MozWebSocket;
          }
          
          //Create and open the socket
          ws = new WebSocket("ws://localhost:6437/");
          
          // On successful connection
          ws.onopen = function(event) {
            console.log("Connected to Leap device.");   
            funcs.onConnect();  
          };
          
          // On message received
          ws.onmessage = function(event) {
            window.leapData = $.parseJSON(event.data); 
            //leapData = window.leapData;
            
            $.fn.leap("leapFrame");
          };
          
          // On socket close
          ws.onclose = function(event) {
            ws = null;
            funcs.onDisconnect();  
            console.log("Disconnected from Leap device.");  
          }
          
          //On socket error
          ws.onerror = function(event) {
            console.log("Error connecting to Leap device.");
          };
        },
        leapFrame : function() {
            frameCount++;
            deltaTime = window.leapData.timestamp - lastFrameTime;
            fps = 1/(deltaTime/1000000); 
            
            window.leapData.numPointables = window.leapData.pointables.length; 
            window.leapData.numHands = window.leapData.hands.length;  
             
            if(lastFrameHands > 0 && window.leapData.numHands == 0) funcs.onHandExit(); 
            if(lastFrameHands == 0 && window.leapData.numHands > 0) funcs.onHandEnter();
            if(lastFrameHands !== window.leapData.numHands) funcs.onHandChange();
            if(lastFramePointers !== window.leapData.numPointables) funcs.onPointerChange();  
            if(Math.round(lastFrameTime/1000000) < Math.round(window.leapData.timestamp/1000000)) funcs.onSecondChange(); 

            window.leapData.fps = fps;
            //for some reason there isnt a timestamp until the 3rd frame
            if(frameCount == 3) {
               timeBegan = window.leapData.timestamp; 
            } 
            window.leapData.timeBegan = timeBegan;
            window.leapData.deltaTime = deltaTime;
            window.leapData.frameCount = frameCount;
            window.leapData.timeElapsed = window.leapData.timestamp - timeBegan;
            
            //detect tapping motion
            if(window.leapData.numPointables > 0) {
                $.each(window.leapData.pointables, function(key, pointable) {
                     if(pointable.tipVelocity[0] < -250 && !tapBegan) {
                         tapBegan = true;   
                     }
                     
                     if(pointable.tipVelocity[0] > 0 && tapBegan) {
                         tapBegan = false;
                         funcs.onTap(pointable);
                     }
                });            
            }
            
            
            funcs.onFrame();   
            
            window.leapData.lastFrameHands = window.leapData.numHands;
            lastFrameHands = window.leapData.numHands
            window.leapData.lastFrameTime = window.leapData.timestamp;
            lastFrameTime = window.leapData.timestamp;
            lastFramePointers = window.leapData.numPointables;
        },
        setEvent : function(name, func) {
            funcs[name] = func;
        },
        setEvents : function(events) {
            $.each(events, function(key, val) {
                funcs[key] = val;    
            });
        },
        data : function() {
            return window.leapData;
        },
        setData : function(data) {
            window.leapData = data;
        }
    }
    
 
    $.fn.leap = function(method) {
        if(!isInit) {
            isInit = true;
            $.fn.leap("initLeap");   
        }
        if(method == undefined) method = 'data';
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.leap');
        }
    };
   
})(jQuery);     