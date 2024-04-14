import { createHmac } from "crypto";

const createHashPassword = (password) => {
  const secret = process.env.CRYPTO_SECRET;
  const hash = createHmac("sha256", secret).update(password).digest("hex");
  return hash;
};

export default createHashPassword;
