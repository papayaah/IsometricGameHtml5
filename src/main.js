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
