import { client } from '$services/redis';
import { itemsCacheKey, itemsByViewsKey } from '$services/keys';
import { deserialize } from './deserialize';

export const itemsByViews = async (order: 'DESC' | 'ASC' = 'DESC', offset = 0, count = 10) => {
	let results: any = await client.sort(itemsByViewsKey(), {
		GET: [
			'#',
			`${itemsCacheKey('*')}->name`,
			`${itemsCacheKey('*')}->views`,
			`${itemsCacheKey('*')}->endingAt`,
			`${itemsCacheKey('*')}->imageUrl`,
			`${itemsCacheKey('*')}->price`
		],
		BY: 'nosort',
		DIRECTION: order,
		LIMIT: {
			offset,
			count
		}
	});

	const items = [];

	while (results.length) {
		const [id, name, views, endingAt, imageUrl, price, ...rest] = results;
		const item = deserialize(id, { name, views, imageUrl, price, endingAt });
		items.push(item);
		results = rest;
	}
	return items;
};
