import jwt from "jsonwebtoken";



const generateJwtToken = (user) => {
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return token;
};



export { generateJwtToken };