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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();
    const emailIsValid = trimmedEmail.length > 0 && emailRegex.test(trimmedEmail);

    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    const trimmedPhone = phoneNumber.trim();
    const phoneIsEmpty = trimmedPhone.length === 0;
    const phoneIsValid = phoneIsEmpty || phoneRegex.test(trimmedPhone);

    const handleRegister = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!emailIsValid) {
                setError("Please enter a valid email address.");
                return;
            }

            if (!phoneIsValid) {
                setError("Please enter a valid phone number (E.164 format, e.g. +15555550123).");
                return;
            }

            await authApi.register({
                email: trimmedEmail,
                password,
                firstName,
                lastName,
                phoneNumber: trimmedPhone,
                role,
            });
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
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={email.length > 0 && !emailIsValid}
                            helperText={
                                email.length === 0
                                    ? ""
                                    : emailIsValid
                                        ? ""
                                        : "Please enter a valid email address"
                            }
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
                                phoneIsEmpty
                                    ? "Use E.164 format, e.g. +15555550123"
                                    : phoneIsValid
                                        ? ""
                                        : "Phone number must start with + and use E.164 format"
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
                            disabled={loading || !phoneIsValid || !emailIsValid}
                        >
                            {loading ? "Registering..." : "Register"}
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        </Container>
    );
}


