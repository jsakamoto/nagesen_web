// must preload jquery
// must preload Box2dWeb-2.1.a.3

var CONFIG = {
  fps: 60.0,
  scale: 30.0,
  canvas: document.getElementById('canvas'),
  mouseEnable: false,
  size: {
    'radius_10y': 20.0,
    'radius_aori': 15.0,
  },
  asset: {
    'imgUrl_10y':  '/static/img/coin.png',
    'imgUrl_aori': '/static/img/stone.png',
    'seUrl_10y':   '/static/se/yen.mp3',
    'seUrl_aori':  '/static/se/coin.mp3',
    'seUrl_1up':   '/static/se/1up.wav',
    'seUrl_lvup':  '/static/se/levelup.wav',
  }
};

CONFIG.asset.img_10y = resizeImage(CONFIG.asset.imgUrl_10y,   2 * CONFIG.size.radius_10y);
CONFIG.asset.img_aori = resizeImage(CONFIG.asset.imgUrl_aori, 2 * CONFIG.size.radius_aori);


var b2 = {
    Vec2          : Box2D.Common.Math.b2Vec2
  , AABB          : Box2D.Collision.b2AABB
  , BodyDef       : Box2D.Dynamics.b2BodyDef
  , Body          : Box2D.Dynamics.b2Body
  , FixtureDef    : Box2D.Dynamics.b2FixtureDef
  , Fixture       : Box2D.Dynamics.b2Fixture
  , World         : Box2D.Dynamics.b2World
  , MassData      : Box2D.Collision.Shapes.b2MassData
  , PolygonShape  : Box2D.Collision.Shapes.b2PolygonShape
  , CircleShape   : Box2D.Collision.Shapes.b2CircleShape
  , DebugDraw     : Box2D.Dynamics.b2DebugDraw
  , MouseJointDef : Box2D.Dynamics.Joints.b2MouseJointDef
};


function sleep(ms) {
  var d1 = new Date().getTime();
  var d2 = new Date().getTime();

  while ( d2 < d1 + ms ) {
    d2 = new Date().getTime();
  }
}


// 参考：http://elicon.blog57.fc2.com/blog-entry-109.html
function resizeImage(src, new_size) {
  var image_data = new Image();

  var img0 = new Image();
  img0.onload = function () {
    var canvas0 = document.createElement('canvas');

    var width = img0.naturalWidth;
    var height = img0.naturalHeight;
    var chouhen = (width>=height) ? width : height;
    if (chouhen < new_size){
        var canvaswidth  = width;
        var canvasheight = height;
    }
    else{
        var canvaswidth  = parseFloat(new_size)/chouhen * width;
        var canvasheight = parseFloat(new_size)/chouhen * height;
    }
    canvas0.width = parseInt(canvaswidth);
    canvas0.height = parseInt(canvasheight);

    var context = canvas0.getContext("2d");
    context.drawImage(img0, 0, 0, canvaswidth, canvasheight);
    image_data.src = canvas0.toDataURL("image/png");
  }
  img0.src = src;


  return image_data;
}

function createStage(world) {
  var width  = CONFIG.canvas.width;
  var height = CONFIG.canvas.height;
  var scale = CONFIG.scale;

  var fixDef = new b2.FixtureDef;
  fixDef.density  = 1.0;    // 密度
  fixDef.friction = 0.5;    // 摩擦係数
  fixDef.restitution = 0.4; // 反発係数

  var bodyDef = new b2.BodyDef;
  // 固定オブジェクト
  bodyDef.type = b2.Body.b2_staticBody;
  fixDef.shape = new b2.PolygonShape;

  // 壁の厚さ
  var tinSize = 2 / scale;

  // 壁の座標
  // top, right, bottom, left 
  var wallXs = [width / 2,
                width + tinSize / 2,
                width / 2,
                0 - tinSize / 2];
  var wallYs = [-height - tinSize / 2,
                0,
                height + tinSize / 2,
                0];

  for (i in wallXs) {
    tx = wallXs[i] / scale;
    ty = wallYs[i] / scale;
    wallWtin = (i % 2) ? tinSize : width / scale + tinSize * 2;
    wallHtin = (i % 2) ? height * 2 / scale + tinSize * 2 : tinSize;

    fixDef.shape.SetAsBox(wallWtin, wallHtin);
    bodyDef.position.Set(tx, ty);
    world.CreateBody(bodyDef).CreateFixture(fixDef);
  }
}

