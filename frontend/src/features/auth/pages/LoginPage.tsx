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
import { useNavigate, useSearch } from "@tanstack/react-router";
import { login } from "../api";
import { useAppStore } from '../../../store/appStore'

export function LoginPage() {
    const navigate = useNavigate();
    const search = useSearch({ strict: false })
    const returnTo = (search as any)?.returnTo || "/events"

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await login({ email, password });

            useAppStore.getState().setAuth(data.token, data.user);

            navigate({ to: returnTo as any })
        } catch (err: any) {
            setError("Login failed");
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