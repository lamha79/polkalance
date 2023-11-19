import { User } from '../utility/src';
import { privateApi, publicApi } from '../front-provider/src';

export interface SignInWithAlepZeroProps {
  wallet: string;
  message: string;
  signature: string;
}

export interface SignUpWithAlepZeroProps extends SignInWithAlepZeroProps {
  wallet: `${string}`;
  email: string;
  firstname: string;
  lastname: string;
  currentUserType: string;
  agreeTOS: boolean;
  agreeDataTreatment: boolean;
}

export type SignInWithAlepZero = (props: SignInWithAlepZeroProps) => Promise<User>;

export type SignUpWithAlepZero = (props: SignUpWithAlepZeroProps) => Promise<boolean>;

export type GetNonceApi = (address: string) => Promise<string>;

export type GetRefreshToken = () => Promise<string>;

export const getNonceApi: GetNonceApi = async (address) => {
  const response = await publicApi.post(`/auth/getNonce/${address}`);
  return response.data.nonce;
};

export const signInWithAlepZeroApi: SignInWithAlepZero = async (payload) => {
  const response = await publicApi.post(`/auth/login`, payload, { withCredentials: true });
  return response.data;
};

export const signUpWithAlepZeroApi: SignUpWithAlepZero = async (payload) => {
  const response = await publicApi.post(`/auth/register`, payload);
  console.log(response.data);
  return response.data;
};

export const getRefreshToken: GetRefreshToken = async () => {
  const response = await privateApi.get('/auth/refresh');
  return response.data;
};
