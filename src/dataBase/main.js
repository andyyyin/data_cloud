const {MongoClient, Long} = require('mongodb');
// const assert = require('assert')

const [,, user, pwd] = process.argv
const DB_URL = process.env.NODE_ENV === 'prod' ? 
	`mongodb://${user}:${pwd}@localhost:27017/?authMechanism=SCRAM-SHA-1` :
	`mongodb://localhost:27017/`

const client = new MongoClient(DB_URL);

const INT32_MAX = 2147483647

let db;

const connect = () => {
	return new Promise(resolve => {
		client.connect(function(err) {
			// assert.equal(err, null)
			console.log("Connected successfully to server");
			resolve()
		});
	})
}

const dataFilter = (data) => {
	if (!data) return data
	const filter = (data) => {
		Object.keys(data).forEach(key => {
			if (data[key] && typeof data[key] === 'number' && data[key] > INT32_MAX) {
				data[key] = data[key] + ''
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
	return new Promise(resolve => {
		const col = getDB(dbName).collection(colName)
		query = query || {}
		col.find(dataFilter(query)).toArray(function(err, result) {
			// assert.equal(err, null);
			resolve(result)
		});
	})
}

const getOne = (query, colName, dbName) => {
	// assert.equal(typeof colName, 'string');
	return new Promise(resolve => {
		const col = getDB(dbName).collection(colName)
		query = query || {}
		col.findOne(dataFilter(query), {}, function(err, result) {
			// assert.equal(err, null);
			resolve(result)
		});
	})
}

const getLastOne = (query, colName, dbName) => {
	// assert.equal(typeof colName, 'string');
	return new Promise(resolve => {
		const col = getDB(dbName).collection(colName)
		query = query || {}
		col.findOne(dataFilter(query), {sort: [['_id', -1]]}, (err, result) => {
			// assert.equal(err, null);
			resolve(result)
		})
	})
}

const insertData = (data, colName, dbName) => {
	if (!data || !data.length) return Promise.resolve()
	// assert.equal(typeof data, 'object');
	// assert.equal(typeof colName, 'string');

	return new Promise(resolve => {
		const col = getDB(dbName).collection(colName)
		let array = Array.isArray(data) ? data : [data];
		col.insertMany(dataFilter(array), function(err, result) {
			// assert.equal(err, null);
			// assert.equal(array.length, result.result.n);
			// assert.equal(array.length, result.ops.length);
			resolve(result)
		});
	})
}

const updateOne = (query, set, colName, dbName, options) => {
	// assert.equal(typeof query, 'object');
	// assert.equal(typeof set, 'object');
	// assert.equal(typeof colName, 'string');

	return new Promise(resolve => {
		const col = getDB(dbName).collection(colName)
		let updateContent = set['$set'] ? set : { $set: dataFilter(set) }
		updateContent['$set'] = dataFilter(updateContent['$set'])
		updateContent['$setOnInsert'] && (updateContent['$setOnInsert'] = dataFilter(updateContent['$setOnInsert']))
		col.updateOne(dataFilter(query), updateContent, options, function(err, result) {
			// assert.equal(err, null);
			// assert.equal(1, result.result.n);
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
}