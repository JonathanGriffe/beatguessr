export function successOrRedirect(navigate) {
  function useSuccessOrNavigate(res) {
    if (res.status !== 401 && res.status !== 403) {
      return res;
    } else {
      navigate('/login');
      throw new Error('Unauthorized');
    }
  }
  return useSuccessOrNavigate;
}