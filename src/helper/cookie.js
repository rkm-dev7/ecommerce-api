const setAccesstokenCookie = (res, accessToken) => {
  res.cookie("accessToken", accessToken, {
    maxAge: 5 * 60 * 1000, // 5 minutes
    httpOnly: true,
    // secure: true,
    sameSite: "None", // Use "None" to allow cross-site cookies
  });
};
const setRefreshtokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    // secure: true,
    sameSite: "None", // Use "None" to allow cross-site cookies
  });
};
module.exports = { setAccesstokenCookie, setRefreshtokenCookie };
