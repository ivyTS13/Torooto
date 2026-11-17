import React from "react";
import PageLayout from "../components/User/UserLayout";
import TarotWorkspace from "../components/reading/TarotWorkspace";

export default function ReadingRoom() {
  return (
    <PageLayout currentPath="/">
      <TarotWorkspace embedded={false} />
    </PageLayout>
  );
}
