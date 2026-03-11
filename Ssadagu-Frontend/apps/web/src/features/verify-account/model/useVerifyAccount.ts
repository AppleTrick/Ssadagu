export const useVerifyAccount = () => {
  const sendCode = async (accountId: number) => {};
  const confirmCode = async (accountId: number, code: string) => {};
  return { sendCode, confirmCode };
};
