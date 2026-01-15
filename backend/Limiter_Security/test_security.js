// testEnhancedMultiRoutes.js
import axios from "axios";

// Plusieurs routes possibles
const ROUTES = [
  "https://projet-stage-afec-2.onrender.com/auth/register",
];

// Génération dynamique des noms
function generateFirstName(index) {
  return `Kizaru_${index}`;
}

function generateLastName(index) {
  return `Borsalino_${index}`;
}

const TOTAL_USERS = 50;

async function sendUser(route, index) {
  const email = `user${index}@example.com`;
  const password = "12345678";
  const confirmPassword = password;

  // Payload conforme à ton backend
  const payload = {
    first_name: generateFirstName(index),
    last_name: generateLastName(index),
    email,
    password,
    confirmPassword,
    agency_id: 1,
    role: "admin"
  };

  try {
    await axios.post(route, payload);
    console.log(`[OK] ${route} → ${email}`);
  } catch (err) {
    console.log(
      `[ERREUR] ${route} → ${email} → ${err.response?.status || err.message}`
    );
  }
}

async function runTest() {
  console.log(`Test adapté → structure first_name / last_name / confirmPassword / role admin.\n`);

  for (const route of ROUTES) {
    console.log(`=== Test sur route : ${route} ===`);

    for (let i = 1; i <= TOTAL_USERS; i++) {
      await sendUser(route, i);
    }
  }

  console.log("\nTests terminés.");
}


runTest();