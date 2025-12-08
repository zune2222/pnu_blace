"use client";

import { useParams } from "next/navigation";
import { StudySettingsPage } from "@/features/study";

export default function StudySettingsRoute() {
  const params = useParams();
  const groupId = params.groupId as string;

  return <StudySettingsPage groupId={groupId} />;
}
