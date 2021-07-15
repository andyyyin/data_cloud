const DB = require('../../dataBase/main.js')

const DB_NAME = 'fifa'
const TRADE_DATA_COL = 'trade_data'

const ff = {}

ff.saveTradepile = async (data) => {
	
	// todo query = id
	
	// todo return DB.upsertMany(query, data, TRADE_DATA_COL, DB_NAME)
	
}

module.exports = ff