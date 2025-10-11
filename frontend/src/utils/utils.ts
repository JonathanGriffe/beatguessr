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

export { successOrRedirect };