// Import the necessary modules.
/* eslint-disable no-unused-expressions */
const { expect } = require('chai')

const EztvApi = require('..')

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

  /**
   * Test the response object of a getTorrent response.
   * @param {ApiResponse} res - The response object to test.
   * @returns {undefined}
   */
  function testGetTorrentsAttributes(res) {
    expect(res).to.be.an('object')
    expect(res.torrents_count).to.be.a('number')
    expect(res.limit).to.be.a('number')
    expect(res.page).to.be.a('number')

    expect(res.torrents).to.be.an('array')
    expect(res.torrents.length).to.be.at.least(1)
    testTorrentAttributes(res.torrents)
  }

  /**
   * Test the torrent attributes.
   * @param {Array<Torrent>} torrents - The torrent to test.
   * @returns {undefined}
   */
  function testTorrentAttributes(torrents) {
    const random = Math.floor(Math.random() * torrents.length)
    const toTest = torrents[random]

    expect(toTest.id).to.be.a('number')
    expect(toTest.hash).to.be.a('string')
    expect(toTest.filename).to.be.a('string')
    expect(toTest.episode_url).to.be.a('string')
    expect(toTest.torrent_url).to.be.a('string')
    expect(toTest.magnet_url).to.be.a('string')
    expect(toTest.title).to.be.a('string')
    expect(toTest.imdb_id).to.be.a('string')
    expect(toTest.season).to.be.a('string')
    expect(toTest.episode).to.be.a('string')
    expect(toTest.small_screenshot).to.be.a('string')
    expect(toTest.large_screenshot).to.be.a('string')
    expect(toTest.seeds).to.be.a('number')
    expect(toTest.peers).to.be.a('number')
    expect(toTest.date_released_unix).to.be.a('number')
    expect(toTest.size_bytes).to.be.a('string')
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

  /** @test {EztvApi#getTorrents} */
  it('should get a list of torrents', done => {
    eztv.getTorrents({
      page: 1,
      limit: 10,
      imdb: '5016504'
    }).then(res => {
      testGetTorrentsAttributes(res)
      expect(res.imdb_id).to.be.a('string')

      done()
    }).catch(done)
  })

  /** @test {EztvApi#getTorrents} */
  it('should get a list of torrents with a standard imdb id', done => {
    eztv.getTorrents({
      imdb: 'tt5016504'
    }).then(res => {
      testGetTorrentsAttributes(res)
      expect(res.imdb_id).to.be.a('string')

      done()
    }).catch(done)
  })

  /** @test {EztvApi#getTorrents} */
  it('should get a list of torrents with the default parameters', done => {
    eztv.getTorrents().then(res => {
      testGetTorrentsAttributes(res)
      expect(res.imdb_id).to.be.undefined

      done()
    }).catch(done)
  })
})
