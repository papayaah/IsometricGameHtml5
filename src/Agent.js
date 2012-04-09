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