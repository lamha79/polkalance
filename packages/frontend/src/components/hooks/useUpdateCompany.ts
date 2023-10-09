import { useCurrentCompany } from '../../front-provider/src';
import { CreateCompany } from '../../utility/src';
import { useCallback, useState } from 'react';
import { updateCompany } from '../services/company';

export const useUpdateCompany = () => {
  const [loading, setLoading] = useState(false);
  const { setCompany } = useCurrentCompany();

  const updateMyCompany = useCallback(
    async (company: Partial<CreateCompany>) => {
      setLoading(true);
      const res = await updateCompany(company);
      setCompany(res);
      setLoading(false);
    },
    [setCompany]
  );

  return { loading, updateMyCompany };
};
