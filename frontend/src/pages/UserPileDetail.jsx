import React from "react";
import UserLayout from "../components/User/UserLayout";
import PileDetailView from "../components/piles/PileDetailView";

export default function UserPileDetail() {
  return (
    <UserLayout>
      <PileDetailView backPath="/piles" />
    </UserLayout>
  );
}
