/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext, ReactNode, useContext, useState } from 'react';
import { UserTypeEnum } from '../../../utility/src';

export type ViewType = UserTypeEnum;

type LandingContextInterface = {
  type: ViewType;
  currentView: string;
  signupModalOpen: boolean;
  createJobModalOpen: boolean;
  activeAccountUser: boolean;
  hasScroll: boolean;
  isCheckWallet: boolean;
  setType: (user: ViewType) => void;
  setCurrentView: (view: string) => void;
  setSignupModalOpen: (open: boolean) => void;
  setCreateJobModalOpen: (open: boolean) => void;
  setActiveAccountUser: (open: boolean) => void;
  setHasScroll: (hasScroll: boolean) => void;
  setIsCheckWallet: (check: boolean) => void;
};

export const LandingContext = createContext<LandingContextInterface>({
  type: UserTypeEnum.Freelancer,
  currentView: '',
  signupModalOpen: false,
  createJobModalOpen: false,
  activeAccountUser: false, 
  hasScroll: false,
  isCheckWallet: false,
  setType: () => {},
  setCurrentView: () => {},
  setSignupModalOpen: () => {},
  setCreateJobModalOpen: () => {},
  setActiveAccountUser: () => {},
  setHasScroll: () => {},
  setIsCheckWallet: () => {},
});

export const LandingProvider = ({ children }: { children: ReactNode }) => {
  const [type, setType] = useState<ViewType>(UserTypeEnum.Freelancer);
  const [currentView, setCurrentView] = useState<string>('');
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [createJobModalOpen, setCreateJobModalOpen] = useState(false);
  const [activeAccountUser, setActiveAccountUser] = useState(false);
  const [hasScroll, setHasScroll] = useState(false);
  const [isCheckWallet, setIsCheckWallet] = useState(false);
  return (
    <LandingContext.Provider
      value={{
        type,
        currentView,
        signupModalOpen,
        createJobModalOpen,
        hasScroll,
        activeAccountUser,
        isCheckWallet, 
        setType,
        setCurrentView,
        setSignupModalOpen,
        setCreateJobModalOpen,
        setActiveAccountUser,
        setHasScroll,
        setIsCheckWallet, 
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
    hasScroll,
    activeAccountUser,
    isCheckWallet, 
    setType,
    setCurrentView,
    setSignupModalOpen,
    setCreateJobModalOpen,
    setActiveAccountUser,
    setHasScroll,
    setIsCheckWallet, 
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
    hasScroll,
    activeAccountUser,
    isCheckWallet, 
    setType,
    handleViewChange,
    setCurrentView,
    setSignupModalOpen,
    setCreateJobModalOpen,
    setActiveAccountUser, 
    handleScroll,
    setHasScroll,
    setIsCheckWallet, 
  };
}
