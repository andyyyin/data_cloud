const ipTask = require('./ip')

module.exports = () => {
	console.log('task start')
	if (process.env.NODE_ENV !== 'test') {
		ipTask().then()
	}
}