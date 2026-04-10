require("dotenv").config();
const mongoose = require("mongoose");
const dnsModule = require("dns");
dnsModule.setServers(["8.8.8.8", "1.1.1.1"]);
const dns = dnsModule.promises;

const isSrvLookupError = (error) => {
    const message = (error && error.message) || "";
    return message.includes("querySrv") || message.includes("ECONNREFUSED");
};

const buildDirectMongoUriFromSrv = async (srvUri) => {
    const parsed = new URL(srvUri);
    const hostname = parsed.hostname;
    const srvName = `_mongodb._tcp.${hostname}`;

    const srvRecords = await dns.resolveSrv(srvName);
    if (!srvRecords.length) {
        throw new Error("No SRV records found for Atlas host.");
    }

    const hostList = srvRecords
        .map((record) => `${record.name}:${record.port}`)
        .join(",");

    let txtOptions = "";
    try {
        const txtRecords = await dns.resolveTxt(hostname);
        txtOptions = txtRecords
            .map((entry) => entry.join(""))
            .filter(Boolean)
            .join("&");
    } catch (_) {
        txtOptions = "";
    }

    const existingOptions = parsed.searchParams.toString();
    const mergedOptions = [existingOptions, txtOptions]
        .filter(Boolean)
        .join("&");

    const pathname = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "/";
    return `mongodb://${parsed.username}:${parsed.password}@${hostList}${pathname}${mergedOptions ? `?${mergedOptions}` : ""}`;
};

const connectWithFallback = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error("MONGO_URI is missing in environment variables.");
    }

    try {
        await mongoose.connect(uri);
    } catch (error) {
        if (!uri.startsWith("mongodb+srv://") || !isSrvLookupError(error)) {
            throw error;
        }

        const directUri = await buildDirectMongoUriFromSrv(uri);
        console.log("SRV lookup failed. Retrying with direct MongoDB hosts...");
        await mongoose.connect(directUri);
    }
};

async function run() {
    await connectWithFallback();
    const db = mongoose.connection.db;

    const oldNames = ["elderlydevotional", "elderlydevotionals"];
    const newName = "elderlyinspirationals";

    const collections = (await db.listCollections().toArray()).map((c) => c.name);
    console.log("Collections before:", collections);

    const oldName = oldNames.find((name) => collections.includes(name));

    if (!oldName) {
        console.log("No devotional collection found. Nothing to rename.");
        return;
    }

    if (collections.includes(newName)) {
        console.log(`Target collection ${newName} already exists. Skipping rename.`);
        return;
    }

    await db.renameCollection(oldName, newName);
    console.log(`Renamed ${oldName} -> ${newName}`);

    const after = (await db.listCollections().toArray()).map((c) => c.name);
    console.log("Collections after:", after);
}

run()
    .catch((error) => {
        console.error("Migration failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        try {
            await mongoose.disconnect();
        } catch (_) {
            // ignore disconnect errors
        }
    });
