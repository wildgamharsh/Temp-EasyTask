"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumerPreview = void 0;
var react_1 = require("react");
var pricing_engine_1 = require("@/lib/pricing/pricing-engine");
var StepSelector_1 = require("./StepSelector");
var lucide_react_1 = require("lucide-react");
var ConsumerPreview = function (_a) {
    var service = _a.service;
    var _b = (0, react_1.useState)({}), selections = _b[0], setSelections = _b[1];
    var _c = (0, react_1.useState)({}), stepQuantities = _c[0], setStepQuantities = _c[1];
    var _d = (0, react_1.useState)(1), quantity = _d[0], setQuantity = _d[1];
    var handleReset = react_1.default.useCallback(function () {
        var defaults = {};
        service.steps.forEach(function (step) {
            if (step.selectionType === 'fixed') {
                defaults[step.id] = step.options.map(function (o) { return o.id; });
                return;
            }
            if (step.defaultOptionIds && step.defaultOptionIds.length > 0) {
                var validIds = step.defaultOptionIds.filter(function (id) {
                    return step.options.some(function (o) { return o.id === id; });
                });
                if (validIds.length > 0) {
                    if (step.selectionType === 'single' || step.selectionType === 'quantity') {
                        defaults[step.id] = [validIds[0]];
                    }
                    else {
                        defaults[step.id] = validIds;
                    }
                }
            }
            else if (step.selectionType === 'quantity' && step.options.length > 0) {
                defaults[step.id] = [step.options[0].id];
            }
        });
        setSelections(defaults);
        setStepQuantities({});
        setQuantity(1);
    }, [service.steps]);
    react_1.default.useEffect(function () {
        handleReset();
    }, [handleReset]);
    var pricingResult = (0, react_1.useMemo)(function () {
        return (0, pricing_engine_1.evaluatePrice)(service, selections, quantity, stepQuantities);
    }, [service, selections, quantity, stepQuantities]);
    var handleSelect = function (stepId, optionId) {
        var step = service.steps.find(function (s) { return s.id === stepId; });
        if (!step)
            return;
        if (step.selectionType === 'fixed')
            return;
        setSelections(function (prev) {
            var _a, _b, _c, _d;
            var currentSelected = prev[stepId] || [];
            if (step.selectionType === 'single' || step.selectionType === 'quantity') {
                if (currentSelected.includes(optionId) && !step.required) {
                    return __assign(__assign({}, prev), (_a = {}, _a[stepId] = [], _a));
                }
                return __assign(__assign({}, prev), (_b = {}, _b[stepId] = [optionId], _b));
            }
            else {
                if (currentSelected.includes(optionId)) {
                    return __assign(__assign({}, prev), (_c = {}, _c[stepId] = currentSelected.filter(function (id) { return id !== optionId; }), _c));
                }
                else {
                    return __assign(__assign({}, prev), (_d = {}, _d[stepId] = __spreadArray(__spreadArray([], currentSelected, true), [optionId], false), _d));
                }
            }
        });
    };
    var handleQuantityChange = function (stepId, value) {
        setStepQuantities(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[stepId] = value, _a)));
        });
    };
    var getOptionLabel = function (stepId) {
        var selected = selections[stepId];
        if (!selected || selected.length === 0)
            return 'None';
        var step = service.steps.find(function (s) { return s.id === stepId; });
        if (!step)
            return 'None';
        var option = step.options.find(function (o) { return o.id === selected[0]; });
        return (option === null || option === void 0 ? void 0 : option.label) || 'None';
    };
    return (<div className="flex h-full w-full bg-slate-50">
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-10 lg:p-12 scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-12 pb-20">
                    {/* Service Info */}
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">{service.name}</h1>
                        <p className="text-slate-500 text-lg">{service.description || 'Configure your service options below.'}</p>
                    </div>

                    {service.steps.length === 0 ? (<div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                            <p className="text-slate-400">Add steps in the builder to see them here.</p>
                        </div>) : (<>
                            {service.steps.sort(function (a, b) { return a.order - b.order; }).map(function (step, index) {
                if (!(0, pricing_engine_1.isStepVisible)(service, step.id, selections))
                    return null;
                return (<StepSelector_1.StepSelector key={step.id} service={service} step={step} stepNumber={index + 1} selections={selections} stepQuantities={stepQuantities} onSelect={handleSelect} onQuantityChange={handleQuantityChange}/>);
            })}
                        </>)}
                </div>
            </div>

            {/* Quote Summary Sidebar - Fixed/Sticky */}
            <aside className="w-[340px] shrink-0 h-full border-l border-slate-200 bg-white">
                <div className="h-full flex flex-col">
                    <div className="p-5 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <lucide_react_1.Receipt className="text-blue-600" size={18}/>
                            Quote Summary
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Real-time estimation</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Service</span>
                            <div className="font-bold text-slate-900 text-sm">{service.name}</div>
                        </div>
                        <div className="h-px bg-slate-100 w-full"></div>
                        <div className="space-y-3">
                            {pricingResult.breakdown.map(function (item, idx) { return (<div key={idx} className="flex justify-between items-start group">
                                    <div className="flex gap-2">
                                        <lucide_react_1.CheckCircle size={14} className="text-slate-400 mt-0.5"/>
                                        <div>
                                            <div className="text-slate-700 font-medium text-sm">{item.label}</div>
                                        </div>
                                    </div>
                                    <div className="text-slate-900 font-bold text-sm">${item.finalPrice.toLocaleString()}</div>
                                </div>); })}
                            {pricingResult.breakdown.length === 0 && (<p className="text-sm text-slate-400 italic">No selections yet</p>)}
                        </div>
                        <div className="h-px bg-slate-100 w-full"></div>
                        {!pricingResult.isValid && (<div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3">
                                <lucide_react_1.Info size={18} className="text-blue-600 mt-0.5"/>
                                <div>
                                    <p className="text-blue-800 text-sm font-bold">Review Selections</p>
                                    <p className="text-blue-600 text-xs mt-0.5">Complete all required options to see the final price.</p>
                                </div>
                            </div>)}
                    </div>
                    <div className="mt-auto p-6 bg-slate-50 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-500">Subtotal</span>
                            <span className="text-sm font-medium text-slate-700">${pricingResult.unitPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-500">Quantity</span>
                            <span className="text-sm font-medium text-slate-700">× {quantity}</span>
                        </div>
                        <div className="flex items-end justify-between pt-4 border-t border-slate-200">
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Est.</span>
                            </div>
                            <div className="text-3xl font-bold text-slate-900 tracking-tight">${pricingResult.totalPrice.toLocaleString()}</div>
                        </div>
                        <button disabled={!pricingResult.isValid} className={"w-full mt-6 bg-blue-600 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"}>
                            <span>Generate Proposal</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                            </svg>
                        </button>
                    </div>
                </div>
                </aside>
            </div>);
};
exports.ConsumerPreview = ConsumerPreview;
;
