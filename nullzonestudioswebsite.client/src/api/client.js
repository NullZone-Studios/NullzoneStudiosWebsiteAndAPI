const BASE_URL = "";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve();
    });
    failedQueue = [];
};

const request = async (url, options = {}) => {
    const response = await fetch(`${BASE_URL}${url}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (response.status === 401) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => request(url, options));
        }

        isRefreshing = true;

        try {
            const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!refreshResponse.ok) {
                processQueue(new Error('Session expired.'))
                window.dispatchEvent(new Event('auth:sessionexpired'));
                return refreshResponse;
            }

            processQueue(null);
            return request(url, options);
        } catch (error) {
            processQueue(error);
            window.dispatchEvent(new Event('auth:sessionexpired'));
            throw error;
        } finally {
            isRefreshing = false;
        }
    }

    return response;
}

const client = {
    get: (url, options = {}) => request(url, { ...options, method: 'GET' }),
    post: (url, body, options = {}) => request(url, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: (url, body, options = {}) => request(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: (url, options = {}) => request(url, { ...options, method: 'DELETE' })
};

export default client;