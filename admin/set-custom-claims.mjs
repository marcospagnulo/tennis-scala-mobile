import {applicationDefault, initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";

function printUsage() {
  console.log(`Usage:
  npm run set-claim -- --email user@example.com --claims '{"admin":true}'
  npm run set-claim -- --uid USER_UID --claims '{"admin":true}'
  npm run set-claim -- --email user@example.com --clear

Options:
  --email <email>     Target user email
  --uid <uid>         Target user uid
  --claims <json>     JSON object with custom claims
  --clear             Remove all custom claims
  --project <id>      Firebase project id (required with emulator)

Environment:
  GOOGLE_APPLICATION_CREDENTIALS  Path to a service account JSON file
  FIREBASE_AUTH_EMULATOR_HOST     Optional, e.g. localhost:9099

Notes:
  - Use either --email or --uid
  - Use either --claims or --clear
  - After setting claims, the user must refresh the ID token
`);
}

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    switch (token) {
      case "--email":
        args.email = next;
        index += 1;
        break;
      case "--uid":
        args.uid = next;
        index += 1;
        break;
      case "--claims":
        args.claims = next;
        index += 1;
        break;
      case "--project":
        args.projectId = next;
        index += 1;
        break;
      case "--clear":
        args.clear = true;
        break;
      case "--help":
      case "-h":
        args.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${token}`);
    }
  }

  return args;
}

function validateArgs(args) {
  if (args.help) {
    return;
  }

  if ((args.email && args.uid) || (!args.email && !args.uid)) {
    throw new Error("You must provide exactly one of --email or --uid.");
  }

  if ((args.claims && args.clear) || (!args.claims && !args.clear)) {
    throw new Error("You must provide exactly one of --claims or --clear.");
  }

  if (process.env.FIREBASE_AUTH_EMULATOR_HOST && !args.projectId) {
    throw new Error(
      "When using FIREBASE_AUTH_EMULATOR_HOST you must also pass --project <projectId>.",
    );
  }
}

function parseClaims(rawClaims) {
  if (!rawClaims) {
    return null;
  }

  let claims;

  try {
    claims = JSON.parse(rawClaims);
  } catch (error) {
    throw new Error(`Invalid JSON for --claims: ${error.message}`);
  }

  if (
    claims === null ||
    Array.isArray(claims) ||
    typeof claims !== "object"
  ) {
    throw new Error("--claims must be a JSON object.");
  }

  return claims;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    return;
  }

  validateArgs(args);

  const isEmulator = Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST);
  const projectId = args.projectId;

  initializeApp(
    isEmulator
      ? {projectId}
      : {
          credential: applicationDefault(),
          ...(projectId ? {projectId} : {}),
        },
  );

  const auth = getAuth();
  const user = args.uid
    ? await auth.getUser(args.uid)
    : await auth.getUserByEmail(args.email);
  const claims = args.clear ? null : parseClaims(args.claims);

  await auth.setCustomUserClaims(user.uid, claims);

  const updatedUser = await auth.getUser(user.uid);

  console.log("Updated user:", updatedUser.uid);
  console.log("Email:", updatedUser.email ?? "(no email)");
  console.log("Custom claims:", updatedUser.customClaims ?? {});

  if (isEmulator) {
    console.log("Auth emulator:", process.env.FIREBASE_AUTH_EMULATOR_HOST);
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
