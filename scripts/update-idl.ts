#!/usr/bin/env ts-node

import * as fs from "fs";
import * as path from "path";

// Paths
const targetIdlPath = path.join(__dirname, "../target/idl/sonicpact.json");
const appIdlPath = path.join(
  __dirname,
  "../app/src/shared/utils/idl/sonicpact.ts"
);

// Interface for the IDL
interface Idl {
  address: string;
  metadata: {
    name: string;
    version: string;
    spec: string;
    description: string;
  };
  instructions: any[];
  accounts: any[];
  errors: any[];
  types: any[];
}

// Function to update the IDL file
async function updateIDL(): Promise<void> {
  try {
    console.log("Reading IDL from", targetIdlPath);

    // Check if the target IDL file exists
    if (!fs.existsSync(targetIdlPath)) {
      console.error("Error: Target IDL file not found.");
      console.error(
        "Make sure you have built the program with `anchor build`."
      );
      process.exit(1);
    }

    // Read the target IDL file
    const idlJson = fs.readFileSync(targetIdlPath, "utf8");
    const idl: Idl = JSON.parse(idlJson);

    // Create the TypeScript export
    const tsContent = `export const IDL = ${JSON.stringify(idl, null, 2)};`;

    // Ensure directories exist
    const appIdlDir = path.dirname(appIdlPath);

    if (!fs.existsSync(appIdlDir)) {
      fs.mkdirSync(appIdlDir, { recursive: true });
    }

    // Write to the app IDL file
    console.log("Writing IDL to", appIdlPath);
    fs.writeFileSync(appIdlPath, tsContent);

    console.log("IDL updated successfully!");
  } catch (error) {
    console.error("Error updating IDL:", error);
    process.exit(1);
  }
}

// Run the update function
updateIDL();
