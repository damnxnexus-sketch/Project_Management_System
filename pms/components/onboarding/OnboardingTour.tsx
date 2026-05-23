'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import type { Step, CallBackProps } from 'react-joyride';

const Joyride = dynamic(() => import('react-joyride'), { ssr: false });
const STATUS = {
  FINISHED: 'finished',
  SKIPPED: 'skipped',
} as const;

const steps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to NEXUS! Let\'s take a quick tour to help you get started.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="search"]',
    content: 'Use the search bar to quickly find tasks and projects. Press ⌘K (or Ctrl+K) as a shortcut!',
    placement: 'bottom',
  },
  {
    target: '[data-tour="theme-switcher"]',
    content: 'Switch between light, dark, or system theme based on your preference.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="notifications"]',
    content: 'Stay updated with notifications about task assignments, mentions, and comments.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="user-menu"]',
    content: 'Access your profile settings, change password, and view account information here.',
    placement: 'bottom-end',
  },
  {
    target: '[data-tour="sidebar"]',
    content: 'Navigate between different sections of NEXUS using the sidebar.',
    placement: 'right',
  },
  {
    target: '[data-tour="ai-prompt"]',
    content: 'Use AI to generate tasks from natural language! Just describe what you need and let Claude create tasks for you.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="kanban"]',
    content: 'Drag and drop tasks between columns to update their status. Click on a task to view details, add comments, and attach files.',
    placement: 'top',
  },
];

export function OnboardingTour() {
  const [run, setRun] = React.useState(false);

  React.useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
    if (!hasSeenTour) {
      // Delay to ensure all elements are rendered
      setTimeout(() => setRun(true), 1000);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('hasSeenOnboardingTour', 'true');
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#722f37',
          textColor: '#e3e3e3',
          backgroundColor: '#1e1e1e',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          arrowColor: '#1e1e1e',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
        },
        buttonNext: {
          backgroundColor: '#722f37',
          borderRadius: 8,
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#a0a0a0',
          marginRight: 10,
        },
        buttonSkip: {
          color: '#a0a0a0',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
}
