// src/ai/flows/index.ts

/**
 * @fileOverview Barrel file for exporting all AI flows.
 * This allows importing flows from '@/ai/flows' directly.
 */

export { summarizeRecord, type SummarizeRecordInput, type SummarizeRecordOutput } from './summarize-record';
export { generateReport, type GenerateReportInput, type GenerateReportOutput } from './generate-report';
