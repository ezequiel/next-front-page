import graphql from '../lib/graphql';

module.exports = function(req, res) {
	const useElasticSearch = res.locals.flags.elasticSearchItemGet.isSwitchedOn;
	const query = req.body;

	graphql(useElasticSearch).fetch(query)
	.then(data => {
		res.json(data);
	})
	.catch(errors => {
		res.status(400);
		res.json(errors);
	});
};
