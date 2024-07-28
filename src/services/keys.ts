export const pageCacheKey = (id: string) => {
	return `pagecache#${id}`;
};

export const sessionsCacheKey = (sessionId: string) => {
	return `sessions#${sessionId}`;
};

// Users

export const usersCacheKey = (userId: string) => {
	return `users#${userId}`;
};

export const usernamesUniqueCacheKey = (username: string) => {
	return `usernames#${username}`;
};

export const userLikesCacheKey = (userId: string) => {
	return `users:likes#${userId}`;
};

export const usernamesCacheKey = () => {
	return `usernames`;
};

// Items
export const itemsCacheKey = (itemId: string) => {
	return `items#${itemId}`;
};

export const itemsByViewsKey = () => {
	return `items:views`;
};

export const itemsByEndingAtKey = () => {
	return `items:endingAt`;
};

export const itemsViewsKey = (itemId: string) => {
	return `items:views#${itemId}`;
};

export const itemsByPriceKey = () => {
	return `items:price`;
};

// Bids
export const bidsHistoryCacheKey = (itemId: string) => {
	return `history#${itemId}`;
};

export const itemsIndexKey = () => {
	return `idx:items`;
};
