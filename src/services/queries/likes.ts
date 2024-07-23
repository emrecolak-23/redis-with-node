import { client } from '$services/redis';
import { itemsCacheKey, userLikesCacheKey } from '$services/keys';
import { getItems } from './items';

export const userLikesItem = async (itemId: string, userId: string) => {
	return await client.sIsMember(userLikesCacheKey(userId), itemId);
};

export const likedItems = async (userId: string) => {
	// Fetch all the item IDs that the user likes
	const itemsIds = await client.sMembers(userLikesCacheKey(userId));
	// Fetch All the items hashes with those ids and return as an array
	return await getItems(itemsIds);
};

export const likeItem = async (itemId: string, userId: string) => {
	const inserted = await client.sAdd(userLikesCacheKey(userId), itemId);

	if (inserted) {
		return await client.hIncrBy(itemsCacheKey(itemId), 'likes', 1);
	}
};

export const unlikeItem = async (itemId: string, userId: string) => {
	const removed = await client.sRem(userLikesCacheKey(userId), itemId);

	if (removed) {
		return await client.hIncrBy(itemsCacheKey(itemId), 'likes', -1);
	}
};

export const commonLikedItems = async (userOneId: string, userTwoId: string) => {
	const ids = await client.sInter([userLikesCacheKey(userOneId), userLikesCacheKey(userTwoId)]);
	return await getItems(ids);
};
