var b2 = undefined;
var fps = 60.0;
var scale = 30.0;
var y10Radius = 20;
var aoriyenRadius = 15;

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
  // img0.src = image_data;
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

function createStage(b2) {
  var width  = b2.width;
  var height = b2.height;

  var fixDef = new b2.FixtureDef;
  fixDef.density  = 1.0;    // 密度
  fixDef.friction = 0.5;    // 摩擦係数
  fixDef.restitution = 0.4; // 反発係数

  var bodyDef = new b2.BodyDef;
  // 固定オブジェクト
  bodyDef.type = b2.Body.b2_staticBody;
  fixDef.shape = new b2.PolygonShape;

  // 壁の厚さ
  var tinSize = 2 / scale

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

    console.log(i, ': (tx, ty): ', tx, ',', ty,  ', wallW :', wallWtin, ', wallH :', wallHtin);

    fixDef.shape.SetAsBox(wallWtin, wallHtin);
    bodyDef.position.Set(tx, ty);
    b2.stageWorld.CreateBody(bodyDef).CreateFixture(fixDef);
  }
}


function createCircle(b2, mx, my, radius, img) {
  var width  = b2.width;
  var height = b2.height;
  var r = radius / scale;

  //var x = r * 2;
  var x = mx / scale;
  var y = my / scale;

  var fixDef = new b2.FixtureDef;
  fixDef.density  = 1.0;     // 密度
  fixDef.friction = 0.5;     // 摩擦係数
  fixDef.restitution = 0.4;  // 反発係数
  fixDef.shape = new b2.CircleShape( r );

  var bodyDef = new b2.BodyDef;
  // 動的オブジェクト
  bodyDef.type = b2.Body.b2_dynamicBody;

  bodyDef.position.x = x;
  bodyDef.position.y = y;
  bodyDef.userData = {img: img, radius: radius};

  b2.stageWorld.CreateBody(bodyDef).CreateFixture(fixDef);

  // SE
  (new Audio(b2.se['yen'].src)).play();
}

function createRandomCircle(b2, radius, img) {
  var x = radius + Math.random() * (b2.width - radius);
  var y = -radius;

  createCircle(b2, x, y, radius, img);
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

function settingMouse(b2) {
  b2.mouseX = undefined;
  b2.mouseY = undefined;
  var canvasPosition = getElementPosition(document.getElementById("canvas"));



  document.addEventListener("mousedown", function(e) {
    b2.isMouseDown = true;
    handleMouseMove(e);
    document.addEventListener("mousemove", handleMouseMove, true);
  }, true);


  document.addEventListener("mouseup", function(e) {
    document.removeEventListener("mousemove", handleMouseMove, true);

    if ( !b2.mouseJoint ) {
      createCircle(b2, b2.mouseX * scale, b2.mouseY * scale, y10Radius, b2.imgs['y10']);
    }


    b2.isMouseDown = false;
    b2.mouseX = undefined;
    b2.mouseY = undefined;
  }, true);

  function handleMouseMove(e) {
    b2.mouseX = (e.clientX - canvasPosition.x) / scale;
    b2.mouseY = (e.clientY - canvasPosition.y) / scale;

    console.log('handleMouseMove : (', b2.mouseX, ',', b2.mouseY, ')');
  };

  b2.getBodyAtMouse = function () {
    var mousePVec = new b2.Vec2(b2.mouseX, b2.mouseY);
    var selectedBody = null;
    var aabb = new b2.AABB();
    aabb.lowerBound.Set(b2.mouseX - 0.001, b2.mouseY - 0.001);
    aabb.upperBound.Set(b2.mouseX + 0.001, b2.mouseY + 0.001);

    b2.stageWorld.QueryAABB(function(fixture) {
      if ( fixture.GetBody().GetType() != b2.Body.b2_staticBody &&
           fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec) ) {
        selectedBody = fixture.GetBody();
        return false;
      }
      return true;
    }, aabb);
    return selectedBody;
  };
}

function loadContents(b2) {
  b2.imgs = {
    "y10":     resizeImage('/static/coin.png', y10Radius * 2),
    "aoriyen": resizeImage('/static/stone.png', 30)
  };

  b2.se = {
    "yen":     new Audio('/static/se/yen.mp3'),
    "coin":    new Audio('/static/se/coin.mp3'),
    "1up":     new Audio('/static/se/1up.wav'),
    "levelup": new Audio('/static/se/levelup.wav'),
  };
}

