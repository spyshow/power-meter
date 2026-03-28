import type { AuthProvider } from "@refinedev/core";
import axios from "axios";

// Configure axios to include token in all requests
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authProvider: AuthProvider = {
    login: async ({ username, password }) => {
        try {
            const { data } = await axios.post("/api/auth/login", {
                username,
                password,
            });

            if (data.access_token) {
                localStorage.setItem("token", data.access_token);
                // We could also decode the token to get the role immediately if we wanted
                return {
                    success: true,
                    redirectTo: "/",
                };
            }
        } catch (error) {
            return {
                success: false,
                error: {
                    name: "LoginError",
                    message: "Invalid username or password",
                },
            };
        }

        return {
            success: false,
            error: {
                name: "LoginError",
                message: "Invalid username or password",
            },
        };
    },
    logout: async () => {
        localStorage.removeItem("token");
        return {
            success: true,
            redirectTo: "/login",
        };
    },
    check: async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                const now = Math.floor(Date.now() / 1000);
                
                if (payload.exp && payload.exp < now) {
                    console.log("Token expired, logging out");
                    localStorage.removeItem("token");
                    return {
                        authenticated: false,
                        logout: true,
                        redirectTo: "/login",
                    };
                }

                return {
                    authenticated: true,
                };
            } catch (e) {
                localStorage.removeItem("token");
                return {
                    authenticated: false,
                    logout: true,
                    redirectTo: "/login",
                };
            }
        }

        return {
            authenticated: false,
            logout: true,
            redirectTo: "/login",
        };
    },
    getPermissions: async () => {
        const token = localStorage.getItem("token");
        if (token) {
            // Decode JWT to get role
            // Basic base64 decode for the payload part
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                return payload.role;
            } catch (e) {
                return null;
            }
        }
        return null;
    },
    getIdentity: async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const payload = JSON.parse(jsonPayload);
                return {
                    id: payload.sub,
                    name: payload.username,
                };
            } catch (e) {
                return null;
            }
        }
        return null;
    },
    onError: async (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            return {
                logout: true,
                redirectTo: "/login",
            };
        }

        return { error };
    },
};
