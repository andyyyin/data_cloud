const axios = require('axios')
const nodemailer = require('nodemailer');
const {file} = require('tools-node')

const IP_TEST_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
const LOCAL_CACHE_PATH = __dirname + '/localCache'
const MailInfo = {
	host: 'smtp.163.com',
	port: 465,
	auth: {
		user: 'ycwd_test@163.com',
		pass: 'tbeqk16tcfgbsbca'
	}
}

const DetectInterval = 1000 * 60 * 15

let ipCache

const send = ({title, content, address}) => {
	return new Promise((resolve, reject) => {
		try {
			let transporter = nodemailer.createTransport({
				secureConnection: false,
				...MailInfo
			});

			let mailOptions = {
				from: 'IP变更通知<ycwd_test@163.com>',
				to: address,
				subject: title || '-',
				html: `<div>${content || ''}</div>`
			};

			transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					console.log(error);
					resolve(false)
				}
				console.log('Message sent: %s', info.messageId);
				resolve(true)
			});
		} catch (e) {
			reject(e)
		}
	})
}


const dealNewIp = (ip) => {
	console.log('new ip', ip)
	ipCache = ip
	file.writeFile(LOCAL_CACHE_PATH, ip).then()
	let address = 'ycwd123@163.com'
	send({content: ip.split('').reverse().join(''), address})
		.then()
		.catch(e => console.error(e))
}

module.exports = async () => {
	try { ipCache = await file.readFile(LOCAL_CACHE_PATH) } catch (e) {}

	const detect = async () => {
		console.log('ip detect')
		try {
			let res = await axios.get('https://ipinfo.io/')
			let ipData = res && res.data
			if (!ipData || !ipData.ip || !IP_TEST_REGEX.test(ipData.ip)) {
				console.log('ip接口异常')
				console.log(res)
				return
			}
			if (ipData.ip === ipCache) return
			dealNewIp(ipData.ip)
		} catch (e) {
			if (e.code === 'ETIMEDOUT') {
				console.error('ETIMEDOUT')
			} else {
				console.error(e)
			}
		}
	}
	setInterval(() => detect().then(), DetectInterval)

	console.log('ip detecting')
}
