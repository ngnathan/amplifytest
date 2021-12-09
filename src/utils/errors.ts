interface Errors {
	generic: Error;
	createProfile: Error;
	updateProfile: Error;
	deleteProfile: Error;
	createPerson: Error;
	updatePerson: Error;
	deletePerson: Error;
	createChannel: Error;
	updateChannel: Error;
	deleteChannel: Error;
	createPlaylist: Error;
	updatePlaylist: Error;
	deletePlaylist: Error;
	createPlaylistItem: Error;
	updatePlaylistItem: Error;
	deletePlaylistItem: Error;
	createResource: Error;
	updateResource: Error;
	deleteResource: Error;
	createPost: Error;
	updatePost: Error;
	deletePost: Error;
	createVote: Error;
	updateVote: Error;
	deleteVote: Error;
	createAnnotation: Error;
	updateAnnotation: Error;
	deleteAnnotation: Error;
	createTopic: Error;
	updateTopic: Error;
	deleteTopic: Error;
}

const errors: Errors = {
	generic: new Error('There was an issue with the request. Please try again or contact support (support@cypherpod.com)'),
	createProfile: new Error('Your profile could not be created. Please try again or contact support (support@cypherpod.com)'),
	updateProfile: new Error('Your profile could not be updated. Please try again or contact support (support@cypherpod.com)'),
	deleteProfile: new Error('Your profile could not be deleted. Please try again or contact support (support@cypherpod.com)'),
	createPerson: new Error('The person could not be created. Please try again or contact support (support@cypherpod.com)'),
	updatePerson: new Error('The person could not be updated. Please try again or contact support (support@cypherpod.com)'),
	deletePerson: new Error('The person could not be deleted. Please try again or contact support (support@cypherpod.com)'),
	createChannel: new Error('Your channel could not be created. Please try again or contact support (support@cypherpod.com)'),
	updateChannel: new Error('Your channel could not be updated. Please try again or contact support (support@cypherpod.com)'),
	deleteChannel: new Error('Your channel could not be deleted. Please try again or contact support (support@cypherpod.com)'),
	createPlaylist: new Error('Your playlist could not be created. Please try again or contact support (support@cypherpod.com)'),
	updatePlaylist: new Error('Your playlist could not be updated. Please try again or contact support (support@cypherpod.com)'),
	deletePlaylist: new Error('Your playlist could not be deleted. Please try again or contact support (support@cypherpod.com)'),
	createPlaylistItem: new Error('Your playlist item could not be created. Please try again or contact support (support@cypherpod.com)'),
	updatePlaylistItem: new Error('Your playlist item could not be updated. Please try again or contact support (support@cypherpod.com)'),
	deletePlaylistItem: new Error('Your playlist item could not be deleted. Please try again or contact support (support@cypherpod.com)'),
	createResource: new Error('The resource could not be created. Please try again or contact support (support@cypherpod.com)'),
	updateResource: new Error('The resource could not be updated. Please try again or contact support (support@cypherpod.com)'),
	deleteResource: new Error('The resource could not be deleted. Please try again or contact support (support@cypherpod.com)'),
	createPost: new Error('Your post could not be created. Please try again or contact support (support@cypherpod.com)'),
	updatePost: new Error('Your post could not be updated. Please try again or contact support (support@cypherpod.com)'),
	deletePost: new Error('Your post could not be deleted. Please try again or contact support (support@cypherpod.com)'),
	createVote: new Error('Your vote could not be created. Please try again or contact support (support@cypherpod.com)'),
	updateVote: new Error('Your vote could not be updated. Please try again or contact support (support@cypherpod.com)'),
	deleteVote: new Error('Your vote could not be deleted. Please try again or contact support (support@cypherpod.com)'),
	createAnnotation: new Error('Your annotation could not be created. Please try again or contact support (support@cypherpod.com)'),
	updateAnnotation: new Error('Your annotation could not be updated. Please try again or contact support (support@cypherpod.com)'),
	deleteAnnotation: new Error('Your annotation could not be deleted. Please try again or contact support (support@cypherpod.com)'),
	createTopic: new Error('Your topic could not be created. Please try again or contact support (support@cypherpod.com)'),
	updateTopic: new Error('Your topic could not be updated. Please try again or contact support (support@cypherpod.com)'),
	deleteTopic: new Error('Your topic could not be deleted. Please try again or contact support (support@cypherpod.com)')
};

export default errors;
