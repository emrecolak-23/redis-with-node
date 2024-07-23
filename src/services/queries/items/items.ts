import type { CreateItemAttrs } from '$services/types';
import { client } from '$services/redis';
import { serialize } from './serialize';
import { deserialize } from './deserialize';
import { genId } from '$services/utils';
import {
	itemsByEndingAtKey,
	itemsByPriceKey,
	itemsByViewsKey,
	itemsCacheKey
} from '$services/keys';

export const getItem = async (id: string) => {
	const item = await client.hGetAll(itemsCacheKey(id));

	if (Object.keys(item).length === 0) {
		return null;
	}

	return deserialize(id, item);
};

export const getItems = async (ids: string[]) => {
	const commands = ids.map((id) => {
		return client.hGetAll(itemsCacheKey(id));
	});

	const results = await Promise.all(commands);
	return results.map((item, i) => {
		if (Object.keys(results).length === 0) {
			return null;
		}

		return deserialize(ids[i], item);
	});
};

export const createItem = async (attrs: CreateItemAttrs) => {
	const itemId = genId();

	await Promise.all([
		client.hSet(itemsCacheKey(itemId), serialize(attrs)),
		client.zAdd(itemsByViewsKey(), {
			value: itemId,
			score: 0
		}),
		client.zAdd(itemsByEndingAtKey(), {
			value: itemId,
			score: attrs.endingAt.toMillis()
		}),
		client.zAdd(itemsByPriceKey(), {
			value: itemId,
			score: attrs.price
		})
	]);

	return itemId;
};