function createCircle(world, mx, my, radius, img, playFunc) {
  var scale = CONFIG.scale;

  var fixDef = new b2.FixtureDef;
  fixDef.density  = 1.0;     // 密度
  fixDef.friction = 0.5;     // 摩擦係数
  fixDef.restitution = 0.4;  // 反発係数
  fixDef.shape = new b2.CircleShape( radius / scale );

  var bodyDef = new b2.BodyDef;
  // 動的オブジェクト
  bodyDef.type = b2.Body.b2_dynamicBody;

  bodyDef.position.x = mx / scale;
  bodyDef.position.y = my / scale;
  bodyDef.userData = {img: img, radius: radius};

  world.CreateBody(bodyDef).CreateFixture(fixDef);

  // SE
  if (playFunc) {
    playFunc();
  }
}

function createPlayFunc(src) {
  return function () { (new Audio(src)).play(); };
}

function getDrawDebug(world) {
  var debugDraw = new b2.DebugDraw();
  debugDraw.SetSprite(CONFIG.canvas.getContext('2d'));
  debugDraw.SetDrawScale(CONFIG.scale);
  debugDraw.SetFillAlpha(0.5);
  debugDraw.SetLineThickness(1.0);
  //debugDraw.SetFlags(b2.DebugDraw.e_shapeBit | b2.DebugDraw.e_jointBit);
  debugDraw.SetFlags( b2.DebugDraw.e_jointBit );
  return debugDraw;
}

function getElementPosition(element) {
  var elem = element;
  var tagname = "";
  var x = 0;
  var y = 0;

  while( (typeof(elem) == "object") &&
         (typeof(elem.tagName) != "undefined") ) {
    y += elem.offsetTop;
    x += elem.offsetLeft;
    tagname = elem.tagName.toUpperCase();

    if (tagname == "BODY") {
      elem = 0;
    }

    if ( (typeof(elem) == "object") &&
         (typeof(elem.offsetParent) == "object") ) {
      elem = elem.offsetParent;
    }
  }

  return {x: x, y: y};
}

function getMouseData(world, clickFunc) {
  var pos = {x: undefined, y: undefined};
  var mouseData = {isMouseDown: false, joint: undefined, pos: pos};
  var canvasPosition = getElementPosition( document.getElementById('canvas') );
  var scale = CONFIG.scale;
  var handleMouseMove = function (e) {
    pos.x =  (e.clientX - canvasPosition.x) / scale;
    pos.y =  (e.clientY - canvasPosition.y) / scale;
  };

  var getBodyAtMouse = function() {
    var mVec = new b2.Vec2(pos.x, pos.y);
    var selectBody = undefined;
    var aabb = new b2.AABB();
    aabb.lowerBound.Set(pos.x - 0.001, pos.y - 0.001);
    aabb.upperBound.Set(pos.x + 0.001, pos.y + 0.001);

    world.QueryAABB(function(fixture) {
      if ( fixture.GetBody().GetType() != b2.Body.b2_staticBody &&
           fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mVec) ) {
        selectBody = fixture.GetBody();
        return false;
      }
      return true;
    }, aabb);
    return selectBody;
  };

  document.addEventListener("mousedown", function(e) {
    handleMouseMove(e);

    if (0 <= pos.x * scale && pos.x * scale < CONFIG.canvas.width &&
        0 <= pos.y * scale && pos.y * scale < CONFIG.canvas.height ) {
      mouseData.isMouseDown = true;
      document.addEventListener("mousemove", handleMouseMove, true);
    }
  }, true);


  document.addEventListener("mouseup", function(e) {
    document.removeEventListener("mousemove", handleMouseMove, true);

    if ( CONFIG.mouseEnable && mouseData.isMouseDown && !mouseData.joint && clickFunc ) {
      clickFunc( pos.x * scale, pos.y * scale );
    }

    mouseData.isMouseDown = false;
    pos.x = undefined;
    pos.y = undefined;
  }, true);

  mouseData.loopAction = function() { 
    if ( mouseData.isMouseDown && !(mouseData.joint) ) {
      var body = getBodyAtMouse();
      if (body) {
        var md = new b2.MouseJointDef();
        md.bodyA = world.GetGroundBody();
        md.bodyB = body;

        md.target.Set(pos.x, pos.y);
        md.collideConnected = true;
        md.maxForce = 300.0 * body.GetMass();
        mouseData.joint = world.CreateJoint(md);
        body.SetAwake(true);
      }
    }

    if ( mouseData.joint ) {
      if ( mouseData.isMouseDown ) {
        mouseData.joint.SetTarget( new b2.Vec2(pos.x, pos.y) );
      } else {
        world.DestroyJoint( mouseData.joint );
        mouseData.joint = undefined;
      }
    }
  };

  return mouseData;
}

