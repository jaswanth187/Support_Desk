process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  "postgresql://test:test@127.0.0.1:65432/supportdesk_test";
process.env.CLIENT_URL = "http://127.0.0.1:5173";
process.env.JWT_ACCESS_SECRET =
  "local-test-secret-that-is-long-enough-for-jwt-signing";
process.env.ACCESS_TOKEN_EXPIRY = "15m";
process.env.REFRESH_TOKEN_EXPIRY_DAYS = "7";
