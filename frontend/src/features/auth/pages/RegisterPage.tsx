import { useState } from "react";
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Stack,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import * as authApi from "../api";

export function RegisterPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async () => {
        setLoading(true);
        setError(null);

        try {
            await authApi.register({ email, password, firstName, lastName });
            // After successful registration redirect to login
            navigate({ to: "/login" });
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: "80vh",
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <Paper sx={{ p: 4, width: "100%" }}>
                    <Stack spacing={3}>
                        <Typography variant="h5" fontWeight={600}>
                            Register
                        </Typography>

                        <TextField
                            label="First name"
                            fullWidth
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />

                        <TextField
                            label="Last name"
                            fullWidth
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />

                        <TextField
                            label="Email"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        {error && (
                            <Typography color="error">{error}</Typography>
                        )}

                        <Button
                            variant="contained"
                            onClick={handleRegister}
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Register"}
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        </Container>
    );
}


