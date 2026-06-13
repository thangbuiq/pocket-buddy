#!/usr/bin/env bun
import { db } from "../db";
import { users } from "../db/schema";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

// Parse command line arguments
const args = process.argv.slice(2);
const emailArg = args.find((a) => a.startsWith("--email="));
const passwordArg = args.find((a) => a.startsWith("--password="));
const nameArg = args.find((a) => a.startsWith("--name="));

const email = emailArg?.split("=")[1];
const password = passwordArg?.split("=")[1];
const name = nameArg?.split("=")[1];

async function createUser() {
  // Validate inputs
  if (!email || !password) {
    console.error("Usage: bun run scripts/create-user.ts --email=<email> --password=<password> [--name=<name>]");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Error: Password must be at least 8 characters");
    process.exit(1);
  }

  try {
    // Check if user already exists
    const existing = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });

    if (existing) {
      console.error(`Error: User with email ${email} already exists`);
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = randomUUID();
    await db.insert(users).values({
      id: userId,
      email,
      name: name || null,
      passwordHash,
    });

    console.log(`✓ User created successfully`);
    console.log(`  ID: ${userId}`);
    console.log(`  Email: ${email}`);
    if (name) console.log(`  Name: ${name}`);
  } catch (error) {
    console.error("Error creating user:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createUser();
