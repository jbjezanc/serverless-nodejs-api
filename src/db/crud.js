const { desc, eq } = require("drizzle-orm");
const client = require("./clients");
const schemas = require("./schemas.cjs");

async function newLead({ email }) {
  const db = await client.getDrizzleDbClient();
  const result = await db
    .insert(schemas.LeadTable)
    .values({
      email: email,
    })
    // .returning({ newEmail: schemas.LeadTable.email });
    .returning();
  if (result.length === 1) {
    return result[0];
  }
  return result;
}

async function getLeads() {
  const db = await client.getDrizzleDbClient();
  const results = await db
    .select()
    .from(schemas.LeadTable)
    .orderBy(desc(schemas.LeadTable.createdAt))
    .limit(10);
  return results;
}

async function getLead(id) {
  const db = await client.getDrizzleDbClient();
  const result = await db
    .select()
    .from(schemas.LeadTable)
    .where(eq(schemas.LeadTable.id, id));

  if (result.length === 1) {
    return result[0];
  }
  return result;
}

module.exports.newLead = newLead;
module.exports.getLeads = getLeads;
module.exports.getLead = getLead;
