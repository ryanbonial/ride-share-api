const assert = require('assert');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');

const Driver = mongoose.model('driver');

describe('Drivers controller tests', () => {
  it('can POST to the /api/drivers endpoint to create a new driver', done => {
    Driver.count().then(count => {
      request(app)
        .post('/api/drivers')
        .send({ email: 'test@example.com' }) // send() sets the body
        .end((err, resp) => {
          const newDriver = resp.body;
          assert(newDriver._id.toString() !== '');
          assert(!newDriver.driving);
          Driver.count().then(newCount => {
            assert(newCount === count + 1);
            done();
          });
        });
    });
  });

  it('can PUT to /api/drivers/:id updates a driver', done => {
    const driver = new Driver({ email: 't@t.com', driving: false });
    driver.save().then(() => {
      request(app)
        .put(`/api/drivers/${driver._id}`)
        .send({ driving: true })
        .end(() => {
          Driver.findOne({ email: 't@t.com' })
            .then(driver => {
              assert(driver.driving === true);
              done();
            });
        });
    });
  });

  it('can DELETE to /api/drivers/:id and remove from the db', done => {
    const driver = new Driver({ email: 't@t.com', driving: false });
    driver.save().then(() => {
      request(app)
        .delete(`/api/drivers/${driver._id}`)
        .end(() => {
          Driver.count({ _id: driver._id })
            .then(count => {
              assert(count === 0);
              done();
            });
        });
    });
  });

  it('can GET to /api/drivers to get nearby drivers', done => {
    const seattleDriver = new Driver({
      email: 'seattle@test.com',
      geometry: {
        type: 'Point',
        coordinates: [-122.4759902, 47.6147628]
      }
    });
    const miamiDriver = new Driver({
      email: 'miami@test.com',
      geometry: {
        type: 'Point',
        coordinates: [-80.253, 25.791]
      }
    });

    Promise.all([seattleDriver.save(), miamiDriver.save()])
      .then(() => {
        request(app)
          .get('/api/drivers?lng=-80&lat=25')
          .end((err, resp) => {
            assert(resp.body.length = 1);
            assert(resp.body[0].obj.email === 'miami@test.com');
            done();
          });
      });
  });
});