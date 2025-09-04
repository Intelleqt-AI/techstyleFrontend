import { useState, useTransition } from 'react';

export function useActionState(action: (formData: any) => Promise<any>, initialState: any) {
  const [state, setState] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  const formAction = async (formData: any) => {
    startTransition(async () => {
      const result = await action(formData);
      setState(result);
    });
  };

  return [state, formAction, isPending] as const;
}
