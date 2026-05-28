import apiClient from '../../api/client'
import { LoginResponseSchema, type LoginResponse } from "./schemas";

// apiClient's baseURL typically includes the '/api' prefix (VITE_API_URL).
// The auth controller is mounted at the server root (/auth) so build an
// absolute backend root URL by stripping a trailing '/api' from the configured
// base if present, and use that for auth calls so we hit e.g. http://localhost:8080/auth/login
const CONFIGURED_API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const BACKEND_ROOT = CONFIGURED_API.replace(/\/api\/?$/, '')

export type LoginPayload = {
    email: string;
    password: string;
};

export type RegisterPayload = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'ATTENDEE' | 'ORGANIZER' | 'SCANNER'
    phoneNumber?: string;
}

export async function register(payload: RegisterPayload) {
    const url = `${BACKEND_ROOT}/auth/register`
    const { data } = await apiClient.post(url, payload)
    return data
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
    // Use absolute URL to hit the auth controller at the server root
    const loginUrl = `${BACKEND_ROOT}/auth/login`
    // backend expects { username, password }
    const { data: authData } = await apiClient.post(loginUrl, {
        username: payload.email,
        password: payload.password,
    })

    const token: string = authData.token

    // Fetch current user using the token. Use a direct request with the
    // Authorization header because apiClient may not yet have the token in state.
    const meUrl = `${BACKEND_ROOT}/auth/me`
    const { data: userData } = await apiClient.get(meUrl, {
        headers: { Authorization: `Bearer ${token}` },
    })

    return LoginResponseSchema.parse({ token, user: userData })
}