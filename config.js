var path = require('path');

var config = {
	host: 'localhost',
	user: 'postgres',
	password: 'qmpzal',
	port: 5433,
	database: 'transport_management_system',
	max: '10',
	idleTimeoutMillis: 100 // how long a client is allowed to remain idle before being closed
}

module.exports = config
