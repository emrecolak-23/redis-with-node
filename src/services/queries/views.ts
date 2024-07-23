import { client } from '$services/redis';
import { itemsCacheKey, itemsByViewsKey, itemsViewsKey } from '$services/keys';

export const incrementView = async (itemId: string, userId: string) => {
	return await client.incrementView(itemId, userId);
	// const inserted = await client.pfAdd(itemsViewsKey(itemId), userId);

	// if (inserted) {
	// 	return await Promise.all([
	// 		client.hIncrBy(itemsCacheKey(itemId), 'views', 1),
	// 		client.zIncrBy(itemsByViewsKey(), 1, itemId)
	// 	]);
	// }
};

// Keys needed to access
// 1. itemsCacheKey --> items#<itemId>
// 2. itemsByViewsKey
// 3. itemsViewsKey

// Arguments I need to accept
// itemId
// userId
