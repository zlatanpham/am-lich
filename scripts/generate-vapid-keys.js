#!/usr/bin/env node

/**
 * Generate VAPID keys for push notifications
 * Run with: node scripts/generate-vapid-keys.js
 */

import webpush from "web-push";

function generateVAPIDKeys() {
  console.log("🔑 Generating VAPID keys for push notifications...\n");

  const vapidKeys = webpush.generateVAPIDKeys();

  console.log("✅ VAPID keys generated successfully!\n");
  console.log("Add these environment variables to your .env file:\n");
  console.log("# Push notification VAPID keys");
  console.log(`VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
  console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
  console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
  console.log(
    "\n📝 Note: Keep the private key secure and never expose it to the client!",
  );
  console.log("🔒 The public key is safe to include in client-side code.");

  console.log(
    "\n🚀 After adding these to .env, restart your development server.",
  );
  console.log("💡 Test push notifications at: /notifications");

  return vapidKeys;
}

// Run the function
generateVAPIDKeys();
