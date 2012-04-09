(function(){
__jah__.resources["/Agent.js"] = {data: function (exports, require, module, __filename, __dirname) {
/**

Copyright (c) 2012 David Ang http://programmingmind.com

MIT License:

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

**/

"use strict"  // Use strict JavaScript mode

var cocos  = require('cocos2d')   // Import the cocos2d module
  , geo    = require('geometry')  // Import the geometry module
  , nodes  = cocos.nodes          // Convenient access to 'nodes'
  , actions   = cocos.actions


 var Sprite   = nodes.Sprite
  , Texture2D   = cocos.Texture2D
  , SpriteFrame   = cocos.SpriteFrame
  , Rect          = geo.Rect
  , ccp           = geo.ccp
  , Animate       = actions.Animate
  , RepeatForever = actions.RepeatForever
  , Animation     = cocos.Animation
  , Entity       = require('./Entity')
  , AnimationSet = require('./AnimationSet')

function Agent(opts) {
  Agent.superclass.constructor.call(this, opts)

  this.animationSets = new Array()

  this.animationSets['idle'] = new AnimationSet({
    textureFile: '/resources/agents/player/idle.png',
    frameWidth: 128,
    frameHeight: 128,
    animationDelay: 0.15,
    backward: true
  })

  this.animationSets['walk'] = new AnimationSet({
    textureFile: '/resources/agents/player/walk.png',
    frameWidth: 128,
    frameHeight: 128,
    animationDelay: 0.10
  })

  this.sprite = new Sprite({ frame: this.animationSets['walk'].startingFrame })
  this.sprite.anchorPoint = ccp(0, 0)
  this.contentSize = this.sprite.contentSize


  this.addChild({child: this.sprite})

  this.play({ animationName: 'idle', animationIndex: this.direction, loop: true })
}

Agent.inherit(Entity, {
  animationSets : null,
  speed: 0,
  direction: 7, // facing SW default direction

  update: function(dt) {
    Agent.superclass.update.call(this, dt)

    // reorder z index
    var tw = this.tmxMap.tileSize.width;
    var th = this.tmxMap.tileSize.height;
    var mw = this.tmxMap.mapSize.width;
    var mh = this.tmxMap.mapSize.height;

    var y = mh - this.position.x/tw + mw/2 - this.position.y/th;
    var x = mh + this.position.x/tw - mw/2 - this.position.y/th;

    x = Math.ceil(x + 0.5)
    y = Math.ceil(y + 0.5)

    var objectLayer = this.tmxMap.getLayer({ name: 'object'})
    objectLayer.reorderChild({child: this, z: x + y})
  },

  play: function(opts) {
    this.sprite.stopAllActions()

    opts = opts || { animationName : 'idle', animationIndex : 0, loop : true }
    this.animationIndex = opts.animationIndex

    var animate   = new Animate({ animation: this.animationSets[opts.animationName].animations[opts.animationIndex], restoreOriginalFrame: false })

    if(opts.loop) {
      this.sprite.runAction(new RepeatForever(animate))
    } else {
      this.sprite.runAction(animate)
    }
  },
  stop: function() {
    this.sprite.stopAllActions()
  }
})

module.exports = Agent
}, mimetype: "application/javascript", remote: false}; // END: /Agent.js


__jah__.resources["/AnimationSet.js"] = {data: function (exports, require, module, __filename, __dirname) {
/**

Copyright (c) 2012 David Ang http://programmingmind.com

MIT License:

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

**/

'use strict'

var cocos   = require('cocos2d')
  , geo     = require('geometry')
  , nodes   = cocos.nodes
  , actions = cocos.actions

 var Sprite       = nodes.Sprite
  , Texture2D     = cocos.Texture2D
  , SpriteFrame   = cocos.SpriteFrame
  , Rect          = geo.Rect
  , Animate       = actions.Animate
  , RepeatForever = actions.RepeatForever
  , Animation     = cocos.Animation
  , ccp           = geo.ccp


function AnimationSet(opts) {
  // store the properties on this object
  this.animationDelay = opts.animationDelay
  this.frameWidth   = opts.frameWidth
  this.frameHeight  = opts.frameHeight

  // load our sprite sheet file
  this.texture    = new Texture2D({ file: opts.textureFile })

  // calculate the number of frames for each row and column, we will use this to loop through all the frames
  var numFramesX  = this.texture.size.width / this.frameWidth
  var numFramesY  = this.texture.size.height / this.frameHeight

  // prepare an array to store each frame
  var animFrames = new Array()
  // loop through all the rows
  for(var y = 0; y < numFramesY; y++) {
    // loop through all the columns
    for(var x = 0; x < numFramesX; x++) {
      // using the frameWidth, frameHeight, x and y, we will be able to extract each individual frame from the sprite sheet
      animFrames.push(new SpriteFrame({ texture: this.texture, rect: new Rect(this.frameWidth * x, this.frameHeight * y, this.frameWidth, this.frameHeight) }))
    }

    // if this animation plays backward then we will push the same number of frames again to the array, starting from the last
    if(opts.backward) {
      var length = animFrames.length
      for(var z = 1; z < numFramesX + 1; z++) {
        animFrames.push(animFrames[length - z])
      }
    }
  }

  this.startingFrame = animFrames[0]

  // group all the frames into their own animation
  this.animations = new Array()
  for(var i = 0; i < 8; i++) {
    // the array splice method will remove items from the array and returns it
    // in effect, we are returning all the frames for each row on every loop
    this.animations.push(new Animation({ frames: animFrames.splice(0, opts.backward ? numFramesX * 2 : numFramesX), delay: this.animationDelay }))
  }
}

AnimationSet.inherit(Object, {
  texture         : null,

  frameWidth      : null, // frame width and height from the sprite sheet
  frameHeight     : null,

  animations      : null,  // cocos.Animations
  animaionIndex   : 0,     // current running animation
  animationDelay  : .04,
  startingFrame   : null, // the starting frame for this sprite
})

module.exports = AnimationSet
}, mimetype: "application/javascript", remote: false}; // END: /AnimationSet.js


__jah__.resources["/Entity.js"] = {data: function (exports, require, module, __filename, __dirname) {
/**

Copyright (c) 2012 David Ang http://programmingmind.com

MIT License:

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

**/

"use strict"  // Use strict JavaScript mode

var cocos  = require('cocos2d')   // Import the cocos2d module


function Entity(opts) {
  Entity.superclass.constructor.call(this)

  this.tmxMap     = opts.tmxMap
  this.position   = opts.position
}

Entity.inherit(cocos.nodes.Node, {
  sprite          : null, // cocos.nodes.Sprite
  tmxMap          : null,  // holds a reference to our current tmx map

  update: function(dt) {
  }
})

module.exports = Entity
}, mimetype: "application/javascript", remote: false}; // END: /Entity.js


__jah__.resources["/main.js"] = {data: function (exports, require, module, __filename, __dirname) {
/**

Copyright (c) 2012 David Ang http://programmingmind.com

MIT License:

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

**/

"use strict"  // Use strict JavaScript mode

// Pull in the modules we're going to use
var cocos  = require('cocos2d')   // Import the cocos2d module
  , nodes  = cocos.nodes          // Convenient access to 'nodes'
  , events = require('events')    // Import the events module
  , geo    = require('geometry')  // Import the geometry module
  , ccp    = geo.ccp              // Short hand to create points
  , actions   = cocos.actions     // Convenient access to the 'actions'

// Convenient access to some constructors
var Layer    = nodes.Layer
  , Scene    = nodes.Scene
  , Label    = nodes.Label
  , Director = cocos.Director
  , TMXTiledMap = nodes.TMXTiledMap
  , RenderTexture = nodes.RenderTexture

  , Node        = nodes.Node
  , Sprite      = nodes.Sprite
  , Texture2D   = cocos.Texture2D
  , SpriteFrame   = cocos.SpriteFrame
  , Rect          = geo.Rect
  , Animate       = actions.Animate
  , RepeatForever = actions.RepeatForever
  , Animation     = cocos.Animation
  , Player        = require('./Player')
  , AnimationSet  = require('./AnimationSet')
  , log           = parent.log


var tmxMap
var player
var debugLabel

/**
 * @class Initial application layer
 * @extends cocos.nodes.Layer
 */
function IsoGameHtml5 () {
    // You must always call the super class constructor
    IsoGameHtml5.superclass.constructor.call(this)

    // Get size of canvas
    var s = Director.sharedDirector.winSize
    log.info('Canvas size: ' + s.width + 'x' + s.height)

    // load our tmx map
    tmxMap = new TMXTiledMap({ file: '/resources/atrium.tmx' })

    // get dimension properties from our tmx map
    var ms = tmxMap.mapSize
    , ts = tmxMap.tileSize
    , ws = geo.sizeMake(ms.width * ts.width, ms.height * ts.height)

    // calculate the center spot for the map
    var mapCenterX = -ms.width * ts.width / 2
    var mapCenterY = -ms.height * ts.height / 2
    var startAreaOffsetX = 900
    var startAreaOffsetY = 280
    // center our map in our canvas
    tmxMap.position = ccp(mapCenterX + s.width / 2, mapCenterY + s.height / 2)
    // move it to where we want the area to show first to our player
    tmxMap.position.x += startAreaOffsetX
    tmxMap.position.y += startAreaOffsetY

    log.info(
      'Map loaded. Size: ' + ms.width + 'x' + ms.height +
      ' Tile size: ' + ts.width + 'x' + ts.height +
      ' World size: ' + ws.width + 'x' + ws.height +
      ' Map pos: ' + tmxMap.position.x + ',' + tmxMap.position.y +
      ' Anchor pt: ' + tmxMap.anchorPoint.x + ',' + tmxMap.anchorPoint.y)

    // get our object & wall layer
    var objectLayer = tmxMap.getLayer({ name: 'object'})

    // reorder each tile's z-order
    for(var y = 0; y < ms.height; y++) {
      for(var x = 0; x < ms.width; x++) {
        var tile = objectLayer.tileAt(ccp(y,x))
        // ensure there's an object or wall
        if( tile ) {
          // add x and y this is equivalient to increasing the tile's z-order row by row
          objectLayer.reorderChild({child: tile, z: x + y})
        }
      }
    }

    // add the map to our main layer
    this.addChild(tmxMap)

    tmxMap.addChild({child: this.createIsoGrid(tmxMap), z: -1})
    this.addChild(this.createDebugPanel())

    player = new Player({ tmxMap: tmxMap, position: ccp(Math.abs(mapCenterX) - startAreaOffsetX, Math.abs(mapCenterY) - startAreaOffsetY) })

    objectLayer.addChild({child: player})

    this.isMouseEnabled = true
    this.isKeyboardEnabled = true

    this.scheduleUpdate()

    var endTime   = new Date()
    log.info('Load time: ' + Math.abs((parent.startTime.getTime() - endTime.getTime()) / 1000) + ' seconds.')
    log.info('Press WASD + QEZC to move our hero in 8 directions.')
}

// Inherit from cocos.nodes.Layer
IsoGameHtml5.inherit(Layer, {

 update: function(dt) {
    player.update(dt)

    debugLabel.string = ' Player pos: ' + player.position.x.toFixed(0) + ',' + player.position.y.toFixed(0)
  },

  mouseDragged: function(evt) {
   var currentPos = tmxMap.position
    tmxMap.position = geo.ccpAdd(currentPos, new geo.Point(evt.deltaX, evt.deltaY))

    return true
  },

  keyDown: function(evt) {
    player.keyDown(evt)

    return true
  },

  keyUp: function(evt) {
    player.keyUp(evt)

    return true
  },

  // returns a nodes.RenderTexture with an ISO grid
  createIsoGrid : function() {
    var ms = tmxMap.mapSize
    , ts = tmxMap.tileSize
    , ws = geo.sizeMake(ms.width * ts.width, ms.height * ts.height)

    var texture = new RenderTexture({width: ws.width, height: ws.height})

    var gridWidth = ts.width
    var gridHeight = ts.height
    var ctx = texture.context

    ctx.strokeStyle = 'white'

    // first half
    for(var y = 0; y < ms.width; y++) {
      var startX = ws.width / 2
      var startY = (ws.height / 2 + (ms.width / 2) * gridHeight) - 16

      startY = startY - y * gridHeight / 2
      startX = startX - y * gridWidth / 2

      for(var x = 0; x < y + 1; x++) {
        var nextX = startX + (x * gridWidth)

        ctx.moveTo(nextX - gridWidth / 2, startY)
        ctx.lineTo(nextX, startY + gridHeight / 2)
        ctx.lineTo(nextX + gridWidth / 2, startY)
        ctx.lineTo(nextX, startY - gridHeight / 2)
        ctx.lineTo(nextX - gridWidth / 2, startY)
      }
    }

    // second half
    for(var y = 0; y < ms.width - 1; y++) {
      var startX = ws.width / 2
      var startY = ws.height / 2 - (((ms.width / 2 - 1) - y) * gridHeight)
      startY = startY - 16

      startY = startY - y * gridHeight / 2
      startX = startX - y * gridWidth / 2

      for(var x = 0; x < y + 1; x++) {
        var nextX = startX + (x * gridWidth)

        ctx.moveTo(nextX - gridWidth / 2, startY)
        ctx.lineTo(nextX, startY + gridHeight / 2)
        ctx.lineTo(nextX + gridWidth / 2, startY)
        ctx.lineTo(nextX, startY - gridHeight / 2)
        ctx.lineTo(nextX - gridWidth / 2, startY)
      }
    }

    ctx.stroke()

    return texture
  },

  createDebugPanel : function() {
    var texture = new RenderTexture({width:  Director.sharedDirector.winSize.width, height: 70})
    var ctx = texture.context
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, texture.contentSize.width, texture.contentSize.height)
    texture.position = ccp(0, 0)

    debugLabel = new Label({ string:   ''

                          , fontSize: 16
                          })

    debugLabel.position = ccp(5, 30)
    debugLabel.anchorPoint = ccp(0, 0)

    texture.addChild({ child: debugLabel} )

    return texture
  }

})

/**
 * Entry point for the application
 */
function main () {
    // Initialise application
    log.info('Game started. Loading...')

    // Get director singleton
    var director = Director.sharedDirector
    director.displayFPS = true

    // Wait for the director to finish preloading our assets
    events.addListener(director, 'ready', function (director) {
        // Create a scene and layer
        var scene = new Scene()
          , layer = new IsoGameHtml5()

        // Add our layer to the scene
        scene.addChild(layer)

        // Run the scene
        director.replaceScene(scene)
    })

    // Preload our assets
    director.runPreloadScene()
}


exports.main = main

}, mimetype: "application/javascript", remote: false}; // END: /main.js


__jah__.resources["/Player.js"] = {data: function (exports, require, module, __filename, __dirname) {
/**

Copyright (c) 2012 David Ang http://programmingmind.com

MIT License:

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

**/

"use strict"

var cocos  = require('cocos2d')
	, geo    = require('geometry')
	, nodes  = cocos.nodes

 var Director = cocos.Director
  , ccp       		= geo.ccp
  , Agent        = require('./Agent')


var moveCounter2 = 0

function Player(opts) {
  Player.superclass.constructor.call(this, opts)

  this.speed = 200
}

Player.inherit(Agent, {
  moveX: 0,
  moveY: 0,

  update: function(dt) {
    Player.superclass.update.call(this, dt)

    // applied timed-based movement to our player
    // Cocos2D-Javascript doesn't seem to like floating point so we are ensuring integer here else will see graphical artificats
    // we need to floor/ceil if its negative/positive or we will have ibalance movement speed on opposite directions
    var amountMoveX = this.moveX < 0 ? Math.floor(this.moveX * dt) : Math.ceil(this.moveX * dt)
    var amountMoveY = this.moveY < 0 ? Math.floor(this.moveY * dt) : Math.ceil(this.moveY * dt)
    var destPos = geo.ccpAdd(this.position, ccp(amountMoveX,amountMoveY))

    this.position = destPos

     // make sure our map follows the player - apply same movement
    this.tmxMap.position = geo.ccpSub(this.tmxMap.position, ccp(amountMoveX, amountMoveY))
  },

  keyDown: function(evt) {
    var keyCode = evt.keyCode
    var charCode = String.fromCharCode(evt.keyCode)

    if(charCode == 'D' || keyCode == '39') {
      this.moveX = this.speed
      this.direction = 4
    } else if(charCode == 'A' || keyCode == '37') {
      this.moveX = -this.speed
      this.direction = 0
    } else if(charCode == 'S' || charCode == 'X' || keyCode == '40') {
      this.moveY = -this.speed
      this.direction = 6
    } else if(charCode == 'W' || keyCode == '38') {
      this.moveY = this.speed
      this.direction = 2
    } else if(charCode == 'E') {
      this.moveY = this.speed / 2
      this.moveX = this.speed
      this.direction = 3
    } else if(charCode == 'Q') {
      this.moveY = this.speed / 2
      this.moveX = -this.speed
      this.direction = 1
    } else if(charCode == 'Z') {
      this.moveY = -this.speed / 2
      this.moveX = -this.speed
      this.direction = 7
    } else if(charCode == 'C') {
      this.moveY = -this.speed / 2
      this.moveX = this.speed
      this.direction = 5
    }

    if(this.moveX != 0 || this.moveY != 0 ) {
      this.play({animationName: 'walk', animationIndex: this.direction, loop : true})
    }
  },
  keyUp: function(evt) {
    this.moveX = 0
    this.moveY = 0

    this.play({animationName: 'idle', animationIndex: this.direction, loop : true})

    return true
  }
})

module.exports = Player
}, mimetype: "application/javascript", remote: false}; // END: /Player.js


__jah__.resources["/resources/agents/player/idle.png"] = {data: __jah__.assetURL + "/resources/agents/player/idle.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/agents/player/walk.png"] = {data: __jah__.assetURL + "/resources/agents/player/walk.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/atrium.tmx"] = {data: __jah__.assetURL + "/resources/atrium.tmx", mimetype: "text/plain", remote: true};
__jah__.resources["/resources/tiled_collision.png"] = {data: __jah__.assetURL + "/resources/tiled_collision.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/tiled_dungeon.png"] = {data: __jah__.assetURL + "/resources/tiled_dungeon.png", mimetype: "image/png", remote: true};
})();