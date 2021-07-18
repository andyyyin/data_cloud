const DB = require('../../dataBase/main.js')

const DB_NAME = 'fifa'
const TRADE_DATA_COL = 'trade_data'

const ff = {}

ff.saveTradepile = async (data) => {
	console.log('trade items', data.length)
	let now = Date.now()
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
			$setOnInsert: {create: now},
			$set: { ...item, update: now }
		}
		await DB.upsertOne(query, update, TRADE_DATA_COL, DB_NAME)
	}
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