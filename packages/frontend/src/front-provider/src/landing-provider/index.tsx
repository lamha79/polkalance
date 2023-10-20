/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, ReactNode, useContext, useState } from 'react';
import { UserTypeEnum } from '../../../utility/src';

export type ViewType = UserTypeEnum;

type LandingContextInterface = {
  type: ViewType;
  currentView: string;
  signupModalOpen: boolean;
  createJobModalOpen: boolean;
  submitModalOpen: boolean;
  activeAccountUser: boolean;
  hasScroll: boolean;
  isCheckWallet: boolean;
  jobSubmitId: number;
  useFormDone: boolean;
  setType: (user: ViewType) => void;
  setCurrentView: (view: string) => void;
  setSignupModalOpen: (open: boolean) => void;
  setCreateJobModalOpen: (open: boolean) => void;
  setSubmitModalOpen: (open: boolean) => void;
  setActiveAccountUser: (open: boolean) => void;
  setHasScroll: (hasScroll: boolean) => void;
  setIsCheckWallet: (check: boolean) => void;
  setJobSubmitId: (jobId: number) => void;
  setUseFormDone: (x: boolean) => void;
};

export const LandingContext = createContext<LandingContextInterface>({
  type: UserTypeEnum.Freelancer,
  currentView: '',
  signupModalOpen: false,
  createJobModalOpen: false,
  submitModalOpen: false,
  activeAccountUser: false, 
  hasScroll: false,
  isCheckWallet: false,
  jobSubmitId: 0,
  useFormDone: false,
  setType: () => {},
  setCurrentView: () => {},
  setSignupModalOpen: () => {},
  setCreateJobModalOpen: () => {},
  setSubmitModalOpen: () => {},
  setActiveAccountUser: () => {},
  setHasScroll: () => {},
  setIsCheckWallet: () => {},
  setJobSubmitId: () => {},
  setUseFormDone: () => {},
});

export const LandingProvider = ({ children }: { children: ReactNode }) => {
  const [type, setType] = useState<ViewType>(UserTypeEnum.Freelancer);
  const [currentView, setCurrentView] = useState<string>('');
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [createJobModalOpen, setCreateJobModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [activeAccountUser, setActiveAccountUser] = useState(false);
  const [hasScroll, setHasScroll] = useState(false);
  const [isCheckWallet, setIsCheckWallet] = useState(false);
  const [jobSubmitId, setJobSubmitId] = useState(0);
  const [useFormDone, setUseFormDone] = useState(false);
  
  return (
    <LandingContext.Provider
      value={{
        type,
        currentView,
        signupModalOpen,
        createJobModalOpen,
        submitModalOpen, 
        hasScroll,
        activeAccountUser,
        isCheckWallet,
        jobSubmitId,
        useFormDone,
        setType,
        setCurrentView,
        setSignupModalOpen,
        setCreateJobModalOpen,
        setSubmitModalOpen,
        setActiveAccountUser,
        setHasScroll,
        setIsCheckWallet,
        setJobSubmitId,
        setUseFormDone,
      }}
    >
      {children}
    </LandingContext.Provider>
  );
};

export function useLanding() {
  const {
    type,
    currentView,
    signupModalOpen,
    createJobModalOpen,
    submitModalOpen,
    hasScroll,
    activeAccountUser,
    isCheckWallet,
    jobSubmitId,
    useFormDone, 
    setType,
    setCurrentView,
    setSignupModalOpen,
    setCreateJobModalOpen,
    setSubmitModalOpen,
    setActiveAccountUser,
    setHasScroll,
    setIsCheckWallet,
    setJobSubmitId,
    setUseFormDone,
  } = useContext(LandingContext);

  const handleViewChange = (inView: boolean, entry: IntersectionObserverEntry) => {
    if (inView) {
      setCurrentView(entry.target.id);
    }
  };

  const handleScroll = (el: HTMLElement) => {
    if (el.scrollTop === 0) {
      setHasScroll(false);
    } else {
      setHasScroll(true);
    }
  };

  return {
    type,
    currentView,
    signupModalOpen,
    createJobModalOpen,
    submitModalOpen,
    hasScroll,
    activeAccountUser,
    isCheckWallet,
    jobSubmitId,
    useFormDone,
    setType,
    handleViewChange,
    setCurrentView,
    setSignupModalOpen,
    setCreateJobModalOpen,
    setSubmitModalOpen,
    setActiveAccountUser, 
    handleScroll,
    setHasScroll,
    setIsCheckWallet,
    setJobSubmitId,
    setUseFormDone,
  };
}
