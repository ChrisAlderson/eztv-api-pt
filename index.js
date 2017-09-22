// Import the necessary modules.
const cheerio = require('cheerio')
const debug = require('debug')
const got = require('got')
const { stringify } = require('querystring')

const { name } = require('./package')

/**
 * Show object which will be returned.
 * @typedef {Object} Show
 * @property {string} show The name of the show.
 * @property {number} id The eztv id of the show.
 * @property {string} slug The slug of the show.
 * @property {string} imdb The imdb code of the show.
 * @property {Object} episodes The episodes of the show.
 */

/**
 * The response object of the API call.
 * @typedef {Object} ApiResponse
 * @property {string} imdb_id The imdb id of the response.
 * @property {number} torrent_count The total number of torrents.
 * @property {number} limit The limit of the torrents response.
 * @property {number} page The page of the torrents response.
 * @property {Array<Torrent>} torrent The torrent of the response.
 */

/**
 * The model of the torrent object.
 * @typedef {Object} Torrent
 * @property {number} id The id of the torrent
 * @property {string} hash The hash of the torrent.
 * @property {string} filename The filename of the torrent.
 * @property {string} episode_url The episode url of the torrent.
 * @property {string} torrent_url The torrent url of the torrent.
 * @property {string} magnet_url The magnet url of the torrent.
 * @property {string} title The title of the torrent.
 * @property {string} imdb_id The imdb id of the torrent.
 * @property {number} season The season of the torrent.
 * @property {number} episode The episode of the torrent.
 * @property {string} small_screenshot The small screenshot of the torrent.
 * @property {string} large_screenshot The large screenshot of the torrent.
 * @property {number} seeds The seeds of the torrent.
 * @property {number} peers The peers of the torrent. 
 * @property {number} date_released_unix The epoch time the torrent was
 * released. 
 * @property {string} size_bytes The size of the torrent in bytes. 
 */

/**
 * An EZTV API wrapper to get data from eztv.ag.
 * @type {EztvApi}
 */
