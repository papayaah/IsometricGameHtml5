// Entity.js
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