import jwt from 'jsonwebtoken'

export default function (req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token === null) return res.status(403).send("A token is required for authentication");

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.status(401).send({status: "Invalid Token"})

        req.user = user
        next()
    })
}

