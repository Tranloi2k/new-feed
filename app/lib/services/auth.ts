import { cookies } from "next/headers";

async function login(params: { email: string; password: string }) {
  const { email, password } = params;
  const options = {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
  };
  const response = await fetch(
    `${process.env.EXTERNAL_API_URL}/api/auth/login`,
    options
  );

  if (!response.ok) {
    throw new Error("Login failed");
  }

  // Return raw response để có thể access headers
  return response;
}

async function logout() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");

    if (accessToken?.value) {
      // Call backend logout endpoint
      await fetch(`${process.env.EXTERNAL_API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    console.error("Backend logout failed:", error);
    // Continue with cookie cleanup even if backend call fails
  }
}

async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token");
    const userId = cookieStore.get("user_id");

    if (accessToken?.value) {
      const response = await fetch(
        `${process.env.EXTERNAL_API_URL}/api/auth/me`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Cookie: cookieStore.toString(),
            "x-user-id": userId?.value || "",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      return data.data;
    }
    throw Error("cannot find access token, maybe login");
  } catch (error) {
    console.error("Failed:", error);
    return null;
  }
}

export { login, logout, getCurrentUser };
