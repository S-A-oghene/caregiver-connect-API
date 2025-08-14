const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");
const jwt = require("jsonwebtoken");

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
      scope: ["user:email"], // Important: requests the user's primary email
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Find user by GitHub ID
        let user = await User.findOne({ githubId: profile.id });
        if (user) {
          return done(null, user);
        }

        // 2. Find user by email
        if (!profile.emails || profile.emails.length === 0) {
          // This can happen if the user has no public email address.
          // We can't create an account without an email, so we must fail.
          return done(new Error('No public email found for this GitHub user. Please set a public email on your GitHub profile.'), null);
        }

        const primaryEmailObject = profile.emails.find(email => email.primary);
        const emailValue = primaryEmailObject ? primaryEmailObject.value : profile.emails[0].value;

        if (!emailValue) {
            return done(new Error('Could not determine an email address from the GitHub profile.'), null);
        }
        user = await User.findOne({ email: emailValue });

        if (user) {
          // 3. Link account if user exists with that email
          user.githubId = profile.id;
          await user.save();
          return done(null, user);
        }

        // 4. Create new user if no account found
        const newUser = new User({
          githubId: profile.id,
          email: emailValue,
          // GitHub profiles might not have separate first/last names
          firstName: profile.displayName || profile.username,
          lastName: "",
          role: 'client' // Assign a default role
        });

        user = await newUser.save();
        done(null, user);
      } catch (err) {
        console.error(err);
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // Simply find the user and pass them along.
  } catch (err) {
    done(err, null);
  }
});
