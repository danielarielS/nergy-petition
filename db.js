const spicedPg = require("spiced-pg");
const bcrypt = require("bcryptjs");
let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    db = spicedPg("postgres:postgres:postgres@localhost:5432/signatures");
}

function saveSign(sig, userId) {
    return db
        .query(
            "INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id",
            [sig, userId]
        )
        .then(function(result) {
            return result.rows;
        });
}
function getNum() {
    return db.query("SELECT count(id) FROM signatures").then((result) => {
        return result;
    });
}
// SELECT COUNT(column1),column1 FROM table GROUP BY column1
function getSignares() {
    return db.query(
        "SELECT users.first, users.last, user_profiles.age, user_profiles.url, user_profiles.city FROM signatures LEFT JOIN users ON users.id=signatures.user_id LEFT JOIN user_profiles ON signatures.user_id=user_profiles.user_id"
    );
}
function getSignares2(city) {
    return db.query(
        "SELECT users.first, users.last, user_profiles.age, user_profiles.url, user_profiles.city FROM signatures LEFT JOIN users ON users.id=signatures.user_id LEFT JOIN user_profiles ON signatures.user_id=user_profiles.user_id WHERE LOWER(user_profiles.city)=LOWER($1)",
        [city]
    );
}
function getSig(arg) {
    return db
        .query("SELECT signature FROM signatures WHERE user_id=$1", [arg])
        .then((result) => {
            return result;
        });
}
function saveUser(first, last, email, password) {
    return db
        .query(
            "INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id",
            [first, last, email, password]
        )
        .then((result) => {
            return result;
        });
}
function getPass(email) {
    return db
        .query("SELECT password, id, first, last FROM users WHERE email=$1", [
            email
        ])
        .then((result) => {
            return result;
        });
}
function getUserId(email) {
    return db
        .query("SELECT id FROM users WHERE email=$1", [email])
        .then((result) => {
            return result;
        });
}
function getSig2(email) {
    return db.query(
        "SELECT signatures.signature AS sig, signatures.id AS signid, users.email AS email, users.id AS userid FROM users JOIN signatures ON users.id=signatures.user_id"
    );
}
function saveProfile(age, city, home, id) {
    return db.query(
        "INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4)",
        [age, city, home, id]
    );
}
function updateUsersPass(first, last, email, password, id) {
    return db.query(
        "UPDATE users SET first=$1, last=$2, email=$3, password=$4 WHERE id=$5",
        [first, last, email, password, id]
    );
}
function updateUsers(first, last, email, id) {
    return db.query(
        "UPDATE users SET first=$1, last=$2, email=$3 WHERE id=$4",
        [first || null, last || null, email || null, id]
    );
}
function getUserEdit(id) {
    return db.query(
        "SELECT first, last, email, age, city, url FROM users LEFT JOIN user_profiles ON users.id=user_profiles.user_id WHERE users.id=$1",
        [id]
    );
}
function updateOrInsert(age, city, url) {
    return db.query(
        "INSERT INTO user_profiles (age, city, url) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET age=$1, city=$2, url=$3",
        [age, city, url]
    );
}
function deleteSig(id) {
    return db.query("DELETE FROM signatures WHERE user_id=$1", [id]);
}
exports.deleteSig = deleteSig;
exports.updateOrInsert = updateOrInsert;
exports.getUserEdit = getUserEdit;
exports.updateUsersPass = updateUsersPass;
exports.updateUsers = updateUsers;
exports.getPass = getPass;
exports.saveUser = saveUser;
exports.getSig = getSig;
exports.getSignares = getSignares;
exports.getSignares2 = getSignares2;
exports.getNum = getNum;
exports.saveSign = saveSign;
exports.checkPassword = checkPassword;
exports.hashPassword = hashPassword;
exports.getUserId = getUserId;
exports.getSig2 = getSig2;
exports.saveProfile = saveProfile;

function hashPassword(plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
}

function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(
            textEnteredInLoginForm,
            hashedPasswordFromDatabase,
            function(err, doesMatch) {
                if (err) {
                    reject(err);
                } else {
                    resolve(doesMatch);
                }
            }
        );
    });
}
// count(id)
// exports.signPetition(first, last, sig) {
//     db.query('INSERT INTO signatures', [first, last, sig])
// }

// function getSign() {
//     db.query('SELECT city, population FROM cities').then(function(result) {
//         console.log(result.rows);
//     }).catch(function(err) {
//         console.log(err);
//     });
// }

// function getSign(name) {
//     return db
//         .query("SELECT * FROM cities WHERE city = $1", [name])
//         .then(function(result) {
//             return result.rows;
//         });
// }
