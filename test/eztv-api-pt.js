'use strict'

/* eslint-disable no-unused-expressions */
// Import the necessary modules.
const { expect } = require('chai')
const EztvApi = require('../eztv-api-pt')

/** @test {EztvApi} */
describe('EztvApi', () => {
  /**
   * The EztvApi instance.
   * @type {EztvApi}
   */
  let eztv

  /**
   * A normal show.
   * @type {Show}
   */
  let show

  /**
   * A non-existent show.
   * @type {show}
   */
  let falseShow

  /**
   * A date based show.
   * @type {Show}
   */
  let dateBasedShow

  /**
   * A show with no episodes.
   * @type {Show}
   */
  let noEpisodesShow

  /**
   * A show with no magnet links.
   * @type {Show}
   */
  let noMagnetShow

  /**
   * Hook for setting up the EztvApi tests.
   * @type {Function}
   */
  before(() => {
    eztv = new EztvApi()

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

  /**
   * Test the show attributes.
   * @param {Show} show - The show to test.
   * @returns {undefined}
   */
  function testShowAttributes(show) {
    expect(show).to.be.an('object')
    expect(show.show).to.be.a('string')
    expect(show.id).to.be.a('number')
    expect(show.slug).to.be.a('string')
  }

  /** @test {EztvApi#getAllShows} */
  it('should get a list of tv shows', done => {
    eztv.getAllShows().then(res => {
      expect(res).to.be.an('array')
      expect(res.length).to.be.at.least(1)

      const random = Math.floor(Math.random() * res.length)
      testShowAttributes(res[random])

      done()
    }).catch(done)
  })

  /** @test {EztvApi#getShowData} */
  it('should get a show', done => {
    // For branch coverage.
    eztv = new EztvApi()
    eztv.getShowData(show).then(res => {
      testShowAttributes(res)
      expect(res.imdb).to.be.a('string')
      expect(res.episodes).to.be.an('object')

      done()
    }).catch(done)
  })

  /** @test {EztvApi#getShowEpisodes} */
  it('should search for a show', done => {
    eztv.getShowEpisodes(show).then(res => {
      testShowAttributes(res)
      expect(res.episodes).to.be.an('object')

      done()
    }).catch(done)
  })

  /** @test {EztvApi#getShowData} */
  it('should get a date based show', done => {
    eztv.getShowData(dateBasedShow).then(res => {
      testShowAttributes(res)
      expect(res.imdb).to.be.a('string')
      expect(res.episodes).to.be.an('object')

      done()
    }).catch(done)
  })

  /** @test {EztvApi#getShowData} */
  it('should get a show with no episodes', done => {
    eztv.getShowData(noEpisodesShow).then(res => {
      testShowAttributes(res)
      expect(res.imdb).to.be.a('string')
      expect(res.episodes).to.be.undefined

      done()
    }).catch(done)
  })

  /** @test {EztvApi#getShowData} */
  it('should get a show with no magnet links', done => {
    eztv.getShowData(noMagnetShow).then(res => {
      testShowAttributes(res)
      expect(res.imdb).to.be.a('string')
      expect(res.episodes).to.be.an('object')

      done()
    }).catch(done)
  })

  /** @test {EztvApi#getShowData} */
  it('should fail to get a show', done => {
    eztv.getShowData(falseShow).then(done).catch(err => {
      expect(err).to.be.an('Error')
      done()
    })
  })
})
