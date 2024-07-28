import { SchemaFieldTypes } from 'redis';
import { client } from './client';
import { itemsIndexKey, itemsCacheKey } from '$services/keys';

export const createIndexes = async () => {
	const indexes = await client.ft._list();

	const exist = indexes.find((index) => index === itemsCacheKey(''));

	if (exist) {
		return;
	}

	return client.ft.create(
		itemsIndexKey(),
		{
			name: {
				type: SchemaFieldTypes.TEXT
			},
			description: {
				type: SchemaFieldTypes.TEXT
			}
		},
		{
			ON: 'HASH',
			PREFIX: itemsCacheKey('')
		}
	);
};
