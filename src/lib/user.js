import clientPromise from "./mongodb";

let client;
let db;
let users; // This needs to be assigned inside init()

async function init() {
  if (db) return;
  try {
    client = await clientPromise;
    db = client.db("imageprocessing");
    // 👇 Assign the collection here
    users = db.collection("users"); 
  } catch (error) {
    throw new Error("Failed to connect to database");
  }
}

export async function getAdminEmails() {
  await init();

  const admins = await users
    .find({ role: "admin" })
    .project({ email: 1, _id: 0 })
    .toArray();

  return admins.map(user => user.email);
}

export async function createUser(user) {
  await init();
  const result = await users.insertOne(user);
  return { _id: result.insertedId, ...user }; 
}

export async function findUserByEmail(email) {
  await init();
  return users.findOne({ email });
}