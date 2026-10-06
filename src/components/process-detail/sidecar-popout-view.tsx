'use client';

import React, { useState, useEffect } from 'react';
import { Process } from '@/types/process';
import { SidecarRunner } from './sidecar-runner';

interface SidecarPopoutViewProps {
  process: Process;
}

export function SidecarPopoutView({ process }: SidecarPopoutViewProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedStepKeys, setCompletedStepKeys] = useState<string[]>([]);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const savedCompleted = localStorage.getItem(`fanavari-completed-steps-${process.id}`);
      if (savedCompleted) {
        setCompletedStepKeys(JSON.parse(savedCompleted));
      }

      const savedStep = localStorage.getItem(`fanavari-active-step-${process.id}`);
      if (savedStep) {
        const stepIdx = parseInt(savedStep, 10);
        if (!isNaN(stepIdx) && stepIdx >= 0 && stepIdx < (process.steps?.length || 1)) {
          setActiveStepIndex(stepIdx);
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [process.id, process.steps?.length]);

  const handleToggleStepComplete = (stepKey: string) => {
    setCompletedStepKeys((prev) => {
      const next = prev.includes(stepKey)
        ? prev.filter((k) => k !== stepKey)
        : [...prev, stepKey];
      try {
        localStorage.setItem(`fanavari-completed-steps-${process.id}`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleCompleteAndNext = (stepKey: string) => {
    if (stepKey && !completedStepKeys.includes(stepKey)) {
      handleToggleStepComplete(stepKey);
    }
    if (activeStepIndex < (process.steps?.length || 1) - 1) {
      const nextIdx = activeStepIndex + 1;
      setActiveStepIndex(nextIdx);
      try {
        localStorage.setItem(`fanavari-active-step-${process.id}`, String(nextIdx));
      } catch (e) {}
    }
  };

  const handleSelectStep = (index: number) => {
    setActiveStepIndex(index);
    try {
      localStorage.setItem(`fanavari-active-step-${process.id}`, String(index));
    } catch (e) {}
  };

  const handleResetProgress = () => {
    setCompletedStepKeys([]);
    setActiveStepIndex(0);
    try {
      localStorage.removeItem(`fanavari-completed-steps-${process.id}`);
      localStorage.removeItem(`fanavari-active-step-${process.id}`);
    } catch (e) {}
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950">
      <SidecarRunner
        process={process}
        isOpen={true}
        onClose={() => window.close()}
        activeStepIndex={activeStepIndex}
        onSelectStep={handleSelectStep}
        completedStepKeys={completedStepKeys}
        onToggleStepComplete={handleToggleStepComplete}
        onCompleteAndNext={handleCompleteAndNext}
        onResetProgress={handleResetProgress}
        isStandalonePopout={true}
      />
    </div>
  );
}
