const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL must point to the isolated test database.");
}

const databaseUrl = new URL(testDatabaseUrl);
if (
  databaseUrl.hostname !== "127.0.0.1" ||
  databaseUrl.port !== "55432" ||
  databaseUrl.pathname !== "/supportdesk_test"
) {
  throw new Error(
    "Integration tests may only connect to 127.0.0.1:55432/supportdesk_test."
  );
}

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = testDatabaseUrl;
process.env.CLIENT_URL = "http://127.0.0.1:5173";
process.env.JWT_ACCESS_SECRET =
  "isolated-integration-test-secret-long-enough-for-signing";
process.env.ACCESS_TOKEN_EXPIRY = "15m";
process.env.REFRESH_TOKEN_EXPIRY_DAYS = "7";
