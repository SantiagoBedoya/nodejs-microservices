const express = require('express');

const service = express();
const Speakers = require('./lib/Speakers');

module.exports = (config) => {
  const log = config.log();
  const speakers = new Speakers(config.data.speakers);
  // Add a request logging middleware in development mode
  if (service.get('env') === 'development') {
    service.use((req, res, next) => {
      log.debug(`${req.method}: ${req.url}`);
      return next();
    });
  }

  service.use('/images/', express.static(config.data.images));

  service.get('/list', async (req, res, next) => {
    try {
      return res.json(await speakers.getList());
    } catch (error) {
      return next(error);
    }
  });

  service.get('/list-short', async (req, res, next) => {
    try {
      return res.json(await speakers.getListShort());
    } catch (error) {
      return next(error);
    }
  });

  service.get('/names', async (req, res, next) => {
    try {
      return res.json(await speakers.getNames());
    } catch (error) {
      return next(error);
    }
  });

  service.get('/artwork', async (req, res, next) => {
    try {
      return res.json(await speakers.getAllArtwork());
    } catch (error) {
      return next(error);
    }
  });

  service.get('/speaker/:shortName', async (req, res, next) => {
    const { shortName } = req.params;
    try {
      return res.json(await speakers.getSpeaker(shortName));
    } catch (error) {
      return next(error);
    }
  });

  service.get('/artwork/:shortName', async (req, res, next) => {
    const { shortName } = req.params;
    try {
      return res.json(await speakers.getArtworkForSpeaker(shortName));
    } catch (error) {
      return next(error);
    }
  });

  // eslint-disable-next-line no-unused-vars
  service.use((error, req, res, next) => {
    res.status(error.status || 500);
    // Log out the error to the console
    log.error(error);
    return res.json({
      error: {
        message: error.message,
      },
    });
  });
  return service;
};
