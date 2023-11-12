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
  auctionModalOpen: boolean;
  activeAccountUser: boolean;
  hasScroll: boolean;
  isCheckWallet: boolean;
  jobIdForForm: number;
  accountForForm: string;
  useFormDone: boolean;
  createContractModalOpen: boolean;
  createJobContractModalOpen: boolean;
  setType: (user: ViewType) => void;
  setCurrentView: (view: string) => void;
  setSignupModalOpen: (open: boolean) => void;
  setCreateJobModalOpen: (open: boolean) => void;
  setSubmitModalOpen: (open: boolean) => void;
  setAuctionModalOpen: (open: boolean) => void;
  setActiveAccountUser: (open: boolean) => void;
  setHasScroll: (hasScroll: boolean) => void;
  setIsCheckWallet: (check: boolean) => void;
  setJobIdForForm: (jobId: number) => void;
  setAccountForForm: (address: string) => void;
  setUseFormDone: (x: boolean) => void;
  setCreateContractModalOpen: (open: boolean) => void;
  setCreateJobContractModalOpen: (open: boolean) => void;

};

export const LandingContext = createContext<LandingContextInterface>({
  type: UserTypeEnum.Freelancer,
  currentView: '',
  signupModalOpen: false,
  createJobModalOpen: false,
  submitModalOpen: false,
  auctionModalOpen: false,
  activeAccountUser: false, 
  hasScroll: false,
  isCheckWallet: false,
  jobIdForForm: 0,
  accountForForm: '',
  useFormDone: false,
  createContractModalOpen: false,
  createJobContractModalOpen: false,

  setType: () => {},
  setCurrentView: () => {},
  setSignupModalOpen: () => {},
  setCreateJobModalOpen: () => {},
  setSubmitModalOpen: () => {},
  setAuctionModalOpen: () => {},
  setActiveAccountUser: () => {},
  setHasScroll: () => {},
  setIsCheckWallet: () => {},
  setJobIdForForm: () => {},
  setAccountForForm: () => {},
  setUseFormDone: () => {},
  setCreateContractModalOpen: () => {},
  setCreateJobContractModalOpen: () => {},

});

export const LandingProvider = ({ children }: { children: ReactNode }) => {
  const [type, setType] = useState<ViewType>(UserTypeEnum.Freelancer);
  const [currentView, setCurrentView] = useState<string>('');
  const [signupModalOpen, setSignupModalOpen] = useState(false);
  const [createJobModalOpen, setCreateJobModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [auctionModalOpen, setAuctionModalOpen] = useState(false);
  const [activeAccountUser, setActiveAccountUser] = useState(false);
  const [hasScroll, setHasScroll] = useState(false);
  const [isCheckWallet, setIsCheckWallet] = useState(false);
  const [jobIdForForm, setJobIdForForm] = useState(0);
  const [accountForForm, setAccountForForm] = useState('');
  const [useFormDone, setUseFormDone] = useState(false);
  const [createContractModalOpen, setCreateContractModalOpen] = useState(false);
  const [createJobContractModalOpen, setCreateJobContractModalOpen] = useState(false);

  
  return (
    <LandingContext.Provider
      value={{
        type,
        currentView,
        signupModalOpen,
        createJobModalOpen,
        submitModalOpen,
        auctionModalOpen,
        hasScroll,
        activeAccountUser,
        isCheckWallet,
        jobIdForForm,
        accountForForm,
        useFormDone,
        createContractModalOpen,
        createJobContractModalOpen,
        setType,
        setCurrentView,
        setSignupModalOpen,
        setCreateJobModalOpen,
        setSubmitModalOpen,
        setAuctionModalOpen,
        setActiveAccountUser,
        setHasScroll,
        setIsCheckWallet,
        setJobIdForForm,
        setAccountForForm,
        setUseFormDone,
        setCreateContractModalOpen,
        setCreateJobContractModalOpen,
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
    auctionModalOpen,
    hasScroll,
    activeAccountUser,
    isCheckWallet,
    jobIdForForm,
    accountForForm,
    useFormDone, 
    createContractModalOpen,
    createJobContractModalOpen,
    setType,
    setCurrentView,
    setSignupModalOpen,
    setCreateJobModalOpen,
    setSubmitModalOpen,
    setAuctionModalOpen,
    setActiveAccountUser,
    setHasScroll,
    setIsCheckWallet,
    setJobIdForForm,
    setUseFormDone,
    setCreateContractModalOpen,
    setCreateJobContractModalOpen,
    setAccountForForm,

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
    auctionModalOpen,
    hasScroll,
    activeAccountUser,
    isCheckWallet,
    jobIdForForm,
    accountForForm,
    useFormDone,
    createContractModalOpen,
    createJobContractModalOpen,
    setType,
    handleViewChange,
    setCurrentView,
    setSignupModalOpen,
    setCreateJobModalOpen,
    setSubmitModalOpen,
    setAuctionModalOpen,
    setActiveAccountUser, 
    handleScroll,
    setHasScroll,
    setIsCheckWallet,
    setJobIdForForm,
    setAccountForForm,
    setUseFormDone,
    setCreateContractModalOpen,
    setCreateJobContractModalOpen,
  };
}
