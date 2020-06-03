const cors = require("cors");
const express = require("express");
const path = require("path");
const serveIndex = require("serve-index");

const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.resolve(process.env.PUBLIC_DIR || path.join(__dirname, "public"));
const isDevelopment = process.env.NODE_ENV === "development";
const redirectConfig = JSON.parse(process.env.REDIRECT_CONFIG || "{}");

class ValidationError extends Error {
    constructor(message) {
        super(message);
    }
}

function getResponseStatusFromError(error) {
    if (error instanceof ValidationError) {
        return 401;
    }

    return 500;
}

async function errorHandler(err, req, res, next) {
    console.error(err);
    const status = getResponseStatusFromError(err);
    const message = isDevelopment || status !== 500 ? err.message : "An error has occurred";
    res.status(status).contentType("application/json").json({ message });
}

function asyncHandler(handler) {
    return (req, res, next) => Promise.resolve()
        .then(() => handler(req, res, next))
        .catch(next);
}

app.use(cors());

for (const fromPath of Object.keys(redirectConfig)) {
    const toLocation = redirectConfig[fromPath];
    if (toLocation) {
        app.get(fromPath, asyncHandler(async (req, res) => {
            const location = `${toLocation}${req.query.p ? req.query.p : ""}`;
            res.redirect(302, location);
        }));
    }
}

app.use("/", express.static(publicDir));
app.use("/", serveIndex(publicDir));

app.use(errorHandler);
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));
