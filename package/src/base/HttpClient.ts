import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
} from "axios";
import { ExtensionsError } from "./ExtensionsError.js";

export interface HttpClientOptions {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
    userAgent?: string;
}

const DEFAULT_USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

/**
 * Thin wrapper around axios that all providers use for HTTP requests.
 * Centralises error handling, default headers, and retry logic.
 */
export class HttpClient {
    protected client: AxiosInstance;
    protected providerName: string;

    constructor(providerName: string, options: HttpClientOptions = {}) {
        this.providerName = providerName;

        this.client = axios.create({
            baseURL: options.baseURL,
            timeout: options.timeout ?? 15_000,
            headers: {
                "User-Agent": options.userAgent ?? DEFAULT_USER_AGENT,
                Accept:
                    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate, br",
                ...options.headers,
            },
        });

        // Response interceptor — unwrap Axios errors into ExtensionsError
        this.client.interceptors.response.use(
            (res) => res,
            (err) => {
                const status: number = err?.response?.status ?? 500;
                const message: string =
                    err?.response?.statusText ??
                    err?.message ??
                    "Unknown network error";

                throw new ExtensionsError({
                    status,
                    message,
                    provider: this.providerName,
                });
            }
        );
    }

    async get<T = string>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.client.get<T>(url, config);
    }

    async post<T = unknown>(
        url: string,
        data?: unknown,
        config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> {
        return this.client.post<T>(url, data, config);
    }
}
