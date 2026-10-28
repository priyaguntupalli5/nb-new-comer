import { Community } from "../components/home/Community";
import { Essentials } from "../components/home/Essentials";
import { Hero } from "../components/home/Hero";
import { Housing } from "../components/home/Housing";
import { UrgentSteps } from "../components/home/UrgentSteps";
import { useCompletedSteps, useProfile } from "../lib/checklist-state";

export function HomePage() {
  const [profile, setProfile] = useProfile();
  const [completed, toggle] = useCompletedSteps();

  return (
    <>
      <Hero profile={profile} onProfileChange={setProfile} />
      <UrgentSteps profile={profile} completed={completed} onToggle={toggle} />
      <Essentials />
      <Housing />
      <Community />
    </>
  );
}
