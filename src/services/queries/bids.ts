import { client } from '$services/redis';
import type { CreateBidAttrs, Bid } from '$services/types';
import { bidsHistoryCacheKey, itemsCacheKey, itemsByPriceKey } from '$services/keys';
import { DateTime } from 'luxon';
import { getItem } from './items';

export const createBid = async (attrs: CreateBidAttrs) => {
	return client.executeIsolated(async (isolatedClient) => {
		await isolatedClient.watch(itemsCacheKey(attrs.itemId));
		const item = await getItem(attrs.itemId);

		if (!item) {
			throw new Error('Item does not exists');
		}

		if (item.price >= attrs.amount) {
			throw new Error('Bid too low');
		}

		if (item.endingAt.diff(DateTime.now()).toMillis() < 0) {
			throw new Error('Item closed to bidding');
		}

		const serialized = serializeHistory(attrs.amount, attrs.createdAt.toMillis());
		return isolatedClient
			.multi()
			.rPush(bidsHistoryCacheKey(attrs.itemId), serialized)
			.hSet(itemsCacheKey(attrs.itemId), {
				bids: item.bids + 1,
				price: attrs.amount,
				highestBidUserId: attrs.userId
			})
			.zAdd(itemsByPriceKey(), {
				value: item.id,
				score: attrs.amount
			})
			.exec();
	});
};

export const getBidHistory = async (itemId: string, offset = 0, count = 10): Promise<Bid[]> => {
	const startIndex = -1 * offset - count;
	const endIndex = -1 - offset;
	const range = await client.lRange(bidsHistoryCacheKey(itemId), startIndex, endIndex);
	return range.map((r) => deserializeHistory(r));
};

export const serializeHistory = (amount: number, createdAt: number) => {
	return `${amount}:${createdAt}`;
};

export const deserializeHistory = (history: string) => {
	const [amount, createdAt] = history.split(':');
	return {
		amount: parseFloat(amount),
		createdAt: DateTime.fromMillis(parseInt(createdAt))
	};
};
