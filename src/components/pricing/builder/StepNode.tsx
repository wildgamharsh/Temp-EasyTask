import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Option } from '@/types/pricing';

interface StepNodeProps {
    data: {
        label: string;
        options: Option[];
        isTarget?: boolean;
        onOptionClick?: (optionId: string) => void;
    };
}

export const StepNode = memo(({ data }: StepNodeProps) => {
    return (
        <div className="bg-white rounded-lg border-2 border-slate-200 shadow-sm min-w-[200px] overflow-hidden relative group">
            <Handle
                type="target"
                position={Position.Left}
                id="step-target"
                className="bg-slate-400! w-3! h-3! -left-1.5!"
                title="Connect here to affect the whole step (Show/Hide)"
            />

            <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-bold text-sm text-slate-800 flex items-center justify-between">
                <span>{data.label}</span>
                <span className="text-xs text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded-full">{data.options.length}</span>
            </div>

            <div className="p-2 space-y-1 bg-white">
                {data.options.length === 0 ? (
                    <div className="text-xs text-slate-400 italic text-center py-2">No options added</div>
                ) : (
                    data.options.map(option => (
                        <div 
                            key={option.id} 
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent node selection if we clicked an option
                                data.onOptionClick?.(option.id);
                            }}
                            className="relative text-xs px-2 py-1.5 bg-slate-50 border border-slate-100 rounded text-slate-600 flex items-center justify-between group/option hover:bg-slate-100 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
                        >
                            <Handle
                                type="target"
                                position={Position.Left}
                                id={`target-${option.id}`}
                                className="bg-indigo-300! w-2! h-2! -left-3! opacity-0 group-hover/option:opacity-100 transition-opacity"
                                title="Connect here to Enable/Disable this option"
                            />
                            <span className="truncate max-w-[140px]" title={option.label}>{option.label}</span>
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`source-${option.id}`}
                                className="bg-indigo-400! w-2.5! h-2.5! -right-3! opacity-0 group-hover/option:opacity-100 transition-opacity"
                                title="Drag from here to trigger a rule"
                            />
                        </div>
                    ))
                )}
            </div>

            <Handle type="source" position={Position.Right} id="step-source" className="bg-slate-300! w-3! h-3! invisible!" />
        </div>
    );
});
