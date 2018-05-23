const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieP = require("cookie-parser");
const hb = require("express-handlebars");
const URL = require("url-parse");
const { saveSign } = require("./db");
const { getNum } = require("./db");
const { getSignares } = require("./db");
const { getSignares2 } = require("./db");
const { getSig } = require("./db");
const { saveUser } = require("./db");
const { checkPassword } = require("./db");
const { getPass } = require("./db");
const { hashPassword } = require("./db");
const { getUserId } = require("./db");
const { getSig2 } = require("./db");
const { saveProfile } = require("./db");
const { updateUsersPass } = require("./db");
const { updateUsers } = require("./db");
const { getUserEdit } = require("./db");
const { updateOrInsert } = require("./db");
const { deleteSig } = require("./db");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.disable("powered-by");
app.use(bodyParser());
app.use(cookieP());
app.use(express.static(__dirname + "/public"));
app.use(
    cookieSession({
        secret: "funky-chicken",
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);
// app.use((req, res, next) => {
//     if (!req.session.userId && req.url != "/register" && req.url != "/login") {
//         res.redirect("/");
//     } else {
//         next();
//     }
// });

app.use(csurf());
app.use(function(req, res, next) {
    console.log(req.body);
    res.setHeader("X-Frame-Options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.get("/", (req, res) => {
    res.render("welcome");
});
app.post("/register", (req, res, next) => {
    console.log(req.body);
    if (
        req.body.first &&
        req.body.last &&
        req.body.email &&
        req.body.password
    ) {
        let first = req.body.first;
        let last = req.body.last;
        req.session.name = {
            first: first,
            last: last
        };
        hashPassword(req.body.password)
            .then((hash) => {
                saveUser(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hash
                ).then((result) => {
                    req.session.userId = result.rows[0].id;

                    res.redirect("/profile");
                });
            })
            .catch((err) => {
                console.log(`There was an error in POST /register ${err}`);
            });
    } else {
        res.render("register", {
            err: "* please fill all information "
        });
    }
});
app.get("/register", (req, res, next) => {
    if (req.session.userId) {
        res.redirect("/login");
    } else {
        res.render("register");
    }
});
app.get("/profile", (req, res) => {
    res.render("profile");
});
app.post("/profile", (req, res) => {
    console.log(req.body);
    if (req.body.age || req.body.city || req.body.home) {
        saveProfile(
            req.body.age,
            req.body.city,
            req.body.home,
            req.session.userId
        )
            .then(() => {
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log(`There was an error in POST profile: ${err}`);
            });
    } else {
        res.redirect("/petition");
    }
});
app.post("/login", (req, res, next) => {
    let inputEmail = req.body.email;
    getPass(inputEmail)
        .then((result) => {
            req.session.name = {
                first: result.rows[0].first,
                last: result.rows[0].last
            };
            req.session.userId = result.rows[0].id;
            checkPassword(req.body.password, result.rows[0].password).then(
                (bool) => {
                    if (bool) {
                        getSig(req.session.userId)
                            .then((result) => {
                                console.log(result.rows[0]);
                                if (result.rows[0].signature) {
                                    req.session.sigId = true;
                                    res.redirect("/thanks");
                                } else {
                                    res.redirect("/petition");
                                }
                            })
                            .catch((err) => {
                                console.log(
                                    `there was an error in POST/login: ${err}`
                                );
                            });
                    } else {
                        res.render("login", {
                            err: "* Please try again "
                        });
                    }
                }
            );
        })
        .catch((err) => {
            console.log(`There was an error in POST /login ${err}`);
        });
});
app.get("/login", (req, res, next) => {
    res.render("login");
});

app.post("/petition", (req, res, next) => {
    console.log(req.body);
    if (req.body.sig) {
        //// need to make a check if already signed/// //
        saveSign(req.body.sig, req.session.userId)
            .then((result) => {
                req.session.sigId = true;
                // req.session.Id = result[0].id;
                res.redirect("/thanks");
            })
            .catch((err) => {
                console.log("there was an err in post /petition", err);
            });
    } else {
        getNum()
            .then((result) => {
                let x = result.rows[0].count;
                res.render("petition", {
                    err: "* please fill all information",
                    count: 10000 - x,
                    first: req.session.name.first,
                    last: req.session.name.last
                });
            })
            .catch((err) => {
                console.log(`There was an error in getNum /petition ${err}`);
            });
    }
});
app.get("/petition", (req, res, next) => {
    getNum().then((result) => {
        // console.log(result);
        let x = result.rows[0].count;
        if (req.session.sigId) {
            res.redirect("/thanks");
        } else {
            res.render("petition", {
                count: 10000 - x,
                first: req.session.name.first,
                last: req.session.name.last
            });
        }
    });
});
app.get("/signed", (req, res) => {
    getSignares()
        .then((result) => {
            let arr = [];
            // console.log(result);
            for (let i = 0; i < result.rows.length; i++) {
                let obj = {};
                obj.first = result.rows[i].first;
                obj.last = result.rows[i].last;
                obj.age = result.rows[i].age;
                obj.city = result.rows[i].city;
                obj.url = result.rows[i].url;

                arr.push(obj);
            }
            res.render("signed", {
                name: arr
            });
        })
        .catch((err) => {
            console.log(`There was an error in GET /signed ${err}`);
        });
});
app.get("/signed/:city", (req, res) => {
    console.log(req.params.city);
    getSignares2(req.params.city).then((result) => {
        let arr = [];
        // console.log(result);
        for (let i = 0; i < result.rows.length; i++) {
            let obj = {};
            obj.first = result.rows[i].first;
            obj.last = result.rows[i].last;
            obj.age = result.rows[i].age;
            obj.url = result.rows[i].url;
            arr.push(obj);
        }
        res.render("signedCity", {
            name: arr
        });
    });
});
app.get("/user/:path", (req, res) => {
    let website = req.params.path;
    website = new URL(website);
    if (!website.protocol) {
        website.protocol = "https://";
        res.redirect(`${website.protocol}${website.pathname}`);
    } else {
        res.redirect(`${website.protocol}${website.pathname}`);
    }
});
app.get("/thanks", (req, res) => {
    getNum()
        .then((result) => {
            let x = result.rows[0].count;
            getSig(req.session.userId)
                .then((sig) => {
                    res.render("thanks", {
                        count: x,
                        sig: sig.rows[0].signature
                    });
                })
                .catch((err) => {
                    console.log(`there was error in getSig ${err}`);
                });
        })
        .catch((err) => {
            console.log(`There was an error in GET /signed ${err}`);
        });
});
app.get("/edit", (req, res) => {
    getUserEdit(req.session.userId)
        .then((result) => {
            let arr = [];
            // console.log(result);
            for (let i = 0; i < result.rows.length; i++) {
                let obj = {};
                obj.first = result.rows[i].first;
                obj.last = result.rows[i].last;
                obj.age = result.rows[i].age;
                obj.city = result.rows[i].city;
                obj.url = result.rows[i].url;
                obj.email = result.rows[i].email;

                arr.push(obj);
            }
            res.render("edit", {
                name: arr
            });
        })
        .catch((err) => {
            console.log(`there was an error in GET/edit: ${err}`);
        });
});
app.post("/edit", (req, res) => {
    console.log(req.body);
    if (req.body.password) {
        hashPassword(req.body.password)
            .then((hash) => {
                updateUsersPass(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hash,
                    req.session.userId
                ).then((result) => {
                    updateOrInsert(
                        req.body.age,
                        req.body.city,
                        req.body.url
                    ).then((result) => {
                        res.redirect("/thanks");
                    });
                });
            })
            .catch((err) => {
                console.log(
                    `there was error in POST/edit updateUsersPass: ${err}`
                );
            });
    } else {
        updateUsers(
            req.body.first,
            req.body.last,
            req.body.email,
            req.session.userId
        )
            .then((result) => {
                updateOrInsert(req.body.age, req.body.city, req.body.url).then(
                    (result) => {
                        res.redirect("/thanks");
                    }
                );
            })
            .catch((err) => {
                console.log(`there was error in POST/edit updateUsers: ${err}`);
            });
    }
});
app.post("/delete", (req, res) => {
    deleteSig(req.session.userId)
        .then((result) => {
            req.session.sigId = false;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log(`there is an error in POST/delete: ${err}`);
        });
});
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

app.listen(process.env.PORT || 8080, () => {
    console.log("im listening on 8080");
});
