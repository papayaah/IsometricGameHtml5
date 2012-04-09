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