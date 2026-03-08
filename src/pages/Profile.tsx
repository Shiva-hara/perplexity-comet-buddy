import ProfileSetup from "@/components/browser/ProfileSetup";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  return <ProfileSetup onComplete={() => navigate("/")} />;
}
