import React, { useState, Children, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import "./Stepper.css";

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = (step: number) => { },
  onFinalStepCompleted = () => { },
  stepCircleContainerClassName = "",
  stepContainerClassName = "",
  contentClassName = "",
  footerClassName = "",
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = "Back",
  nextButtonText = "Continue",
  disableStepIndicators = false,
  renderStepIndicator = undefined,
  ...rest
}: {
  children: React.ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  disableStepIndicators?: boolean;
  renderStepIndicator?: ((props: { step: number; currentStep: number; onStepClick: (step: number) => void }) => React.ReactNode) | undefined;
  [key: string]: any;
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    console.log(`🔍 Stepper: updateStep called with newStep: ${newStep}, currentStep: ${currentStep}`);
    setCurrentStep(newStep);
    console.log(`🔍 Stepper: calling onStepChange with step: ${newStep}`);
    onStepChange(newStep);
  };

  const handleBack = () => {
    console.log(`🔍 Stepper: handleBack called, currentStep: ${currentStep}`);
    if (currentStep > 1) {
      console.log(`🔍 Stepper: navigating to previous step`);
      setDirection(-1);
      updateStep(currentStep - 1);
    } else {
      console.log(`🔍 Stepper: already at first step, cannot go back`);
    }
  };

  const handleNext = () => {
    console.log(`🔍 Stepper: handleNext called, currentStep: ${currentStep}, isLastStep: ${isLastStep}`);
    if (!isLastStep) {
      console.log(`🔍 Stepper: navigating to next step`);
      setDirection(1);
      updateStep(currentStep + 1);
    } else {
      console.log(`🔍 Stepper: already at last step, cannot go next`);
    }
  };

  const handleComplete = () => {
    console.log('🔍 Stepper: handleComplete called');
    setDirection(1);
    setIsCompleted(true);
    // Chama onFinalStepCompleted apenas quando o usuário realmente confirma
    console.log('🔍 Stepper: calling onFinalStepCompleted');
    onFinalStepCompleted();
  };

  return (
    <div className="outer-container" {...rest}>
      <div className={`step-circle-container ${stepCircleContainerClassName}`}>
        <div className={`step-indicator-row ${stepContainerClassName}`}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep,
                    onStepClick: (clicked: number) => {
                      console.log(`🔍 Stepper: renderStepIndicator onStepClick called with clicked: ${clicked}, currentStep: ${currentStep}`);
                      const direction = clicked > currentStep ? 1 : -1;
                      console.log(`🔍 Stepper: renderStepIndicator setting direction to ${direction}`);
                      setDirection(direction);
                      updateStep(clicked);
                    },
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={currentStep}
                    onClickStep={(clicked) => {
                      console.log(`🔍 Stepper: onStepClick called with clicked: ${clicked}, currentStep: ${currentStep}`);
                      const direction = clicked > currentStep ? 1 : -1;
                      console.log(`🔍 Stepper: setting direction to ${direction}`);
                      setDirection(direction);
                      updateStep(clicked);
                    }}
                  />
                )}
                {isNotLastStep && (
                  <StepConnector isComplete={currentStep > stepNumber} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={`step-content-default ${contentClassName}`}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && (
          <div className={`footer-container ${footerClassName}`}>
            <div className={`footer-nav ${currentStep !== 1 ? "spread" : "end"}`}>
              {currentStep !== 1 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleBack();
                  }}
                  className={`back-button ${currentStep === 1 ? "inactive" : ""}`}
                  style={{
                    backgroundColor: currentStep === 1 ? '#145759' : '#e1ac33',
                    borderColor: currentStep === 1 ? '#145759' : '#e1ac33',
                    color: currentStep === 1 ? '#a3a3a3' : '#F7F5F3'
                  }}
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isLastStep) {
                    handleComplete();
                  } else {
                    handleNext();
                  }
                }}
                className="next-button"
                style={{
                  backgroundColor: '#145759',
                  color: '#fff'
                }}
                {...nextButtonProps}
              >
                {isLastStep ? "Confirmar" : nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepContentWrapper({ isCompleted, currentStep, direction, children, className }: { 
  isCompleted: boolean; 
  currentStep: number; 
  direction: number; 
  children: React.ReactNode; 
  className: string; 
}) {
  const [parentHeight, setParentHeight] = useState(0);

  return (
    <motion.div
      className={className}
      style={{ position: "relative", overflow: "hidden" }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: "spring", duration: 0.4 }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition key={currentStep} direction={direction} onHeightReady={(h) => setParentHeight(h)}>
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SlideTransition({ children, direction, onHeightReady }: { 
  children: React.ReactNode; 
  direction: number; 
  onHeightReady: (height: number) => void; 
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) onHeightReady(containerRef.current.offsetHeight);
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      style={{ position: "absolute", left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? "-100%" : "100%",
    opacity: 0,
  }),
  center: {
    x: "0%",
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? "50%" : "-50%",
    opacity: 0,
  }),
};

export function Step({ children }: { children: React.ReactNode }) {
  return <div className="step-default">{children}</div>;
}

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators }: { 
  step: number; 
  currentStep: number; 
  onClickStep: (step: number) => void; 
  disableStepIndicators: boolean; 
}) {
  const status = currentStep === step ? "active" : currentStep < step ? "inactive" : "complete";

  const handleClick = () => {
    console.log(`🔍 StepIndicator: handleClick called for step ${step}, currentStep: ${currentStep}`);
    if (step !== currentStep && !disableStepIndicators) {
      console.log(`🔍 StepIndicator: calling onClickStep for step ${step}`);
      onClickStep(step);
    } else {
      console.log(`🔍 StepIndicator: step ${step} is current step or indicators are disabled`);
    }
  };

  return (
    <motion.div 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleClick();
      }} 
      className="step-indicator" 
      animate={status} 
      initial={false}
    >
      <motion.div
        variants={{
          inactive: { scale: 1, backgroundColor: "#145759", color: "#145759" },
          active: { scale: 1, backgroundColor: "#E1AC33", color: "#E1AC33" },
          complete: { scale: 1, backgroundColor: "#E1AC33", color: "#E1AC33" },
        }}
        transition={{ duration: 0.3 }}
        className={`step-indicator-inner ${status === "inactive" ? "inactive" : ""}`}
      >
        {status === "complete" ? (
          <CheckIcon className="check-icon" />
        ) : status === "active" ? (
          <div className="active-dot" />
        ) : (
          <span className="step-number">{step}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

function StepConnector({ isComplete }: { isComplete: boolean }) {
  const lineVariants = {
    incomplete: { width: 0, backgroundColor: "transparent" },
    complete: { width: "100%", backgroundColor: "#E1AC33" },
  };

  return (
    <div className="step-connector">
      <motion.div
        className="step-connector-inner"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? "complete" : "incomplete"}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.1, type: "tween", ease: "easeOut", duration: 0.3 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
