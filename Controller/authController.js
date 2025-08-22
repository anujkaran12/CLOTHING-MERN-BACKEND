const userModel = require("../Models/UserModel");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const sendMail = require("../utility/nodeMailer");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      role,
      mobile,
      address,
    } = req.body;
    console.log(req.body);
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !role.trim() ||
      !mobile.trim() ||
      !address.trim()
    ) {
      return res.status(401).send("Please fill all fields");
    }
    if (password !== confirmPassword) {
      return res.status(400).send("Passwords does not match");
    }
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email already in use");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new userModel({
      fullName,
      email,
      password: hashedPassword,
      mobile,
      address,
      role,
    });
    await user.save();
    return res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).send("Please fill in all fields");
    }

    const user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(400).send("Email & Password not matched");
    }
    if (!user.password) {
      return res.status(400).send("Email & Password not matched");
    }
    const match = await bcrypt.compare(password.toString(), user.password);

    if (!match) {
      return res.status(404).send("Email & Password not matched");
    }
    const token = JWT.sign({ payload: user._id }, process.env.JWT_KEY);
    res
      .status(200)
      .cookie("JWT_TOKEN", token)
      .json({ JWT_TOKEN: token, msg: "Login successfully" });
  } catch (error) {
    console.log(error);
    res.status(502).send("Internal server error");
  }
};

const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email: email });
    if (user) {
      return res.status(400).send("Email already in use");
    }
    const code = Math.floor(100000 + Math.random() * 900000);
    const html = `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1 style="color:#4CAF50;">${code}</h1>
      <p>This code is valid for 10 minutes.</p>
    `;
    const subject = "Your Verification Code";
    const response = await sendMail(email, subject, html);
    if (response) {
      return res.status(200).send({ verificationCode: code });
    }
    return res.status(400).send("Failed to send email");
  } catch (error) {
    console.log(error);
    return res.status(502).send("Internal server error");
  }
};

const googleSignup = async (req, res) => {
  try {
    console.log("google code run");
    const { token } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    let user = await userModel.findOne({ email: email });
    if (user) {
      if (user.provider === "email&password") {
        user.provider = "google";
        await user.save();
      }
    } else {
      user = await userModel.create({
        email,
        fullName: name,
        avatar: { secure_url: picture },
        provider: "google",
      });
    }
    const JWT_TOKEN = JWT.sign({ payload: user._id }, process.env.JWT_KEY);

    return res
      .status(200)
      .cookie("JWT_TOKEN", JWT_TOKEN)
      .json({ JWT_TOKEN: JWT_TOKEN, msg: "Google signup successfully" });
  } catch (error) {
    console.log(error);
    return res.status(200).send("Internal server error");
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!email) {
      return res
        .status(200)
        .send("If an account exists, a reset email has been sent.");
    }
    if (!user) {
      return res
        .status(200)
        .send("If an account exists, a reset email has been sent.");
    }
    const salt = await bcrypt.genSalt(10);
    const resetToken = await bcrypt.hash(user._id.toString(), salt);
    user.resetPasswordTokenHash = resetToken;
    user.resetPasswordExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    const resetUrl = `${
      process.env.FRONTEND_URL
    }/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const subject = "Your reset password link";

    const html = `<div style="font-family:Inter,system-ui,Segoe UI,Roboto,Arial">
      <h2>Reset your password</h2>
      <p>We received a request to reset your password. This link is valid for 15 minutes.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#111;color:#fff;text-decoration:none">
          Reset Password
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p style="word-break:break-all">${resetUrl}</p>
      <p>If you didn’t request this, you can ignore this email.</p>
    </div>`;

    await sendMail(email, subject, html);
    return res
      .status(200)
      .send("If an account exists, a reset email has been sent.");
  } catch (error) {
    console.log(error);
    return res.status(502).send("Internal server error");
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(401).send("Missing fields");
    }

    //checking user in DB using email
    const user = await userModel.findOne({ email: email });
    if (!user || !user.resetPasswordExpiresAt || !user.resetPasswordTokenHash) {
      return res.status(400).send("Invalid or expired token");
    }
    //checking expires time of hash in db
    if (user.resetPasswordExpiresAt < new Date()) {
      user.resetPasswordExpiresAt = null;
      user.resetPasswordTokenHash = null;
      await user.save();
      return res.status(400).send("Invalid or expired token");
    }
    //matching token and DB reset token
    if (user.resetPasswordTokenHash !== token) {
      return res.status(400).send("Invalid or expired token");
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    // add hashed password in user
    user.password = hashPassword;
    //now empty the reset token and expires
    user.resetPasswordExpiresAt = null;
    user.resetPasswordTokenHash = null;
    //now saving the user in db
    const savePass = await user.save();
    if(savePass){
      return res.status(200).send("Password reset successful");

    }
    return res.status(400).send("unable to reset password");
  } catch (error) {
    console.log(error);
    return res.status(502).send("Internal server error");
  }
};
module.exports = {
  login,
  register,
  sendVerificationCode,
  googleSignup,
  forgotPassword,
  resetPassword,
};
