"use client";

import { useState } from "react";
import { ApplicationList } from "@/components/admin/application-list";
import { ApplicationDetail } from "@/components/admin/application-detail";
import type { Application } from "@/lib/types";
import { dummyApplications } from "@/lib/dummy-data";

export default function AdminPage() {
  const [applications, setApplications] = useState<Application[]>(dummyApplications);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const handleApplicationSelect = (application: Application) => {
    setSelectedApplication(application);
  };

  const handleBack = () => {
    setSelectedApplication(null);
  };

  const handleSave = (updatedApplication: Application) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === updatedApplication.id ? updatedApplication : app
      )
    );
    setSelectedApplication(updatedApplication);
    
    // localStorage에 업데이트된 application 저장 (심의서 페이지와 연동)
    try {
      const savedApplications = JSON.parse(localStorage.getItem('updatedApplications') || '{}');
      savedApplications[updatedApplication.id] = updatedApplication;
      localStorage.setItem('updatedApplications', JSON.stringify(savedApplications));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  return (
    <div className="space-y-6">
      {selectedApplication ? (
        <ApplicationDetail
          application={selectedApplication}
          onBack={handleBack}
          onSave={handleSave}
        />
      ) : (
        <ApplicationList
          applications={applications}
          onSelect={handleApplicationSelect}
        />
      )}
    </div>
  );
}
