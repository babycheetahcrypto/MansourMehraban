const { MongoClient } = require("mongodb")
require("dotenv").config({path: "./config.env"})

async function main() {

    const Db = process.env.ATLAS_URI
    const client = new MongoClient(Db)

try {
    await client.connect()
    const collection = await client.db("babycheetah").collection()
    collections.foreach((collection) => console.log(collection.s.namespace.collection))
} catch(e) {
    console.error(e)
} finally {
    await client.close()
}    
   
}

main()