import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    Position,
    MarkerType,
    Controls,
    Background,
    ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Service, RuleType } from '@/types/pricing';
import { StepNode } from './StepNode';
import { RuleConfigModal } from './RuleConfigModal';

const nodeTypes = {
    stepNode: StepNode,
};

interface Props {
    service: Service;
    onUpdate: (service: Service) => void;
}

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const nodeWidth = 220;
    const nodeHeight = 150;
    const columns = 4;

    // Simple Grid Layout
    nodes.forEach((node, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        
        node.position = {
            x: col * (nodeWidth + 50) + 50,
            y: row * (nodeHeight + 50) + 50,
        };
        node.targetPosition = Position.Left;
        node.sourcePosition = Position.Right;
    });

    return { nodes, edges };
};

export const DependencyGraphContent: React.FC<Props> = ({ service, onUpdate }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingConnection, setPendingConnection] = useState<{
        source: string;
        sourceHandle: string;
        target: string;
        targetHandle: string;
        sourceName: string;
        targetName: string;
        targetType: 'step' | 'option';
    } | null>(null);

    // Selection State
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

    const onOptionClick = useCallback((stepId: string, optionId: string) => {
        setSelectedNodeId(stepId);
        setSelectedOptionId(optionId);
        setSelectedRuleId(null);
    }, []);

    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const nodes: Node[] = service.steps.map(step => ({
            id: step.id,
            data: { 
                label: step.name, 
                options: step.options, 
                onOptionClick: (optId: string) => onOptionClick(step.id, optId) 
            },
            position: { x: 0, y: 0 }, 
            type: 'stepNode', 
        }));

        const edges: Edge[] = [];

        service.rules.forEach(rule => {
            const sourceStepId = rule.condition.dependsOnStepId;
            const sourceOptionId = rule.condition.selectedOptionId;

            rule.effects.forEach(effect => {
                let targetStepId = effect.targetStepId;
                let targetOptionId: string | undefined;

                if (effect.targetOptionIds && effect.targetOptionIds.length > 0) {
                    targetOptionId = effect.targetOptionIds[0];
                } else if (effect.targetOptionId) {
                    targetOptionId = effect.targetOptionId;
                }

                if (targetOptionId) {
                    const step = service.steps.find(s => s.options.some(o => o.id === targetOptionId));
                    targetStepId = step?.id;
                }

                if (targetStepId && sourceStepId !== targetStepId) {
                    let color = '#94a3b8'; 
                    const type = effect.type;

                    if (type === RuleType.PRICE_OVERRIDE || type === RuleType.PRICE_MULTIPLIER) {
                        color = '#10b981'; 
                    } else if (type === RuleType.ENABLE || type === RuleType.DISABLE) {
                        color = '#3b82f6';
                    } else if (type === RuleType.STEP_SHOW || type === RuleType.STEP_HIDE) {
                        color = '#f59e0b'; 
                    }

                    const sourceHandle = `source-${sourceOptionId}`;
                    const targetHandle = targetOptionId ? `target-${targetOptionId}` : 'step-target';

                    edges.push({
                        id: `e-${rule.id}-${targetStepId}-${Math.random()}`,
                        source: sourceStepId,
                        target: targetStepId,
                        sourceHandle: sourceHandle,
                        targetHandle: targetHandle,
                        animated: true,
                        style: { stroke: color, strokeWidth: 3, cursor: 'pointer' },
                        interactionWidth: 20, // Make it easier to click
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: color,
                        },
                        data: { ruleId: rule.id }
                    });
                }
            });
        });

        if (nodes.length === 0) {
            nodes.push({
                id: 'info-node',
                data: { label: 'No Steps Configured', options: [] },
                position: { x: 50, y: 50 },
                type: 'stepNode', 
            });
        }

        return getLayoutedElements(nodes, edges);
    }, [service, onOptionClick]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    React.useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const onConnect = useCallback((connection: Connection) => {
        if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) return;

        const sourceStep = service.steps.find(s => s.id === connection.source);
        const sourceOptionId = connection.sourceHandle.replace('source-', '');
        const sourceName = sourceStep?.options.find(o => o.id === sourceOptionId)?.label || 'Unknown Option';

        let targetName = 'Unknown Target';
        let targetType: 'step' | 'option' = 'step';

        if (connection.targetHandle === 'step-target') {
            const targetStep = service.steps.find(s => s.id === connection.target);
            targetName = targetStep?.name || 'Unknown Step';
            targetType = 'step';
        } else {
            const targetStep = service.steps.find(s => s.id === connection.target);
            const targetOptionId = connection.targetHandle.replace('target-', '');
            targetName = targetStep?.options.find(o => o.id === targetOptionId)?.label || 'Unknown Option';
            targetType = 'option';
        }

        setPendingConnection({
            source: connection.source,
            sourceHandle: connection.sourceHandle,
            target: connection.target,
            targetHandle: connection.targetHandle,
            sourceName,
            targetName,
            targetType
        });
        setIsModalOpen(true);
    }, [service]);

    const handleModalSave = (config: { type: RuleType, value?: number }) => {
        if (!pendingConnection) return;

        const sourceOptionId = pendingConnection.sourceHandle.replace('source-', '');
        const targetOptionId = pendingConnection.targetHandle.startsWith('target-')
            ? pendingConnection.targetHandle.replace('target-', '')
            : undefined;

        const newRule = {
            id: `rule-${Date.now()}`,
            serviceId: service.id,
            condition: {
                dependsOnStepId: pendingConnection.source,
                selectedOptionId: sourceOptionId
            },
            effects: [{
                type: config.type,
                targetStepId: pendingConnection.target,
                targetOptionIds: targetOptionId ? [targetOptionId] : undefined,
                value: config.value
            }]
        };

        const updatedService = {
            ...service,
            rules: [...service.rules, newRule]
        };

        onUpdate(updatedService);
        setIsModalOpen(false);
        setPendingConnection(null);
    };

    // --- Interaction Handlers ---

    const handleNodeClick = (event: React.MouseEvent, node: Node) => {
        setSelectedNodeId(node.id);
        setSelectedOptionId(null); // Reset option selection when clicking the main node
        setSelectedRuleId(null);
    };

    const handleEdgeClick = (event: React.MouseEvent, edge: Edge) => {
        event.stopPropagation();
        if (edge.data?.ruleId) {
            setSelectedRuleId(edge.data.ruleId);
            setSelectedNodeId(null);
            setSelectedOptionId(null);
        }
    };

    // --- Derived Data for UI Panels ---

    const selectedStep = service.steps.find(s => s.id === selectedNodeId);
    const selectedOption = selectedStep?.options.find(o => o.id === selectedOptionId);
    const selectedRule = service.rules.find(r => r.id === selectedRuleId);

    // Find related rules for the selected option/step
    const relatedRules = useMemo(() => {
        if (!selectedStep) return { incoming: [], outgoing: [] };
        
        const incoming = service.rules.filter(r => 
            r.effects.some(e => 
                e.targetStepId === selectedStep.id || 
                (e.targetOptionIds && selectedOptionId && e.targetOptionIds.includes(selectedOptionId)) || 
                (e.targetOptionId && selectedOptionId && e.targetOptionId === selectedOptionId)
            )
        );

        const outgoing = service.rules.filter(r => 
            r.condition.dependsOnStepId === selectedStep.id &&
            (!selectedOptionId || r.condition.selectedOptionId === selectedOptionId)
        );

        return { incoming, outgoing };
    }, [service.rules, selectedStep, selectedOptionId]);

    return (
        <div style={{ width: '100%', height: '600px' }} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-inner relative flex">
            <div className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={handleNodeClick}
                    onEdgeClick={handleEdgeClick}
                    nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-right"
                >
                    <Controls />
                    <Background color="#cbd5e1" gap={16} />
                </ReactFlow>

                {/* --- Step/Option Details Panel --- */}
                {selectedStep && (
                    <div className="absolute top-4 right-4 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100%-32px)] animate-in slide-in-from-right-10 duration-200 z-10">
                        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">
                                {selectedOption ? 'Option Details' : 'Step Details'}
                            </h3>
                            <button onClick={() => { setSelectedNodeId(null); setSelectedOptionId(null); }} className="text-slate-400 hover:text-slate-600">
                                <span className="sr-only">Close</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        
                        <div className="p-4 overflow-y-auto space-y-4">
                            {selectedOption ? (
                                <>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">Option Name</div>
                                        <div className="font-semibold text-lg text-slate-900">{selectedOption.label}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">Price Adjustment</div>
                                        <div className="font-mono text-slate-700 font-bold">
                                            {selectedOption.baseDelta >= 0 ? '+' : ''}${selectedOption.baseDelta.toFixed(2)}
                                        </div>
                                    </div>
                                    {selectedOption.description && (
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase">Description</div>
                                            <div className="text-sm text-slate-600">{selectedOption.description}</div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">Step Name</div>
                                        <div className="font-semibold text-lg text-slate-900">{selectedStep.name}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase">Type</div>
                                            <div className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded inline-block font-semibold capitalize">{selectedStep.selectionType}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase">Design</div>
                                            <div className="bg-slate-100 text-slate-700 px-2 py-1 rounded inline-block font-mono text-xs">{selectedStep.displayStyle}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-2">
                                        Select an option inside the graph node to see option-specific details.
                                    </div>
                                </>
                            )}

                            {/* Related Rules Section */}
                            <div className="border-t border-slate-100 pt-4 mt-2">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Related Logic</div>
                                
                                {relatedRules.outgoing.length > 0 && (
                                    <div className="mb-3">
                                        <div className="text-xs font-semibold text-indigo-600 mb-1">Triggers (IF selected):</div>
                                        <ul className="space-y-1">
                                            {relatedRules.outgoing.map(r => (
                                                <li key={r.id} className="text-xs bg-indigo-50 text-indigo-800 px-2 py-1.5 rounded border border-indigo-100 cursor-pointer hover:bg-indigo-100" onClick={() => setSelectedRuleId(r.id)}>
                                                    Rule #{r.id.slice(-4)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {relatedRules.incoming.length > 0 && (
                                    <div>
                                        <div className="text-xs font-semibold text-amber-600 mb-1">Affected By (THEN):</div>
                                        <ul className="space-y-1">
                                            {relatedRules.incoming.map(r => (
                                                <li key={r.id} className="text-xs bg-amber-50 text-amber-800 px-2 py-1.5 rounded border border-amber-100 cursor-pointer hover:bg-amber-100" onClick={() => setSelectedRuleId(r.id)}>
                                                    Rule #{r.id.slice(-4)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {relatedRules.incoming.length === 0 && relatedRules.outgoing.length === 0 && (
                                    <div className="text-xs text-slate-400 italic">No logic rules connected.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Rule Details Modal (Simple) --- */}
                {selectedRule && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm" onClick={() => setSelectedRuleId(null)}>
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border-2 border-blue-500 overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                                <h3 className="font-bold flex items-center gap-2">
                                    <span className="bg-white/20 p-1 rounded">⚡</span> Logic Rule Detail
                                </h3>
                                <button onClick={() => setSelectedRuleId(null)} className="hover:bg-white/20 p-1 rounded transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-6">
                                {/* Condition */}
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">Condition (IF)</div>
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                                        <div className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded">
                                            {service.steps.find(s => s.id === selectedRule.condition.dependsOnStepId)?.name || 'Unknown Step'}
                                        </div>
                                        <span className="text-slate-400 text-sm">is</span>
                                        <div className="bg-white border border-slate-300 text-slate-800 text-sm font-semibold px-2 py-1 rounded shadow-sm">
                                            {service.steps.find(s => s.id === selectedRule.condition.dependsOnStepId)?.options.find(o => o.id === selectedRule.condition.selectedOptionId)?.label || 'Unknown Option'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                                </div>

                                {/* Effects */}
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">Effects (THEN)</div>
                                    <div className="space-y-2">
                                        {selectedRule.effects.map((effect, idx) => (
                                            <div key={idx} className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded capitalize">{effect.type}</span>
                                                    {(effect.value !== undefined && effect.value !== 0) && (
                                                        <span className="text-sm font-mono font-bold text-slate-700">
                                                            {effect.type === RuleType.PRICE_MULTIPLIER ? `×${effect.value}` : `$${effect.value}`}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-slate-600">
                                                    Target: 
                                                    <span className="font-semibold ml-1">
                                                        {(effect.targetStepId 
                                                            ? service.steps.find(s => s.id === effect.targetStepId)?.name 
                                                            : (effect.targetOptionIds?.[0] 
                                                                ? service.steps.flatMap(s => s.options).find(o => o.id === effect.targetOptionIds?.[0])?.label 
                                                                : 'Unknown Target')
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-4 border-t border-slate-200 text-center">
                                <button 
                                    onClick={() => setSelectedRuleId(null)}
                                    className="text-sm text-slate-500 hover:text-slate-800 font-semibold"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {pendingConnection && (
                <RuleConfigModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleModalSave}
                    sourceName={pendingConnection.sourceName}
                    targetName={pendingConnection.targetName}
                    targetType={pendingConnection.targetType}
                />
            )}
        </div>
    );
};

export const DependencyGraph: React.FC<Props> = (props) => (
    <ReactFlowProvider>
        <DependencyGraphContent {...props} />
    </ReactFlowProvider>
);
