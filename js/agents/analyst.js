// ========================================
// AGENT 1: Business Analyst AI
// ========================================
// Role: Break down client requirements into structured format
// Extracts: Objective, Features, User Types, Constraints, Risks
// Classifies every statement: FEATURE | VAGUE | CONSTRAINT | SCOPE_CHANGE | VALID_EXTENSION
// Validates budget feasibility (hybrid: global rate + project estimate)
// Suggests MVP if budget unrealistic

const AnalystAgent = (() => {
  const AGENT_NAME = 'Business Analyst';
  const AGENT_ICON = '📋';
  const AGENT_COLOR = 'analyst';

  // ---- Classification Types ----
  const TYPES = {
    FEATURE: 'FEATURE',
    VAGUE: 'VAGUE',
    CONSTRAINT: 'CONSTRAINT',
    SCOPE_CHANGE: 'SCOPE_CHANGE',
    VALID_EXTENSION: 'VALID_EXTENSION',
  };

  // ---- Vagueness Detection Patterns ----
  const VAGUE_PATTERNS = [
    /^make\s+it\s+/i,
    /^improve\s+/i,
    /^better\s+/i,
    /^enhance\s+/i,
    /^optimize\s+/i,
    /^fix\s+(everything|all|it|things)/i,
    /^(can|could)\s+(you|we)\s+.{0,10}$/i,
    /^what\s+about\s+/i,
    /^(just|simply)\s+/i,
    /^I\s+(want|need)\s+(it\s+)?(to\s+be\s+)?(good|nice|great|better|fast|modern|cool|awesome)/i,
    /^(good|nice|great|fast|modern|cool|awesome|beautiful|sleek|clean)\s*$/i,
  ];

  const VAGUE_ADJECTIVES = [
    'better', 'faster', 'nicer', 'modern', 'good', 'great', 'cool',
    'awesome', 'sleek', 'clean', 'beautiful', 'smart', 'amazing',
    'professional', 'perfect', 'excellent', 'intuitive', 'user-friendly',
  ];

  const ACTIONABLE_VERBS = [
    'add', 'build', 'create', 'implement', 'integrate', 'develop',
    'design', 'include', 'support', 'enable', 'provide', 'display',
    'show', 'generate', 'track', 'manage', 'allow', 'configure',
    'export', 'import', 'connect', 'send', 'notify', 'schedule',
    'automate', 'calculate', 'process', 'upload', 'download',
  ];

  const CONSTRAINT_KEYWORDS = [
    'budget', 'cost', 'price', 'afford', 'spend', 'pay',
    'deadline', 'timeline', 'by next', 'within', 'before',
    'weeks', 'months', 'days', 'asap', 'urgent', 'hurry',
    'limit', 'max', 'maximum', 'minimum', 'at least', 'at most',
    'must be done', 'need it by', 'cannot exceed', 'no more than',
    'gdpr', 'hipaa', 'pci', 'compliance', 'regulation', 'legal',
    'only', 'restrict', 'cannot', 'must not', 'should not',
  ];

  const SCOPE_EXPANSION_SIGNALS = [
    'ai ', 'artificial intelligence', 'machine learning', 'ml ',
    'chatbot', 'voice assistant', 'speech recognition', 'nlp',
    'blockchain', 'crypto', 'nft', 'web3',
    'ar ', 'vr ', 'augmented reality', 'virtual reality',
    'new platform', 'new app', 'separate app', 'native app',
    'completely redesign', 'rebuild from scratch', 'rewrite',
    'social media integration', 'video streaming', 'live stream',
    'multi-tenant', 'white label', 'marketplace',
    'mobile app', 'ios app', 'android app',
    'migrate to', 'switch to', 'new technology',
  ];

  /**
   * Analyze raw client input and extract structured requirements
   * @param {Object} input - { rawDescription, clientName, company, budget, timeline }
   * @returns {Object} Structured requirements with classifications
   */
  function analyze(input) {
    const raw = (input.rawDescription || '').trim();

    if (!raw || raw.length < 20) {
      return {
        success: false,
        clarifications: [
          'Could you describe your project goals in more detail?',
          'What specific problem are you trying to solve?',
          'Who are the primary users of this system?',
        ],
        message: 'Insufficient input. The description needs more detail for accurate analysis.',
      };
    }

    // Step 1: Classify every statement
    const classified = classifyStatements(raw, null);

    // Step 2: Extract features only from FEATURE + VALID_EXTENSION types
    const features = extractFeatures(raw);
    const userTypes = extractUserTypes(raw);
    const constraints = extractConstraints(raw, input);
    const risks = assessRisks(raw, input, features, constraints);
    const objective = extractObjective(raw);
    const clarifications = generateClarifications(raw, features, userTypes, constraints, input, classified);

    // Step 3: Budget feasibility
    const budgetAnalysis = validateBudgetFeasibility(features, input);

    return {
      success: true,
      data: {
        objective,
        features,
        userTypes,
        constraints,
        risks,
        budgetRange: input.budget || 'Not specified',
        timeline: input.timeline || 'Not specified',
        rawInput: raw,
      },
      classified,
      budgetAnalysis,
      clarifications,
      confidence: calculateConfidence(raw, features, userTypes, constraints),
      summary: `Extracted ${features.length} features, ${userTypes.length} user types, ${constraints.length} constraints, and ${risks.length} risks.`,
    };
  }

  // ========================================
  // INPUT CLASSIFICATION ENGINE
  // ========================================

  /**
   * Split raw input into individual statements, classify each one.
   * @param {string} rawText - Raw client input
   * @param {Object|null} existingRequirements - Original project requirements (for scope comparison)
   * @returns {Array<{text: string, type: string, reason: string}>}
   */
  function classifyStatements(rawText, existingRequirements) {
    const statements = splitIntoStatements(rawText);
    return statements.map(stmt => classifySingle(stmt, existingRequirements));
  }

  function splitIntoStatements(text) {
    // Split by newlines first
    let parts = text.split(/[\n\r]+/).map(l => l.trim()).filter(l => l.length > 0);

    // For each part, try splitting by sentence boundaries
    const results = [];
    parts.forEach(part => {
      // Remove bullet/number prefixes
      const cleaned = part.replace(/^[-•*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim();
      if (!cleaned || cleaned.length < 3) return;

      // Try splitting by sentence-ending punctuation
      const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 3);
      if (sentences.length > 1) {
        sentences.forEach(s => results.push(s.trim()));
      } else {
        // Try splitting by " and " / " & " / ", " if the result looks meaningful
        const commaParts = cleaned.split(/,\s*and\s+|\s+and\s+|\s*&\s*/i);
        if (commaParts.length > 1 && commaParts.every(p => p.trim().length > 8)) {
          commaParts.forEach(p => results.push(p.trim()));
        } else {
          results.push(cleaned);
        }
      }
    });

    return results.length > 0 ? results : [text.trim()];
  }

  function classifySingle(statement, existingRequirements) {
    const text = statement.trim();
    const lower = text.toLowerCase();

    // ---- Rule 1: Check for VAGUE ----
    if (isVague(text)) {
      return {
        text,
        type: TYPES.VAGUE,
        status: '⚠️ Needs Clarification',
        reason: getVagueReason(text),
      };
    }

    // ---- Rule 2: Check for CONSTRAINT ----
    if (isConstraint(lower)) {
      return {
        text,
        type: TYPES.CONSTRAINT,
        status: '🔒 Constraint',
        reason: getConstraintReason(text),
      };
    }

    // ---- Rule 3: Check for SCOPE_CHANGE (major new capability) ----
    if (isScopeChange(lower, existingRequirements)) {
      return {
        text,
        type: TYPES.SCOPE_CHANGE,
        status: '❌ Out of Scope',
        reason: getScopeChangeReason(text),
      };
    }

    // ---- Rule 4: Check for VALID_EXTENSION (logical addition) ----
    if (existingRequirements && isValidExtension(lower, existingRequirements)) {
      return {
        text,
        type: TYPES.VALID_EXTENSION,
        status: '✅ In Scope',
        reason: 'Logical extension of existing functionality within the original scope.',
      };
    }

    // ---- Rule 5: Default = FEATURE ----
    return {
      text,
      type: TYPES.FEATURE,
      status: '✅ In Scope',
      reason: 'Concrete system functionality that can be scoped and implemented.',
    };
  }

  // ---- Vagueness Detection ----
  function isVague(text) {
    const lower = text.toLowerCase().trim();

    // Pattern match
    if (VAGUE_PATTERNS.some(p => p.test(lower))) return true;

    // Too short to be actionable (< 15 chars of meaningful content)
    const meaningfulText = lower.replace(/[^a-z\s]/g, '').trim();
    if (meaningfulText.length < 15) {
      // But check if it has an actionable verb
      const hasAction = ACTIONABLE_VERBS.some(v => lower.includes(v));
      if (!hasAction) return true;
    }

    // Entirely adjective-based (no actionable nouns/verbs)
    const words = lower.split(/\s+/).filter(w => w.length > 2);
    const vagueWordCount = words.filter(w => VAGUE_ADJECTIVES.includes(w)).length;
    if (words.length > 0 && vagueWordCount / words.length >= 0.6) return true;

    // Question format without specifics
    if (/^(can|could|would|should|what if)\s+(you|we|they|it)/i.test(lower) && lower.length < 40) {
      const hasAction = ACTIONABLE_VERBS.some(v => lower.includes(v));
      if (!hasAction) return true;
    }

    return false;
  }

  function getVagueReason(text) {
    const lower = text.toLowerCase();
    if (/^(can|could|would|should|what if)/i.test(lower)) {
      return 'This is a question, not a concrete requirement. Please provide specific functionality you need.';
    }
    if (VAGUE_ADJECTIVES.some(adj => lower.includes(adj)) && !ACTIONABLE_VERBS.some(v => lower.includes(v))) {
      return 'This statement uses subjective descriptors without specifying concrete functionality. Please describe what specific feature or behavior you need.';
    }
    if (lower.length < 20) {
      return 'This statement is too brief to be actionable. Please provide more detail about what you need built.';
    }
    return 'This request is ambiguous and cannot be translated into a concrete feature. Please clarify with specific, measurable requirements.';
  }

  // ---- Constraint Detection ----
  function isConstraint(lower) {
    return CONSTRAINT_KEYWORDS.some(kw => lower.includes(kw));
  }

  function getConstraintReason(text) {
    const lower = text.toLowerCase();
    if (/budget|cost|price|afford|spend|pay/i.test(lower)) return 'Budget constraint identified. Will be factored into feasibility analysis.';
    if (/deadline|timeline|weeks|months|days|asap|urgent|by next|within|before/i.test(lower)) return 'Timeline constraint identified. Will be validated against project scope.';
    if (/gdpr|hipaa|pci|compliance|regulation|legal/i.test(lower)) return 'Regulatory compliance constraint. Requires validation and possibly additional effort.';
    return 'Project limitation or boundary condition identified.';
  }

  // ---- Scope Change Detection ----
  function isScopeChange(lower, existingRequirements) {
    // Always flag expansion signals as scope change
    if (SCOPE_EXPANSION_SIGNALS.some(sig => lower.includes(sig))) return true;

    // If we have existing requirements, check if this is entirely unrelated
    if (existingRequirements) {
      const scopeTerms = getAllScopeTerms(existingRequirements);
      const similarity = calculateMaxSimilarity(lower, scopeTerms);
      // Very low similarity + long enough to be a real request = scope change
      if (similarity < 0.1 && lower.length > 30) return true;
    }

    return false;
  }

  function getScopeChangeReason(text) {
    const lower = text.toLowerCase();
    const matched = SCOPE_EXPANSION_SIGNALS.filter(sig => lower.includes(sig));
    if (matched.length > 0) {
      return `This introduces ${matched.join(', ')} — technology/capabilities not in the original scope. Requires separate work stream with its own timeline and budget.`;
    }
    return 'This functionality was not part of the original project scope and represents a significant new work stream.';
  }

  // ---- Valid Extension Detection ----
  function isValidExtension(lower, existingRequirements) {
    const scopeTerms = getAllScopeTerms(existingRequirements);
    const similarity = calculateMaxSimilarity(lower, scopeTerms);
    // Good similarity with existing scope = valid extension
    return similarity >= 0.25;
  }

  function getAllScopeTerms(requirements) {
    const terms = [];
    (requirements.features || []).forEach(f => {
      const text = typeof f === 'string' ? f : f.name || String(f);
      terms.push(text.toLowerCase());
    });
    if (requirements.objective) terms.push(requirements.objective.toLowerCase());
    (requirements.constraints || []).forEach(c => terms.push(c.toLowerCase()));
    return terms;
  }

  function calculateMaxSimilarity(text, scopeTerms) {
    let maxScore = 0;
    for (const term of scopeTerms) {
      const score = jaccardSimilarity(text, term);
      if (score > maxScore) maxScore = score;
    }
    return maxScore;
  }

  function jaccardSimilarity(str1, str2) {
    const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 2));
    if (words1.size === 0 || words2.size === 0) return 0;

    let intersection = 0;
    words1.forEach(w => {
      if (words2.has(w)) intersection++;
      words2.forEach(w2 => {
        if (w !== w2 && (w.includes(w2) || w2.includes(w)) && w.length > 3) {
          intersection += 0.4;
        }
      });
    });
    const union = words1.size + words2.size - intersection;
    return union > 0 ? intersection / union : 0;
  }

  // ========================================
  // BUDGET FEASIBILITY ENGINE (Hybrid)
  // ========================================

  /**
   * Validate client budget against estimated effort.
   * Uses HYBRID approach: global hourly rate from Settings + feature-based estimate.
   * @param {Array} features - Extracted features list
   * @param {Object} input - { budget, timeline }
   * @returns {Object} { isRealistic, verdict, estimatedCost, clientBudget, gap, mvpSuggestion }
   */
  function validateBudgetFeasibility(features, input) {
    const budgetStr = input.budget || '';
    const clientBudget = parseBudgetValue(budgetStr);

    if (!clientBudget || clientBudget <= 0) {
      return {
        isRealistic: null,
        verdict: 'unknown',
        message: 'No budget specified — cannot validate feasibility.',
        clientBudget: 0,
        estimatedCost: null,
        mvpSuggestion: null,
      };
    }

    // Hybrid cost calculation
    const settings = (typeof Store !== 'undefined' && Store.getSettings) ? Store.getSettings() : { defaultRate: 100 };
    const hourlyRate = settings.defaultRate || 100;

    // Estimate hours per feature using complexity heuristics
    let totalHours = 0;
    const featureEstimates = features.map(f => {
      const name = typeof f === 'string' ? f : f.name || String(f);
      const hours = estimateFeatureHours(name);
      totalHours += hours;
      return { name, hours, priority: guessFeaturePriority(name) };
    });

    // Add 25% buffer for PM, meetings, revisions, deployment
    totalHours = Math.round(totalHours * 1.25);

    const estimatedMin = Math.round(totalHours * hourlyRate * 0.85);
    const estimatedMax = Math.round(totalHours * hourlyRate * 1.15);
    const estimatedMid = Math.round((estimatedMin + estimatedMax) / 2);

    // Verdict
    let verdict, isRealistic, message;
    const ratio = clientBudget / estimatedMid;

    if (ratio >= 0.9) {
      verdict = 'realistic';
      isRealistic = true;
      message = `Budget of $${clientBudget.toLocaleString()} is realistic for the requested scope (~${totalHours} hours at $${hourlyRate}/hr).`;
    } else if (ratio >= 0.6) {
      verdict = 'tight';
      isRealistic = false;
      message = `Budget of $${clientBudget.toLocaleString()} is tight. Estimated cost is $${estimatedMin.toLocaleString()} – $${estimatedMax.toLocaleString()}. Consider reducing scope or extending timeline.`;
    } else {
      verdict = 'unrealistic';
      isRealistic = false;
      message = `Budget of $${clientBudget.toLocaleString()} is significantly below the estimated $${estimatedMin.toLocaleString()} – $${estimatedMax.toLocaleString()}. An MVP approach is strongly recommended.`;
    }

    // Generate MVP suggestion if not realistic
    let mvpSuggestion = null;
    if (!isRealistic) {
      mvpSuggestion = generateMVPSuggestion(featureEstimates, clientBudget, hourlyRate);
    }

    return {
      isRealistic,
      verdict,
      message,
      clientBudget,
      estimatedCost: { min: estimatedMin, max: estimatedMax, hours: totalHours, rate: hourlyRate },
      gap: isRealistic ? 0 : estimatedMid - clientBudget,
      mvpSuggestion,
    };
  }

  function parseBudgetValue(str) {
    if (!str) return 0;
    const cleaned = str.replace(/[^0-9.kKmM]/g, '');
    let val = parseFloat(cleaned);
    if (isNaN(val)) return 0;
    if (/k/i.test(str)) val *= 1000;
    if (/m/i.test(str)) val *= 1000000;
    return Math.round(val);
  }

  function estimateFeatureHours(featureName) {
    const lower = featureName.toLowerCase();
    // High complexity
    if (/payment|billing|e-commerce|ecommerce|marketplace|streaming|real-?time|workflow|automation/.test(lower)) return 120;
    // Medium-high
    if (/dashboard|analytics|search|api|integration|chat|messaging/.test(lower)) return 80;
    // Medium
    if (/auth|user|notification|file|upload|report|export|calendar|schedule/.test(lower)) return 60;
    // Lower
    if (/mobile|responsive|tracking|monitoring|content/.test(lower)) return 40;
    // Default
    return 60;
  }

  function guessFeaturePriority(featureName) {
    const lower = featureName.toLowerCase();
    if (/auth|payment|core|critical|security/.test(lower)) return 'critical';
    if (/dashboard|user|api|integration|e-commerce/.test(lower)) return 'high';
    if (/notification|search|file|report/.test(lower)) return 'medium';
    return 'low';
  }

  /**
   * Generate both a list of features to cut AND a reduced proposal.
   */
  function generateMVPSuggestion(featureEstimates, clientBudget, hourlyRate) {
    // Sort by priority (critical first, then high, medium, low)
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const sorted = [...featureEstimates].sort((a, b) =>
      (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
    );

    // Calculate budget capacity in hours (with buffer)
    const budgetHours = Math.floor(clientBudget / hourlyRate / 1.25);

    // Pick features until budget exhausted
    let usedHours = 0;
    const includedFeatures = [];
    const cutFeatures = [];

    sorted.forEach(f => {
      if (usedHours + f.hours <= budgetHours) {
        usedHours += f.hours;
        includedFeatures.push(f);
      } else {
        cutFeatures.push(f);
      }
    });

    const mvpCost = Math.round(usedHours * hourlyRate * 1.25);

    return {
      includedFeatures: includedFeatures.map(f => f.name),
      cutFeatures: cutFeatures.map(f => ({ name: f.name, reason: `${f.priority} priority, ~${f.hours}h effort` })),
      estimatedMVPCost: mvpCost,
      estimatedMVPHours: usedHours,
      summary: `MVP with ${includedFeatures.length} features fits within ~$${mvpCost.toLocaleString()}. ${cutFeatures.length} feature(s) deferred to Phase 2.`,
      reducedProposal: {
        features: includedFeatures.map(f => ({
          name: f.name,
          priority: f.priority,
          estimatedHours: f.hours,
        })),
        deferredFeatures: cutFeatures.map(f => ({
          name: f.name,
          priority: f.priority,
          estimatedHours: f.hours,
          deferReason: 'Deferred to Phase 2 due to budget constraints',
        })),
        totalCost: mvpCost,
        totalHours: usedHours,
        phases: [
          {
            name: 'Phase 1 — MVP',
            features: includedFeatures.map(f => f.name),
            cost: mvpCost,
            timeline: `${Math.ceil(usedHours / 160)} months`,
          },
          ...(cutFeatures.length > 0 ? [{
            name: 'Phase 2 — Full Scope',
            features: cutFeatures.map(f => f.name),
            cost: Math.round(cutFeatures.reduce((s, f) => s + f.hours, 0) * hourlyRate * 1.25),
            timeline: `${Math.ceil(cutFeatures.reduce((s, f) => s + f.hours, 0) / 160)} months`,
          }] : []),
        ],
      },
    };
  }

  // ========================================
  // ORIGINAL EXTRACTION METHODS (Enhanced)
  // ========================================

  function extractObjective(text) {
    const goalPatterns = [
      /(?:we\s+(?:need|want|require)|goal\s+is|objective\s+is|looking\s+(?:for|to))\s+(.+?)(?:\.|$)/i,
      /(?:build|create|develop|design)\s+(?:a\s+|an\s+)?(.+?)(?:\s+(?:that|which|with|for))/i,
    ];

    for (const pattern of goalPatterns) {
      const match = text.match(pattern);
      if (match) {
        return capitalizeFirst(match[1].trim());
      }
    }

    const firstSentence = text.split(/[.!?]/)[0].trim();
    return firstSentence.length > 10
      ? capitalizeFirst(firstSentence)
      : capitalizeFirst(text.substring(0, 150));
  }

  function extractFeatures(text) {
    const features = [];
    const lower = text.toLowerCase();

    const featureKeywords = {
      'authentication': ['login', 'signup', 'auth', 'sign in', 'sign up', 'registration', 'sso', 'oauth'],
      'dashboard': ['dashboard', 'analytics', 'metrics', 'statistics', 'reports', 'kpis'],
      'user management': ['user management', 'roles', 'permissions', 'admin panel', 'rbac', 'access control'],
      'payment processing': ['payment', 'billing', 'subscription', 'checkout', 'stripe', 'paypal', 'invoice'],
      'notification system': ['notification', 'email', 'sms', 'alert', 'push notification'],
      'search & filtering': ['search', 'filter', 'sort', 'query', 'browse'],
      'file management': ['upload', 'file', 'document', 'attachment', 'media', 'storage'],
      'messaging & chat': ['chat', 'messaging', 'communication', 'inbox', 'conversation'],
      'API integration': ['api', 'integration', 'third-party', 'webhook', 'connect'],
      'data export': ['export', 'csv', 'pdf', 'excel', 'download', 'report generation'],
      'mobile responsive': ['mobile', 'responsive', 'mobile-first', 'app', 'pwa'],
      'real-time updates': ['real-time', 'realtime', 'live', 'websocket', 'instant'],
      'workflow automation': ['workflow', 'automation', 'automate', 'pipeline', 'process'],
      'inventory management': ['inventory', 'stock', 'warehouse', 'catalog', 'products'],
      'scheduling & calendar': ['schedule', 'calendar', 'booking', 'appointment', 'reservation'],
      'e-commerce': ['e-commerce', 'ecommerce', 'shop', 'store', 'cart', 'marketplace'],
      'content management': ['cms', 'content', 'blog', 'pages', 'editor'],
      'tracking & monitoring': ['tracking', 'monitoring', 'logs', 'audit', 'activity'],
      'data visualization': ['chart', 'graph', 'visualization', 'map', 'heatmap'],
      'multi-language support': ['multi-language', 'localization', 'i18n', 'translation', 'multilingual'],
    };

    for (const [feature, keywords] of Object.entries(featureKeywords)) {
      if (keywords.some(kw => lower.includes(kw))) {
        features.push(feature);
      }
    }

    const listPatterns = [
      /[-•]\s*(.+)/g,
      /\d+[.)]\s*(.+)/g,
    ];

    for (const pattern of listPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const item = match[1].trim();
        if (item.length > 3 && item.length < 100 && !features.includes(item)) {
          // Only add if it's not vague
          if (!isVague(item)) {
            features.push(capitalizeFirst(item));
          }
        }
      }
    }

    if (features.length < 3) {
      const commaSplit = text.match(/(?:features?|include|such as|like|with)\s*:?\s*(.+?)(?:\.|$)/i);
      if (commaSplit) {
        commaSplit[1].split(/,|and/).forEach(item => {
          const trimmed = item.trim();
          if (trimmed.length > 3 && !features.includes(trimmed) && !isVague(trimmed)) {
            features.push(capitalizeFirst(trimmed));
          }
        });
      }
    }

    return features.length > 0 ? features : ['Core application development', 'User interface design', 'Backend API development'];
  }

  function extractUserTypes(text) {
    const lower = text.toLowerCase();
    const userTypes = [];

    const userKeywords = {
      'Admin': ['admin', 'administrator', 'super admin', 'superadmin'],
      'End User': ['user', 'customer', 'client', 'member', 'subscriber'],
      'Manager': ['manager', 'supervisor', 'team lead', 'director'],
      'Employee': ['employee', 'staff', 'worker', 'agent'],
      'Vendor': ['vendor', 'supplier', 'partner', 'merchant', 'seller'],
      'Guest': ['guest', 'visitor', 'anonymous', 'public'],
      'Moderator': ['moderator', 'editor', 'content manager'],
      'Delivery Partner': ['delivery', 'driver', 'courier', 'logistics'],
      'Analyst': ['analyst', 'data analyst', 'reporter'],
    };

    for (const [type, keywords] of Object.entries(userKeywords)) {
      if (keywords.some(kw => lower.includes(kw))) {
        userTypes.push(type);
      }
    }

    return userTypes.length > 0 ? userTypes : ['Admin', 'End User'];
  }

  function extractConstraints(text, input) {
    const lower = text.toLowerCase();
    const constraints = [];

    if (input.budget) constraints.push(`Budget: ${input.budget}`);
    if (input.timeline) constraints.push(`Timeline: ${input.timeline}`);

    const techConstraints = {
      'Must be mobile responsive': ['mobile', 'responsive', 'mobile-first'],
      'Requires secure authentication': ['secure', 'security', 'encrypted', 'ssl'],
      'High availability required': ['24/7', 'uptime', 'availability', 'always available'],
      'Needs to scale for large user base': ['scale', 'scalable', 'high traffic', 'concurrent'],
      'Must comply with data privacy regulations': ['gdpr', 'privacy', 'compliance', 'hipaa', 'pci'],
      'Integration with existing systems required': ['integrate', 'existing system', 'legacy', 'migrate'],
      'Real-time performance required': ['real-time', 'instant', 'low latency'],
      'Cross-browser compatibility needed': ['cross-browser', 'all browsers', 'ie support'],
    };

    for (const [constraint, keywords] of Object.entries(techConstraints)) {
      if (keywords.some(kw => lower.includes(kw))) {
        constraints.push(constraint);
      }
    }

    return constraints;
  }

  function assessRisks(text, input, features, constraints) {
    const risks = [];

    if (features.length > 8) {
      risks.push('Large feature scope may lead to timeline overruns');
    }

    const budgetStr = (input.budget || '').toLowerCase();
    if (budgetStr.includes('low') || budgetStr.includes('tight') || budgetStr.includes('limited')) {
      risks.push('Budget constraints may limit feature completeness');
    }

    const timeline = (input.timeline || '').toLowerCase();
    if (timeline.includes('asap') || timeline.includes('urgent') || timeline.includes('1 month') || timeline.includes('2 weeks')) {
      risks.push('Aggressive timeline increases risk of quality trade-offs');
    }

    if (text.toLowerCase().includes('integrat')) {
      risks.push('Third-party integration dependencies may cause delays');
    }

    if (text.toLowerCase().match(/gdpr|hipaa|pci|compliance/)) {
      risks.push('Regulatory compliance requirements need expert review');
    }

    if (risks.length === 0) {
      risks.push('Requirements may need refinement during development');
      risks.push('Client feedback cycles could impact delivery schedule');
    }

    return risks;
  }

  function generateClarifications(text, features, userTypes, constraints, input, classified) {
    const clarifications = [];
    const lower = text.toLowerCase();

    // Flag vague items as clarification needs
    if (classified) {
      const vagueItems = classified.filter(c => c.type === TYPES.VAGUE);
      if (vagueItems.length > 0) {
        clarifications.push(`${vagueItems.length} statement(s) are too vague to be actionable. Please provide specifics for: "${vagueItems[0].text}"`);
      }
    }

    if (features.length < 3) {
      clarifications.push('Could you list the specific features you need in priority order?');
    }

    if (userTypes.length < 2) {
      clarifications.push('Who are all the different types of users who will interact with this system?');
    }

    if (!input.budget) {
      clarifications.push('Do you have an estimated budget range for this project?');
    }

    if (!input.timeline) {
      clarifications.push('Is there a target launch date or deadline?');
    }

    if (!lower.includes('design') && !lower.includes('ui') && !lower.includes('ux')) {
      clarifications.push('Do you have existing design mockups or brand guidelines?');
    }

    if (!lower.includes('hosting') && !lower.includes('cloud') && !lower.includes('server')) {
      clarifications.push('Do you have a preferred hosting platform or infrastructure?');
    }

    return clarifications;
  }

  function calculateConfidence(text, features, userTypes, constraints) {
    let score = 0;

    if (text.length > 100) score += 20;
    if (text.length > 300) score += 10;
    if (features.length >= 3) score += 20;
    if (features.length >= 6) score += 10;
    if (userTypes.length >= 2) score += 15;
    if (constraints.length >= 2) score += 15;
    if (text.match(/\d/)) score += 5;
    if (text.match(/must|should|need|require/i)) score += 5;

    return Math.min(100, Math.max(20, score));
  }

  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return {
    analyze,
    classifyStatements,
    validateBudgetFeasibility,
    isVague,
    TYPES,
    AGENT_NAME,
    AGENT_ICON,
    AGENT_COLOR,
  };
})();
