import OnboardingStep1Bg1 from "@/assets/icons/onboarding/onboarding-step1-bg-1.svg";
import OnboardingStep1Bg2 from "@/assets/icons/onboarding/onboarding-step1-bg-2.svg";
import OnboardingStep1Center from "@/assets/icons/onboarding/onboarding-step1-center.svg";
import OnboardingStep2Bg1 from "@/assets/icons/onboarding/onboarding-step2-bg-1.svg";
import OnboardingStep2Bg2 from "@/assets/icons/onboarding/onboarding-step2-bg-2.svg";
import OnboardingStep2Center from "@/assets/icons/onboarding/onboarding-step2-center.svg";
import OnboardingStep3Bg1 from "@/assets/icons/onboarding/onboarding-step3-bg-1.svg";
import OnboardingStep3Bg2 from "@/assets/icons/onboarding/onboarding-step3-bg-2.svg";
import OnboardingStep3Center from "@/assets/icons/onboarding/onboarding-step3-center.svg";
import OnboardingStep4Bg1 from "@/assets/icons/onboarding/onboarding-step4-bg-1.svg";
import OnboardingStep4Center from "@/assets/icons/onboarding/onboarding-step4-center.svg";
import OnboardingStep5 from "@/assets/icons/onboarding/onboarding-step5.svg";
import type { OnboardingStep } from "@/features/onboarding/components/OnboardingStepControls";
import { cn } from "@/shared/lib/cn";

type SceneLayer = {
  src: string;
  className: string;
};

type CenterLayer = SceneLayer & {
  appearAt: Exclude<OnboardingStep, 5>;
};

type OnboardingPuzzleSceneProps = {
  step: OnboardingStep;
};

const baseLayerClass =
  "pointer-events-none absolute left-1/2 h-auto -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out";

const backgroundLayers: Record<Exclude<OnboardingStep, 5>, SceneLayer[]> = {
  1: [
    {
      src: OnboardingStep1Bg1,
      className: "top-[60%] z-0 w-[min(100vw,402px)]",
    },
    {
      src: OnboardingStep1Bg2,
      className: "top-[54%] z-10 w-[min(78vw,314px)]",
    },
  ],
  2: [
    {
      src: OnboardingStep2Bg1,
      className: "top-[58%] z-0 w-[min(100vw,402px)]",
    },
    {
      src: OnboardingStep2Bg2,
      className: "top-[53%] z-10 w-[min(78vw,314px)]",
    },
  ],
  3: [
    {
      src: OnboardingStep3Bg1,
      className: "top-[55%] z-0 w-[min(100vw,402px)]",
    },
    {
      src: OnboardingStep3Bg2,
      className: "top-[52%] z-10 w-[min(78vw,314px)]",
    },
  ],
  4: [
    {
      src: OnboardingStep4Bg1,
      className: "top-[51%] z-10 w-[min(78vw,314px)]",
    },
  ],
};

const centerLayers: CenterLayer[] = [
  {
    appearAt: 1,
    src: OnboardingStep1Center,
    className: "top-[40%] z-20 -ml-11.25 w-[min(24vw,97px)]",
  },
  {
    appearAt: 2,
    src: OnboardingStep2Center,
    className: "top-[80%] z-20 -ml-5.5 w-[min(24vw,97px)]",
  },
  {
    appearAt: 3,
    src: OnboardingStep3Center,
    className: "top-[75%] z-20 ml-21.5 w-[min(24vw,97px)]",
  },
  {
    appearAt: 4,
    src: OnboardingStep4Center,
    className: "top-[35%] z-20 ml-17 w-[min(24vw,97px)]",
  },
];

const completeLayer: SceneLayer = {
  src: OnboardingStep5,
  className: "top-[65%] z-20 ml-4.5 w-[min(45vw,180px)]",
};

export function OnboardingPuzzleScene({
  step,
}: OnboardingPuzzleSceneProps) {
  const layers =
    step === 5
      ? [completeLayer]
      : [
          ...backgroundLayers[step],
          ...centerLayers.filter((layer) => step >= layer.appearAt),
        ];

  return (
    <div
      className="relative h-[clamp(250px,44dvh,330px)] shrink-0 overflow-visible"
      aria-hidden="true"
    >
      {layers.map((layer) => (
        <img
          key={layer.src}
          src={layer.src}
          alt=""
          className={cn(baseLayerClass, layer.className)}
        />
      ))}
    </div>
  );
}
