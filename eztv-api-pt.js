"use strict";

const cheerio = require("cheerio");
const req = require("request");

const defaultOptions = {
  "baseUrl": "https://eztv.ag/",
  "timeout": 3 * 1000
};

module.exports = class EZTV {

  constructor(options = defaultOptions, debug = false) {
    this.request = req.defaults(options);
    this.debug = debug;

    this.eztvMap = {
      "10-oclock-live": "10-o-clock-live",
      "battlestar-galactica": "battlestar-galactica-2003",
      "house-of-cards-2013": "house-of-cards",
      "black-box": "the-black-box",
      "brooklyn-nine-nine": "brooklyn-ninenine",
      "cracked": "cracked-2013",
      "golden-boy": "golden-boy-2013",
      "hank": "hank-2009",
      "hawaii-five-0-2010": "hawaii-fiveo-2010",
      "legit": "legit-2013",
      "louie": "louie-2010",
      "marvels-agent-carter": "marvel-s-agent-carter",
      "marvels-agents-of-shield": "marvel-s-agents-of-s-h-i-e-l-d",
      "marvels-avengers-assemble": "marvel-s-avengers-assemble",
      "marvels-daredevil": "marvel-s-daredevil",
      "marvels-guardians-of-the-galaxy": "marvel-s-guardians-of-the-galaxy",
      "power-2014": "power",
      "reign": "reign-2013",
      "resurrection-us": "resurrection",
      "scandal-us": "scandal-2012",
      "the-fosters": "the-fosters-2013",
      "the-goldbergs": "the-goldbergs-2013",
      "the-good-guys": "the-good-guys-2010",
      "the-killing": "the-killing-us",
      "the-office": "the-office-us",
      "vikings-us": "vikings"
    };

    this.imdbMap = {
      "tt0093036": "tt3074694",
      "tt0102517": "tt1657505",
      "tt0264270": "the-late-late-show",
      "tt0288918": "big-brother-s-little-brother",
      "tt0413541": "big-brother-s-big-mouth",
      "tt0432648": "celebrity-fit-club-2005",
      "tt0983782": "thank-god-you-re-here",
      "tt1038686": "dominion",
      "tt1039922": "la-ink",
      "tt1083958": "the-pickup-artist",
      "tt1095158": "the-paper",
      "tt1136131": "cheerleader-u",
      "tt1190536": "black-dynamite",
      "tt1198108": "the-chopping-block-2009",
      "tt1262762": "mark-loves-sharon",
      "tt1277979": "hole-in-the-wall",
      "tt1312022": "time-warp",
      "tt1360544": "paris-hilton-s-british-best-friend",
      "tt1371997": "hows-your-news",
      "tt1380582": "missing",
      "tt1405169": "newswipe-with-charlie-brooker",
      "tt1470539": "you-have-been-watching",
      "tt1536736": "john-safran-s-race-relations",
      "tt1607037": "gordon-s-great-escape",
      "tt1538090": "frankie-neffe",
      "tt1673792": "boston-med",
      "tt1717499": "onion-news-network",
      "tt1724572": "the-suspicions-of-mr-whicher",
      "tt1786826": "get-out-alive-with-bear-grylls",
      "tt1803123": "royal-institution-christmas-lectures",
      "tt1886866": "chemistry-2011",
      "tt1926955": "young-james-herriot",
      "tt2069311": "fry-s-planet-word",
      "tt2091762": "the-celebrity-apprentice-australia",
      "tt1989007": "feasting-on-waves",
      "tt2141186": "derek",
      "tt2151670": "planet-earth-live",
      "tt2171637": "the-story-of-musicals",
      "tt2272367": "loiter-squad",
      "tt2292521": "hooters-dream-girls",
      "tt2297363": "duets-2012",
      "tt2317255": "the-secret-policeman-s-ball",
      "tt2346091": "earthflight",
      "tt2724068": "boston-s-finest",
      "tt2788282": "bikinis-boardwalks",
      "tt2814102": "weed-country",
      "tt2936390": "tt2069449",
      "tt2947494": "brooklyn-da",
      "tt3351392": "long-way-round",
      "tt3394574": "the-great-christmas-light-fight",
      "tt3475768": "duck-quacks-don-t-echo-uk",
      "tt3529910": "victoria-wood-s-nice-cup-of-tea",
      "tt3689584": "satisfaction",
      "tt3713876": "kirstie-s-handmade-christmas",
      "tt3888812": "shannons-legends-of-motorsport",
      "tt4135218": "tt1930315",
      "tt4370492": "tt0106179",
      "tt4453314": "jail-las-vegas",
      "tt4472994": "the-strange-case-of-the-law",
      "tt4563714": "louis-theroux",
      "tt4614532": "walking-through-history",
      "tt4726488": "homes-by-the-sea",
      "tt4883746": "ali-g-rezurection",
      "tt4903026": "topp-country",
      "tt4908908": "carol-klein-s-plant-odysseys",
      "tt4930646": "epic-attractions",
      "tt5006660": "tt5090150",
      "tt5013506": "masterchef-new-zealand",
      "tt5047494": "dash-dolls",
      "tt5072140": "sex-diaries",
      "tt5133970": "building-cars-live",
      "tt5176246": "tiny-house-world",
      "tt5397520": "dark-net",
      "tt5489746": "evil-lives-here"
    };
  };

  getAllShows(retry = true) {
    const url = "showlist/";
    if (this.debug) console.warn(`Making request to: ${url}.`);
    return new Promise((resolve, reject) => {
      this.request(url, (err, res, body) => {
        if (err && retry) {
          if (this.debug) console.warn(`${err.code} trying again.`);
          return resolve(this.getAllShows(false));
        } else if (err) {
          return reject(err);
        } else if (!body || res.statusCode >= 400) {
          return reject(new Error(`No data found for link: '${url}', statusCode: ${res.statusCode}`));
        } else {
          const $ = cheerio.load(body);
          const eztvMap = this.eztvMap;

          const allShows = [];
          $(".thread_link").each(function () {
            const show = $(this).text();
            const id = $(this).attr("href").match(/\/shows\/(.*)\/(.*)\//)[1];
            let slug = $(this).attr("href").match(/\/shows\/(.*)\/(.*)\//)[2];
            slug = slug in eztvMap ? eztvMap[slug] : slug;
            allShows.push({show: show, id: id, slug: slug});
          });

          return resolve(allShows);
        }
      });
    });
  };

  getShowData(data, retry = true) {
    const url = `shows/${data.id}/${data.slug}/`;
    if (this.debug) console.warn(`Making request to: ${url}.`);
    return new Promise((resolve, reject) => {
      this.request(url, (err, res, body) => {
        if (err && retry) {
          if (this.debug) console.warn(`${err.code} trying again.`);
          return resolve(this.getShowData(data, false));
        } else if (err) {
          return reject(err);
        } else if (!body || res.statusCode >= 400) {
          return reject(new Error(`No data found for slug: '${data.slug}', statusCode: ${res.statusCode}`));
        } else {
          const $ = cheerio.load(body);

          let imdb = $("div[itemtype='http://schema.org/AggregateRating']").find("a[target='_blank']").attr("href");
          if (imdb) {
            imdb = imdb.match(/\/title\/(.*)\//)[1];
            imdb = imdb in this.imdbMap ? this.imdbMap[imdb] : imdb;
            data.slug = imdb;
          }

          data.episodes = {};
          $("tr.forum_header_border[name='hover']").each(function () {
            const title = $(this).children("td").eq(1).text().replace("x264", "");
            const magnet = $(this).children("td").eq(2).children("a.magnet").first().attr("href");
            if (magnet === null) return true;

            const seasonBased = /S?0*(\d+)?[xE]0*(\d+)/;
            const dateBased = /(\d{4}).(\d{2}.\d{2})/;
            const vtv = /(\d{1,2})[x](\d{2})/;
            const quality = title.match(/(\d{3,4})p/) ? title.match(/(\d{3,4})p/)[0] : "480p";

            let season, episode;
            const torrent = {
              url: magnet,
              seeds: 0,
              peers: 0,
              provider: "EZTV"
            };

            if (title.match(seasonBased) || title.match(vtv)) {
              season = parseInt(title.match(seasonBased)[1], 10);
              episode = parseInt(title.match(seasonBased)[2], 10);
              data.episodes.dateBased = false;
            } else if (title.match(dateBased)) {
              season = title.match(dateBased)[1];
              episode = title.match(dateBased)[2].replace(/\s/g, "-");
              data.episodes.dateBased = true;
            }

            if (season && episode) {
              if (!data.episodes[season]) data.episodes[season] = {};
              if (!data.episodes[season][episode]) data.episodes[season][episode] = {};
              if (!data.episodes[season][episode][quality] || title.toLowerCase().indexOf("repack") > -1) data.episodes[season][episode][quality] = torrent;
              }
            });

          return resolve(data);
        }
      });
    });
  };

};
