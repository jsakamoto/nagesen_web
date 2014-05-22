var express = require('express'),
    path = require('path'),
    app = express(),
    router = express.Router(),
    qrCode = require('qrcode-npm/qrcode'),
    morgan = require('morgan');

app.use(morgan());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/static', express.static(__dirname + '/static'));
app.use('/', router);


app.get('/', function (req, res) {
  res.render('index');
});

app.get('/box', function (req, res) {
  res.render('box');
});

var server = app.listen(process.env.PORT || 3000, function() {
  console.log('Listening on port %d...', server.address().port);
});

app.get('/qr', function (req, res) {
  var size = 4;
  var qr = qrCode.qrcode(4, 'M');
  qr.addData(req.headers.host);
  qr.make(); 

  if (req.query.s && isFinite(req.query.s)) {
    size = +req.query.s;
    if (size > 20) size = 20;
    if (size < 1 ) size = 1;
  }

  res.render('qr', { imgTag: qr.createImgTag(size) });
});

var io = require('socket.io').listen(server, {'log level': 1});

io.configure(function() {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 20);
});

io.sockets.on('connection', function(socket) {

  socket.on('dummy', function(data) { console.log('dummy'); });

  socket.on('nagesen', function(data) {
    console.log('handle_nagesen', data);
    val_type = '';
    if (typeof data === 'string') {
      val_type = data;
    } else if ( data && typeof data === 'object' ) {
      val_type = data['val_type'];
    }

    if ( val_type ) {
      console.log('throw nagesen type:', val_type);
      socket.broadcast.emit('box', { 'val_type': val_type });
    }
  });
});


