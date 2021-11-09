const DB = require('../../dataBase/main.js')
const {file} = require('tools-node')

const DB_NAME = 'fifa'
const TRADE_DATA_COL = 'trade_data'

const ff = {}

const LOCAL_CACHE_PATH = __dirname + '/localCache/tradeplie_cache'

let _localCache
const getLocalCache = async () => {
	try {
		_localCache || (_localCache = await file.readJSON(LOCAL_CACHE_PATH))
	} catch (e) {
		if (e.code === 'ENOENT') {
			_localCache = []
			await file.initJSON(LOCAL_CACHE_PATH, _localCache)
		} else {
			throw e
		}
	}
}
const saveLocalCache = async () => await file.writeJSON(LOCAL_CACHE_PATH, _localCache)

const saveTradePile = async (data, time) => {
	console.log('trade items', data.length)
	for (let item of data) {
		// 没关闭的直接覆盖，如果关闭了，看tradeId相同则覆盖
		let {tradeId, tradeState} = item
		if (tradeState === 'closed' && await DB.getOne({tradeId, tradeState}, TRADE_DATA_COL, DB_NAME)) {
			// 已经结束的交易不更新（这样可以保留卖出时的更新时间）
			continue
		}
		let query = {
			id: item.id,
			$or: [
				{ tradeState: { $ne: 'closed' } },
				{ tradeState: 'closed', tradeId: item.tradeId }
			]
		}
		let update = {
			$setOnInsert: {create: time},
			$set: { ...item, update: time }
		}
		await DB.upsertOne(query, update, TRADE_DATA_COL, DB_NAME)
	}
}

ff.saveTradepile = async (newData) => {
	let now = Date.now()
	await getLocalCache()
	_localCache.push({data: newData, time: now})
	let item
	while ((item = _localCache.shift())) {
		let {data, time} = item
		try {
			await saveTradePile(data, time)
		} catch (e) {
			_localCache.unshift(item)
			console.error(e)
			break
		}
	}
	await saveLocalCache()
}

ff.getSold = async ({start, end}) => {
	start = start || Date.now() - (1000 * 60 * 60 * 24)
	let query = {
		tradeState: 'closed',
		update: { $gt: Number(start) }
	}
	if (end) query.update.$lt = Number(end)
	return await DB.getData(query, TRADE_DATA_COL, DB_NAME)
}

module.exports = ff