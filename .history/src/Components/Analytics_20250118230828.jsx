import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, Calendar, Briefcase } from "lucide-react";

const Analytics = () => {
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://13.127.144.141:3004/api/interviews/get-interview_by_id/?interview_id=${localStorage.getItem('cvResponse')}`
        );
        const data = await response.json();
        setInterviewData(data.data.Interview);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch interview data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-8 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-[300px] mx-auto" />
          <Skeleton className="h-4 w-[200px] mx-auto" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] rounded-lg" />
          <Skeleton className="h-[400px] rounded-lg md:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-[400px]">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-red-500 font-medium">{error}</p>
              <p className="text-sm text-muted-foreground">Please try again later</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!interviewData) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-[400px]">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="font-medium">No interview data available</p>
              <p className="text-sm text-muted-foreground">Please check back later</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { candidate, jd, created_at } = interviewData;

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Interview Analysis</h1>
        <p className="text-muted-foreground">Comprehensive evaluation of interview performance</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Candidate Profile Card */}
        <Card>
          <CardHeader className="text-center pb-2">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {candidate?.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl mb-1">{candidate.full_name}</CardTitle>
            <Badge variant="secondary" className="mt-2">Candidate</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm">{candidate.email}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm">{candidate.phone_number}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm">{new Date(created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Description Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <CardTitle>Job Description</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-muted-foreground">{jd}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;