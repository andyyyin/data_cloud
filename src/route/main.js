const ff = require('../serve/fifa/main.js')
const auth = require('../serve/authorization/main.js')

module.exports = async (app) => {

	/* --- 获取权限列表 --- */
	// const authList = await auth.getAuthList()

	const checkAuth = (req, res) => {
		// todo
		// const {authorization} = req.headers
		// const auth = authList.find(a => a.deviceId === authorization)
		// if (!auth) {
		// 	res.status(401).send('No Access')
		// 	return false
		// }
		// req.user = auth.user
		return true
	}

	/* --- user --- */

	app.use('/user*', (req, res, next) => {
		if(!checkAuth(req, res)) return
		next()
	});

	app.get('/user/config', (req, res) => {
		auth.getUserConfig(req.user).then(config => {
			res.send(config)
		}).catch(err => {
			res.send(err)
		})
	})

	app.post('/user/set-config', (req, res) => {
		auth.setUserConfig(req.user, req.body).then(config => {
			res.send(config)
		}).catch(err => {
			res.send(err)
		})
	})
	
	/* --- fifa --- */

	app.post('/ff/tradepile', (req, res) => {
		const data = req.body.data
		ff.saveTradepile(data).then(() => {
			res.send('ok')
		}).catch(err => {
			res.send(err)
		})
	})

	app.get('/ff/get-sold', (req, res) => {
		ff.getSold(req.query).then(result => {
			res.send(result)
		}).catch(err => {
			res.send(err)
		})
	})

}