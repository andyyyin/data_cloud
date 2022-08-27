const {MongoClient, Long} = require('mongodb');
// const assert = require('assert')

const [,, user, pwd] = process.argv
const isDBAuth = !!(user && pwd)
const DB_URL = process.env.NODE_ENV === 'prod' ?
	`mongodb://${user}:${pwd}@localhost:27017/?authMechanism=SCRAM-SHA-1` :
	`mongodb://${isDBAuth ? `${user}:${pwd}@` : ''}localhost:27017/${isDBAuth ? '?authMechanism=SCRAM-SHA-1' : 'cd '}`

const client = new MongoClient(DB_URL);

const INT32_MAX = 2147483647

let db;

const connect = () => {
	return new Promise((resolve, reject) => {
		client.connect(function(err) {
			if (err) { reject(err); return }
			// assert.equal(err, null)
			console.log("connected successfully to data base");
			resolve()
		});
	})
}

const dataFilter = (data) => {
	const filter = (data) => {
		if (!data) return data
		Object.keys(data).forEach(key => {
			if (typeof data[key] === 'number' && data[key] > INT32_MAX) {
				data[key] = Long(data[key] + '')
			} else if (typeof data[key] === 'object') {
				filter(data[key])
			}
		})
		return data
	}
	if (Array.isArray(data)) {
		return data.map(filter)
	} else {
		return filter(data)
	}
}

const getDB = (name) => {
	if (!db || (name && db.databaseName !== name)) {
		db = client.db(name)
	}
	return db
}

const getData = (query, colName, dbName) => {
	// assert.equal(typeof colName, 'string');
	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		query = query || {}
		col.find(dataFilter(query)).toArray(function(err, result) {
			// assert.equal(err, null);
			if (err) { reject(err); return }
			resolve(result)
		});
	})
}

const getDistinctField = (key, colName, dbName) => {
	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		col.distinct(key, function(err, result) {
			if (err) { reject(err); return }
			resolve(result)
		});
	})
}

const getOne = (query, colName, dbName) => {
	// assert.equal(typeof colName, 'string');
	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		query = query || {}
		col.findOne(dataFilter(query), {}, function(err, result) {
			// assert.equal(err, null);
			if (err) { reject(err); return }
			resolve(result)
		});
	})
}

const getLastOne = (query, colName, dbName) => {
	// assert.equal(typeof colName, 'string');
	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		query = query || {}
		col.findOne(dataFilter(query), {sort: [['_id', -1]]}, (err, result) => {
			// assert.equal(err, null);
			if (err) { reject(err); return }
			resolve(result)
		})
	})
}

const insertData = (data, colName, dbName) => {
	if (!data || (Array.isArray(data) && !data.length)) return Promise.resolve()
	// assert.equal(typeof data, 'object');
	// assert.equal(typeof colName, 'string');

	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		let array = Array.isArray(data) ? data : [data];
		col.insertMany(dataFilter(array), function(err, result) {
			// assert.equal(err, null);
			// assert.equal(array.length, result.result.n);
			// assert.equal(array.length, result.ops.length);
			if (err) { reject(err); return }
			resolve(result)
		});
	})
}

const updateOne = (query, set, colName, dbName, options) => {
	// assert.equal(typeof query, 'object');
	// assert.equal(typeof set, 'object');
	// assert.equal(typeof colName, 'string');

	return new Promise((resolve, reject) => {
		const col = getDB(dbName).collection(colName)
		let updateContent = set['$set'] ? set : { $set: set }
		col.updateOne(dataFilter(query), dataFilter(updateContent), options, function(err, result) {
			// assert.equal(err, null);
			// assert.equal(1, result.result.n);
			if (err) { reject(err); return }
			if (result.upsertedCount) console.log('upserted', result.upsertedCount)
			resolve(result);
		});
	})
}
const upsertOne = (query, set, colName, dbName) => {
	return updateOne(query, set, colName, dbName, {upsert: true})
}


module.exports = {
	connect,
	getData,
	getOne,
	insertData,
	updateOne,
	upsertOne,
	getLastOne,
	getDistinctField,
}