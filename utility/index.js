import jwt from "jsonwebtoken";



const generateJwtToken = (user) => {
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};

const validateJwtToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error };
  }
};



export { generateJwtToken, validateJwtToken };