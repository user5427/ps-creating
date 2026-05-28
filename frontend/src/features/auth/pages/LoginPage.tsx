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
import { defaultEventsSearch } from '../../../router'
import { login } from "../api";
import { useAppStore } from '../../../store/appStore'

export function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await login({ email, password });

            // store token and user in app store
            useAppStore.getState().setAuth(data.token, data.user);

            // redirect after login
            navigate({ to: "/events", search: defaultEventsSearch });
        } catch (err: any) {
            setError(err.message || "Login failed");
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
                            Login
                        </Typography>

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
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        </Container>
    );
}