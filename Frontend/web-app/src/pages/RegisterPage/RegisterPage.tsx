import { useState, type FormEvent } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAppDispatch, login } from "../../store";
import { authService } from "../../services/auth.service";
import { notyf } from "../../utils/notyf";
import { getErrorMessage } from "../../utils/error-helper";
import "../LoginPage/LoginPage.css";
import "./RegisterPage.css";

function RegisterPage() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError("");

       
        if (!firstName || !lastName || !email || !password) {
            setError("All fields are required.");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);
            const token = await authService.register({ firstName, lastName, email, password });
            dispatch(login(token));
            notyf.success("Registration successful!");
            navigate("/vacations");
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Registration failed. Please try again."));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="RegisterPage">
            <form onSubmit={handleSubmit} className="AuthForm">
                <h2>Register</h2>

                {error && <div className="ErrorMessage">{error}</div>}

                <label>
                    First Name
                    <input
                        type="text"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        placeholder="Enter your first name"
                        autoFocus
                    />
                </label>

                <label>
                    Last Name
                    <input
                        type="text"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        placeholder="Enter your last name"
                    />
                </label>

                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Enter your email"
                    />
                </label>

                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Minimum 6 characters"
                    />
                </label>

                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>

                <p className="AuthLink">
                    Already have an account? <NavLink to="/login">Login here</NavLink>
                </p>
            </form>
        </div>
    );
}

export default RegisterPage;
