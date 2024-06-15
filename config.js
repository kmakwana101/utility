const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_TOKEN_EXPIRE_IN_SECONDS = process.env.REFRESH_TOKEN_EXPIRE_IN_SECONDS;
const JWT_EXPIRE_IN_SECONDS = process.env.JWT_EXPIRE_IN_SECONDS;
const PORT = process.env.PORT;
const SOCKET_PORT = process.env.SOCKET_PORT;
const MONGO_URL = process.env.MONGO_URL;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const FIREBASE_SECRET_KEY = process.env.FIREBASE_SECRET_KEY;

const constants = {
  SECRET_KEY,
  REFRESH_TOKEN_EXPIRE_IN_SECONDS,
  JWT_EXPIRE_IN_SECONDS,
  PORT,
  SOCKET_PORT,
  MONGO_URL,
  STRIPE_SECRET_KEY,
  FIREBASE_SECRET_KEY
};

exports.constants = Object.freeze(constants);