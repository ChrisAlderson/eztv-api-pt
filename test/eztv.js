const chai = require('chai');
const assert = chai.assert;
const EZTV = require('../eztv-api-pt');

describe('EZTV', () => {

  let eztv, data, falseData;
  before(() => {
    eztv = new EZTV();

    data = {
      show: '10 O\'Clock Live',
      id: '449',
      slug: '10-o-clock-live'
    };

    falseData = {
      show: 'False Show Name',
      id: '12345',
      slug: 'false-show-name'
    };
  });

  it('Should get a list of tv shows', done => {
    eztv.getAllShows().then(res => {
      assert.isArray(res);
      done();
    }).catch(err => done(err));
  });

  it('Should get episodes of a tv show', done => {
    eztv.getShowData(data).then(res => {
      assert.isObject(res);
      done();
    }).catch(err => done(err));
  });

  it('Should get fail to get episodes of a tv show', done => {
    eztv.getShowData(falseData).then(res => {
      assert.isObject(res);
      done();
    }).catch(err => {
      assert.isOk(err);
      done();
    });
  });

});
