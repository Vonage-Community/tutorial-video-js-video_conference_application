# Create a node backend server

For our video conference application we need a backend server that will create sessions, provide credentials and start archiving.

If you just want to learn how to build a server for Opentok you can learn from the [Official Github Repository](https://github.com/opentok/opentok-node/blob/main/sample/HelloWorld/README.md). 

## Prerequisites

* Nodejs (12+).
* Opentok project apikey and secret.

If you don't already have it, [create your Video API account](https://tokbox.com/account/user/signup). Then you can create you project to get `apikey` and `secret`.

## Setup

```bash
npm init -y
npm install opentok express dotenv
touch index.js
```

We will also install `nodemon` to automatically restart the server when we make changes.

```bash
npm install -D nodemon
```

In `package.json` add the following in the `scripts` section:

```json
    "watch": "nodemon",
    "start": "node index.js"
```

In file `index.js` add the following code:

```node
require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenTok = require('opentok');
const port = process.env.port || 3000;

const app = express();
const opentok = new OpenTok(process.env.API_KEY, process.env.API_SECRET);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Frontend serving code goes here

app.post('/api/create', (req, res) => {
  opentok.createSession(
    {
      mediaMode: "routed"
    },
    function (err, session) {
      if (err) {
        res.status(500).send({error: 'createSession error'});
        return;
      }
      token = opentok.generateToken(session.sessionId);
      res.setHeader('Content-Type', 'application/json');
      res.send({
        sessionId: session.sessionId,
      });
    }
  );
});

app.post('/api/credentials', (req, res) => {
  const sessionId = req.body.sessionId;
  const token = opentok.generateToken(sessionId);
  res.send({
    sessionId: sessionId,
    apiKey: process.env.API_KEY,
    token: token
  });
})

// Archiving Code goes here

app.listen(port, () => {
  console.log(`App running on port: ${port}`);
});
```

This is all we need to get started. But we would also want to serve our frontend code from our server. We will put our frontend code in a folder called `public`. We will then serve the frontend code with `express.static`. In the code above we will add the following code in place of `// Frontend serving code goes here`:

```node
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
})

app.get('/session/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  res.sendFile(path.join(__dirname + '/public/call.html'));
})
```

In our application we have two pages: `index.html` and `call.html`. `index.html` will serve the page with preview and username. `call.html` will serve the page with the video call.

We will also add archiving functionality to our server. We will add the following code in place of `// Archiving Code goes here`:

```node
app.post('/api/archive/start/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;
  const time = new Date().toLocaleString();
  let archiveOptions = {
    name: `archive-${time}`,
    outputMode: 'composed',
    layout: {
      type: "bestFit",
      screenshareType: "pip"
    }
  }

  opentok.startArchive(sessionId, archiveOptions, function(err, archive) {
    if(err) {
      return res.status(500).send(err);
    }
    return res.json(archive);
  });
})

app.post('/api/archive/:archiveId/stop', (req, res) => {
  const archiveId = req.params.archiveId;
  opentok.stopArchive(archiveId, function(err, archive) {
    if(err) {
      return res.status(500).send({
        archiveId: archiveId,
        error: err
      });
    }
    return res.json(archive);
  });
})
```

Setting up archiving is not complete with the server. We also need to setup archiving for our project in the Project Dashboard. Setup a suitable storage for archive using the [instructions here](https://tokbox.com/developer/guides/archiving/#storage). In this example I am using a [S3 bucket](https://aws.amazon.com/s3). You can learn more about setting up a [S3 storage for Tokbox in this document](https://tokbox.com/developer/guides/archiving/using-s3.html). 

## Starting the server

We can start the server with nodemon by running `npm run watch`. This will automatically restart the server on port `3000` when we make changes.

## Next Steps

For building a functioning video conference application we got all we need server side. There are many other functionalities that we are not adding in this tutorial, but you can learn about them all in the [Official Docs](https://tokbox.com/developer/sdks/node/).

