var assert = require('assert');

module.exports = inject;

function inject(bot) {
  var swingInterval = null;

  bot.targetDigBlock = null;

  function activateItem() {

  }

  function deactivateItem() {

  }

  function activateBlock(block) {

  }

  function startDigging(block) {
    assert.equal(bot.targetDigBlock, null);
    bot.lookAt(block.pos);
    bot.client.write(0x0e, {
      status: 0, // start digging
      x: block.pos.x,
      y: block.pos.y,
      z: block.pos.z,
      face: 1, // hard coded to always dig from the top
    });
    bot.client.write(0x0e, {
      status: 2, // finish digging
      x: block.pos.x,
      y: block.pos.y,
      z: block.pos.z,
      face: 1, // hard coded to always dig from the top
    });
    bot.targetDigBlock = block;
    clearInterval(swingInterval);
    swingInterval = setInterval(function() {
      bot.client.write(0x12, {
        entityId: bot.entity.id,
        animation: 1,
      });
    }, 350);
    var eventName = "blockUpdate:" + block.pos;
    bot.on(eventName, onBlockUpdate);

    function onBlockUpdate() {
      var updatedBlock = bot.blockAt(block.pos);
      if (updatedBlock.type === 0) {
        clearInterval(swingInterval);
        bot.emit("diggingCompleted", block);
        bot.targetDigBlock = null;
        bot.removeListener(eventName, onBlockUpdate);
      }
    }
  }

  function canDigBlock(block) {
    return block.diggable && block.pos.offset(0.5, 0.5, 0.5).distanceTo(bot.entity.position) < 6;
  }

  bot.activateItem = activateItem;
  bot.deactivateItem = deactivateItem;
  bot.activateBlock = activateBlock;
  bot.startDigging = startDigging;
  bot.canDigBlock = canDigBlock;
}