const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const MicrosoftStrategy = require("passport-microsoft").Strategy;
const User = require("./models/User");
const jwt = require("jsonwebtoken");

async function findOrCreateUser(profile, provider) {
    let user = await User.findOne({ oauthId: profile.id });

    if (!user) {
        user = new User({
            oauthId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value || `${profile.id}@${provider}.com`, // Si pas d'email, en créer un
            provider,
            role: "student", // Tous les utilisateurs sont étudiants par défaut
            profilePicture: profile.photos?.[0]?.value || null,
        });
        await user.save();
    }
    return user;
}

// Google
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            const user = await findOrCreateUser(profile, "Google");
            return done(null, user);

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET || "SECRET_KEY",
                { expiresIn: "1h" }
            );
            return done(null, { user, token });
            
        }
    )
);

// GitHub
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "/auth/github/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            const user = await findOrCreateUser(profile, "GitHub");
            return done(null, user);

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET || "SECRET_KEY",
                { expiresIn: "1h" }
            );
            return done(null, { user, token });
            
        }
    )
);

// Microsoft
passport.use(
    new MicrosoftStrategy(
        {
            clientID: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
            callbackURL: "/auth/microsoft/callback",
            scope: ["user.read"],
        },
        async (accessToken, refreshToken, profile, done) => {
            const user = await findOrCreateUser(profile, "Microsoft");
            return done(null, user);

            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET || "SECRET_KEY",
                { expiresIn: "1h" }
            );
            return done(null, { user, token });
            
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});
