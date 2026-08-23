import axiosClient from "./axiosClient";

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "ASSESSMENT" | "APPROVED" | "REJECTED" | "PROJECT_QUEUE";
export interface Lead { id: number; name: string; company: string; email: string; phone: string; requirements: string; budget: string | null; timeline: string; status: LeadStatus; assigned_to: number | null; assigned_to_name: string; created_at: string; }
export interface Assessment { id: number; lead: number; assessment_type: "TECHNICAL" | "FINANCIAL"; status: "REQUESTED" | "SUBMITTED"; findings: string; risks: string; recommendation: string; }
const list = async <T>(url: string): Promise<T[]> => { const { data } = await axiosClient.get<T[] | { results: T[] }>(url); return Array.isArray(data) ? data : data.results; };
export const listLeads = () => list<Lead>("/api/leads/");
export const createLead = (payload: Partial<Lead>) => axiosClient.post<Lead>("/api/leads/", payload).then(({ data }) => data);
export const updateLead = (id: number, payload: Partial<Lead>) => axiosClient.patch<Lead>(`/api/leads/${id}/`, payload).then(({ data }) => data);
export const assignLead = (id: number, assigned_to: number) => axiosClient.post<Lead>(`/api/leads/${id}/assign/`, { assigned_to }).then(({ data }) => data);
export const requestAssessment = (id: number, assessment_type: Assessment["assessment_type"]) => axiosClient.post(`/api/leads/${id}/request_assessment/`, { assessment_type });
export const decideLead = (id: number, decision: "APPROVED" | "REJECTED") => axiosClient.post(`/api/leads/${id}/decide/`, { decision });
export const sendToProjectQueue = (id: number) => axiosClient.post(`/api/leads/${id}/send_to_project_queue/`);
export const addInteraction = (payload: { lead: number; kind: string; summary: string; occurred_at: string }) => axiosClient.post("/api/interactions/", payload);
export const addFollowUp = (payload: { lead: number; title: string; due_at: string; assigned_to: number }) => axiosClient.post("/api/follow-ups/", payload);
export const addNote = (lead: number, body: string) => axiosClient.post("/api/lead-notes/", { lead, body });
export const listAssessments = () => list<Assessment>("/api/assessments/");
export const submitAssessment = (id: number, payload: Pick<Assessment, "findings" | "risks" | "recommendation">) => axiosClient.post(`/api/assessments/${id}/submit/`, payload);
export const uploadLeadDocument = (lead: number, file: File) => { const form = new FormData(); form.append("file", file); form.append("related_lead_id", String(lead)); return axiosClient.post("/api/documents/upload/", form, { headers: { "Content-Type": "multipart/form-data" } }); };
