const DB = require('../../dataBase/main.js')
const {file} = require('tools-node')

const DB_NAME = 'fifa'
const TRADE_DATA_COL = 'match'

const fm = {}

const LOCAL_CACHE_PATH = __dirname + '/localCache/tradeplie_cache'

const splitParam = (data) => {
	const {match, score, possession, loss, player} = data
	const matchData = {match, player: 'match', possession, loss}
	const playerData = {match, player, score}
	Object.keys(data).forEach(key => {
		const value = data[key]
		if (Array.isArray(value)) {
			playerData[key] = value[0]
			matchData[key] = value[1]
		}
	})
	return [playerData, matchData]
}

const compareData = (newData, existData) => {
	let error
	Object.keys(newData).forEach(key => {
		if (newData[key] !== existData[key]) {
			error = `match 数据异常 key=${key}, ex ${existData[key]} new ${newData[key]}`
		}
	})
	return error
}
fm.getPlayers = async () => {
	return await DB.getDistinctField('player', TRADE_DATA_COL, DB_NAME)
}
fm.getPlayersData = async () => {
	return await DB.getData({}, TRADE_DATA_COL, DB_NAME)
}
fm.getMatchData = async (match) => {
	if (!match) {
		const lastData = await DB.getLastOne({}, TRADE_DATA_COL, DB_NAME)
		match = lastData.match
	}
	return await DB.getData({match}, TRADE_DATA_COL, DB_NAME)
}
fm.saveMatchData = async (data) => {
	const {match, player} = data
	const [playerData, matchData] = splitParam(data)

	const exist = await DB.getOne({match, player}, TRADE_DATA_COL, DB_NAME)
	if (exist) {
		return '数据已存在'
	}
	const existMatch = await DB.getOne({match, player: 'match'}, TRADE_DATA_COL, DB_NAME)
	if (!existMatch) {
		await DB.insertData(matchData, TRADE_DATA_COL, DB_NAME)
	} else {
		let error
		if ((error = compareData(matchData, existMatch)))
		return error
	}
	const query = {match, player}
	await DB.upsertOne(query, playerData, TRADE_DATA_COL, DB_NAME)
	return await fm.getMatchData(match)
}

module.exports = fm