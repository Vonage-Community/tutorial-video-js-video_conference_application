require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenTok = require('opentok');

const port = process.env.port || 3000;

const app = express();
const opentok = new OpenTok(process.env.API_KEY, process.env.API_SECRET);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/public/index.html`));
});

app.get('/session/:sessionId', (req, res) => {
  res.sendFile(path.join(`${__dirname}/public/call.html`));
});

app.post('/api/create', (req, res) => {
  opentok.createSession(
    {
      mediaMode: 'routed',
    },
    (err, session) => {
      if (err) {
        res.status(500).send({ error: 'createSession error' });
        return;
      }
      res.setHeader('Content-Type', 'application/json');
      res.send({
        sessionId: session.sessionId,
      });
    },
  );
});

app.post('/api/credentials', (req, res) => {
  const { sessionId } = req.body;
  const token = opentok.generateToken(sessionId);
  res.send({
    sessionId,
    apiKey: process.env.API_KEY,
    token,
  });
});

app.post('/api/archive/start/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const time = new Date().toLocaleString();
  const archiveOptions = {
    name: `archive-${time}`,
    outputMode: 'composed',
    layout: {
      type: 'bestFit',
      screenshareType: 'pip',
    },
  };

  opentok.startArchive(sessionId, archiveOptions, (err, archive) => {
    if (err) {
      return res.status(500).send(err);
    }
    return res.json(archive);
  });
});

app.post('/api/archive/:archiveId/stop', (req, res) => {
  const { archiveId } = req.params;
  opentok.stopArchive(archiveId, (err, archive) => {
    if (err) {
      return res.status(500).send({
        archiveId,
        error: err,
      });
    }
    return res.json(archive);
  });
});

app.get('/api/archive/list', (req, res) => {
  opentok.listArchives({ count: 10 }, (err, archive) => {
    if (err) {
      return res.status(500).send(err);
    }
    return res.json(archive);
  });
});

app.listen(port, () => {
  console.log(`App running on port: ${port}`);
});
