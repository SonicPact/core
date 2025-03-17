#!/usr/bin/env node

/**
 * Development initialization script
 * 
 * This script runs a series of initialization tasks for the project:
 * 1. Updates the IDL files
 * 2. Generates sample NFT metadata
 * 3. Creates mock NFT upload data
 */

const { spawn } = require('child_process');
const path = require('path');

// Define the scripts to run
const scripts = [
  { name: 'Update IDL', command: 'npm', args: ['run', 'update-idl'] },
  { name: 'Generate NFT Metadata', command: 'ts-node', args: ['scripts/generate-nft-metadata.ts'] },
  { name: 'Upload NFT Metadata', command: 'ts-node', args: ['scripts/upload-nft-metadata.ts'] }
];

// Function to run a single script
function runScript(script) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running: ${script.name}...`);
    
    const process = spawn(script.command, script.args, { 
      stdio: 'inherit',
      shell: true
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${script.name} completed successfully!`);
        resolve();
      } else {
        console.error(`❌ ${script.name} failed with code ${code}`);
        reject(new Error(`Script failed with code ${code}`));
      }
    });
    
    process.on('error', (err) => {
      console.error(`❌ Failed to start ${script.name}: ${err.message}`);
      reject(err);
    });
  });
}

// Run all scripts in sequence
async function runAllScripts() {
  console.log('🛠️  Initializing development environment...');
  
  for (const script of scripts) {
    try {
      await runScript(script);
    } catch (error) {
      console.error(`Failed during initialization: ${error.message}`);
      process.exit(1);
    }
  }
  
  console.log('\n✨ Development environment initialized successfully! ✨');
}

// Run the initialization
runAllScripts();