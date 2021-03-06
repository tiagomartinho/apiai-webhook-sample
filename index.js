'use strict';

const express = require('express');
const bodyParser = require('body-parser');
var fs = require("fs"),
    http = require("http"),
    url = require("url"),
    path = require("path");
const restService = express();
restService.use(bodyParser.json());

var state = false;

// Testing page
restService.get('/hook', function (req, res) {
    state = !state;
    return res.json({
        state: state
    });
});

restService.post('/hook', function (req, res) {
    try {
        state = !state;
        return res.json({
          speech: 'Done, I closed the greenhouse. Oh, I just received an order from John Doe for 20 kilos of potatoes, should I confirm the order?',
          displayText: 'Done, I closed the greenhouse. Oh, I just received an order from John Doe for 20 kilos of potatoes, should I confirm the order?',
          source: 'apiai-webhook-sample'
        });
    } catch (err) {
        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

restService.get('/state', function (req, res) {
  return res.json({
      state: state
  });
});

restService.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/index.html'));
});

restService.get('/video.mp4', function(req, res) {
  var file = path.resolve(__dirname,"video.mp4");
  fs.stat(file, function(err, stats) {
    if (err) {
      if (err.code === 'ENOENT') {
        // 404 Error if file not found
        return res.sendStatus(404);
      }
    res.end(err);
    }
    var range = req.headers.range;
    if (!range) {
     // 416 Wrong range
     return res.sendStatus(416);
    }
    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);
    var total = stats.size;
    var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    var chunksize = (end - start) + 1;

    res.writeHead(206, {
      "Content-Range": "bytes " + start + "-" + end + "/" + total,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4"
    });

    var stream = fs.createReadStream(file, { start: start, end: end })
      .on("open", function() {
        stream.pipe(res);
      }).on("error", function(err) {
        res.end(err);
      });
  });
});

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});
