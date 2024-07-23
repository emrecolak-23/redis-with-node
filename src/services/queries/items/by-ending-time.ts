import { client } from '$services/redis';
import { itemsByEndingAtKey, itemsCacheKey } from '$services/keys';
import { deserialize } from './deserialize';

export const itemsByEndingTime = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
	const ids = await client.zRange(itemsByEndingAtKey(), Date.now(), '+inf', {
		BY: 'SCORE',
		LIMIT: {
			offset,
			count
		}
	});

	const mostViewedItems = await Promise.all(
		ids.map((id) => {
			return client.hGetAll(itemsCacheKey(id));
		})
	);

	return mostViewedItems.map((item, i) => deserialize(ids[i], item));
};
