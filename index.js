'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const restService = express();
restService.use(bodyParser.json());

var state = false;

restService.post('/hook', function (req, res) {
    try {
        state = !state;
        return res.json({
          state: state,
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

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});
