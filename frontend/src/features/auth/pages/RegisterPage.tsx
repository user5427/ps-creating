import { useState } from "react";
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import * as authApi from "../api";

export function RegisterPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState<'ATTENDEE' | 'ORGANIZER' | 'SCANNER'>('ATTENDEE')
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const phoneIsValid = phoneNumber.trim().length === 0 || phoneRegex.test(phoneNumber.trim());

    const handleRegister = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!phoneIsValid) {
                setError("Please enter a valid phone number (E.164 format, e.g. +15555550123).");
                return;
            }

            await authApi.register({ email, password, firstName, lastName, phoneNumber, role });
            navigate({ to: "/login", search: {} });
        } catch (err: any) {
            setError("Registration failed");
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

                        <TextField
                            label="Phone number (optional)"
                            fullWidth
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            error={!phoneIsValid}
                            helperText={
                                phoneIsValid
                                    ? "Use E.164 format, e.g. +15555550123"
                                    : "Invalid phone number format"
                            }
                        />

                        <ToggleButtonGroup
                            size="small"
                            value={role}
                            exclusive
                            onChange={(_, next) => next && setRole(next)}
                            aria-label="Register role"
                        >
                            <ToggleButton value="ATTENDEE">Attendee</ToggleButton>
                            <ToggleButton value="ORGANIZER">Organizer</ToggleButton>
                            <ToggleButton value="SCANNER">Scanner</ToggleButton>
                        </ToggleButtonGroup>

                        {error && (
                            <Typography color="error">{error}</Typography>
                        )}

                        <Button
                            variant="contained"
                            onClick={handleRegister}
                            disabled={loading || !phoneIsValid}
                        >
                            {loading ? "Registering..." : "Register"}
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        </Container>
    );
}


