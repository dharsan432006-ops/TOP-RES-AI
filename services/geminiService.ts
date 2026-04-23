import { DetailedAnalysis, SimilarityAnalysis } from "../types";
import { logger } from "../utils/logger";

/**
 * Lightweight mock parser for command parsing (works in browser and Node)
 */
function parseRecruiterCommandMock(userMessage: string): {
  action: string;
  params: any;
} {
  const msg = (userMessage || "").trim();
  const lower = msg.toLowerCase();

  let extractedName: string | null = null;
  const forMatch = msg.match(/for\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/i);
  if (forMatch) extractedName = forMatch[1].trim();
  else {
    const candMatch = msg.match(/candidate\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/i);
    if (candMatch) extractedName = candMatch[1].trim();
  }

  if (lower.includes("shortlist"))
    return { action: "shortlist_top", params: { count: 3 } };
  if (lower.includes("filter"))
    return {
      action: "filter_candidates",
      params: { skill: "react", min_experience: 2, top: 5 },
    };
  if (lower.includes("summarize"))
    return {
      action: "summarize_candidate",
      params: { name: extractedName || "" },
    };
  if (lower.includes("questions"))
    return {
      action: "generate_questions",
      params: { name: extractedName || "" },
    };
  if (lower.includes("email") || lower.includes("draft"))
    return {
      action: "generate_email",
      params: { type: "invite", name: extractedName || "" },
    };
  if (lower.includes("analytics") || lower.includes("summary"))
    return { action: "analytics_summary", params: {} };
  return { action: "none", params: {} };
}

export class GeminiService {
  private readonly VERSION = "2025-02-09-hotfix-v3"; // Cache bust key

  constructor() {}

  async parseRecruiterCommand(userMessage: string): Promise<any> {
    try {
      return parseRecruiterCommandMock(userMessage);
    } catch (err) {
      logger.error("Parse error:", err);
      return { action: "none", params: { error: "parse_failed" } };
    }
  }

