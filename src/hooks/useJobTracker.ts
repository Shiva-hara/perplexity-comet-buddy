import { useState, useCallback } from "react";

export type JobStatus = "saved" | "applied" | "interview" | "offer" | "rejected";

export interface JobApplication {
  id: string;
  title: string;
  company: string;
  url?: string;
  status: JobStatus;
  notes?: string;
  salary?: string;
  location?: string;
  addedAt: string;
}

const STORAGE_KEY = "comet_job_applications";

function load(): JobApplication[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(jobs: JobApplication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

export function useJobTracker() {
  const [jobs, setJobs] = useState<JobApplication[]>(load);

  const addJob = useCallback((data: Omit<JobApplication, "id" | "addedAt">) => {
    const job: JobApplication = {
      ...data,
      id: crypto.randomUUID(),
      addedAt: new Date().toISOString(),
    };
    setJobs((prev) => {
      const next = [job, ...prev];
      save(next);
      return next;
    });
    return job;
  }, []);

  const updateJob = useCallback((id: string, updates: Partial<JobApplication>) => {
    setJobs((prev) => {
      const next = prev.map((j) => (j.id === id ? { ...j, ...updates } : j));
      save(next);
      return next;
    });
  }, []);

  const deleteJob = useCallback((id: string) => {
    setJobs((prev) => {
      const next = prev.filter((j) => j.id !== id);
      save(next);
      return next;
    });
  }, []);

  const moveJob = useCallback((id: string, status: JobStatus) => {
    setJobs((prev) => {
      const next = prev.map((j) => (j.id === id ? { ...j, status } : j));
      save(next);
      return next;
    });
  }, []);

  return { jobs, addJob, updateJob, deleteJob, moveJob };
}
