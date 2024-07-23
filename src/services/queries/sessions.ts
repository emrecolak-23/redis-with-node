import type { Session } from '$services/types';
import { sessionsCacheKey } from '$services/keys';
import { client } from '$services/redis';

export const getSession = async (id: string) => {
	const session = await client.hGetAll(sessionsCacheKey(id));

	if (Object.keys(session).length === 0) {
		console.log('Session not found, respond with 404');
		return null;
	}

	return deserialize(id, session);
};

export const saveSession = async (session: Session) => {
	return await client.hSet(sessionsCacheKey(session.id), serialize(session));
};

const serialize = (session: Session) => {
	return {
		userId: session.userId,
		username: session.username
	};
};

const deserialize = (id: string, session: { [key: string]: string }) => {
	return {
		id,
		userId: session.userId,
		username: session.username
	};
};
