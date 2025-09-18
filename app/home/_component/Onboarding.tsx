'use client';

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import AccountSetupStep from '@/components/onboarding/AccountSetupStep';
import ClubInfoStep from '@/components/onboarding/ClubInfoStep';
import LocationsStep from '@/components/onboarding/LocationsStep';
import TeamsStep from '@/components/onboarding/TeamsStep';
import AdminsCoachesStep from '@/components/onboarding/AdminsCoachesStep';
import CompletionStep from '@/components/onboarding/CompletionStep';
import Modal from 'react-modal';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import useUser from '@/hooks/useUser';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { updateUser } from '@/supabase/API';

interface OnboardingData {
  account: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  };
  club: {
    name: string;
    logo: string | null;
    contactEmail: string;
    contactPhone: string;
    description: string;
    address: string;
  };
  locations: Array<{
    type: 'office' | 'training' | 'match';
    address: string;
    name: string;
  }>;
  teams: Array<{
    name: string;
    ageGroup: string;
    sport: string;
    color: string;
  }>;
  admins: Array<{
    name: string;
    email: string;
    role: 'admin' | 'coach';
  }>;
}

const Onboarding = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreatingClub, setIsCreatingClub] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { user, isLoading } = useUser();

  // replace with your actual mutation function
  const mutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      toast.success('User Onboarded');
    },
  });

  useEffect(() => {
    if (searchParams.get('onboarding') === 'true') {
      setModalOpen(true);
    }
  }, [searchParams]);

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    account: { fullName: '', email: '', phone: '', password: '' },
    club: { name: '', logo: null, contactEmail: '', contactPhone: '', description: '', address: '' },
    locations: [],
    teams: [],
    admins: [],
  });

  const steps = [
    { id: 1, title: 'Account Setup', required: true },
    { id: 2, title: 'Email Link', required: false },
    { id: 3, title: 'Organization Info', required: false },
    { id: 4, title: 'Link Xero', required: false },
    { id: 5, title: 'Complete', required: true },
  ];

  const progressPercentage = (currentStep / steps.length) * 100;

  const updateData = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));
  };

  const nextStep = () => setCurrentStep(s => Math.min(s + 1, steps.length));
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

  const skipStep = () => {
    if (currentStep < steps.length && !steps[currentStep - 1].required) {
      nextStep();
    }
  };

  const finishOnboarding = async () => {
    setIsCreatingClub(true);
    try {
      mutation.mutate({ user: { email: user?.email, name: onboardingData.account.fullName } });
    } catch (error: any) {
      console.error('Error creating club:', error);
      toast.error('Error Occurred , Try again !');
    } finally {
      setIsCreatingClub(false);
      router.push('/');
    }
  };

  const goToDashboard = () => {
    finishOnboarding();
  };

  const renderStepContent = () => (
    <SwitchTransition mode="out-in">
      <CSSTransition key={currentStep} timeout={400} classNames="slide-fade" unmountOnExit>
        <div>
          {(() => {
            switch (currentStep) {
              case 1:
                return <AccountSetupStep data={onboardingData.account} onUpdate={account => updateData({ account })} onNext={nextStep} />;
              case 3:
                return (
                  <ClubInfoStep
                    phone={onboardingData.account}
                    data={onboardingData.club}
                    onUpdate={club => updateData({ club })}
                    onNext={nextStep}
                    onSkip={skipStep}
                  />
                );
              case 2:
                return (
                  <LocationsStep
                    data={onboardingData.locations}
                    onUpdate={locations => updateData({ locations })}
                    onNext={nextStep}
                    onSkip={skipStep}
                  />
                );
              case 4:
                return (
                  <TeamsStep data={onboardingData.teams} onUpdate={teams => updateData({ teams })} onNext={nextStep} onSkip={skipStep} />
                );
              case 6:
                return (
                  <AdminsCoachesStep
                    data={onboardingData.admins}
                    onUpdate={admins => updateData({ admins })}
                    onNext={nextStep}
                    onSkip={skipStep}
                  />
                );
              case 5:
                return <CompletionStep clubData={onboardingData.club} onComplete={goToDashboard} isLoading={isCreatingClub} />;
              default:
                return null;
            }
          })()}
        </div>
      </CSSTransition>
    </SwitchTransition>
  );

  const afterCloseModal = () => {
    setModalOpen(false);
    router.push('/');
  };

  const svgRender = () => (
    <div className="absolute bottom-20 left-[0px] w-[160px] z-10">
      <DotLottieReact
        className={`transition-opacity duration-500 ${currentStep === 1 ? 'opacity-100' : 'opacity-0'}`}
        src="https://lottie.host/e75c6b8f-2512-47a2-b238-574a162cd299/IixqRmDiUs.lottie"
        autoplay
        color="#000"
        loop
      />
      <DotLottieReact
        className={`absolute top-0 left-0 transition-opacity duration-500 ${currentStep === 2 ? 'opacity-100' : 'opacity-0'}`}
        src="https://lottie.host/d8dd98ca-4840-4235-b09d-c6933b0dc104/9Aak2dChAS.lottie"
        autoplay
        color="#000"
        loop
      />
      <DotLottieReact
        className={`absolute top-0 left-0 transition-opacity duration-500 ${currentStep === 3 ? 'opacity-100' : 'opacity-0'}`}
        src="https://lottie.host/250078b7-1aac-41b6-a1b5-d13fffe6fa18/fD3rSAq4CK.lottie"
        autoplay
        color="#000"
        loop
      />
      <DotLottieReact
        className={`absolute top-0 left-0 transition-opacity duration-500 ${currentStep === 4 ? 'opacity-100' : 'opacity-0'}`}
        src="https://lottie.host/9146520c-cca0-418d-8325-b03792724345/9U9PrV5Ubz.lottie"
        autoplay
        color="#000"
        loop
      />
      <DotLottieReact
        className={`absolute top-0 left-0 translate-x-10 scale-150 transition-opacity duration-500 ${
          currentStep === 5 ? 'opacity-100' : 'opacity-0'
        }`}
        src="https://lottie.host/da2b709f-f7fb-4df0-92e1-2b6cb2919825/aqIfCCwarn.lottie"
        autoplay
        color="#000"
        loop
      />
    </div>
  );

  return (
    <Modal
      className={'!p-0 !pl-0 !pr-0 m-0 border-0 outline-none !max-h-[600px] !max-w-[1050px] custom'}
      isOpen={modalOpen}
      ariaHideApp={false}
      //   onRequestClose={null}
      contentLabel="Onboarding Modal"
    >
      <div className="p-0 h-full border-0">
        <div className="grid h-full grid-cols-12">
          {/* Left sidebar */}
          <div className="bg-white h-full overflow-hidden col-span-4 px-6 relative py-8">
            <div className="absolute bottom-0 translate-y-[80%] -left-[210px] w-[500px] rotate-[30deg] h-[500px] bg-[#D6D0F4] "></div>
            <div className="absolute bottom-0 translate-y-[85%] -left-[180px] w-[600px] rotate-[25deg] h-[500px] bg-[#D6D0F4]/60"></div>
            {svgRender()}

            <img className="max-w-[130px] opacity-0 mb-12" src="/images/High_Res_Logo.png" alt="logo" />
            <div className="max-w-6xl mx-auto flex justify-center">
              <div className="flex justify-between items-start gap-4 flex-col mt-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-4 justify-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index + 1 < currentStep
                          ? 'bg-[#4331A0] text-white'
                          : index + 1 === currentStep
                          ? 'border border-[#4331A0]'
                          : 'border text-gray-600'
                      }`}
                    >
                      <div>
                        <SwitchTransition mode="out-in">
                          <CSSTransition
                            key={index + 1 < currentStep ? 'check' : 'stepId'}
                            timeout={400}
                            classNames="slide-fade"
                            unmountOnExit
                          >
                            <div>{index + 1 < currentStep ? <CheckCircle className="w-4 h-4" /> : step.id}</div>
                          </CSSTransition>
                        </SwitchTransition>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-semibold text-center ${
                        index + 1 === currentStep ? 'text-team-red font-medium' : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 h-full overflow-scroll pt-16 bg-gray-50 col-span-8 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full">
              {renderStepContent()}
              {currentStep > 1 && currentStep < 5 && (
                <div className="flex items-center justify-between mt-8 ml-5">
                  <Button variant="outline" onClick={prevStep} className="flex w-12 h-12 rounded-full items-center">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="text-right text-xs text-gray-500">
                    <p>
                      Need help?{' '}
                      <a href="#" className="text-team-red font-semibold text-black hover:underline">
                        Contact Support
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Onboarding;
