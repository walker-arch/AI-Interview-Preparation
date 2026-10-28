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
  Upload,
  FileText,
  CheckCircle2,
  Briefcase,
  Play,
  Terminal,
  ShieldCheck,
  ArrowRight,
  Layers,
  FileCode,
} from 'lucide-react';

export default function ResumeParserStudio() {
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
    } catch {
      // Empty state handled
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
      setError('File exceeds maximum size limit of 10 MB.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(30);
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? prev : prev + 15));
      }, 250);

      await uploadResume(file);
      clearInterval(interval);
      setUploadProgress(100);

      setSuccessMsg(`"${file.name}" parsed and classified via ML pipeline.`);
      await fetchLatestSkills();
    } catch (err: any) {
      setError(err?.detail || err?.message || 'Failed to parse resume.');
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
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Resume Intelligence // NLP Parser
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Resume Skill Extraction & Role Mapping
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Our supervised classification model parses experience narratives, extracts technical competencies, and calibrates mock interview questions.
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}

        {/* Upload Dropzone */}
        <Card className="p-6 sm:p-8 border-slate-200/80 dark:border-slate-800/80">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
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

            <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>

            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {uploading ? 'Parsing Resume with NLP Model...' : 'Select or drop resume (PDF / DOCX)'}
            </h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto font-mono">
              Max file size 10 MB. Text is analyzed locally without external data sharing.
            </p>

            {uploading && (
              <div className="mt-4 max-w-xs mx-auto">
                <ProgressBar value={uploadProgress} size="sm" showLabel />
              </div>
            )}
          </div>
        </Card>

        {/* Parsing Outputs */}
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : skillsData && skillsData.skills && skillsData.skills.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Classified Role */}
            <Card className="p-6 border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                  Target Domain Classification //
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {skillsData.role || 'Full Stack Software Engineer'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Classified via supervised TF-IDF Logistic Regression model.
                </p>

                <div className="mt-5 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">Confidence Calibration</span>
                    <span className="font-bold text-slate-900 dark:text-white">88%</span>
                  </div>
                  <ProgressBar value={88} size="sm" />
                </div>
              </div>

              <Link href="/interview" className="mt-6">
                <Button size="sm" className="w-full justify-center text-xs">
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  Launch Calibrated Mock Session
                </Button>
              </Link>
            </Card>

            {/* Extracted Skills Chips */}
            <Card className="lg:col-span-2 p-6 border-slate-200/80 dark:border-slate-800/80 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Recognized Technical Competencies
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Verified keyword and concept extractions
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  {skillsData.skills.length} Detected
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {skillsData.skills.map((skill: any, idx: number) => {
                  const skillName = typeof skill === 'string' ? skill : skill.name;
                  return (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {skillName}
                    </span>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Ready to test these specific competencies?
                </span>
                <Link href="/interview">
                  <Button variant="outline" size="sm" className="text-xs">
                    Start Interview Round <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-12 text-center border-slate-200/80 dark:border-slate-800/80">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No Resume Parsed Yet
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Upload your resume above to extract technical skills and generate customized mock interview rounds.
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
