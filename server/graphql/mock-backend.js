import {Promise} from 'es6-promise';
import fetch from 'isomorphic-fetch';

import ApiClient from 'next-ft-api-client';
import articleGenres from 'ft-next-article-genre';

import pages from './fixtures/pages';
import searches from './fixtures/searches';
import byConcept from './fixtures/by-concept';
import popular from './fixtures/popular';
import liveblogs from './fixtures/liveblogs';

class Backend {
	constructor() {
		this.elasticSearch = true;
		this.type = 'mock';
	}

	page(uuid, sectionsId, ttl = 50) {
		const page = pages[uuid];

		if(page) {
			return Promise.resolve({
				id: uuid,
				title: page.title,
				sectionId: sectionsId,
				items: page.items
			});
		}

		ApiClient.pages({ uuid: uuid })
		.then(it => {
			const resp = { title: it.title, items: it.slice() };
			console.log(`Mock backend asked for a missing page: ${uuid}. Add this to pages.js to use current real response: \n'${uuid}': ${JSON.stringify(resp, null, 2)}`);
		});
	}

	byConcept(uuid, title, ttl = 50) {
		const concept = byConcept[uuid];

		if(concept) {
			return Promise.resolve({
				title: concept.title,
				conceptId: uuid,
				sectionId: null,
				items: concept.items
			});
		}

		return ApiClient.contentAnnotatedBy({
			uuid: uuid,
			useElasticSearch: this.elasticSearch
		})
		.then(it => {
			const resp = { title: it.title, items: it.slice() };

			console.log(`Mock backend asked for a missing content by concept: ${uuid}. Add this to by-concept.js to use current real response: \n'${uuid}': ${JSON.stringify(resp, null, 2)}`);
		});
	}

	search(query, ttl = 50) {
		const search = searches[query];

		if(search) return Promise.resolve(search);

		return ApiClient.searchLegacy({
			query: query,
			useLegacyContent: true,
			useElasticSearch: this.elasticSearch
		}).then(it => {
			console.log(`Mock backend asked for a search: "${query}". Add this to searches.js to use current real response: \n'${query}': ${JSON.stringify(it, null, 2)}`);
		});
	}

	popular(url, title, ttl = 50) {
		const pop = popular[url];

		if(pop) {
			return Promise.resolve({
				id: null,
				sectionId: null,
				title: title,
				items: pop
			})
		}

		return fetch(url)
		.then((response) => response.json())
		.then((data) => {
			return data.mostRead.pages.map(function (page) {
					var index = page.url.lastIndexOf("/");
					var id = page.url.substr(index + 1).replace('.html', '');
					return id;
			})
		}).then(it => {
			console.log(`Mock backend asked for popular items from: "${url}". Add this to popular.js to use current real response: \n'${url}': ${JSON.stringify(it, null, 2)}`);
		});
	}

	liveblogUpdates(uri) {
		const liveblog = liveblogs[uri];
		const extractUpdates = (json) => {
			const dated = json.filter(it => !!it.data.datemodified)
			const [first, second] = dated.slice(0, 2);

			if(first.data.datemodified < second.data.datemodified) { json.reverse(); }

			let [_, updates] = json.reduce(([skip, updates], event) => {
				if (event.data.event == 'msg' && event.data.mid && !skip[event.data.mid]) {
					updates.push(event);
					skip[event.data.mid] = true;
				}
				return [skip, updates];
			}, [{}, []]);

			return updates;
		}

		console.log("Mock backend fetching", uri);
		if(liveblog) {
			return Promise.resolve(liveblog).then(extractUpdates);
		}

		const then = new Date();

		return fetch(`${uri}?action=catchup&format=json`)
		.then(res => {
			const now = new Date();
			console.log("Fetching live blog took %d ms", now - then);

			return res;
		})
		.then(res => res.json())
		.then(json => {
			console.log(`Mock backend asked for live updates for blog: ${uri}. Add this to liveblogs.js to use current real response: \n'${uri}': ${JSON.stringify(json, null, 2)}`);
			return json;
		})
		.then(extractUpdates);
	}

	// Content endpoints are not mocked because the responses are massive.

	contentv1(uuids, {from, limit, genres}) {
		return ApiClient.contentLegacy({
			uuid: uuids,
			useElasticSearch: this.elasticSearch
		})
		.then(items => {
			if(genres && genres.length) {
				items = items.filter(it => genres.indexOf(articleGenres(it.item.metadata)) > -1);
			}

			items = (from ? items.slice(from) : items);
			items = (limit ? items.slice(0, limit) : items);

			return items;
		})
	}

	contentv2(uuids, {from, limit, genres}) {
		return ApiClient.content({
			uuid: uuids,
			useElasticSearch: this.elasticSearch
		})
		.then(items => {
			if(genres && genres.length) {
				items = items.filter(it => genres.indexOf(articleGenres(it.item.metadata)) > -1);
			}

			items = (from ? items.slice(from) : items);
			items = (limit ? items.slice(0, limit) : items);

			return items;
		});
	}


}

// expire old content after 10 minutes
const backend = new Backend();

export default backend;
