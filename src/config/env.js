const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const envalid = require('envalid');

const env = envalid.cleanEnv(process.env, {
  PORT: envalid.port({ default: 3000 }),
  MONGO_URI: envalid.str(),
  JWT_SECRET: envalid.str(),
  NODE_ENV: envalid.str({ choices: ['development', 'production', 'test'] }),
  EMAIL_HOST: envalid.str(),
  EMAIL_PORT: envalid.port(),
  EMAIL_USER: envalid.str(),
  EMAIL_PASS: envalid.str(),
});

module.exports = { envConfig: env };