import {GraphQLEnumType} from 'graphql';

const Region = new GraphQLEnumType({
	name: 'Region',
	description: 'Region with specific content',
	values: {
		UK: {
			value: 'uk',
			description: 'United Kingdom'
		},
		US: {
			value: 'us',
			description: 'United States of America'
		}
	}
});

const ContentType = new GraphQLEnumType({
	name: 'ContentType',
	description: 'Story type, e.g. article, live blog, video, infographic, etc.',
	values: {
		Article: {
			value: 'article',
			description: 'Basic article'
		},
		LiveBlog: {
			value: 'liveblog',
			description: 'LiveBlog with updates'
		}
	}
});

const LiveBlogStatus = new GraphQLEnumType({
	name: 'LiveBlogStatus',
	description: 'State of the live blog, i.e. coming soon / in progress / closed',
	values: {
		ComingSoon: {
			value: 'comingsoon',
			description: 'Live blog will start, there are no updates'
		},
		InProgress: {
			value: 'inprogress',
			description: 'LiveBlog is currently being updated'
		},
		Closed: {
			value: 'closed',
			description: 'LiveBlog is over'
		}
	}
});

export default {
	Region,
	ContentType,
	LiveBlogStatus
};
