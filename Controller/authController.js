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
    <div style="background: linear-gradient(135deg, #f0f4ff, #ffe1e1); padding: 30px 0; font-family: 'Helvetica Neue', Arial, sans-serif;">
  
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="500" style="background-color: #ffffff; border-radius: 8px; padding: 15px 30px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); text-align: center;">
          
          <tr>
            <td style="padding-bottom: 20px;">
              <img src=${process.env.PROJECT_LOGO_WHITE_BACKGROUND} alt="Wild Stitch Logo" width="65" style="display: block; margin: auto;">
            </td>
          </tr>

          <tr>
            <td style="font-size: 18px; font-weight: 500; padding-bottom: 15px; color: #333;">
              Verify Your Email Address
            </td>
          </tr>

          <tr>
            <td style="display: inline-block; background-color: #f2f2f2; padding: 18px 30px; border-radius: 6px; font-size: 28px; font-weight: 500; color: #000; letter-spacing: 2px; margin-bottom: 25px;">
              ${code}
            </td>
          </tr>

          <tr>
            <td style="font-size: 14px; color: #555; line-height: 1.6; padding-bottom: 25px;">
              You're one step away from unlocking the best in fashion. Use the code above to verify your email and start exploring Wild Stitch’s latest collections.
            </td>
          </tr>

          <tr>
            <td style="font-size: 13px; color: #777; line-height: 1.5;">
              This code will expire in 10 minutes. If you did not request this, simply ignore this email.
            </td>
          </tr>

        </table>

        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="500" style="margin-top: 20px;">
          <tr>
            <td style="font-size: 12px; text-align: center; color: #aaa;">
              &copy; 2025 Wild Stitch. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  
</div>

    `;
    const subject = "Your Email Verification Code";
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

    const subject = "Your Reset Password Link";

    const html = `<div style="background: linear-gradient(135deg, #f0f4ff, #ffe1e1); padding: 30px 0; font-family: 'Helvetica Neue', Arial, sans-serif;">
  
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="500" style="background-color: #ffffff; border-radius: 8px; padding: 15px 30px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); text-align: center;">
          
          <tr>
            <td style="padding-bottom: 20px;">
              <img src=${process.env.PROJECT_LOGO_WHITE_BACKGROUND} alt="Wild Stitch Logo" width="65" style="display: block; margin: auto;">
            </td>
          </tr>

          <tr>
            <td style="font-size: 18px; font-weight: 500; padding-bottom: 15px; color: #333;">
              Reset Your Password
            </td>
          </tr>

          <tr>
            <td style="font-size: 14px; color: #555; line-height: 1.6; padding-bottom: 25px;">
              We received a request to reset your password. Click the button below to securely set a new password for your Wild Stitch account.
            </td>
          </tr>

          <tr>
            <td style="padding-bottom: 25px;">
              <a href=${resetUrl} style="background-color: #000000; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 25px; font-size: 15px; font-weight: 500; display: inline-block;">
                Reset Password
              </a>
            </td>
          </tr>

          <tr>
            <td style="font-size: 13px; color: #777; line-height: 1.5; padding-bottom: 15px;">
              If the button above doesn’t work, copy and paste the following link into your browser:
            </td>
          </tr>

          <tr>
            <td style="font-size: 13px; color: #555; word-break: break-all; padding-bottom: 25px;">
              <p style="color: #0000EE; text-decoration: underline;">
               ${resetUrl}
              </p>
            </td>
          </tr>

          <tr>
            <td style="font-size: 13px; color: #777; line-height: 1.5;">
              This link will expire in 10 minutes. If you did not request this, simply ignore this email.
            </td>
          </tr>

        </table>

        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="500" style="margin-top: 20px;">
          <tr>
            <td style="font-size: 12px; text-align: center; color: #aaa;">
              &copy; 2025 Wild Stitch. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  
</div>
`;

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
