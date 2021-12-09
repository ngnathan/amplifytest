import { useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import {
	AmplifyProvider,
	Button,
	Card,
	Text,
	Heading,
	Flex,
	useTheme,
	Authenticator,
	Table,
	TableBody,
	TableRow,
	TableCell
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Amplify from '@aws-amplify/core';

import { CreateBlogInput, CreateCommentInput, CreatePostInput } from './API';
import awsExports from './aws-exports';
import { AuthProvider } from './contexts/AuthContext';
import useAuth from './hooks/useAuth';
import { createBlog } from './lib/blog';
import { createPost } from './lib/post';
import { createComment } from './lib/comment';
import { theme } from './theme';
import * as subscriptions from './graphql/subscriptions';
import { useBlogs } from './hooks/useBlog';
import { usePosts } from './hooks/usePost';
import { useComments } from './hooks/useComment';

Amplify.configure(awsExports);

const Main = () => {
	const { user } = useAuth();
	const { tokens } = useTheme();
	const { blogs } = useBlogs();
	const { posts } = usePosts();
	const { comments } = useComments();

	const handleCreateBlog = async () => {
		const input: CreateBlogInput = {
			name: 'Blog'
		};
		const createdBlog = await createBlog(input);
		console.log('createdBlog', createdBlog);
	};

	const handleCreatePost = async () => {
		const input: CreatePostInput = {
			title: 'Post',
			blogPostsId: blogs && blogs.length > 0 ? blogs[0].id : undefined
		};
		const createdPost = await createPost(input);
		console.log('createdPost', createdPost);
	};

	const handleCreateComment = async () => {
		const input: CreateCommentInput = {
			content: 'Comment',
			postCommentsId: posts && posts.length > 0 ? posts[0].id : undefined
		};
		const createdComment = await createComment(input);
		console.log('createdComment', createdComment);
	};

	useEffect(() => {
		const subscription = API.graphql(graphqlOperation(subscriptions.onCreateBlog))
			// @ts-ignore
			.subscribe({
				next: ({ provider, value }: any) => console.log({ provider, value }),
				error: (error: any) => console.warn(error)
			});
		return () => {
			subscription.unsubscribe();
		};
	}, []);

	return user ? (
		<Card>
			<Flex direction='column' alignItems='flex-start'>
				<Flex direction='column' gap={tokens.space.xs}>
					<Heading level={3}>Blog</Heading>
					<Flex direction='row' alignItems='center'>
						<Button variation='primary' onClick={() => handleCreateBlog()}>
							Create Blog
						</Button>
					</Flex>
					<Text>Blogs</Text>
					<Table size='large' variation='bordered'>
						<TableBody>
							{blogs &&
								blogs.length > 0 &&
								blogs.map((blog) => (
									<TableRow key={blog.id}>
										<TableCell>{blog.id}</TableCell>
										<TableCell>{blog.name}</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
				</Flex>
				<Flex direction='column' gap={tokens.space.xs}>
					<Heading level={3}>Post</Heading>
					<Flex direction='row' alignItems='center'>
						<Button variation='primary' onClick={() => handleCreatePost()}>
							Create Post
						</Button>
					</Flex>
					<Text>Posts</Text>
					<Table size='large' variation='bordered'>
						<TableBody>
							{posts &&
								posts.length > 0 &&
								posts.map((post) => (
									<TableRow key={post.id}>
										<TableCell>{post.id}</TableCell>
										<TableCell>{post.title}</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
				</Flex>
				<Flex direction='column' gap={tokens.space.xs}>
					<Heading level={3}>Comment</Heading>
					<Flex direction='row' alignItems='center'>
						<Button variation='primary' onClick={() => handleCreateComment()}>
							Create Comment
						</Button>
					</Flex>
					<Text>Comments</Text>
					<Table size='large' variation='bordered'>
						<TableBody>
							{comments &&
								comments.length > 0 &&
								comments.map((comment) => (
									<TableRow key={comment.id}>
										<TableCell>{comment.id}</TableCell>
										<TableCell>{comment.content}</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
				</Flex>
			</Flex>
		</Card>
	) : (
		<Text>Please sign in</Text>
	);
};

export default function App() {
	return (
		<AmplifyProvider theme={theme}>
			<AuthProvider>
				<Authenticator>
					{({ signOut, user }) => (
						<main>
							<h1>Hello {user.username}</h1>
							<button onClick={signOut}>Sign out</button>
						</main>
					)}
				</Authenticator>
				<Main />
			</AuthProvider>
		</AmplifyProvider>
	);
}
