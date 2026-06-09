// ========================================
// AGENT 4: Scope Control Auditor AI
// ========================================
// Role: Compare original requirements with new client requests
// 5-Class System: FEATURE | VAGUE | CONSTRAINT | SCOPE_CHANGE | VALID_EXTENSION
// Structured consultant output with Problem Understanding, Base Scope,
// Scope Evaluation Table, Budget Analysis, Execution Plan, Risks
// STRICT RULES: Never treat vague as features. Never blindly accept. Always justify.

const AuditorAgent = (() => {
  const AGENT_NAME = 'Scope Control Auditor';
  const AGENT_ICON = '🔍';
  const AGENT_COLOR = 'auditor';

  const TYPES = AnalystAgent.TYPES;

  /**
   * Evaluate a new client request against original scope
   * Returns full structured consultant output
   */
  function evaluate(newRequest, originalRequirements, proposal) {
    if (!newRequest || newRequest.trim().length < 5) {
      return { success: false, message: 'New request description is too short for evaluation.' };
    }
    if (!originalRequirements) {
      return { success: false, message: 'No original requirements found. Cannot perform scope comparison.' };
    }

    const request = newRequest.trim();

    // Step 1: Classify every statement using AnalystAgent engine
    const classified = AnalystAgent.classifyStatements(request, originalRequirements);

    // Step 2: Deep-evaluate each classified item against scope
    const results = classified.map(item => deepEvaluate(item, originalRequirements, proposal));

    // Step 3: Build structured output
    const inScope = results.filter(r => r.classification === 'in-scope');
    const outScope = results.filter(r => r.classification === 'out-scope');
    const partial = results.filter(r => r.classification === 'partial');
    const vague = results.filter(r => r.classification === 'vague');

    // Build Problem Understanding
    const problemUnderstanding = buildProblemUnderstanding(request, originalRequirements, results);

    // Build Base Scope (original features)
    const baseScope = (originalRequirements.features || []).map(f =>
      typeof f === 'string' ? f : f.name || String(f)
    );

    // Build Scope Evaluation Table
    const scopeEvaluation = results.map(r => ({
      request: r.request,
      type: r.type,
      status: r.statusLabel,
      reason: r.justification,
      impact: r.impact,
    }));

    // Budget Analysis (if budget info available)
    const budgetAnalysis = buildBudgetAnalysis(results, originalRequirements, proposal);

    // Execution Plan (only in-scope + valid extensions)
    const executionPlan = results
      .filter(r => r.type === TYPES.FEATURE || r.type === TYPES.VALID_EXTENSION)
      .map(r => ({ feature: r.request, type: r.type, impact: r.impact }));

    // Risks & Notes
    const risks = buildRisks(results, originalRequirements);

    return {
      success: true,
      results,
      summary: {
        total: results.length,
        inScope: inScope.length,
        outScope: outScope.length,
        partial: partial.length,
        vague: vague.length,
      },
      // Structured consultant output
      problemUnderstanding,
      baseScope,
      scopeEvaluation,
      budgetAnalysis,
      executionPlan,
      risks,
      overallVerdict: getOverallVerdict(results),
    };
  }

  function deepEvaluate(classifiedItem, requirements, proposal) {
    const { text, type, reason } = classifiedItem;
    const itemLower = text.toLowerCase();

    // ---- VAGUE: Never treat as feature ----
    if (type === TYPES.VAGUE) {
      return {
        request: text,
        type: TYPES.VAGUE,
        classification: 'vague',
        statusLabel: '⚠️ Needs Clarification',
        justification: reason,
        impact: { time: 'N/A', cost: 'N/A' },
        matchConfidence: 0,
        matchedFeature: 'None',
      };
    }

    // ---- CONSTRAINT: Validate, don't convert to feature ----
    if (type === TYPES.CONSTRAINT) {
      const feasibility = validateConstraint(text, requirements);
      return {
        request: text,
        type: TYPES.CONSTRAINT,
        classification: 'partial',
        statusLabel: feasibility.feasible ? '🔒 Feasible Constraint' : '🔒 Risky Constraint',
        justification: feasibility.reason,
        impact: { time: feasibility.timeImpact || 'Varies', cost: feasibility.costImpact || 'Varies' },
        matchConfidence: 0,
        matchedFeature: 'N/A (Constraint)',
      };
    }

    // ---- SCOPE_CHANGE: Reject with reasoning ----
    if (type === TYPES.SCOPE_CHANGE) {
      return {
        request: text,
        type: TYPES.SCOPE_CHANGE,
        classification: 'out-scope',
        statusLabel: '❌ Out of Scope',
        justification: reason,
        impact: estimateImpact(text, 'out-scope'),
        matchConfidence: 0,
        matchedFeature: 'None — New Scope',
      };
    }

    // ---- FEATURE / VALID_EXTENSION: Match against scope ----
    const scopeTerms = buildScopeTerms(requirements, proposal);
    let bestMatch = { score: 0, matchedFeature: '', matchType: 'none' };

    for (const scopeTerm of scopeTerms) {
      const score = calculateSimilarity(itemLower, scopeTerm.text.toLowerCase());
      const keywordScore = calculateKeywordOverlap(itemLower, scopeTerm.text.toLowerCase());
      const totalScore = Math.max(score, keywordScore);
      if (totalScore > bestMatch.score) {
        bestMatch = { score: totalScore, matchedFeature: scopeTerm.original, matchType: scopeTerm.type };
      }
    }

    const expansionSignals = checkExpansionSignals(itemLower);

    let classification, statusLabel, justification, impact;

    if (bestMatch.score >= 0.6 && !expansionSignals.isExpansion) {
      classification = 'in-scope';
      statusLabel = '✅ In Scope';
      justification = `Aligns with original scope item "${bestMatch.matchedFeature}". ${getInScopeReasoning(text, bestMatch.matchedFeature)}`;
      impact = { time: 'No additional time', cost: 'Included in existing estimate' };
    } else if (bestMatch.score >= 0.3 || (bestMatch.score >= 0.2 && !expansionSignals.isExpansion)) {
      classification = 'partial';
      statusLabel = '⚠️ Needs Discussion';
      justification = `Partially relates to "${bestMatch.matchedFeature}" but extends beyond original scope. ${getPartialReasoning(text, bestMatch.matchedFeature, expansionSignals)}`;
      impact = estimateImpact(text, 'partial');
    } else {
      classification = 'out-scope';
      statusLabel = '❌ Out of Scope';
      justification = `Not part of original project scope. ${getOutOfScopeReasoning(text, requirements, expansionSignals)}`;
      impact = estimateImpact(text, 'out-scope');
    }

    // Override: if AnalystAgent classified as VALID_EXTENSION and score is moderate, trust it
    if (type === TYPES.VALID_EXTENSION && bestMatch.score >= 0.2) {
      classification = 'in-scope';
      statusLabel = '✅ In Scope';
      justification = `Valid extension of existing scope. Relates to "${bestMatch.matchedFeature}". ${reason}`;
      impact = { time: 'Minimal additional', cost: 'Within estimates' };
    }

    return {
      request: text,
      type,
      classification,
      statusLabel,
      justification,
      impact,
      matchConfidence: Math.round(bestMatch.score * 100),
      matchedFeature: bestMatch.matchedFeature || 'None',
    };
  }

  // ---- Constraint Validation ----
  function validateConstraint(text, requirements) {
    const lower = text.toLowerCase();
    if (/budget|cost|price/i.test(lower)) {
      return {
        feasible: true,
        reason: 'Budget constraint noted. Will be validated against project cost estimates in the feasibility analysis below.',
        timeImpact: 'May require scope trimming',
        costImpact: 'Defines ceiling',
      };
    }
    if (/asap|urgent|2\s*weeks?|1\s*week|rush/i.test(lower)) {
      return {
        feasible: false,
        reason: 'This timeline is aggressive for the current scope. Risk of quality trade-offs or incomplete delivery. Consider an MVP approach or phased delivery.',
        timeImpact: 'High risk',
        costImpact: 'May increase (rush premium)',
      };
    }
    if (/deadline|timeline|months?|weeks?/i.test(lower)) {
      return {
        feasible: true,
        reason: 'Timeline constraint noted. Will be validated against project plan milestones.',
        timeImpact: 'Defines schedule boundary',
        costImpact: 'N/A',
      };
    }
    if (/gdpr|hipaa|pci|compliance/i.test(lower)) {
      return {
        feasible: true,
        reason: 'Compliance constraint requires dedicated effort for audit-readiness. This is factored into development estimates.',
        timeImpact: '+1-2 weeks for compliance review',
        costImpact: '+$3,000-$8,000',
      };
    }
    return {
      feasible: true,
      reason: 'Constraint acknowledged and will be factored into project planning.',
      timeImpact: 'TBD',
      costImpact: 'TBD',
    };
  }

  // ---- Structured Output Builders ----
  function buildProblemUnderstanding(request, requirements, results) {
    const featureCount = results.filter(r => r.type === TYPES.FEATURE || r.type === TYPES.VALID_EXTENSION).length;
    const vagueCount = results.filter(r => r.type === TYPES.VAGUE).length;
    const scopeChangeCount = results.filter(r => r.type === TYPES.SCOPE_CHANGE).length;
    const constraintCount = results.filter(r => r.type === TYPES.CONSTRAINT).length;

    let summary = `The client has submitted ${results.length} request item(s) for evaluation against the project "${requirements.objective || 'current scope'}". `;
    if (featureCount > 0) summary += `${featureCount} item(s) are actionable feature requests. `;
    if (vagueCount > 0) summary += `${vagueCount} item(s) are too vague to act on and require clarification. `;
    if (scopeChangeCount > 0) summary += `${scopeChangeCount} item(s) represent new scope not in the original agreement. `;
    if (constraintCount > 0) summary += `${constraintCount} item(s) are project constraints to validate. `;

    return summary.trim();
  }

  function buildBudgetAnalysis(results, requirements, proposal) {
    const outScopeItems = results.filter(r => r.classification === 'out-scope');
    const partialItems = results.filter(r => r.classification === 'partial' && r.type !== TYPES.CONSTRAINT);

    let additionalCost = 0;
    let additionalTime = 0;

    [...outScopeItems, ...partialItems].forEach(item => {
      const costStr = item.impact?.cost || '';
      const costMatch = costStr.match(/\$?([\d,]+)/);
      if (costMatch) additionalCost += parseInt(costMatch[1].replace(/,/g, ''));
      const timeMatch = (item.impact?.time || '').match(/(\d+)/);
      if (timeMatch) additionalTime += parseInt(timeMatch[1]);
    });

    return {
      additionalCostEstimate: additionalCost > 0 ? `$${additionalCost.toLocaleString()}+` : '$0',
      additionalTimeEstimate: additionalTime > 0 ? `${additionalTime}+ weeks` : 'None',
      recommendation: outScopeItems.length > 0
        ? 'Out-of-scope items require a formal change request with separate budget allocation.'
        : 'All items are within or near current scope. No additional budget required.',
    };
  }

  function buildRisks(results, requirements) {
    const risks = [];
    const vagueItems = results.filter(r => r.type === TYPES.VAGUE);
    const outItems = results.filter(r => r.classification === 'out-scope');
    const constraintItems = results.filter(r => r.type === TYPES.CONSTRAINT);

    if (vagueItems.length > 0) {
      risks.push({
        type: 'ambiguity',
        icon: '🔶',
        message: `${vagueItems.length} request(s) are ambiguous: "${vagueItems.map(v => v.request).join('", "')}". These MUST be clarified before any work begins.`,
      });
    }
    if (outItems.length > 0) {
      risks.push({
        type: 'scope_creep',
        icon: '🔴',
        message: `${outItems.length} out-of-scope item(s) detected. Accepting these without formal change requests risks scope creep, budget overrun, and timeline delays.`,
      });
    }
    if (constraintItems.length > 0) {
      const risky = constraintItems.filter(c => c.statusLabel.includes('Risky'));
      if (risky.length > 0) {
        risks.push({
          type: 'constraint',
          icon: '🟡',
          message: `${risky.length} constraint(s) pose feasibility risks. Review timeline and resource allocation carefully.`,
        });
      }
    }
    if (results.length > 5) {
      risks.push({
        type: 'volume',
        icon: '🟡',
        message: 'High volume of change requests. Consider batching and prioritizing to avoid disruption to ongoing work.',
      });
    }
    if (risks.length === 0) {
      risks.push({
        type: 'none',
        icon: '🟢',
        message: 'No significant risks identified. All items are well-defined and within scope.',
      });
    }
    return risks;
  }

  function getOverallVerdict(results) {
    const hasOut = results.some(r => r.classification === 'out-scope');
    const hasVague = results.some(r => r.type === TYPES.VAGUE);
    const hasPartial = results.some(r => r.classification === 'partial');
    if (hasOut) return 'Contains out-of-scope items — change request required';
    if (hasVague) return 'Contains vague items — clarification required before proceeding';
    if (hasPartial) return 'Requires discussion on partial-scope items';
    return 'All items approved — within scope';
  }

  // ---- Scope Term Building ----
  function buildScopeTerms(requirements, proposal) {
    const terms = [];
    (requirements.features || []).forEach(f => {
      const text = typeof f === 'string' ? f : f.name || String(f);
      terms.push({ text, original: text, type: 'requirement' });
    });
    (requirements.constraints || []).forEach(c => {
      terms.push({ text: c, original: c, type: 'constraint' });
    });
    if (requirements.objective) {
      terms.push({ text: requirements.objective, original: requirements.objective, type: 'objective' });
    }
    if (proposal?.features) {
      proposal.features.forEach(f => {
        const name = typeof f === 'string' ? f : f.name || String(f);
        const desc = f.description || '';
        terms.push({ text: name, original: name, type: 'proposal-feature' });
        if (desc) terms.push({ text: desc, original: name, type: 'proposal-description' });
      });
    }
    return terms;
  }

  // ---- Similarity Scoring ----
  function calculateSimilarity(str1, str2) {
    const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 2));
    if (words1.size === 0 || words2.size === 0) return 0;
    let intersection = 0;
    words1.forEach(w => {
      if (words2.has(w)) intersection++;
      words2.forEach(w2 => {
        if (w !== w2 && (w.includes(w2) || w2.includes(w)) && w.length > 3) intersection += 0.5;
      });
    });
    const union = words1.size + words2.size - intersection;
    return intersection / union;
  }

  function calculateKeywordOverlap(requestText, scopeText) {
    const domainKeywords = {
      'auth': ['login', 'signup', 'authentication', 'auth', 'register', 'password', 'session', 'token', 'jwt', 'oauth', 'sso'],
      'payment': ['payment', 'pay', 'billing', 'invoice', 'subscription', 'checkout', 'stripe', 'transaction', 'refund', 'pricing'],
      'dashboard': ['dashboard', 'analytics', 'report', 'chart', 'graph', 'metrics', 'kpi', 'statistics', 'visualization'],
      'search': ['search', 'filter', 'sort', 'query', 'find', 'browse', 'autocomplete'],
      'notification': ['notification', 'notify', 'email', 'sms', 'alert', 'push', 'reminder'],
      'user': ['user', 'profile', 'account', 'role', 'permission', 'admin', 'member'],
      'file': ['file', 'upload', 'download', 'document', 'image', 'media', 'attachment', 'storage'],
      'chat': ['chat', 'message', 'conversation', 'inbox', 'communication', 'comment'],
      'ecommerce': ['product', 'cart', 'shop', 'store', 'catalog', 'order', 'inventory', 'stock'],
      'workflow': ['workflow', 'process', 'automation', 'approval', 'pipeline'],
      'mobile': ['mobile', 'responsive', 'app', 'pwa', 'ios', 'android'],
      'realtime': ['realtime', 'real-time', 'live', 'websocket', 'instant'],
      'tracking': ['track', 'monitor', 'log', 'audit', 'activity', 'history'],
      'calendar': ['calendar', 'schedule', 'booking', 'appointment', 'event'],
    };
    let requestDomain = null, scopeDomain = null;
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(kw => requestText.includes(kw))) requestDomain = domain;
      if (keywords.some(kw => scopeText.includes(kw))) scopeDomain = domain;
    }
    if (requestDomain && scopeDomain && requestDomain === scopeDomain) return 0.65;
    return 0;
  }

  function checkExpansionSignals(text) {
    const expansionKeywords = [
      'ai ', 'artificial intelligence', 'machine learning', 'ml ', 'nlp',
      'chatbot', 'voice', 'speech', 'blockchain', 'crypto', 'nft',
      'ar ', 'vr ', 'augmented reality', 'virtual reality',
      'new platform', 'new app', 'mobile app', 'native app',
      'completely redesign', 'rebuild', 'new feature',
      'social media', 'video streaming', 'live stream',
      'multi-tenant', 'white label', 'marketplace',
    ];
    const isExpansion = expansionKeywords.some(kw => text.includes(kw));
    const matchedKeywords = expansionKeywords.filter(kw => text.includes(kw));
    return { isExpansion, matchedKeywords };
  }

  // ---- Reasoning Generators ----
  function getInScopeReasoning(request, matchedFeature) {
    return `The requested functionality is a natural part of the "${matchedFeature}" module and can be delivered within the agreed scope and timeline.`;
  }

  function getPartialReasoning(request, matchedFeature, expansionSignals) {
    if (expansionSignals.isExpansion) {
      return `While related to existing scope, this introduces ${expansionSignals.matchedKeywords.join(', ')} which requires additional effort. Recommend formal scoping discussion.`;
    }
    return `The core concept aligns with existing scope, but specific implementation details extend beyond what was originally planned. A scoping discussion is recommended.`;
  }

  function getOutOfScopeReasoning(request, requirements, expansionSignals) {
    if (expansionSignals.isExpansion) {
      return `This involves ${expansionSignals.matchedKeywords.join(', ')} — technology/capabilities not in the original scope. Requires separate work stream with its own timeline and budget.`;
    }
    return `This functionality was not discussed or documented in the original requirements. A formal change request with additional time and cost estimates is required.`;
  }

  function estimateImpact(item, type) {
    const lower = item.toLowerCase();
    let weeks, cost;
    const highComplexity = ['ai', 'ml', 'blockchain', 'realtime', 'streaming', 'marketplace', 'chatbot'];
    const medComplexity = ['integration', 'api', 'payment', 'migration', 'redesign'];
    if (highComplexity.some(kw => lower.includes(kw))) { weeks = '4-8 weeks'; cost = '+$15,000-$30,000'; }
    else if (medComplexity.some(kw => lower.includes(kw))) { weeks = '2-4 weeks'; cost = '+$8,000-$15,000'; }
    else { weeks = '1-2 weeks'; cost = '+$3,000-$8,000'; }
    if (type === 'partial') { weeks = '0.5-1 week'; cost = '+$1,500-$4,000'; }
    return { time: weeks, cost };
  }

  return {
    evaluate,
    AGENT_NAME,
    AGENT_ICON,
    AGENT_COLOR,
  };
})();
