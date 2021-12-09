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
import { useBlogsSubscription } from './hooks/useBlog';
import { usePostsSubscription } from './hooks/usePost';
import { useCommentsSubscription } from './hooks/useComment';
import { createBlog } from './lib/blog';
import { createPost } from './lib/post';
import { createComment } from './lib/comment';
import { theme } from './theme';

Amplify.configure(awsExports);

const Main = () => {
	const { user } = useAuth();
	const { tokens } = useTheme();
	const { blogs } = useBlogsSubscription();
	const { posts } = usePostsSubscription();
	const { comments } = useCommentsSubscription();

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
			blogPostsId: blogs.length > 0 ? blogs[0].id : undefined
		};
		const createdPost = await createPost(input);
		console.log('createdPost', createdPost);
	};
	const handleCreateComment = async () => {
		const input: CreateCommentInput = {
			content: 'Comment',
			postCommentsId: posts.length > 0 ? posts[0].id : undefined
		};
		const createdComment = await createComment(input);
		console.log('createdComment', createdComment);
	};

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
							{blogs.length > 0 &&
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
							{posts.length > 0 &&
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
							{comments.length > 0 &&
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
	const { user } = useAuth();

	console.log('user', user);
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