  async analyzeResume(
    resumeText: string,
    jobDescription: string,
  ): Promise<DetailedAnalysis> {
    try {
      const text = (resumeText || "").toLowerCase();
      const jdText = (jobDescription || "").toLowerCase();

    // ===== COMPREHENSIVE JD ANALYSIS =====
    // Define domain-specific skill requirements
    const skillDomains = {
      dataAnalyst: {
        required: [
          "sql",
          "tableau",
          "power bi",
          "python",
          "r",
          "excel",
          "analytics",
          "dashboard",
          "data visualization",
        ],
        nice: [
          "machine learning",
          "statistical",
          "predictive",
          "bigquery",
          "snowflake",
        ],
        forbidden: [
          "kubernetes",
          "docker",
          "devops",
          "infrastructure",
          "cloud architecture",
          "ci/cd",
          "terraform",
        ],
      },
      cloudEngineer: {
        required: [
          "aws",
          "azure",
          "gcp",
          "kubernetes",
          "docker",
          "terraform",
          "infrastructure",
          "cloud",
        ],
        nice: ["devops", "ci/cd", "helm", "ansible", "jenkins"],
        forbidden: [
          "tableau",
          "power bi",
          "statistical analysis",
          "sql analytics",
          "data warehouse",
        ],
      },
      softwareDeveloper: {
        required: [
          "java",
          "python",
          "javascript",
          "c++",
          "apis",
          "databases",
          "backend",
          "frontend",
        ],
        nice: ["react", "node.js", "spring", "microservices", "git"],
        forbidden: ["only data analyst", "business intelligence"],
      },
      dataEngineer: {
        required: [
          "sql",
          "python",
          "spark",
          "hadoop",
          "data pipeline",
          "etl",
          "kafka",
        ],
        nice: ["aws", "azure", "bigquery", "snowflake", "airflow"],
        forbidden: ["only frontend", "ui design"],
      },
    };

    // Detect JD domain (check specific phrases first to avoid generic matches)
    let jdDomain = "unknown";
    let dominantRequiredSkills: string[] = [];

    if (jdText.includes("data engineer") || jdText.includes("data-engineer")) {
      jdDomain = "dataEngineer";
      dominantRequiredSkills = skillDomains.dataEngineer.required;
    } else if (
      jdText.includes("data analyst") ||
      jdText.includes("data-analyst") ||
      jdText.includes("analyst")
    ) {
      jdDomain = "dataAnalyst";
      dominantRequiredSkills = skillDomains.dataAnalyst.required;
    } else if (
      jdText.includes("cloud engineer") ||
      jdText.includes("cloud") ||
      jdText.includes("devops") ||
      jdText.includes("kubernetes")
    ) {
      jdDomain = "cloudEngineer";
      dominantRequiredSkills = skillDomains.cloudEngineer.required;
    } else if (jdText.includes("developer") || jdText.includes("engineer")) {
      jdDomain = "softwareDeveloper";
      dominantRequiredSkills = skillDomains.softwareDeveloper.required;
    }

    // Count matched required skills in resume
    let requiredSkillsMatch = 0;
    let totalRequired = dominantRequiredSkills.length;
    dominantRequiredSkills.forEach((skill) => {
      if (text.includes(skill)) requiredSkillsMatch++;
    });

    const requiredSkillMatchPercent =
      totalRequired > 0 ? (requiredSkillsMatch / totalRequired) * 100 : 0;

    // ===== EXTREME JOB-FIT CHECK (BEFORE ANYTHING ELSE) =====
    // For Data Analyst role: MUST have BI tools OR data analysis projects
    // Without these, score is capped at 25 regardless of other achievements
    let jobFitCap = 100; // Default: no cap
    let jobFitWarning = "";

    if (jdDomain === "dataAnalyst") {
      const hasTableau = /tableau/.test(text);
      const hasPowerBI = /power\s?bi|powerbi/.test(text);
      const hasDataVisualization = /data\s?visualization|dashboard/.test(text);
      const hasAnalyticsProject =
        /analytics|analyzing.*data|data.*analysis/.test(text);

      const hasDataAnalystSkillset =
        hasTableau || hasPowerBI || hasDataVisualization || hasAnalyticsProject;

      // HARD RULE: if NO BI tools AND NO data projects, max score is 25
      if (!hasDataAnalystSkillset) {
        jobFitCap = 25;
        jobFitWarning = `No BI tools (Tableau/PowerBI) or data analysis projects detected`;
      }

      // DEBUG LOG
      console.log(
        `[JOB FIT CAP] Resume: ${resumeText.substring(0, 40)}, Tableau: ${hasTableau}, PowerBI: ${hasPowerBI}, DataViz: ${hasDataVisualization}, Analytics: ${hasAnalyticsProject}, HasSkillset: ${hasDataAnalystSkillset}, CAP: ${jobFitCap}`,
      );
    }

    // Check for domain mismatches (red flags) — require strong context signals
    let hasDomainMismatch = false;
    let mismatchReason = "";

    if (jdDomain === "dataAnalyst") {
      // Detect cybersecurity/cloud infra specific keywords (strong indicators of wrong domain)
      const hasCybersecurityFocus =
        /cybersecurity|vulnerability assessment|endpoint security|firewall|sophos|nessus|edr|ids|ips|penetration|malware|incident response|security operations|security posture|threat|vulnerability management|compliance framework|iso 27001|zero trust|burp suite|sqlmap|wireshark|patch management/.test(
          text,
        );
      const hasCloudInfra =
        /kubernetes|docker|terraform|devops|infrastructure as code|cloud architecture|devops pipeline/.test(
          text,
        );

      // Require BI TOOLS EXPLICITLY (Tableau/PowerBI) for data-analysis focus — not just generic keywords
      const hasDataAnalysisTools =
        /tableau|power\s?bi|powerbi|dashboard|data\s?visualization/.test(text);

      // Count additional context signals
      const dataAnalysisKeywords = [
        "analytics",
        "data analysis",
        "bi tool",
        "business intelligence",
        "exploratory",
      ];
      let dataAnalysisCount = 0;
      dataAnalysisKeywords.forEach((keyword) => {
        if (text.includes(keyword)) dataAnalysisCount++;
      });

      // Mismatch if cybersecurity/cloud is strong AND NO BI tools AND weak context signals
      if (
        (hasCybersecurityFocus || hasCloudInfra) &&
        !hasDataAnalysisTools &&
        dataAnalysisCount < 2
      ) {
        hasDomainMismatch = true;
        jobFitCap = 18; // Even stricter for obvious mismatch
        mismatchReason = hasCybersecurityFocus
          ? "Cybersecurity focus, not Data Analysis"
          : "Cloud Infrastructure focus, not Data Analysis";
      }

      // DEBUG: Log mismatch detection
      console.log(
        `[MISMATCH DEBUG] Name: ${resumeText.substring(0, 50)}, Cyber: ${hasCybersecurityFocus}, Cloud: ${hasCloudInfra}, BITools: ${hasDataAnalysisTools}, AnalysisKeywords: ${dataAnalysisCount}, MISMATCH: ${hasDomainMismatch}, JobFitCap: ${jobFitCap}`,
      );
    } else if (jdDomain === "cloudEngineer") {
      const hasCloudExperience =
        /\baws\b|\bazure\b|\bgcp\b|kubernetes|docker|infrastructure|devops|cloud|terraform|ansible|helm/.test(
          text,
        );
      const hasOnlyDataAnalysis =
        /tableau|power\s?bi|powerbi|statistical analysis|data visualization/.test(
          text,
        ) && !hasCloudExperience;
      if (hasOnlyDataAnalysis) {
        hasDomainMismatch = true;
        jobFitCap = 25;
        mismatchReason = "Data Analysis focus, not Cloud Engineering";
      }
    }

    // ===== SECTION PRESENCE CHECKS =====
    const hasExperience =
      /experience|work|employment|career|professional|job history/.test(text);
    const hasEducation =
      /education|degree|bachelor|master|university|college|phd|diploma|graduated|gpa/.test(
        text,
      );
    const hasSkills =
      /skills|technical|proficient|expertise|languages|tools|platforms|competencies/.test(
        text,
      );
    const hasProjects =
      /project|developed|designed|implemented|built|created|led|managed|deployed/.test(
        text,
      );
    const hasCertifications =
      /certification|certified|license|aws certified|gcp certified|azure|pmp/.test(
        text,
      );
    const hasSummary =
      /summary|objective|profile|about|overview|introduction/.test(text);

    // ===== EXPERIENCE LEVEL DETECTION =====
    const yearsMatch = text.match(
      /(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)/i,
    );
    const yearsOfExp = yearsMatch ? parseInt(yearsMatch[1]) : 0;
    const seniorityLevel =
      yearsOfExp >= 10
        ? 4 // Principal/Staff level
        : yearsOfExp >= 7
          ? 3 // Senior
          : yearsOfExp >= 4
            ? 2 // Mid-level
            : yearsOfExp >= 2
              ? 1 // Junior
              : 0; // Entry-level

    // ===== SPECIFIC TOOL/TECHNOLOGY MENTIONS =====
    const dataAnalystTools = [
      "sql",
      "tableau",
      "power bi",
      "python",
      "r language",
      "excel",
      "dashboard",
    ];
    const advancedAnalytics = [
      "machine learning",
      "predictive",
      "statistical",
      "regression",
      "neural network",
      "deep learning",
    ];
    const cloudPlatforms = ["aws", "azure", "gcp", "snowflake", "bigquery"];
    const databases = ["mysql", "postgresql", "mongodb", "oracle", "teradata"];

    let toolCount = 0;
    let advancedCount = 0;
    let cloudCount = 0;
    let dbCount = 0;

    dataAnalystTools.forEach((tool) => {
      if (text.includes(tool)) toolCount++;
    });
    advancedAnalytics.forEach((tech) => {
      if (text.includes(tech)) advancedCount++;
    });
    cloudPlatforms.forEach((platform) => {
      if (text.includes(platform)) cloudCount++;
    });
    databases.forEach((db) => {
      if (text.includes(db)) dbCount++;
    });

    const hasSpecializedTools = toolCount >= 4;
    const hasSomeTechSkills = toolCount >= 2;
    const hasAdvancedSkills = advancedCount >= 2;
    const hasCloudExperience = cloudCount >= 1;

    // ===== ACHIEVEMENT COUNTING & QUANTIFICATION =====
    const achievementPatterns = [
      { pattern: /increased|grew|expanded|boosted/gi, weight: 1.5 },
      { pattern: /decreased|reduced|minimized|optimized/gi, weight: 1.5 },
      { pattern: /improved|enhanced|strengthened|refined/gi, weight: 1 },
      { pattern: /delivered|achieved|accomplished|completed/gi, weight: 1.2 },
      { pattern: /led|managed|directed|oversaw|headed/gi, weight: 1.3 },
      { pattern: /awarded|won|recognized|promoted/gi, weight: 1.4 },
    ];

    let achievementScore = 0;
    achievementPatterns.forEach((item) => {
      const matches = text.match(item.pattern);
      if (matches) {
        achievementScore += matches.length * item.weight;
      }
    });

    const hasExceptionalAchievements = achievementScore >= 12;
    const hasStrongAchievements = achievementScore >= 6;
    const hasSomeAchievements = achievementScore >= 2;

    // ===== QUANTIFIED METRICS (VERY STRICT) =====
    const metricPatterns = [
      /\$\d+[mk]?(?:\s+(?:in|of|revenue|profit))?/gi, // Money
      /\d+%\s+(?:increase|improvement|growth|reduction)/gi, // Percentage improvement
      /\d+x\s+(?:faster|improvement|growth|increase)/gi, // Multiple improvement
      /reduced\s+(?:by\s+)?\d+%/gi, // Reduction metrics
      /\d+(?:,\d{3})?\+?\s+(?:users?|customers?|records?|reports?|dashboards?)/gi, // Scale metrics
    ];

    let metricsCount = 0;
    metricPatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) metricsCount += matches.length;
    });

    const hasExceptionalMetrics = metricsCount >= 8;
    const hasMultipleMetrics = metricsCount >= 4;
    const hasGoodMetrics = metricsCount >= 2;
    const hasMinimalMetrics = metricsCount === 1;

    // ===== LEADERSHIP & IMPACT =====
    const leadershipMatch = text.match(
      /led|managed|directed|supervised|mentor|team lead|manager|head of|built team/gi,
    );
    const leadershipLevel = leadershipMatch ? leadershipMatch.length : 0;
    const hasSignificantLeadership = leadershipLevel >= 4;
    const hasModerateLeadership = leadershipLevel >= 2;

    // ===== PROJECT DEPTH & COMPLEXITY =====
    const projectMatches = text.match(/project:|case study:|initiative:/gi);
    const projectCount = projectMatches ? projectMatches.length : 0;
    const hasComplexProjects = projectCount >= 4;
    const hasMultipleProjects = projectCount >= 2;

    // ===== ACTION VERB DENSITY (Resume Quality) =====
    const actionVerbs =
      /\b(designed|developed|implemented|analyzed|created|built|architected|optimized|automated|led|managed|coordinated|drove|spearheaded|pioneered|delivered|executed|evaluated|assessed|forecasted)\b/gi;
    const actionVerbCount = (text.match(actionVerbs) || []).length;
    const hasStrongLanguage = actionVerbCount >= 15;
    const hasGoodLanguage = actionVerbCount >= 8;

    // ===== ACADEMIC CREDENTIALS =====
    const hasGPA =
      /gpa|3\.[0-9]|4\.0|honors|cum\s+laude|dean's|high distinction/.test(text);
    const hasAdvancedDegree = /master|phd|m\.?b\.?a|m\.?s\.|m\.?tech/i.test(
      text,
    );
    const hasBachelor = /bachelor|b\.?s\.|b\.?a\.|undergraduate/.test(text);

    // ===== QUALITY CHECKS =====
    const wordCount = text.split(/\s+/).length;
    const hasBulletPoints = (text.match(/^[\s]*[•\-\*]\s/gm) || []).length >= 5;
    const isExceptional = wordCount >= 400;
    const isComprehensive = wordCount >= 250;
    const isGoodLength = wordCount >= 150;
    const isTooShort = wordCount < 100;

    const hasDates =
      /\d{4}|\d{1,2}\/\d{1,2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/gi.test(
        text,
      );
    const dateCount = (text.match(/\d{4}|\d{1,2}\/\d{1,2}/gi) || []).length;
    const hasGoodDateStructure = dateCount >= 4;

    // ===== KEYWORD MATCHING WITH JD (STRICTER - DOMINANT FACTOR) =====
    const jdTerms = jdText
      .split(/[\s,;.!?\/\-]+/)
      .filter((w) => w.length > 4 && !/^\d+$/.test(w)) // Longer terms only
      .slice(0, 60); // Fewer terms for stricter matching

    let matchedTerms = 0;
    jdTerms.forEach((term) => {
      if (text.includes(term)) matchedTerms++;
    });

    const matchPercent =
      jdTerms.length > 0 ? (matchedTerms / jdTerms.length) * 100 : 0;

    // ===== NEW SIMPLE JD-KEYWORD BASED ATS SCORING =====
    // Extract keywords from JD and match against resume

    // Parse JD to extract key required skills/keywords
    const jdKeywords = jdText
      .split(/[\s,;.!?()]+/)
      .filter((word) => word.length > 3 && !/^\d+$/.test(word))
      .map((w) => w.toLowerCase())
      .filter((w) => {
        // Filter to meaningful technical terms and skills
        const techTerms = [
          "sql",
          "python",
          "tableau",
          "power",
          "bi",
          "excel",
          "dashboard",
          "analytics",
          "visualization",
          "r",
          "sas",
          "google",
          "analytics",
          "excel",
          "vba",
          "BI",
          "data",
          "analysis",
          "statistical",
          "programming",
          "database",
          "tools",
          "skills",
          "experience",
          "ability",
          "understanding",
        ];
        return (
          techTerms.some((term) => w.includes(term)) || /[a-z]{4,}/.test(w)
        ); // Or any meaningful word 4+ chars
      });

    // Get unique keywords
    const uniqueJDKeywords = [...new Set(jdKeywords)];

    // Count how many JD keywords are in the resume
    let matchedKeywords = 0;
    uniqueJDKeywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        matchedKeywords++;
      }
    });

    // Calculate match percentage
    const jdMatchPercent =
      uniqueJDKeywords.length > 0
        ? (matchedKeywords / uniqueJDKeywords.length) * 100
        : 0;

    // Base ATS score: 0-100 based ONLY on JD keyword match percentage
    let atsScore = Math.round(jdMatchPercent);

    // Apply floor/ceiling (no penalty for domain mismatch - just flag in feedback)
    atsScore = Math.max(0, Math.min(100, atsScore));
    atsScore = Math.max(0, Math.min(100, atsScore));

    console.log(
      `[ATS SCORE] Resume: ${resumeText.substring(0, 30)}, JD Keywords: ${uniqueJDKeywords.length}, Matched: ${matchedKeywords}, Match%: ${jdMatchPercent.toFixed(1)}%, Score: ${atsScore}`,
    );

    // ===== GENERATE FEEDBACK =====
    const pros: string[] = [];
    const gaps: string[] = [];

    // Domain mismatch - flag it but don't cap score
    if (hasDomainMismatch) {
      gaps.push(
        `⚠️ MISMATCHED DOMAIN: ${mismatchReason}`,
      );
    }

    if (jdMatchPercent >= 75) {
      pros.push(
        `Excellent JD match: ${jdMatchPercent.toFixed(0)}% of JD keywords present`,
      );
    } else if (jdMatchPercent >= 50) {
      gaps.push(
        `Moderate JD match: ${jdMatchPercent.toFixed(0)}% of JD keywords present`,
      );
    } else {
      gaps.push(
        `Poor JD match: Only ${jdMatchPercent.toFixed(0)}% of required JD keywords present`,
      );
    }

    if (hasExperience) {
      if (seniorityLevel === 4)
        pros.push("Principal-level expertise documented");
      else if (seniorityLevel === 3)
        pros.push("Senior-level experience demonstrated");
      else if (seniorityLevel === 2) pros.push("Strong mid-career background");
      else pros.push("Entry to junior level experience listed");
    } else {
      gaps.push("CRITICAL: Work experience section missing");
    }

    if (hasEducation) {
      if (hasAdvancedDegree) pros.push("Advanced degree holder");
      else pros.push("Strong educational foundation");
    } else {
      gaps.push("CRITICAL: Education background required");
    }

    if (requiredSkillsMatch >= 4)
      pros.push(
        `Excellent technical stack (${requiredSkillsMatch} core tools)`,
      );
    else if (requiredSkillsMatch >= 2)
      pros.push(
        `Good technical foundation (${requiredSkillsMatch} core tools)`,
      );
    else if (hasSomeTechSkills)
      gaps.push("Limited specialized tools - enhance technical skills");
    else gaps.push("CRITICAL: Add relevant technical tools");

    if (hasExceptionalMetrics)
      pros.push(
        `Outstanding metrics documentation (${metricsCount} quantified results)`,
      );
    else if (hasMultipleMetrics)
      pros.push(`Good use of metrics (${metricsCount} quantified results)`);
    else gaps.push("CRITICAL: Add quantifiable achievements with numbers");

    if (hasAdvancedSkills)
      pros.push("Advanced analytics expertise demonstrated");
    if (hasCloudExperience) pros.push("Cloud platform experience documented");

    if (hasSignificantLeadership)
      pros.push("Strong leadership and team management");
    else if (hasModerateLeadership) pros.push("Some management experience");

    if (hasComplexProjects) pros.push("Complex project portfolio demonstrated");
    else if (hasMultipleProjects)
      gaps.push("Add more detailed project examples");
    else gaps.push("Include specific project case studies");

    if (hasStrongLanguage) pros.push("Excellent action-oriented language");
    else if (!hasGoodLanguage) gaps.push("Use stronger action verbs");

    if (hasCertifications) pros.push("Industry certifications held");

    if (matchPercent > 60)
      pros.push(`Excellent JD alignment (${Math.round(matchPercent)}%)`);
    else if (matchPercent > 30)
      gaps.push(
        `Moderate JD alignment (${Math.round(matchPercent)}%) - emphasize role requirements`,
      );
    else
      gaps.push(
        `CRITICAL: Poor JD match (${Math.round(matchPercent)}%) - revise to match job description`,
      );

    const experienceScore =
      seniorityLevel === 4
        ? 95
        : seniorityLevel === 3
          ? 85
          : seniorityLevel === 2
            ? 70
            : seniorityLevel === 1
              ? 50
              : 30;
    const skillScoreVal = hasSpecializedTools
      ? 88
      : hasSomeTechSkills
        ? 65
        : hasSkills
          ? 45
          : 20;
    const projectScore = hasComplexProjects
      ? 85
      : hasMultipleProjects
        ? 65
        : hasProjects
          ? 45
          : 20;

    // === Build concise semantic executive summary (unique per resume) ===
    const levelPhrase =
      seniorityLevel === 4
        ? "Principal-level"
        : seniorityLevel === 3
          ? "Senior"
          : seniorityLevel === 2
            ? "Mid-level"
            : seniorityLevel === 1
              ? "Junior"
              : "Entry-level";

    // gather top matching technical terms for a short skills phrase
    const skillCandidates = [
      ...dataAnalystTools,
      ...databases,
      ...cloudPlatforms,
      ...advancedAnalytics,
    ];
    const matchedSkills: string[] = [];
    skillCandidates.forEach((s) => {
      if (s && text.includes(s) && !matchedSkills.includes(s))
        matchedSkills.push(s);
    });
    const topSkills = matchedSkills.slice(0, 4).join(", ");

    const metricsPhrase = hasExceptionalMetrics
      ? `demonstrates strong measurable impact (${metricsCount}+ results)`
      : hasMultipleMetrics
        ? `includes multiple quantified outcomes (${metricsCount})`
        : hasGoodMetrics
          ? `some measurable results (${metricsCount})`
          : "limited quantifiable outcomes";

    const projectsPhrase = hasComplexProjects
      ? `complex project portfolio (${projectCount} case studies)`
      : hasMultipleProjects
        ? `multiple projects (${projectCount})`
        : hasProjects
          ? "project experience"
          : "few project examples";

    const leadPhrase = hasSignificantLeadership
      ? "experienced leader"
      : hasModerateLeadership
        ? "some leadership experience"
        : "";

    const matchPhrase =
      matchPercent >= 70
        ? `strong alignment to role (${Math.round(matchPercent)}%)`
        : matchPercent >= 50
          ? `moderate alignment (${Math.round(matchPercent)}%)`
          : `limited alignment (${Math.round(matchPercent)}%)`;

    const rec =
      atsScore >= 85
        ? "Highly recommended for interview"
        : atsScore >= 75
          ? "Recommended for interview"
          : atsScore >= 65
            ? "Consider for interview"
            : atsScore >= 50
              ? "Screen further"
              : "Not recommended at this time";

    const yearsPhrase = yearsOfExp ? `${yearsOfExp} yrs` : "";

    const parts: string[] = [];
    parts.push(`${levelPhrase}${yearsPhrase ? ` • ${yearsPhrase}` : ""}`);
    if (topSkills) parts.push(`Skills: ${topSkills}`);
    parts.push(metricsPhrase);
    parts.push(projectsPhrase);
    if (leadPhrase) parts.push(leadPhrase);
    parts.push(matchPhrase);
    parts.push(rec);

    const executiveSummary = parts
      .filter(Boolean)
      .join(" — ")
      .replace(/\s+/g, " ")
      .trim();

    return {
      atsScore: Math.round(atsScore * 100) / 100,
      roleFit: Math.round(matchPercent),
      experienceScore,
      skillScore: skillScoreVal,
      breakdown: {
        skills: skillScoreVal,
        experience: experienceScore,
        projects: projectScore,
        education: hasAdvancedDegree ? 85 : hasBachelor ? 70 : 30,
        clarity: isExceptional
          ? 90
          : isComprehensive
            ? 75
            : isGoodLength
              ? 60
              : 30,
      },
      matchedSkillsPercent: Math.round(matchPercent),
      missingSkillsPercent: Math.max(0, 100 - Math.round(matchPercent)),
      summary: executiveSummary,
      pros: pros.length > 0 ? pros : ["Resume recognized"],
      gaps: gaps.length > 0 ? gaps : ["Solid overall profile"],
      cultureLatentVector:
        atsScore > 75
          ? "high_alignment"
          : atsScore > 60
            ? "medium_alignment"
            : "low_alignment",
      lastUpdated: new Date().toISOString(),
    };
    } catch (error) {
      logger.error("Error analyzing resume:", error);
      // Return a default analysis with error indication
      return {
        atsScore: 0,
        roleFit: 0,
        experienceScore: 0,
        skillScore: 0,
        breakdown: {
          skills: 0,
          experience: 0,
          projects: 0,
          education: 0,
          clarity: 0,
        },
        matchedSkillsPercent: 0,
        missingSkillsPercent: 100,
        summary: "Analysis failed due to an error",
        pros: [],
        gaps: ["Unable to analyze resume"],
        cultureLatentVector: "unknown",
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  async compareResumes(resumes: any[]): Promise<SimilarityAnalysis> {
    try {
      // Deterministic similarity based on pairwise Jaccard of token sets.
      if (!resumes || resumes.length < 2) {
        return {
          similarity_percentage: 0,
          suspicion_score: 0,
          risk_level: "Low",
          reasons: [],
        };
      }

    const normalize = (s: string) =>
      (s || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((t) => t && t.length > 2);
    // Common resume stopwords to exclude (reduces false positives)
    const resumeStopwords = new Set([
      "experience",
      "work",
      "employment",
      "career",
      "professional",
      "led",
      "managed",
      "developed",
      "designed",
      "implemented",
      "created",
      "built",
      "deployed",
      "skills",
      "technical",
      "expertise",
      "education",
      "degree",
      "university",
      "bachelor",
      "master",
      "project",
      "projects",
      "team",
      "achieved",
      "delivered",
      "improved",
      "increased",
      "reduced",
      "optimized",
      "enhanced",
      "responsibilities",
      "achievement",
      "awards",
      "certification",
      "certified",
      "license",
      "proficiency",
      "proficient",
      "knowledge",
      "understanding",
      "ability",
      "capable",
      "competent",
      "excellent",
      "strong",
      "solid",
      "good",
      "experienced",
      "expert",
      "junior",
      "senior",
      "lead",
      "leader",
      "leadership",
      "management",
      "date",
      "dates",
      "period",
      "year",
      "years",
      "month",
      "months",
    ]);

    const normalizeFiltered = (s: string) =>
      (s || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((t) => t && t.length > 3 && !resumeStopwords.has(t));
    const sets = resumes.map(
      (r) => new Set(normalizeFiltered(r.content || r.analysis?.summary || "")),
    );

    const pairs: number[] = [];
    const commonTokens: Record<string, number> = {};

    for (let i = 0; i < sets.length; i++) {
      for (let j = i + 1; j < sets.length; j++) {
        const a = sets[i];
        const b = sets[j];
        const inter: string[] = [];
        a.forEach((tok) => {
          if (b.has(tok)) inter.push(tok);
        });
        const unionSize = new Set([...a, ...b]).size || 1;
        const jaccard = inter.length / unionSize;
        pairs.push(jaccard);
        inter.forEach((t) => (commonTokens[t] = (commonTokens[t] || 0) + 1));
      }
    }

    const avg = pairs.length
      ? pairs.reduce((s, v) => s + v, 0) / pairs.length
      : 0;
    const similarity_percentage = Math.round(avg * 100);
    const suspicion_score = Math.round(avg * 10); // 0-10 scale

    // Count how many rare tokens are shared across multiple resumes
    const sharedRareTokenCount = Object.entries(commonTokens).filter(
      ([_, count]) => count > 1,
    ).length;

    // EXTREMELY STRICT: Default to Low unless overwhelming evidence of duplication
    let risk_level: "Low" | "Medium" | "High" = "Low";

    // Only High if 98%+ identical AND 5+ shared rare tokens (near-perfect copy)
    if (avg >= 0.98 && sharedRareTokenCount >= 5) {
      risk_level = "High";
    }
    // Only Medium if 96%+ identical AND 8+ shared rare tokens (very likely duplicate)
    else if (avg >= 0.96 && sharedRareTokenCount >= 8) {
      risk_level = "Medium";
    }
    // Everything else is Low risk (normal different resumes)

    const sortedCommon = Object.entries(commonTokens)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((p) => p[0]);

    const reasons = sortedCommon.length
      ? [`Common unique terms: ${sortedCommon.join(", ")}`]
      : ["No significant overlap detected"];

    return {
      similarity_percentage,
      suspicion_score,
      risk_level,
      reasons,
    };
    } catch (error) {
      logger.error("Error comparing resumes:", error);
      return {
        similarity_percentage: 0,
        suspicion_score: 0,
        risk_level: "Low",
        reasons: ["Comparison failed due to an error"],
      };
    }
  }

  async generateInterviewQuestions(
    resumeText: string,
    jobDescription: string,
  ): Promise<{ technical: string[]; behavioral: string[] }> {
    try {
      const nameMatch = (resumeText || "").match(/([A-Z][a-z]+\s[A-Z][a-z]+)/);
      const name = nameMatch ? nameMatch[0] : "Candidate";
      return {
        technical: [
          `${name}: Describe your primary technical strengths relevant to this role.`,
          `${name}: Walk through your most impactful project and your role.`,
          `${name}: How would you design a scalable system?`,
        ],
        behavioral: [
          `${name}: Tell us about a time you handled conflicting priorities.`,
          `${name}: How do you approach mentorship and knowledge sharing?`,
          `${name}: Describe a situation where you overcame a major obstacle.`,
        ],
      };
    } catch (error) {
      logger.error("Error generating interview questions:", error);
      return {
        technical: ["Unable to generate technical questions due to an error."],
        behavioral: ["Unable to generate behavioral questions due to an error."],
      };
    }
  }

  async draftGmail(
    resume: any,
    jd: any,
    status: string = "Eligible",
  ): Promise<string> {
    try {
      const isRejection = status === "Ineligible";
      if (isRejection) {
        return `Hi ${resume.candidateName},\n\nThank you for your interest in the ${jd.title} position. After careful review, we have decided to move forward with other candidates whose experience aligns more closely with our current needs.\n\nWe appreciate your time and wish you the best in your future endeavors.\n\nBest,\nRecruiting Team\n\nNote: This is an automated mail generated by the TopRes AI Recruitment Engine.`;
      }
      return `Hi ${resume.candidateName},\n\nWe're impressed by your background for the role of ${jd.title}. We'd like to invite you to the next stage.\n\nBest,\nRecruiting Team\n\nNote: This is an automated mail generated by the TopRes AI Recruitment Engine.`;
    } catch (error) {
      logger.error("Error drafting email:", error);
      return "Error generating email template. Please try again.";
    }
  }
}

export const gemini = new GeminiService();
