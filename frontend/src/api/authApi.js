const BASE_URL = "http://localhost:8080/api/auth";

export const loginUser = async (username, password) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const text = await response.text();

  if (text.startsWith("Error")) {
    throw new Error("Invalid credentials");
  }

  // text is the raw JWT token
  return text;
};

export const registerUser = async (username, password, email, role) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email, role }),
  });

  const text = await response.text();

  if (text.startsWith("Error")) {
    // Return the specific error from backend (username taken, email in use)
    throw new Error(text.replace("Error: ", ""));
  }

  return text; // "User registered successfully!"
};
