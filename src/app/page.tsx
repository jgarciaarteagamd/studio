// src/app/page.tsx (Dashboard Page)
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPatients } from "@/lib/mock-data";
import { FileText, Users, BarChart3, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { useState, useEffect } from 'react'; // Added

// Helper component to render date on client-side to avoid hydration mismatch
const PatientLastUpdatedDisplay = ({ updatedAt }: { updatedAt: string }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after initial hydration
    setFormattedDate(new Date(updatedAt).toLocaleDateString());
  }, [updatedAt]); // Recalculate if updatedAt changes

  // Render placeholder during SSR and initial client render, then client-side formatted date
  return <>{formattedDate || "..."}</>;
};

export default function DashboardPage() {
  const recentPatients = mockPatients.slice(0, 3); // Show 3 most recent for demo

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome to EndoCloud Notes</CardTitle>
          <CardDescription>Your endocrinology patient management hub.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Efficiently manage patient records, generate insightful reports, and streamline your workflow.
            All your data can be securely stored and managed within your Google Drive.
          </p>
          <Button onClick={() => alert("Connect to Google Drive action (not implemented)")}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Connect to Google Drive
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPatients.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently managed patient records
            </p>
            <Button asChild size="sm" className="mt-4 w-full">
              <Link href="/patients">View All Patients</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 <span className="text-sm text-muted-foreground">(Mock)</span></div>
            <p className="text-xs text-muted-foreground">
              AI-powered reports created
            </p>
             <Button size="sm" className="mt-4 w-full" variant="outline" onClick={() => alert("Feature not fully implemented")}>
              Generate New Report
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drive Storage</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">
              Connect Google Drive to see usage
            </p>
            <Button size="sm" className="mt-4 w-full" variant="outline" onClick={() => alert("Connect to Google Drive action (not implemented)")}>
              Check Storage
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Recently Accessed Patients</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPatients.length > 0 ? (
            <ul className="space-y-3">
              {recentPatients.map((patient) => (
                <li key={patient.id} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors">
                  <div>
                    <Link href={`/patients/${patient.id}`} className="font-medium text-primary hover:underline">
                      {patient.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">Last updated: <PatientLastUpdatedDisplay updatedAt={patient.updatedAt} /></p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/patients/${patient.id}`}>View Record</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No recent patients to display.</p>
          )}
        </CardContent>
      </Card>
       <div className="mt-8 p-6 bg-card rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">App Visual Placeholder</h3>
        <Image 
          src="https://placehold.co/800x300.png" 
          alt="App Visual Placeholder" 
          width={800} 
          height={300} 
          className="rounded-md object-cover"
          data-ai-hint="medical dashboard" 
        />
        <p className="text-sm text-muted-foreground mt-2">This is a placeholder image representing a potential UI or data visualization within the app.</p>
      </div>
    </div>
  );
}