module.exports = class EztvApi {

  /**
   * Create a new instance of the module.
   * @param {!Object} config={} - The configuration object for the module.
   * @param {!string} baseUrl=https://eztv.ag/ - The base url of eztv.
   */
  constructor({baseUrl = 'https://eztv.ag/'} = {}) {
    /**
     * The base url of eztv.
     * @type {string}
     */
    this._baseUrl = baseUrl
    /**
     * Show extra output.
     * @type {Function}
     */
    this._debug = debug(name)

    /**
     * Maps the EZTV slugs to trakt.tv slugs.
     * @type {Object}
     */
    EztvApi._eztvMap = {
      '10-oclock-live': '10-o-clock-live',
      '24-hours-in-aande': '24-hours-in-a-e',
      '24ch-la-serie': '24ch',
      '60-minutes-us': '60-minutes',
      '999-whats-your-emergency': '999-what-s-your-emergency',
      'a-young-doctors-notebook': 'a-young-doctor-s-notebook',
      'accused-uk': 'accused',
      'ad-the-bible-continues': 'a-d-the-bible-continues-2015',
      'adam-devines-house-party': 'adam-devine-s-house-party',
      'after-paradise': 'bachelor-in-paradise-after-paradise-2015',
      'agatha-christies-partners-in-crime': 'agatha-christie-s-partners-in-crime',
      'andrew-marrs-history-of-the-world': 'andrew-marr-s-history-of-the-world',
      'arthur-and-george': 'arthur-george',
      'bad-education-uk': 'bad-education',
      'barabbas': 'barabbas-2013',
      'battlestar-galactica': 'battlestar-galactica-2003',
      'beach-eats-usa-with-curtis-stone': 'beach-eats-usa',
      'big-brothers-little-brother': 'big-brother-s-little-brother',
      'bikinis-and-boardwalks': 'bikinis-boardwalks',
      'black-box': 'the-black-box',
      'bobs-burgers': 'bob-s-burgers',
      'bonnie-and-clyde-2013': 'bonnie-clyde',
      'bostons-finest': 'boston-s-finest',
      'brad-neelys-harg-nallin-sclopio-peepio': 'brad-neely-s-harg-nallin-sclopio-peepio',
      'breathless-uk': 'breathless',
      'britains-got-more-talent': 'britain-s-got-more-talent',
      'britains-got-talent': 'britain-s-got-talent',
      'brooklyn-nine-nine': 'brooklyn-ninenine',
      'brooklyn-ninenine': 'brooklyn-nine-nine',
      'cant-pay-well-take-it-away': 'can-t-pay-well-take-it-away',
      'carol-kleins-plant-odysseys': 'carol-klein-s-plant-odysseys',
      'catastrophe-2008': 'catastrophe',
      'catherine-tates-nan': 'catherine-tate-s-nan',
      'charlie-brookers-screenwipe': 'charlie-brooker-s-weekly-wipe',
      'charlie-brookers-weekly-wipe': 'charlie-brooker-s-screenwipe',
      'charlies-angels-2011': 'charlie-s-angels-2011',
      'chicago-pd': 'chicago-p-d',
      'childrens-hospital-us': 'childrens-hospital',
      'coopers-treasure': 'cooper-s-treasure',
      'cops-lac': 'cops-l-a-c',
      'cracked': 'cracked-2013',
      'craig-ferguson-the-late-late-show-with': 'the-late-late-show-with-craig-ferguson',
      'da-vincis-demons': 'da-vinci-s-demons',
      'dancing-with-the-stars-us': 'dancing-with-the-stars',
      'dara-o-briains-science-club': 'dara-o-briain-s-science-club',
      'david-attenboroughs-africa': 'africa-2013',
      'david-attenboroughs-conquest-of-the-skies': 'david-attenborough-s-conquest-of-the-skies',
      'detroit-187': 'detroit-1-8-7',
      'diamond-jubilee-concert-2012': 'the-diamond-jubilee',
      'dick-clarks-new-years-rockin-eve-with-ryan-seacrest': 'dick-clark-s-new-year-s-rockin-eve-with-ryan-seacrest',
      'doll-and-em': 'doll-em',
      'dont-trust-the-b--in-apartment-23': 'don-t-trust-the-b-in-apartment-23',
      'duck-quacks-dont-echo-uk': 'duck-quacks-don-t-echo-2014-75919',
      'duets': 'duet-s',
      'eastbound-and-down': 'eastbound-down',
      'ellen-the-ellen-degeneres-show': 'ellen-the-ellen-degenere-s-show',
      'fat-tony-and-co': 'fat-tony-co',
      'food-network-star': 'the-next-food-network-star',
      'forever-us-2014': 'forever-2014',
      'frankie-and-neffe': 'frankie-neffe',
      'franklin-and-bash': 'franklin-bash',
      'frys-planet-word-': 'frys-planet-word',
      'get-out-alive-2013': 'get-out-alive',
      'gold-rush-alaska': 'gold-rush',
      'golden-boy': 'golden-boy-2013',
      'gordon-ramsays-ultimate-cookery-course': 'gordon-ramsay-s-ultimate-cookery-course',
      'gordons-great-escape': 'gordon-s-great-escape',
      'greys-anatomy': 'grey-s-anatomy',
      'hank': 'hank-2009',
      'harpers-island': 'harper-s-island',
      'harrys-law': 'harry-s-law',
      'hatfields-and-mccoys-2012': 'hatfields-mccoys',
      'hawaii-five-0-2010': 'hawaii-fiveo-2010',
      'hawaii-fiveo-2010': 'hawaii-five-0',
      'hells-kitchen-uk': 'hell-s-kitchen',
      'hells-kitchen-us': 'hell-s-kitchen-2005',
      'hemingway-and-gellhorn': 'hemingway-gellhorn',
      'hinterland-aka-y-gwyll': 'hinterland',
      'hit-and-miss': 'hit-miss',
      'hooten-and-the-lady': 'hooten-the-lady',
      'houdini-2014': 'houdini',
      'house-of-cards-2013': 'house-of-cards',
      'how-its-made': 'how-it-s-made',
      'hughs-war-on-waste': 'hugh-s-war-on-waste',
      'im-sorry': 'i-m-sorry',
      'intelligence-us': 'intelligence-2014',
      'iron-fist': 'marvel-s-iron-fist',
      'its-always-sunny-in-philadelphia': 'it-s-always-sunny-in-philadelphia',
      'james-mays-cars-of-the-people': 'james-may-s-cars-of-the-people',
      'jay-lenos-garage': 'jay-leno-s-garage',
      'john-safrans-race-relations': 'john-safran-s-race-relations',
      'jonathan-strange-and-mr-norrell': 'jonathan-strange-mr-norrell',
      'karl-pilkington-the-moaning-of-life': 'k-michelle-my-life',
      'kath-and-kim': 'kath-kim',
      'kc-undercover': 'k-c-undercover',
      'key-and-peele': 'key-peele',
      'kims-convenience': 'kim-s-convenience',
      'king-and-maxwell': 'king-maxwell',
      'kirsties-handmade-christmas': 'kirstie-s-handmade-christmas',
      'kmichelle-my-life': 'k-michelle-my-life',
      'labyrinth-2013': 'labyrinth',
      'last-man-standing-us': 'last-man-standing-201',
      'late-night-with-conan-obrien': 'late-night-with-conan-o-brien',
      'law-and-order-los-angeles': 'law-order-los-angeles',
      'law-and-order-special-victims-unit': 'law-order-special-victims-unit',
      'law-and-order-uk': 'law-order-uk',
      'law-and-order': 'law-order',
      'legit': 'legit-2013',
      'lego-star-wars-the-freemaker-adventures': 'lego-star-wars-the-freemaker-adventures-113185',
      'lewis-blacks-the-root-of-all-evil': 'lewis-black-s-root-of-all-evil',
      'life-documentary': 'life-2009',
      'lifes-too-short-uk': 'life-s-too-short',
      'louie': 'louie-2010',
      'love-and-hip-hop-atlanta': 'love-hip-hop-atlanta',
      'love-and-hip-hop-hollywood': 'love-hip-hop-hollywood',
      'love-and-hip-hop': 'love-hip-hop',
      'lucan-uk': 'lucan-2013',
      'lucas-bros-moving-company': 'lucas-bros-moving-co',
      'mad-love-': 'mad-love',
      'marvels-agent-carter': 'marvel-s-agent-carter',
      'marvels-agents-of-shield': 'marvel-s-agents-of-s-h-i-e-l-d',
      'marvels-avengers-assemble': 'marvel-s-avengers-assemble',
      'marvels-daredevil': 'marvel-s-daredevil',
      'marvels-guardians-of-the-galaxy': 'marvel-s-guardians-of-the-galaxy',
      'matador-us': 'matador-2014',
      'maya-and-marty': 'maya-marty',
      'mayday-uk-2013': 'mayday-2013',
      'melissa-and-joey': 'melissa-joey',
      'mike-and-molly': 'mike-molly',
      'million-dollar-listing': 'million-dollar-listing-los-angeles',
      'milo-murphys-law': 'milo-murphy-s-law',
      'mistresses-uk': 'mistresses-2008',
      'never-mind-the-buzzcocks-uk': 'never-mind-the-buzzcocks',
      'newgameplus': 'new-game-plus',
      'nick-swardsons-pretend-time': 'nick-swardson-s-pretend-time',
      'nuts-and-bolts': 'nuts-bolts',
      'oliver-stones-untold-history-of-the-united-states': 'oliver-stone-s-untold-history-of-the-united-states',
      'parades-end': 'parade-s-end',
      'paris-hiltons-british-best-friend': 'paris-hilton-s-british-best-friend',
      'penelope-keith-at-her-majestys-service': 'penelope-keith-at-her-majesty-s-service',
      'penn-and-teller-bullshit': 'penn-teller-bullshit',
      'penn-and-teller-fool-us': 'penn-teller-fool-us',
      'polar-bear-family-and-me': 'the-polar-bear-family-me',
      'power-2014': 'power',
      'prey-uk': 'prey-2014',
      'raised-by-wolves-uk': 'raised-by-wolves',
      'ramsays-costa-del-nightmares': 'ramsay-s-costa-del-nightmares',
      'reckless-us': 'reckless-2014',
      'reign': 'reign-2013',
      'resurrection-us': 'resurrection',
      'revolution-2012': 'revolution',
      'richard-hammonds-crash-course': 'richard-hammond-s-crash-course',
      'rizzoli-and-isles': 'rizzoli-isles',
      'ruby-and-the-rockits': 'ruby-the-rockits',
      'runs-house': 'run-s-house',
      'rush-us': 'rush-2014',
      'saf3-aka-rescue-3': 'saf3',
      'satisfaction-us': 'satisfaction-2014',
      'scandal-us': 'scandal-2012',
      'schitts-creek': 'schitt-s-creek',
      'scott-and-bailey': 'scott-bailey',
      'scott-baio-is-46and-pregnant': 'scott-baio-is-46-and-pregnant',
      'seth-meyers-late-night-with': 'late-night-with-seth-meyers',
      'sexanddrugsandrockandroll': 'sex-drugs-rock-roll',
      'shadowhunters-the-mortal-instruments': 'shadowhunters',
      'shit-my-dad-says': 'my-dad-says',
      'stan-lees-lucky-man': 'stan-lee-s-lucky-man',
      'startalk': 'startalk-with-neil-degrasse-tyson',
      'stephen-fry-gadget-man': 'gadget-man',
      'steve-austins-broken-skull-challenge': 'prey-2014',
      'steve-harveys-funderdome': 'steve-harvey-s-funderdome',
      'suprnova': 'supernova',
      'survivors-remorse': 'survivor-s-remorse',
      'talking-saul': 'talking-saul-2016',
      'taxi-brooklyn-us': 'axi-brooklyn',
      'thank-god-youre-here': 'thank-god-you-re-here',
      'the-bachelorette-australia': 'the-bachelorette-au',
      'the-black-box': 'black-box',
      'the-bridge-us': 'the-bridge-2013',
      'the-characters': 'netflix-presents-the-characters-2016',
      'the-chasers-war-on-everything': 'the-chaser-s-war-on-everything',
      'the-comedians-us': 'the-comedians-2015',
      'the-devils-whore': 'the-devil-s-whore',
      'the-directors-chair': 'the-director-s-chair',
      'the-fosters': 'the-fosters-2013',
      'the-goldbergs': 'the-goldbergs-2013',
      'the-good-guys': 'the-good-guys-2010',
      'the-great-british-menu': 'great-british-menu',
      'the-gruffalos-child': 'the-gruffalo-s-child',
      'the-handmaids-tale': 'the-handmaid-s-tale',
      'the-hour-uk-2011': 'the-hour-2011',
      'the-killing-us': 'the-killing-2011',
      'the-killing': 'the-killing-us',
      'the-la-complex': 'the-l-a-complex',
      'the-last-days-of-': 'the-last-days-of',
      'the-life-and-times-of-tim': 'the-life-times-of-tim',
      'the-missing-us-and-uk': 'the-missing',
      'the-mole-us': 'the-mole-2001',
      'the-office': 'the-office-us',
      'the-politicians-husband': 'the-politician-s-husband',
      'the-real-oneals': 'the-real-o-neals',
      'the-venture-brothers': 'the-venture-bros',
      'those-who-cant': 'those-who-can-t',
      'tim-and-erics-bedtime-stories': 'tim-and-eric-s-bedtime-stories',
      'tosh0': 'tosh-0',
      'tracey-ullmans-show': 'tracey-ullman-s-show',
      'truth-and-iliza': 'truth-iliza',
      'up-all-night-2011': 'up-all-night',
      'utopia-uk': 'utopia',
      'victoria-woods-nice-cup-of-tea': 'victoria-wood-s-nice-cup-of-tea',
      'vikings-us': 'vikings',
      'wabbit-a-looney-tunes-production': 'wabbit',
      'watson-and-oliver': 'watson-oliver',
      'whodunnit-2013': 'whodunnit',
      'xiii-the-series-2011': 'xiii-2011-34490',
      'young-and-hungry': 'young-hungry',
      'young-herriot': 'young-james-herriot',
      'youre-the-worst': 'you-re-the-worst',
      'zero-hour-us': 'zero-hour-2013'
    }
    /**
     * Maps the EZTV imdb codes to trakt.tv imdb codes.
     * @type {Object}
     */
    EztvApi._imdbMap = {
      tt0093036: 'tt3074694',
      tt0102517: 'tt1657505',
      tt0264270: 'the-late-late-show',
      tt0288918: 'big-brother-s-little-brother',
      tt0413541: 'big-brother-s-big-mouth',
      tt0432648: 'celebrity-fit-club-2005',
      tt0983782: 'thank-god-you-re-here',
      tt1038686: 'dominion',
      tt1039922: 'la-ink',
      tt1083958: 'the-pickup-artist',
      tt1095158: 'the-paper',
      tt1136131: 'cheerleader-u',
      tt1190536: 'black-dynamite',
      tt1198108: 'the-chopping-block-2009',
      tt1262762: 'mark-loves-sharon',
      tt1277979: 'hole-in-the-wall',
      tt1312022: 'time-warp',
      tt1360544: 'paris-hilton-s-british-best-friend',
      tt1371997: 'hows-your-news',
      tt1380582: 'missing',
      tt1405169: 'newswipe-with-charlie-brooker',
      tt1470539: 'you-have-been-watching',
      tt1536736: 'john-safran-s-race-relations',
      tt1607037: 'gordon-s-great-escape',
      tt1538090: 'frankie-neffe',
      tt1673792: 'boston-med',
      tt1717499: 'onion-news-network',
      tt1724572: 'the-suspicions-of-mr-whicher',
      tt1786826: 'get-out-alive-with-bear-grylls',
      tt1803123: 'royal-institution-christmas-lectures',
      tt1886866: 'chemistry-2011',
      tt1926955: 'young-james-herriot',
      tt2069311: 'fry-s-planet-word',
      tt2091762: 'the-celebrity-apprentice-australia',
      tt1989007: 'feasting-on-waves',
      tt2141186: 'derek',
      tt2151670: 'planet-earth-live',
      tt2171637: 'the-story-of-musicals',
      tt2272367: 'loiter-squad',
      tt2292521: 'hooters-dream-girls',
      tt2297363: 'duets-2012',
      tt2317255: 'the-secret-policeman-s-ball',
      tt2346091: 'earthflight',
      tt2724068: 'boston-s-finest',
      tt2788282: 'bikinis-boardwalks',
      tt2814102: 'weed-country',
      tt2936390: 'tt2069449',
      tt2947494: 'brooklyn-da',
      tt3351392: 'long-way-round',
      tt3394574: 'the-great-christmas-light-fight',
      tt3475768: 'duck-quacks-don-t-echo-uk',
      tt3529910: 'victoria-wood-s-nice-cup-of-tea',
      tt3689584: 'satisfaction',
      tt3713876: 'kirstie-s-handmade-christmas',
      tt3888812: 'shannons-legends-of-motorsport',
      tt4135218: 'tt1930315',
      tt4370492: 'tt0106179',
      tt4453314: 'jail-las-vegas',
      tt4472994: 'the-strange-case-of-the-law',
      tt4563714: 'louis-theroux',
      tt4614532: 'walking-through-history',
      tt4726488: 'homes-by-the-sea',
      tt4883746: 'ali-g-rezurection',
      tt4903026: 'topp-country',
      tt4908908: 'carol-klein-s-plant-odysseys',
      tt4930646: 'epic-attractions',
      tt5006660: 'tt5090150',
      tt5013506: 'masterchef-new-zealand',
      tt5047494: 'dash-dolls',
      tt5072140: 'sex-diaries',
      tt5133970: 'building-cars-live',
      tt5176246: 'tiny-house-world',
      tt5397520: 'dark-net',
      tt5489746: 'evil-lives-here'
    }
  }

  /**
   * Make a get request to eztv.ag.
   * @param {!string} endpoint - The endpoint to make the request to.
   * @param {?Object} query - The query parameters of the HTTP request.
   * @param {?boolean} raw - Get the raw body of the response.
   * @returns {Promise<Function, Error>} - The response body wrapped in
   * cheerio.
   */
  _get(endpoint, query = {}, raw = false) {
    const uri = `${this._baseUrl}${endpoint}`
    const opts = {
      query
    }

    this._debug(`Making request to: '${uri}?${stringify(query)}'`)

    if (raw) {
      opts.json = true
    }

    return got.get(uri, opts).then(({ body }) => {
      if (raw) {
        return body
      }

      return cheerio.load(body)
    })
  }

  /**
   * Get additional data from a show, like imdb codes and episodes.
   * @param {Show} data - The show you want additional data from.
   * @param {Function} $ - The cheerio function.
   * @returns {Show} - The show with additional data.
   */
  _getEpisodeData(data, $) {
    let imdb = $('div[itemtype="http://schema.org/AggregateRating"]')
      .find('a[target="_blank"]')
      .attr('href')
    imdb = imdb ? imdb.match(/\/title\/(.*)\//)[1] : undefined
    imdb = imdb in EztvApi._imdbMap ? EztvApi._imdbMap[imdb] : imdb
    if (imdb) {
      data.imdb = imdb
    }

    const table = 'tr.forum_header_border[name="hover"]'
    $(table).each(function () {
      const entry = $(this)
      const magnet = entry.children('td').eq(2)
        .children('a.magnet')
        .first()
        .attr('href')

      if (!magnet) {
        return
      }

      const seasonBased = /S?0*(\d+)[xE]0*(\d+)/i
      const dateBased = /(\d{4}).(\d{2}.\d{2})/i
      const title = entry.children('td').eq(1)
        .text()
        .replace('x264', '')
      let season
      let episode

      if (title.match(seasonBased)) {
        season = parseInt(title.match(seasonBased)[1], 10)
        episode = parseInt(title.match(seasonBased)[2], 10)
        data.dateBased = false
      } else if (title.match(dateBased)) {
        season = title.match(dateBased)[1]
        episode = title.match(dateBased)[2].replace(/\s/g, '-')
        data.dateBased = true
      } else {
        season = 0
        episode = 0
      }

      if (season && episode) {
        if (!data.episodes) {
          data.episodes = {}
        }

        if (!data.episodes[season]) {
          data.episodes[season] = {}
        }

        if (!data.episodes[season][episode]) {
          data.episodes[season][episode] = {}
        }

        const quality = title.match(/(\d{3,4})p/)
          ? title.match(/(\d{3,4})p/)[0]
          : '480p'

        const torrent = {
          url: magnet,
          seeds: 0,
          peers: 0,
          provider: 'EZTV'
        }

        if (
          !data.episodes[season][episode][quality] ||
          title.toLowerCase().indexOf('repack') > -1
        ) {
          data.episodes[season][episode][quality] = torrent
        }
      }
    })

    return data
  }

  /**
   * Get all the available shows from eztv.
   * @return {Promise<Array<Show>, Error>} - All the available shows from eztv.
   */
  getAllShows() {
    return this._get('showlist/').then($ => {
      const regex = /\/shows\/(.*)\/(.*)\//

      return $('.thread_link').map(function () {
        const entry = $(this)
        const href = entry.attr('href')

        const show = entry.text()
        const id = parseInt(href.match(regex)[1], 10)

        let slug = href.match(regex)[2]
        slug = slug in EztvApi._eztvMap ? EztvApi._eztvMap[slug] : slug

        return {
          show,
          id,
          slug
        }
      }).get()
    })
  }

  /**
   * Get episodes for a show.
   * @param {Show} data - Teh show to get episodes for.
   * @returns {Promise<Show, Error>} - The show with additional data.
   */
  getShowData(data) {
    return this._get(`shows/${data.id}/${data.slug}/`)
      .then($ => this._getEpisodeData(data, $))
  }

  /**
   * Search for episodes of a show.
   * @param {Show} data - The show to get episodes for.
   * @returns {Promise<Show, Error>} - The show with additional data.
   */
  getShowEpisodes(data) {
    return this._get('search/')
      .then($ => this._getEpisodeData(data, $))
  }

  /**
   * Get a list of torrents. 
   * @param {!Object} config={} - The config object of the method.
   * @param {!number} config.page=1 - The page of the API call.
   * @param {!number} config.limit=10 - The limit of the API call.
   * @returns {Promise<ApiResponse, Error>} - The response object of an API
   * call.
   */
  getTorrents({page = 1, limit = 30, imdb} = {}) {
    let imdbId
    if (typeof imdb === 'string' && imdb.startsWith('tt')) {
      imdbId = imdb.substring(2, imdb.length)
    } else {
      imdbId = imdb
    }

    return this._get('api/get-torrents', {
      page,
      limit,
      imdb_id: imdbId
    }, true)
  }

}
