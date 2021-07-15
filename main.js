const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const route = require('./src/route/main.js')
const DB = require('./src/dataBase/main.js')

const PORT = 3366

const run = async () => {

	/* --- 连接数据库 --- */
	await DB.connect()

	/* --- 数据格式中间件 --- */
	app.use((req, res, next) => {
		// 设置是否运行客户端设置 withCredentials
		// 第二个参数表示允许跨域的域名，* 代表所有域名
		res.header('Access-Control-Allow-Origin', '*')
		res.header('Access-Control-Allow-Methods', '*') // 允许的 http 请求的方法
		// 允许前台获得的除 Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma 这几张基本响应头之外的响应头
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
		// res.header('Content-Type', 'application/json;charset=utf-8') // 这里全局设置，会导致html无法自动渲染
		next()
	})
	app.use('/page', express.static('web'));
	// 下面是让api可以在application/json格式请求参数下读取数据
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());


	/* --- 路由配置 --- */
	app.get('/', (req, res) => res.send('ok'))
	await route(app)

	/* --- 启动 --- */
	app.listen(PORT, () => {
		console.log(`chaos server listening on port ${PORT}`)
	})

}

run().then()