import { type NavigateFunction } from 'react-router';

function successOrRedirect(navigate: NavigateFunction) {
  function useSuccessOrNavigate(res: Response) {
    if (res.status !== 401 && res.status !== 403) {
      return res;
    } else {
      navigate('/login');
      throw new Error('Unauthorized');
    }
  }
  return useSuccessOrNavigate;
}

function getCookie(name: string) {
  const parts = document.cookie.split(`${name}=`);
  if (parts.length === 2) {
    const part = parts.pop();
    return part ? part.split(';').shift() : undefined;
  }
  return undefined;
}

function getHeaders() {
    const requestHeaders: HeadersInit = new Headers();
    const cookie = getCookie('csrftoken');
    if (!cookie) {
        console.error("No CSRF token found in cookies");
        throw new Error("No CSRF token found in cookies");
    }
    requestHeaders.set('X-CSRFToken', cookie);
    return requestHeaders;
}

function request(method: string, url: string, navigate: NavigateFunction, headers?: Record<string, string>, body?: Record<string, string>) {
    const requestHeaders = getHeaders();
    Object.entries(headers ?? {}).forEach(([key, value]) => {
        requestHeaders.set(key, value);
    });

    return fetch(url, {
        method,
        credentials: 'include',
        headers: requestHeaders,
        body: JSON.stringify(body),
    }).then(successOrRedirect(navigate));
}

  const get = (url: string, navigate: NavigateFunction, headers?: Record<string,string>) => request('GET', url, navigate, headers);
  const post = (url: string, navigate: NavigateFunction, headers?: Record<string,string>, body?: Record<string,string>) => request('POST', url, navigate, headers, body);
  const put = (url: string, navigate: NavigateFunction, headers?: Record<string,string>, body?: Record<string,string>) => request('PUT', url, navigate, headers, body);
  const del = (url: string, navigate: NavigateFunction, headers?: Record<string,string>, body?: Record<string,string>) => request('DELETE', url, navigate, headers, body);

export { successOrRedirect, get, post, put, del };