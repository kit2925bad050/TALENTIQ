import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Target,
  Sparkles,
  CheckCircle2,
  Lock,
  Play,
  Award,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { LearningFeedItem, LearningMissionItem } from '../../types';

export const LearningFeedPage: React.FC = () => {
  const { activeEmployeeId } = useAuth();
  const navigate = useNavigate();
  const [feedItems, setFeedItems] = useState<LearningFeedItem[]>([]);
  const [missions, setMissions] = useState<LearningMissionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedAndMissions();
  }, [activeEmployeeId]);

  const loadFeedAndMissions = async () => {
    if (!activeEmployeeId) return;
    try {
      setLoading(true);
      const [feedData, missionData] = await Promise.all([
        apiService.getPersonalLearningFeed(activeEmployeeId),
        apiService.getLearningMissions(activeEmployeeId)
      ]);
      setFeedItems(feedData || []);
      setMissions(missionData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStage = async (missionId: string, stageNumber: number) => {
    try {
      await apiService.advanceLearningMission({
        missionId,
        employeeId: activeEmployeeId,
        stageNumber
      });
      loadFeedAndMissions();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400">Curating Personalized Learning Feed & Missions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-1">
              <Compass className="w-4 h-4" />
              <span>Grounded Curriculum Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Personal Learning Feed & Missions
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Curated recommendations and 8-stage mastery missions transforming verified skill deficits into internal career readiness.
            </p>
          </div>
        </div>
      </div>

      {/* Active 8-Stage Learning Missions */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <span>Active Learning Missions (8-Stage Path)</span>
        </h3>

        {missions.map((mission) => (
          <div
            key={mission.missionId}
            className="rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/40 shadow-xl space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  Target Role: {mission.targetRole}
                </span>
                <h4 className="text-xl font-extrabold text-white">
                  Mission: Master {mission.skillName} for Job Readiness
                </h4>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Mission Progress</span>
                  <span className="text-lg font-bold text-cyan-300 font-mono">{mission.progressPercent}%</span>
                </div>
                <button
                  onClick={() => navigate('/mentor')}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Resume Mission</span>
                </button>
              </div>
            </div>

            {/* 8 Stages Pipeline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {mission.stages.map((stage) => {
                const isCompleted = stage.status === 'COMPLETED';
                const isActive = stage.status === 'ACTIVE';

                return (
                  <div
                    key={stage.stageNumber}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col justify-between ${
                      isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : isActive
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-500/30 shadow-lg'
                        : 'bg-slate-950/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-center mb-1.5">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isActive ? (
                          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </div>
                      <span className="text-[9px] uppercase font-bold tracking-wider block">Stage {stage.stageNumber}</span>
                      <h5 className="text-xs font-bold text-white mt-0.5">{stage.stageName}</h5>
                    </div>

                    <div className="mt-3">
                      {isActive && (
                        <button
                          onClick={() => handleAdvanceStage(mission.missionId, stage.stageNumber)}
                          className="w-full py-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg text-[10px] shadow"
                        >
                          Complete
                        </button>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">Passed</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Personalized Feed Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <span>Curated Learning Feed (Verified & Grounded)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feedItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl glass-panel p-5 border border-slate-800 hover:border-cyan-500/30 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-900 border border-slate-700 text-cyan-300">
                    {item.skill}
                  </span>
                  <span className="text-[10px] text-slate-400">{item.estimatedEffort}</span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">{item.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{item.whyRecommended}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">{item.resourceType}</span>
                <button
                  onClick={() => navigate('/mentor')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <span>Start Module</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
