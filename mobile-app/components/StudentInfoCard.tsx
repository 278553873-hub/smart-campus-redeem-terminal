import React from 'react';
import { Student } from '../types';
import { MaleIcon, FemaleIcon, ReportIcon } from './Icons';

interface StudentInfoCardProps {
  student: Student;
}

const StudentInfoCard: React.FC<StudentInfoCardProps> = ({ student }) => {
  return (
    <div className="mx-4 mt-4 p-5 rounded-2xl shadow-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 right-10 w-32 h-32 bg-cyan-300 opacity-10 rounded-full blur-3xl"></div>

      <div className="flex justify-between items-start relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold tracking-tight">{student.name}</h2>
            <div className={`rounded-full p-1 flex items-center justify-center ${student.gender === 'male' ? 'bg-blue-400/30' : 'bg-pink-400/30'}`}>
              {student.gender === 'male' ? <MaleIcon /> : <FemaleIcon />}
            </div>
          </div>
          <div className="flex items-center gap-2 text-blue-50 text-sm font-medium">
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs backdrop-blur-sm">{student.grade}</span>
            <span className="opacity-90">{student.class}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl cursor-pointer /20 transition-all shadow-sm">
          <ReportIcon className="text-white mb-1" />
          <span className="text-xs font-medium text-white">期末报告</span>
        </div>
      </div>
    </div>
  );
};

export default StudentInfoCard;
