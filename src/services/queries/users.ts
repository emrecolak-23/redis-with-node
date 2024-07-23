import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';
import { client } from '$services/redis';
import { usersCacheKey, usernamesUniqueCacheKey, usernamesCacheKey } from '$services/keys';

export const getUserByUsername = async (username: string) => {
	// Use the username argumanet to look up the persons userId
	// with usernames sorted set
	const decimalId = await client.zScore(usernamesCacheKey(), username);

	// make sure we actually got an id from the lookup
	if (!decimalId) {
		throw new Error('User does not exist');
	}

	// take the id and convert it back to hex
	const userId = decimalId.toString(16);
	// use the id to look up the user in the users hash
	const user = await client.hGetAll(usersCacheKey(userId));

	// deserialize and return the hash
	return deserialize(userId, user);
};

export const getUserById = async (id: string) => {
	const user = await client.hGetAll(usersCacheKey(id));
	return deserialize(id, user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
	const userId = genId();

	// See if the username is already in the set of usernames
	const exists = await client.sIsMember(usernamesUniqueCacheKey(attrs.username), attrs.username);

	// If so, throw an error
	if (exists) {
		throw new Error('Username already exists');
	}
	// Otherwise, continue with the creation of the user

	await Promise.all([
		client.hSet(usersCacheKey(userId), serialize(attrs)),
		client.sAdd(usernamesUniqueCacheKey(attrs.username), attrs.username),
		client.zAdd(usernamesCacheKey(), {
			value: attrs.username,
			score: parseInt(userId, 16)
		})
	]);

	return userId;
};

const serialize = (user: CreateUserAttrs) => {
	return {
		username: user.username,
		password: user.password
	};
};

const deserialize = (id: string, user: { [key: string]: string }) => {
	return {
		id,
		username: user.username,
		password: user.password
	};
};
