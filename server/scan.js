/* eslint-disable no-undef */
const express = require("express")
const path = require("path")

const app = express()
const port = 5679

const frontendPath = path.join(__dirname, "build")

app.use(express.static(frontendPath))

app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"))
})

console.log(path.join(frontendPath, "index.html"));

app.listen(port, () => {
    console.log("Server running")
})