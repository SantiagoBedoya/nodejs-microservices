const express = require('express');
const ServiceRegistry = require('./lib/ServiceRegistry');

const service = express();
// const ServiceRegistry = require('./ServiceRegistry');

module.exports = (config) => {
  const log = config.log();
  const serviceRegistry = new ServiceRegistry(log);
  // Add a request logging middleware in development mode
  if (service.get('env') === 'development') {
    service.use((req, res, next) => {
      log.debug(`${req.method}: ${req.url}`);
      return next();
    });
  }

  service.put('/register/:serviceName/:serviceVersion/:servicePort', (req, res) => {
    const { serviceName, serviceVersion, servicePort } = req.params;
    const serviceIp = req.connection.remoteAddress.includes('::') ? `[${req.connection.remoteAddress}]` : req.connection.remoteAddress;
    const serviceKey = serviceRegistry.register(
      serviceName,
      serviceVersion,
      serviceIp,
      servicePort,
    );
    return res.json({ result: serviceKey });
  });

  service.delete('/register/:serviceName/:serviceVersion/:servicePort', (req, res) => {
    const { serviceName, serviceVersion, servicePort } = req.params;
    const serviceIp = req.connection.remoteAddress.includes('::') ? `[${req.connection.remoteAddress}]` : req.connection.remoteAddress;
    const serviceKey = serviceRegistry.unregister(
      serviceName,
      serviceVersion,
      serviceIp,
      servicePort,
    );
    return res.json({ result: serviceKey });
  });

  service.get('/find/:serviceName/:serviceVersion', (req, res) => {
    const { serviceName, serviceVersion } = req.params;
    const svc = serviceRegistry.get(serviceName, serviceVersion);
    if (!svc) return res.status(404).json({ result: 'service not found' });
    return res.json(svc);
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
