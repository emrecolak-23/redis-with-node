import { itemsByViewsKey, itemsCacheKey, itemsViewsKey } from '$services/keys';
import { createClient, defineScript } from 'redis';
import { createIndexes } from './create-indexes';

const client = createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT)
	},
	password: process.env.REDIS_PW,
	scripts: {
		addOneAndStore: defineScript({
			NUMBER_OF_KEYS: 1,
			SCRIPT: `
				local storeAtKey = KEYS[1]
				local addOneTo = ARGV[1]

				return redis.call('SET', storeAtKey, 1 + tonumber(addOneTo))
			`,
			transformArguments(key: string, value: number) {
				return [key, value.toString()];
			},
			transformReply(reply: any) {
				return reply;
			}
		}),
		incrementView: defineScript({
			NUMBER_OF_KEYS: 3,
			SCRIPT: `
				local itemsViewsKey = KEYS[1]
				local itemsCacheKey = KEYS[2]
				local itemsByViewsKey = KEYS[3]
				local itemId = ARGV[1]
				local userId = ARGV[2]

				local inserted = redis.call('PFADD', itemsViewsKey, userId)

				if inserted == 1 then
					redis.call('HINCRBY', itemsCacheKey, 'views', 1)
					redis.call('ZINCRBY', itemsByViewsKey, 1, itemId)
				end
			`,
			transformArguments(itemId: string, userId: string) {
				return [itemsViewsKey(itemId), itemsCacheKey(itemId), itemsByViewsKey(), itemId, userId];
			},
			transformReply() {}
		}),
		unlock: defineScript({
			NUMBER_OF_KEYS: 1,
			SCRIPT: `
				local key = KEYS[1]
				local token = ARGV[1]

				if redis.call('GET', key) == token then
					return redis.call('DEL', key)
				end

				return 0
			`,
			transformArguments(key: string, token: string) {
				return [key, token];
			},
			transformReply(reply: any) {
				return reply;
			}
		})
	}
});

client.on('connect', async () => {
	// await client.addOneAndStore('books:count', 5);
	// const result = await client.get('books:count');
	// console.log(result, 'result');
	try {
		await createIndexes();
	} catch (err) {
		console.error(err);
	}
});

client.on('error', (err) => console.error(err));
client.connect();

export { client };
