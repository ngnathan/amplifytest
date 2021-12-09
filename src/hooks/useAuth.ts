import { useContext } from 'react';

import AuthContext, { AuthContextValue } from 'src/contexts/AuthContext';

const useAuth = (): AuthContextValue => useContext(AuthContext);

export default useAuth;
