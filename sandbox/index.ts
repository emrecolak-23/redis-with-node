import 'dotenv/config';
import { client } from '../src/services/redis';

const run = async () => {
	await client.hSet('car1', {
		color: 'red',
		year: 1950
	});

	await client.hSet('car2', {
		color: 'green',
		year: 1955
	});

	await client.hSet('car3', {
		color: 'blue',
		year: 1960
	});

	const commands = [1, 2, 3].map((i) => {
		return client.hGetAll(`car${i}`);
	});

	const result = await Promise.all(commands);

	console.log(result);

	// const car = await client.hGetAll('car');
	// if (Object.keys(car).length === 0) {
	// 	console.log('Car not found, respond with 404');
	// 	return;
	// }
	// console.log(car);
};
run();
