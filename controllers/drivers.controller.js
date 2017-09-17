const Driver = require('../models/driver');

module.exports = {
  index(req, res, next) {
    const { lng, lat } = req.query;
    Driver.geoNear(
      { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      { spherical: true, maxDistance: 200000 }
    )
      .then(drivers => res.send(drivers))
      .catch(next);
  },

  create(req, res, next) {
    const driverProps = req.body;

    Driver.create(driverProps)
      .then(newDriver => res.send(newDriver))
      .catch(next);
  },

  update(req, res, next) {
    const driverId = req.params.id;
    const driverProps = req.body;

    Driver.findByIdAndUpdate(driverId, driverProps, { new: true })
      .then(driver => res.send(driver))
      .catch(next);
  },

  remove(req, res, next) {
    const driverId = req.params.id;
    Driver.findByIdAndRemove(driverId)
      .then(deletedDriver => res.status(204).send(deletedDriver))
      .catch(next);
  },

  // Dummy route for testing
  greeting(req, res) {
    res.send({ hi: 'there' });
  }
};