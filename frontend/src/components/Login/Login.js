import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase.js";
import { useNavigate } from "react-router-dom";

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);

    const user = result.user;
    const token = await user.getIdToken();

    console.log("User:", user.email);
    console.log("Firebase Token:", token);

    // Send token to backend
    await fetch("http://localhost:8000/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token })
    });

  } catch (err) {
    console.log("Login failed:", err);
  }
};

export default function Login() {
    const navigate = useNavigate();
  
    const loginWithGoogle = async () => {
      try {
        const result = await signInWithPopup(auth, provider);
        const token = await result.user.getIdToken();
  
        localStorage.setItem("firebaseToken", token);
  
        // OPTIONAL: verify with backend
        await fetch("http://localhost:8000/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });
  
        // 🔥 SWITCH PAGE
        navigate("/dashboard");
  
      } catch (err) {
        console.log(err);
      }
    };
  
    return (
      <div>
        <h2>Login Page</h2>
        <button onClick={loginWithGoogle}>
          Login with Google
        </button>
      </div>
    );
}