import React from "react";
import PageLayout from "../components/User/UserLayout";
import ProfileView from "../components/profile/ProfileView";

export default function UserProfilePage() {
  return (
    <PageLayout currentPath="/profile">
      <ProfileView isAdmin={false} />
    </PageLayout>
  );
}
