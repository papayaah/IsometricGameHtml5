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