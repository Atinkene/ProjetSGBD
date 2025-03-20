const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/sgbd-platform", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const User = mongoose.model("User", new mongoose.Schema({
    email: String,
    password: String,
    role: String,
    name: String,
    provider: String,
    oauthId: String
}));

const hashPassword = async () => {
    const hashedPassword = await bcrypt.hash("passer", 10);
    await User.create({
        email: "enseignant3@email.com",
        password: hashedPassword,
        role: "teacher",
        name: "Professeur Sécurisé",
        provider: "local",
        oauthId: "local_" + Date.now()
    });
    console.log("Utilisateur ajouté !");
    mongoose.disconnect();
};

hashPassword();
