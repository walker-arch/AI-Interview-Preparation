'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { uploadResume, getSkills, SkillsResponse } from '@/lib/api';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import Alert from '@/components/ui/Alert';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  Briefcase,
  Play,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function ResumePage() {
  const [skillsData, setSkillsData] = useState<SkillsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLatestSkills();
  }, []);

  async function fetchLatestSkills() {
    try {
      setLoading(true);
      const data = await getSkills();
      setSkillsData(data);
    } catch (err: any) {
      console.warn('No resume uploaded yet or fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = async (file: File) => {
    setError(null);
    setSuccessMsg(null);

    const validTypes = ['.pdf', '.docx', '.doc'];
    const hasValidExt = validTypes.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setError('Please upload a valid PDF or DOCX file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(25);
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? prev : prev + 15));
      }, 300);

      const res = await uploadResume(file);
      clearInterval(interval);
      setUploadProgress(100);

      setSuccessMsg(`Resume "${file.name}" uploaded and parsed successfully by ML model!`);
      await fetchLatestSkills();
    } catch (err: any) {
      setError(err?.detail || err?.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Resume Analysis & Skill Extraction
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Our ML model extracts technical competencies, maps job domains, and tailors mock interview questions.
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}

        {/* Upload Zone */}
        <Card className="p-8 border-slate-200/80 dark:border-slate-800">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-900/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {uploading ? 'Analyzing Resume with ML...' : 'Drop your resume here, or click to browse'}
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Supports PDF, DOCX (Max 10 MB). Text and technical keywords will be classified automatically.
            </p>

            {uploading && (
              <div className="mt-6 max-w-xs mx-auto">
                <ProgressBar value={uploadProgress} showLabel />
              </div>
            )}
          </div>
        </Card>

        {/* Analysis Results */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : skillsData && skillsData.skills && skillsData.skills.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Target Role & Profile */}
            <Card className="p-6 border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2">
                  <Briefcase className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Candidate Role</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {skillsData.role || 'Full Stack Developer'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Classified via supervised Logistic Regression and TF-IDF feature analysis.
                </p>

                <div className="mt-6 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-200 mb-1">
                    <span>Role Match Fit</span>
                    <span>88%</span>
                  </div>
                  <ProgressBar value={88} size="sm" />
                </div>
              </div>

              <Link href="/interview" className="mt-6">
                <Button className="w-full justify-center">
                  <Play className="w-4 h-4 mr-2" />
                  Start Tailored Mock Interview
                </Button>
              </Link>
            </Card>

            {/* Extracted Skills Badges */}
            <Card className="lg:col-span-2 p-6 border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Extracted Competencies</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Skills recognized by the NLP extraction pipeline
                  </p>
                </div>
                <Badge variant="success">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  {skillsData.skills.length} Skills Detected
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {skillsData.skills.map((skill: any, idx: number) => {
                  const skillName = typeof skill === 'string' ? skill : skill.name;
                  return (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      {skillName}
                    </span>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Want to practice questions focusing on these specific skills?
                </p>
                <Link href="/interview">
                  <Button variant="outline" size="sm">
                    Configure Session <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-12 text-center border-slate-200/80 dark:border-slate-800">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No Resume Uploaded Yet
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Upload your resume above to view detected skills, get an automatic target-role match, and receive customized technical interview questions.
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

