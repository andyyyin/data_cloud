const DB = require('../../dataBase/main.js')

const DB_NAME = 'fifa'
const TRADE_DATA_COL = 'trade_data'

const ff = {}

ff.saveTradepile = async (data) => {
	let now = Date.now()
	for (let item of data) {
		let query = {id: data.id, tradeState: { $ne: 'closed' }}
		let update = {
			$setOnInsert: {create: now},
			$set: { ...item, update: now }
		}
		await DB.upsertOne(query, update, TRADE_DATA_COL, DB_NAME)
	}
}

module.exports = ff