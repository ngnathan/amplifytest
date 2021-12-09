import API, { GRAPHQL_AUTH_MODE, GraphQLResult } from '@aws-amplify/api';

import {
	Blog,
	GetBlogQuery,
	ListBlogsQueryVariables,
	ListBlogsQuery,
	CreateBlogInput,
	CreateBlogMutation,
	UpdateBlogInput,
	UpdateBlogMutation
} from 'src/API';
import * as mutations from 'src/graphql/mutations';
import * as queries from 'src/graphql/queries';
import { setGraphQLError } from 'src/utils/amplify';

// ==============================
// ===== GraphQL Queries

export const getBlog = async (blogId: string, isAuthenticated?: boolean): Promise<Blog | null> => {
	try {
		const queryResponse = (await API.graphql({
			query: queries.getBlog,
			variables: { id: blogId },
			authMode: isAuthenticated ? GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS : GRAPHQL_AUTH_MODE.AWS_IAM
		})) as GraphQLResult<GetBlogQuery>;
		const query = queryResponse.data as GetBlogQuery;
		const blog = (query.getBlog as Blog) ?? null;
		return blog;
	} catch (error) {
		throw setGraphQLError('getBlog', error);
	}
};

export const listBlogs = async (input?: ListBlogsQueryVariables, isAuthenticated?: boolean): Promise<[Blog[], string | null]> => {
	try {
		const queryResponse = (await API.graphql({
			query: queries.listBlogs,
			variables: input,
			authMode: isAuthenticated ? GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS : GRAPHQL_AUTH_MODE.AWS_IAM
		})) as GraphQLResult<ListBlogsQuery>;
		const query = queryResponse.data as ListBlogsQuery;
		const blogs = query.listBlogs?.items as Blog[];
		const nextToken = query.listBlogs?.nextToken ?? null;
		return [blogs, nextToken];
	} catch (error) {
		throw setGraphQLError('listBlogs', error);
	}
};

// ==============================
// ===== GraphQL Mutations

export const createBlogMutation = async (input?: CreateBlogInput): Promise<Blog | null> => {
	const mutationResponse = (await API.graphql({
		query: mutations.createBlog,
		variables: { input },
		authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
	})) as GraphQLResult<CreateBlogMutation>;
	const mutation = mutationResponse.data as CreateBlogMutation;
	const blog = mutation.createBlog as Blog;
	return blog;
};

export const updateBlogMutation = async (input?: UpdateBlogInput): Promise<Blog | null> => {
	const mutationResponse = (await API.graphql({
		query: mutations.updateBlog,
		variables: { input },
		authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
	})) as GraphQLResult<UpdateBlogMutation>;
	const mutation = mutationResponse.data as UpdateBlogMutation;
	const blog = mutation.updateBlog as Blog;
	return blog;
};

export const deleteBlogMutation = async (blogId: string): Promise<void> => {
	await API.graphql({
		query: mutations.deleteBlog,
		variables: { input: { id: blogId } },
		authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
	});
};

// ==============================
// ===== Client Functions

export const createBlog = async (input: CreateBlogInput): Promise<Blog | null> => {
	try {
		return await createBlogMutation(input);
	} catch (error) {
		throw setGraphQLError('createBlog', error);
	}
};

export const updateBlog = async (input: UpdateBlogInput): Promise<Blog | null> => {
	try {
		return await updateBlogMutation(input);
	} catch (error) {
		throw setGraphQLError('updateBlog', error);
	}
};

export const deleteBlog = async (blogId: string): Promise<void> => {
	// Delete blog
	try {
		await deleteBlogMutation(blogId);
	} catch (error) {
		throw setGraphQLError('deleteBlog', error);
	}
};