function newBox2D (width, height) {
  b2 = {
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


  loadContents(b2);

  b2.stageWorld = new b2.World(
    new b2.Vec2(0, 9.8),   // 重力方向
    true                   // sleepの可否(?)
  );

  b2.width = width;
  b2.height = height;
  b2.getBodyAtMouse = undefined;
  b2.isMouseDown = false;
  b2.mouseJoint = undefined;


  createStage(b2);

  for (var i = 0; i < 20; ++i) {
    createRandomCircle(b2, y10Radius, b2.imgs['y10']);
    createRandomCircle(b2, aoriyenRadius, b2.imgs['aoriyen']);
  }



  // context
  b2.canvas  = document.getElementById("canvas");
  b2.context = b2.canvas.getContext("2d");



  //setup debug draw
  var debugDraw = new b2.DebugDraw();
  debugDraw.SetSprite(b2.context);
  debugDraw.SetDrawScale(scale);
  debugDraw.SetFillAlpha(0.5);
  debugDraw.SetLineThickness(1.0);
  //debugDraw.SetFlags(b2.DebugDraw.e_shapeBit | b2.DebugDraw.e_jointBit);
  debugDraw.SetFlags( b2.DebugDraw.e_jointBit );
  b2.stageWorld.SetDebugDraw(debugDraw);

  settingMouse(b2);


  window.setInterval(update, 1000 / fps);

  return b2;
}

function update() {
  if (b2 && b2.getBodyAtMouse) {
    if ( b2.isMouseDown && !(b2.mouseJoint) ) {
      var body = b2.getBodyAtMouse();
      if (body) {
        var md = new b2.MouseJointDef();
        md.bodyA = b2.stageWorld.GetGroundBody();
        md.bodyB = body;

        console.log('BodyA:', md.bodyA, ', BodyB:', md.bodyB);
        md.target.Set(b2.mouseX, b2.mouseY);
        md.collideConnected = true;
        md.maxForce = 300.0 * body.GetMass();
        b2.mouseJoint = b2.stageWorld.CreateJoint(md);
        body.SetAwake(true);
      }
    }
  }

  if ( b2.mouseJoint ) {
    if ( b2.isMouseDown ) {
      b2.mouseJoint.SetTarget( new b2.Vec2(b2.mouseX, b2.mouseY) );
    } else {
      b2.stageWorld.DestroyJoint( b2.mouseJoint );
      b2.mouseJoint = undefined;
    }
  }

  if (b2 && b2.stageWorld) {
    b2.stageWorld.Step(
      1 / fps,
      20,
      20
    );
    b2.stageWorld.DrawDebugData();
    b2.stageWorld.ClearForces();

    // memo: http://gamedev.stackexchange.com/questions/27407/box2dweb-and-images
    // b2.context.clearRect(0, 0, b2.width, b2.height);


    var n = 0;
    for ( bodyItem = b2.stageWorld.GetBodyList();
          bodyItem;
          bodyItem = bodyItem.GetNext() )
    {
      if ( bodyItem.GetType() == b2.Body.b2_dynamicBody ) {
        var pos = bodyItem.GetPosition();


        //console.log(n++, ':', pos.x, ',', pos.y);
        b2.context.save();
        var userData = bodyItem.GetUserData();
        if (userData && userData.img && userData.img.complete )
        {
          var slideX = pos.x * scale;
          var slideY = pos.y * scale;
          b2.context.translate(slideX, slideY);
          b2.context.rotate( bodyItem.GetAngle() );
          b2.context.drawImage( userData.img, -userData.radius, -userData.radius);
        }

        //if ( b2.imgs['y10'].complete ) {
        //  var slideX = pos.x * scale;
        //  var slideY = pos.y * scale;
        //  b2.context.translate(slideX, slideY);
        //  b2.context.rotate( bodyItem.GetAngle() );
        //  b2.context.drawImage( b2.imgs['y10'], -y10Radius, -y10Radius);
        //  // b2.context.rotate( -bodyItem.GetAngle() );
        //  // b2.context.translate(-slideX, -slideY);
        //}
        b2.context.restore();
      }
    }
  }
}
