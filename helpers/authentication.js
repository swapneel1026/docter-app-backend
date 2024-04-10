import JWT from "jsonwebtoken";

const Secret = process.env.JWT_SECRET;
export function createToken(user) {
  if (!user?.userType) return "No user ";
  if (user?.userType === "User") {
    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      profileImage: user.profileImage,
    };
    const token = JWT.sign(payload, Secret);
    return token;
  }
  if (user?.userType === "Docter") {
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      specialization: user.specialization,
      docsImage: user.docsImage,
      profileImage: user.profileImage,
      experience: user.experience,
      currentLivingState: user.currentLivingState,
      currentLivingCity: user.currentLivingCity,
      userType: user.userType,
    };
    const token = JWT.sign(payload, Secret);
    return token;
  }
}

export function verifyToken(token) {
  const payload = JWT.verify(token, Secret);
  return payload;
}