function startBox( ) {
  var world = new b2.World(
      new b2.Vec2(0, 9.8), // 重力方向
      true                 // Sleepの可否(?)
  );
  var mouseData = undefined;

  createStage(world);

  world.throw10y = function(mx, my) {
    createCircle(world, mx, my,
        CONFIG.size.radius_10y,
        CONFIG.asset.img_10y,
        createPlayFunc( CONFIG.asset.seUrl_10y ));
  };


  world.throwAori = function(mx, my) {
    createCircle(world, mx, my,
        CONFIG.size.radius_aori,
        CONFIG.asset.img_aori,
        createPlayFunc( CONFIG.asset.seUrl_aori ));
  };

  world.throwRandom10y = function() {
    var r = CONFIG.size.radius_10y;
    world.throw10y(
      r + Math.random() * (CONFIG.canvas.width - r),
      -r );
  };

  world.throwRandomAori = function() {
    var r = CONFIG.size.radius_aori;
    world.throwAori(
      r + Math.random() * (CONFIG.canvas.width - r),
      -r );
  };

  world.resetBox = function() {
    destroyBodyArray = [];
    for ( var bodyItem = world.GetBodyList();
          bodyItem;
          bodyItem = bodyItem.GetNext() ) {
      if (bodyItem.GetType() == b2.Body.b2_dynamicBody) {
        destroyBodyArray.push(bodyItem);
      }
    }

    for ( var i in destroyBodyArray ) {
      world.DestroyBody( destroyBodyArray[i] );
    }
  }
  
  world.getCoinCounts = function() {
    var vals = { '10y': 0, 'aori': 0 };

    for ( var bodyItem = world.GetBodyList();
          bodyItem;
          bodyItem = bodyItem.GetNext() ) {
      if (bodyItem.GetType() == b2.Body.b2_dynamicBody) {
        var userData = bodyItem.GetUserData();
        if ( userData && userData.radius ) {
          var r = userData.radius;
          if ( r == CONFIG.size['radius_10y'] ) {
            vals['10y'] += 1;
          }
          else if ( r == CONFIG.size['radius_aori'] ) {
            vals['aori'] += 1;
          }
        }
      }
    }

    return vals;
  }

  world.SetDebugDraw(getDrawDebug());
  mouseData = getMouseData(world, world.throw10y);

  window.setInterval(function() {

    if (mouseData) {
      mouseData.loopAction();
    }

    world.Step(
      1 / CONFIG.fps,
      10,
      10 
    );

    var context = CONFIG.canvas.getContext('2d');

    context.clearRect(0, 0, b2.width, b2.height);
    world.DrawDebugData();
    world.ClearForces();

    for ( var bodyItem = world.GetBodyList();
         bodyItem;
         bodyItem = bodyItem.GetNext() )
    {
      if ( bodyItem.GetType() == b2.Body.b2_dynamicBody ) {
        var pos = bodyItem.GetPosition();

        context.save();
        var userData = bodyItem.GetUserData();
        if ( userData && userData.img && userData.img.complete ) {
          var slideX = pos.x * CONFIG.scale;
          var slideY = pos.y * CONFIG.scale;

          context.translate(slideX, slideY);
          context.rotate( bodyItem.GetAngle() );
          context.drawImage( userData.img, -userData.radius, -userData.radius);
        }
        context.restore();
      }
    }
  }, 1000 / CONFIG.fps);


  return world;
}

