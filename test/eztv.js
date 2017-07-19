'use strict'

const { expect } = require('chai')
const EZTV = require('../eztv-api-pt')

describe('EZTV', () => {
  let eztv, show, falseShow, dateBasedShow, noEpisodesShow, noMagnetShow

  before(() => {
    console.warn = () => {}
    eztv = new EZTV({
      debug: true
    })

    show = {
      show: 'Dark Net',
      id: 1597,
      slug: 'dark-net'
    }
    falseShow = {
      show: 'False Show Name',
      id: 12345,
      slug: 'false-show-name'
    }
    dateBasedShow = {
      show: '60 Minutes US',
      id: 817,
      slug: '60-minutes-us'
    }
    noEpisodesShow = {
      show: '2010 Vancouver Winter Olympics',
      id: 350,
      slug: '2010-vancouver-winter-olympics'
    }
    noMagnetShow = {
      show: 'Grimm',
      id: 556,
      slug: 'grimm'
    }
  })

  function testShowAttributes(show) {
    expect(show).to.be.an('object')
    expect(show.show).to.be.a('string')
    expect(show.id).to.be.a('number')
    expect(show.slug).to.be.a('string')
  }

  it('should get a list of tv shows', done => {
    eztv.getAllShows().then(res => {
      expect(res).to.be.an('array')
      expect(res.length).to.be.at.least(1)

      const random = Math.floor(Math.random() * res.length)
      testShowAttributes(res[random])

      done()
    }).catch(done)
  })

  it('should get a show', done => {
    eztv._debug = false
    eztv.getShowData(show).then(res => {
      testShowAttributes(res)
      expect(res.imdb).to.be.a('string')
      expect(res.episodes).to.be.an('object')

      done()
    }).catch(done)
  })

  it('should search for a show', done => {
    eztv.getShowEpisodes(show).then(res => {
      testShowAttributes(res)
      expect(res.episodes).to.be.an('object')

      done()
    }).catch(done)
  })

  it('should get a date based show', done => {
    eztv.getShowData(dateBasedShow).then(res => {
      testShowAttributes(res)
      expect(res.imdb).to.be.a('string')
      expect(res.episodes).to.be.an('object')

      done()
    }).catch(done)
  })

  it('should get a show with no episodes', done => {
    eztv.getShowData(noEpisodesShow).then(res => {
      testShowAttributes(res)
      expect(res.imdb).to.be.a('string')

      done()
    }).catch(done)
  })

  it('should get a show with no magnet links', done => {
    eztv.getShowData(noMagnetShow).then(res => {
      testShowAttributes(res)
      expect(res.imdb).to.be.a('string')
      expect(res.episodes).to.be.an('object')

      done()
    }).catch(done)
  })

  it('should fail to get a show', done => {
    eztv.getShowData(falseShow)
      .then(done)
      .catch(err => {
        expect(err).to.be.an('Error')
        done()
      })
  })
})
