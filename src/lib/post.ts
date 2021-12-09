import API, { GRAPHQL_AUTH_MODE, GraphQLResult } from '@aws-amplify/api';
import { Storage } from 'aws-amplify';

import {
	Post,
	GetPostQuery,
	ListPostsQueryVariables,
	ListPostsQuery,
	CreatePostInput,
	CreatePostMutation,
	UpdatePostInput,
	UpdatePostMutation
} from 'src/API';
import { getAuthenticatedUser } from 'src/contexts/AuthContext';
import * as mutations from 'src/graphql/mutations';
import * as queries from 'src/graphql/queries';
import { setGraphQLError } from 'src/utils/amplify';

// ==============================
// ===== GraphQL Queries

export const getPost = async (postId: string, isAuthenticated?: boolean): Promise<Post | null> => {
	try {
		const queryResponse = (await API.graphql({
			query: queries.getPost,
			variables: { id: postId },
			authMode: isAuthenticated ? GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS : GRAPHQL_AUTH_MODE.AWS_IAM
		})) as GraphQLResult<GetPostQuery>;
		const query = queryResponse.data as GetPostQuery;
		const post = (query.getPost as Post) ?? null;
		return post;
	} catch (error) {
		throw setGraphQLError('getPost', error);
	}
};

export const listPosts = async (input?: ListPostsQueryVariables, isAuthenticated?: boolean): Promise<[Post[], string | null]> => {
	try {
		const queryResponse = (await API.graphql({
			query: queries.listPosts,
			variables: input,
			authMode: isAuthenticated ? GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS : GRAPHQL_AUTH_MODE.AWS_IAM
		})) as GraphQLResult<ListPostsQuery>;
		const query = queryResponse.data as ListPostsQuery;
		const posts = query.listPosts?.items as Post[];
		const nextToken = query.listPosts?.nextToken ?? null;
		return [posts, nextToken];
	} catch (error) {
		throw setGraphQLError('listPosts', error);
	}
};

// ==============================
// ===== GraphQL Mutations

export const createPostMutation = async (input?: CreatePostInput): Promise<Post | null> => {
	const mutationResponse = (await API.graphql({
		query: mutations.createPost,
		variables: { input },
		authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
	})) as GraphQLResult<CreatePostMutation>;
	const mutation = mutationResponse.data as CreatePostMutation;
	const post = mutation.createPost as Post;
	return post;
};

export const updatePostMutation = async (input?: UpdatePostInput): Promise<Post | null> => {
	const mutationResponse = (await API.graphql({
		query: mutations.updatePost,
		variables: { input },
		authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
	})) as GraphQLResult<UpdatePostMutation>;
	const mutation = mutationResponse.data as UpdatePostMutation;
	const post = mutation.updatePost as Post;
	return post;
};

export const deletePostMutation = async (postId: string): Promise<void> => {
	await API.graphql({
		query: mutations.deletePost,
		variables: { input: { id: postId } },
		authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
	});
};

// ==============================
// ===== Client Functions

export const createPost = async (input: CreatePostInput): Promise<Post | null> => {
	try {
		return await createPostMutation(input);
	} catch (error) {
		throw setGraphQLError('createPost', error);
	}
};

export const updatePost = async (input: UpdatePostInput): Promise<Post | null> => {
	try {
		return await updatePostMutation(input);
	} catch (error) {
		throw setGraphQLError('updatePost', error);
	}
};

export const deletePost = async (postId: string): Promise<void> => {
	// Delete post
	try {
		await deletePostMutation(postId);
	} catch (error) {
		throw setGraphQLError('deletePost', error);
	}
};
